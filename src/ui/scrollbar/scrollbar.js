import $ from '../../core/query.js';
import Util from '../../core/util.js';
import OptionBase from '../../core/option-base.js';
import Drag from '../../core/drag.js';
import Motion from '../../core/motion.js';

const E = {
    CHANGE: 'change'
};

export default OptionBase.extend({
    //v, h
    //mode: "",
    //type: {},

    //final value from option
    size: 0,
    viewSize: 0,
    bodySize: 0,
    trackSize: 0,

    //scroll position
    position: 0,

    //thumb scale: thumb size / track size
    scale: 0,

    thumbPosition: 0,
    thumbScale: 0,

    constructor: function(holder) {
        this.id = Util.uid(4, `tg-scrollbar-${this.mode}-`);
        this.setOption();
        this.$holder = $(holder);
        //some clean
        this.$holder.find(`.${this.type.className}`).remove();
    },

    getDefaultOption: function() {
        return {
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
    },

    //========================================================================

    create: function() {

        const template = '<div><div class="tg-scrollbar-track"></div><div class="tg-scrollbar-thumb"></div></div>';

        this.$container = $(template).appendTo(this.$holder);
        this.$container.attr('id', this.id);
        this.$container.addClass(Util.classMap(['tg-scrollbar', this.type.className, {
            'tg-scrollbar-round': this.option.round
        }]));

        this.$track = this.$container.find('.tg-scrollbar-track');
        this.$thumb = this.$container.find('.tg-scrollbar-thumb');

        //thumb drag events
        this.thumbDrag = new Drag();
        this.thumbDrag.bind(Drag.DRAG_START, (e, d) => {
            this.thumbDragStart(d);
        }).bind(Drag.DRAG_MOVE, (e, d) => {
            this.thumbDragMove(d);
        }).bind(Drag.DRAG_END, (e, d) => {
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
    },

    //========================================================================
    //API

    getBlank: function() {
        return this.option.blank;
    },

    getSize: function() {
        return this.size;
    },

    getViewSize: function() {
        return this.viewSize;
    },

    getBodySize: function() {
        return this.bodySize;
    },

    //========================================================================

    getTrackMouseDirection: function() {
        let direction = 1;
        if (this.trackMousePosition < this.thumbPosition) {
            direction = -1;
        }
        return direction;
    },

    getTrackMousePos: function(e) {
        const offset = this.$track.offset();
        return e[this.type.page] - offset[this.type.offset];
    },

    //========================================================================

    getMaxThumbPosition: function() {
        return this.trackSize - this.thumbSize;
    },

    setThumbPosition: function(thumbPosition) {
        if (thumbPosition === this.thumbPosition) {
            return this;
        }
        this.thumbPosition = thumbPosition;
        if (this.$thumb) {
            this.$thumb.css(this.type.offset, thumbPosition);
        }
        return this;
    },

    //update thumb pos
    updateThumbPosition: function() {
        let thumbPosition = 0;
        const maxPosition = this.getMaxPosition();
        if (maxPosition > 0) {
            const maxThumbPosition = this.getMaxThumbPosition();
            thumbPosition = Math.round(maxThumbPosition * this.position / maxPosition);
            thumbPosition = Util.clamp(thumbPosition, 0, maxThumbPosition);
        }
        this.setThumbPosition(thumbPosition);
        return this;
    },

    //=====================================================================
    //track

    trackMousedownHandler: function(e) {
        this.motionStop();
        this.trackMousePosition = this.getTrackMousePos(e);
        this.motionStart();
        return this;
    },

    trackMouseupHandler: function(e) {
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
    },

    trackScrollHandler: function() {
        const viewSize = Math.max(0, this.viewSize - 20);
        //thumb current position
        const direction = this.getTrackMouseDirection();
        const offset = viewSize * direction;
        this.setOffset(offset);
        return this;
    },

    //===================================================================
    //motion

    motionStop: function() {
        if (this.motion) {
            this.motion.destroy();
            this.motion = null;
        }
        return this;
    },

    motionStart: function() {
        const from = this.position;
        const till = Math.round(this.trackMousePosition / this.viewSize * this.getMaxPosition());
        this.motionStarted = false;

        this.motion = new Motion();
        this.motion.bind(Motion.MOTION_START, (e, d) => {
            this.motionStarted = true;
        });
        this.motion.bind(Motion.MOTION_MOVE, (e, d) => {
            this.motionUpdateHandler(e, d);
        });
        this.motion.start({
            duration: this.option.motionDuration,
            from: from,
            till: till
        });
        return this;
    },

    motionUpdateHandler: function(e, pos) {
        //update position, change thumb, trigger event
        if (pos === this.position) {
            return;
        }
        this.setPosition(pos);
        this.triggerEvent();
    },

    //=====================================================================
    //thumb drag

    thumbMouseDownHandler: function(e) {
        this.$thumb.addClass('tg-scrollbar-thumb-hold');
        this.thumbDrag.start(e, {
            target: this.$thumb
        });
    },

    thumbDragStart: function(d) {
        this.motionStop();
        d.thumbPositionStart = this.thumbPosition;
    },

    thumbDragMove: function(d) {

        //change thumb position
        let thumbPosition = d.thumbPositionStart + d[this.type.offsetName];
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
    },

    thumbDragEnd: function(d) {
        //no matter if d.valid always remove, because added on init not start
        if (this.$thumb) {
            this.$thumb.removeClass('tg-scrollbar-thumb-hold');
        }
    },

    //===================================================================

    //from inside change trigger
    triggerEvent: function() {
        this.trigger(E.CHANGE, this.position);
    },

    //===================================================================
    //px position

    getPosition: function() {
        return this.position;
    },

    setPosition: function(position) {
        position = Util.toNum(position, true);
        const maxPosition = this.getMaxPosition();
        position = Util.clamp(position, 0, maxPosition);
        //console.log(this.position, position);
        this.position = position;
        this.updateThumbPosition();
    },

    getMaxPosition: function() {
        return this.bodySize - this.viewSize;
    },

    updatePosition: function() {
        const maxPosition = this.getMaxPosition();
        const position = Util.clamp(this.position, 0, maxPosition);
        this.position = position;
    },

    //offset position +/-
    setOffset: function(offset) {
        offset = Util.toNum(offset);
        const position = this.position + offset;
        this.setPosition(position);
        return this;
    },

    //===================================================================
    //scale for thumb

    getScale: function() {
        return this.scale;
    },

    setScale: function(scale) {
        scale = Util.per(scale);
        this.scale = scale;
        this.scaleChangeHandler();
        return this;
    },

    scaleChangeHandler: function() {
        let thumbSize = Math.round(this.viewSize * this.scale);
        thumbSize = Math.max(thumbSize, this.option.size);
        thumbSize = Math.min(thumbSize, this.viewSize);
        this.thumbSize = thumbSize;
        if (this.$thumb) {
            const thumbData = {};
            if (this.mode === 'h') {
                thumbData.height = this.size;
                thumbData.width = this.thumbSize;
            } else {
                thumbData.width = this.size;
                thumbData.height = this.thumbSize;
            }
            this.$thumb.css(thumbData);
        }
    },

    //===================================================================

    //container and track size
    updateTrackSize: function() {
        const trackData = {};
        if (this.mode === 'h') {
            trackData.width = this.trackSize;
            trackData.height = this.size;
        } else {
            trackData.height = this.trackSize;
            trackData.width = this.size;
        }
        this.$container.css(trackData);
        return this;
    },

    //thumb size
    updateThumbSize: function() {
        let scale = 0;
        if (this.bodySize) {
            scale = this.trackSize / this.bodySize;
        }
        this.setScale(scale);
        return this;
    },

    //===================================================================

    //do twice: calculate size and show size
    updateOption: function(option) {

        this.setOption(option);

        //init size
        let size = this.option.size;
        if (!Util.isNum(size)) {
            size = Util.toNum(size);
        }
        size = Math.round(size);
        //range 0 - 30
        size = Math.max(size, 0);
        size = Math.min(size, 30);
        this.size = size;


    },

    parseSize: function(v) {
        v = Util.toNum(v);
        v = Math.round(v);
        v = Math.max(v, 0);
        return v;
    },

    //for view size and body size
    //track size for fade
    updateSize: function(viewSize, bodySize, trackSize) {
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
    },

    fade: function(fadeIn) {
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
    },

    show: function() {
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
    },

    hide: function() {
        this.updatePosition();
        this.remove();
        return this;
    },

    remove: function() {
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
    },

    //===================================================================

    destroy: function() {
        this.remove();
        return this;
    }

}, E);
