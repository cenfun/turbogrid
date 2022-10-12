import $ from '../core/query.js';
import Util from '../core/util.js';
import EventBase from '../core/event-base.js';
import Drag from './drag.js';
import Motion from './motion.js';

const EVENT = {
    CHANGE: 'change'
};

const types = {
    h: {
        type: 'h',
        className: 'tg-scrollbar-h',
        offset: 'left',
        size: 'width',
        page: 'pageX',
        axis: 'x',
        offsetName: 'offsetX'
    },
    v: {
        type: 'v',
        className: 'tg-scrollbar-v',
        offset: 'top',
        size: 'height',
        page: 'pageY',
        axis: 'y',
        offsetName: 'offsetY'
    }
};

export default class Scrollbar extends EventBase {

    static EVENT = EVENT;
    static H = 'h';
    static V = 'v';

    //h, v
    type = 'h';
    settings = {};

    //final value from options
    size = 0;
    viewSize = 0;
    bodySize = 0;
    trackSize = 0;

    //scroll position
    position = 0;

    //thumb scale: thumb size / track size
    scale = 0;

    thumbPosition = 0;
    thumbScale = 0;

    constructor(type, holder) {
        super();
        this.settings = types[type] || types.h;
        this.type = this.settings.type;

        this.id = Util.uid(4, `tg-scrollbar-${this.type}-`);

        this.$holder = $(holder);
        //some clean
        this.$holder.find(`.${this.settings.className}`).remove();

        this.options = this.generateOptions();
    }

    generateOptions(options) {
        const defaultOptions = {
            //width or height for scrollbar
            //0 means invisible
            size: 15,

            round: false,

            //for invisible but takes up space
            //false: without blank (default)
            //true: with blank, without scroll view extension
            //1: with blank, with scroll view extension
            blank: false,

            //disable event and hover
            //disabled: false,

            //motion
            motionDuration: 200

        };

        return Util.merge(defaultOptions, options);
    }

    //do twice: calculate size and show size
    updateOptions(options) {

        this.options = this.generateOptions(options);

        //init size
        let size = this.options.size;
        if (!Util.isNum(size)) {
            size = Util.toNum(size);
        }
        size = Math.round(size);
        //range 0 - 30
        size = Math.max(size, 0);
        size = Math.min(size, 30);
        this.size = size;
    }

    //========================================================================

    create() {

        const template = '<div><div class="tg-scrollbar-track"></div><div class="tg-scrollbar-thumb"></div></div>';

        this.$container = $(template).appendTo(this.$holder);
        this.$container.attr('id', this.id);
        this.$container.addClass(Util.classMap(['tg-scrollbar', this.settings.className, {
            'tg-scrollbar-round': this.options.round
        }]));

        this.$track = this.$container.find('.tg-scrollbar-track');
        this.$thumb = this.$container.find('.tg-scrollbar-thumb');

        //thumb drag events
        this.thumbDrag = new Drag();
        this.thumbDrag.bind(Drag.EVENT.DRAG_START, (e, d) => {
            this.thumbDragStart(d);
        }).bind(Drag.EVENT.DRAG_MOVE, (e, d) => {
            this.thumbDragMove(d);
        }).bind(Drag.EVENT.DRAG_END, (e, d) => {
            this.thumbDragEnd(d);
        });

        const container = this.$container.get(0);

        this.scrollEvents = {
            mousedown: {
                handler: (e) => {

                    //click on thumb
                    if (e.target.classList.contains('tg-scrollbar-thumb')) {
                        this.thumbMouseDownHandler(e);
                        return;
                    }

                    this.trackEvents = {
                        mouseup: {
                            handler: (ee) => {
                                this.trackMouseupHandler(ee);
                            },
                            options: {
                                once: true
                            }
                        }
                    };

                    Util.bindEvents(this.trackEvents, container);

                    this.trackMousedownHandler(e);
                },
                options: true
            },
            selectstart: {
                handler: (e) => {
                    Util.preventDefault(e);
                },
                options: true
            }
        };

        Util.bindEvents(this.scrollEvents, container);

        return this;
    }

    //========================================================================
    //API

    getBlank() {
        return this.options.blank;
    }

    getSize() {
        return this.size;
    }

    getViewSize() {
        return this.viewSize;
    }

    getBodySize() {
        return this.bodySize;
    }

    //========================================================================

    getTrackMouseDirection() {
        let direction = 1;
        if (this.trackMousePosition < this.thumbPosition) {
            direction = -1;
        }
        return direction;
    }

    getTrackMousePos(e) {
        const offset = this.$track.offset();
        return e[this.settings.page] - offset[this.settings.offset];
    }

    //========================================================================

    getMaxThumbPosition() {
        return this.trackSize - this.thumbSize;
    }

    setThumbPosition(thumbPosition) {
        if (thumbPosition === this.thumbPosition) {
            return this;
        }
        this.thumbPosition = thumbPosition;
        if (this.$thumb) {
            this.$thumb.css(this.settings.offset, thumbPosition);
        }
        return this;
    }

    //update thumb pos
    updateThumbPosition() {
        let thumbPosition = 0;
        const maxPosition = this.getMaxPosition();
        if (maxPosition > 0) {
            const maxThumbPosition = this.getMaxThumbPosition();
            thumbPosition = Math.round(maxThumbPosition * this.position / maxPosition);
            thumbPosition = Util.clamp(thumbPosition, 0, maxThumbPosition);
        }
        this.setThumbPosition(thumbPosition);
        return this;
    }

    //=====================================================================
    //track

    trackMousedownHandler(e) {
        this.motionStop();
        this.trackMousePosition = this.getTrackMousePos(e);
        this.motionStart();
        return this;
    }

    trackMouseupHandler(e) {
        Util.unbindEvents(this.trackEvents);
        this.motionStop();
        if (this.motionStarted) {
            return this;
        }
        this.trackMousePosition = this.getTrackMousePos(e);
        //track click scroll
        this.trackScrollHandler();
        this.triggerEvent();
        return this;
    }

    trackScrollHandler() {
        const viewSize = Math.max(0, this.viewSize - 20);
        //thumb current position
        const direction = this.getTrackMouseDirection();
        const offset = viewSize * direction;
        this.setOffset(offset);
        return this;
    }

    //===================================================================
    //motion

    motionStop() {
        if (this.motion) {
            this.motion.destroy();
            this.motion = null;
        }
        return this;
    }

    motionStart() {
        const from = this.position;
        const till = Math.round(this.trackMousePosition / this.viewSize * this.getMaxPosition());
        this.motionStarted = false;

        this.motion = new Motion();
        this.motion.bind(Motion.EVENT.MOTION_START, (e, d) => {
            this.motionStarted = true;
        });
        this.motion.bind(Motion.EVENT.MOTION_MOVE, (e, d) => {
            this.motionUpdateHandler(e, d);
        });
        this.motion.start({
            duration: this.options.motionDuration,
            from: from,
            till: till
        });
        return this;
    }

    motionUpdateHandler(e, pos) {
        //update position, change thumb, trigger event
        if (pos === this.position) {
            return;
        }
        this.setPosition(pos);
        this.triggerEvent();
    }

    //=====================================================================
    //thumb drag

    thumbMouseDownHandler(e) {
        this.$thumb.addClass('tg-scrollbar-thumb-hold');
        this.thumbDrag.start(e, {
            target: this.$thumb
        });
    }

    thumbDragStart(d) {
        this.motionStop();
        d.thumbPositionStart = this.thumbPosition;
    }

    thumbDragMove(d) {

        //change thumb position
        let thumbPosition = d.thumbPositionStart + d[this.settings.offsetName];
        const maxThumbPosition = this.getMaxThumbPosition();
        thumbPosition = Util.clamp(thumbPosition, 0, maxThumbPosition);
        this.setThumbPosition(thumbPosition);

        //new position
        let newPosition = 0;
        if (maxThumbPosition > 0) {
            newPosition = Util.per(thumbPosition / maxThumbPosition) * this.getMaxPosition();
            newPosition = Math.round(newPosition);
        }
        this.position = newPosition;
        //update position and event change
        this.triggerEvent();
    }

    thumbDragEnd(d) {
        //no matter if d.valid always remove, because added on init not start
        if (this.$thumb) {
            this.$thumb.removeClass('tg-scrollbar-thumb-hold');
        }
    }

    //===================================================================

    //from inside change trigger
    triggerEvent() {
        this.trigger(EVENT.CHANGE, this.position);
    }

    //===================================================================
    //px position

    getPosition() {
        return this.position;
    }

    setPosition(position) {
        position = Util.toNum(position, true);
        const maxPosition = this.getMaxPosition();
        position = Util.clamp(position, 0, maxPosition);
        //console.log(this.position, position);
        this.position = position;
        this.updateThumbPosition();
    }

    getMaxPosition() {
        return this.bodySize - this.viewSize;
    }

    updatePosition() {
        const maxPosition = this.getMaxPosition();
        const position = Util.clamp(this.position, 0, maxPosition);
        this.position = position;
    }

    //offset position +/-
    setOffset(offset) {
        offset = Util.toNum(offset);
        const position = this.position + offset;
        this.setPosition(position);
        return this;
    }

    //===================================================================
    //scale for thumb

    getScale() {
        return this.scale;
    }

    setScale(scale) {
        scale = Util.per(scale);
        this.scale = scale;
        this.scaleChangeHandler();
        return this;
    }

    scaleChangeHandler() {
        let thumbSize = Math.round(this.viewSize * this.scale);
        thumbSize = Math.max(thumbSize, this.options.size);
        thumbSize = Math.min(thumbSize, this.viewSize);
        this.thumbSize = thumbSize;
        if (this.$thumb) {
            const thumbData = {};
            if (this.type === 'h') {
                thumbData.height = this.size;
                thumbData.width = this.thumbSize;
            } else {
                thumbData.width = this.size;
                thumbData.height = this.thumbSize;
            }
            this.$thumb.css(thumbData);
        }
    }

    //===================================================================

    //container and track size
    updateTrackSize() {
        const trackData = {};
        if (this.type === 'h') {
            trackData.width = this.trackSize;
            trackData.height = this.size;
        } else {
            trackData.height = this.trackSize;
            trackData.width = this.size;
        }
        this.$container.css(trackData);
        return this;
    }

    //thumb size
    updateThumbSize() {
        let scale = 0;
        if (this.bodySize) {
            scale = this.trackSize / this.bodySize;
        }
        this.setScale(scale);
        return this;
    }

    //===================================================================

    parseSize(v) {
        v = Util.toNum(v);
        v = Math.round(v);
        v = Math.max(v, 0);
        return v;
    }

    //for view size and body size
    //track size for fade
    updateSize(viewSize, bodySize, trackSize) {
        viewSize = this.parseSize(viewSize);
        this.viewSize = viewSize;
        bodySize = this.parseSize(bodySize);
        this.bodySize = bodySize;
        if (Util.isNum(trackSize)) {
            trackSize = this.parseSize(trackSize);
        } else {
            trackSize = viewSize;
        }
        this.trackSize = trackSize;
        //reset fade state
        this.previousFadeIn = null;
    }

    fade(fadeIn) {
        if (!this.$container || !this.size) {
            return false;
        }
        if (this.previousFadeIn === fadeIn) {
            return false;
        }
        this.previousFadeIn = fadeIn;
        if (fadeIn) {
            if (this.$container.hasClass('tg-fade-out')) {
                this.$container.removeClass('tg-fade-out').addClass('tg-fade-in');
            }
        } else {
            this.$container.removeClass('tg-fade-in').addClass('tg-fade-out');
        }
        return true;
    }

    show() {
        this.updatePosition();
        if (this.getBlank()) {
            this.remove();
            return;
        }

        if (!this.$container && this.size > 0) {
            this.create();
        }

        if (!this.$container) {
            return this;
        }
        this.updateTrackSize();
        this.updateThumbSize();

        return this;
    }

    hide() {
        this.updatePosition();
        this.remove();
        return this;
    }

    remove() {
        this.motionStop();

        Util.unbindEvents(this.scrollEvents);
        Util.unbindEvents(this.trackEvents);

        if (this.thumbDrag) {
            this.thumbDrag.destroy();
            this.thumbDrag = null;
        }

        if (!this.$container) {
            return this;
        }
        this.$thumb = null;
        this.$track = null;
        this.$container.remove();
        this.$container = null;
    }

    //===================================================================

    destroy() {
        this.remove();
        return this;
    }

}
