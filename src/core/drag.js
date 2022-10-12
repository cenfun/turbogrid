import Util from './util.js';
import EventBase from './event-base.js';

const EVENT = {
    DRAG_START: 'drag_start',
    DRAG_MOVE: 'drag_move',
    DRAG_END: 'drag_end'
};

export default class Drag extends EventBase {

    static EVENT = EVENT;

    generateOptions(options) {
        const defaultOptions = {

            type: 'mouse',

            startX: 0,
            startY: 0,

            previousX: 0,
            previousY: 0,

            currentX: 0,
            currentY: 0,

            moveX: 0,
            moveY: 0,

            offsetX: 0,
            offsetY: 0,
            changed: false
        };

        return Util.merge(defaultOptions, options);
    }

    //============================================================================

    start(e, data) {
        if (!e) {
            return;
        }
        this.unbindEvents();
        this.bindEvents();
        this.options = this.generateOptions(data);
        this.startHandler(e);
    }

    bindEvents() {
        this.windowEvents = {
            mousemove: {
                handler: (e) => {
                    this.iframeHandler(e);
                    this.mouseMoveHandler(e);
                },
                options: true
            },
            mouseup: {
                handler: (e) => {
                    this.mouseUpHandler(e);
                },
                options: {
                    once: true
                }
            }
        };
        Util.bindEvents(this.windowEvents, window);
    }

    unbindEvents() {
        Util.unbindEvents(this.windowEvents);
        this.windowEvents = null;
        if (this.previousIframe) {
            this.previousIframe.classList.remove('tg-pointer-events-none');
            this.previousIframe = null;
        }
    }

    iframeHandler(e) {
        const target = e.target;
        if (target.nodeName !== 'IFRAME') {
            return;
        }
        if (target === this.previousIframe) {
            return;
        }
        if (this.previousIframe) {
            this.previousIframe.classList.remove('tg-pointer-events-none');
        }
        target.classList.add('tg-pointer-events-none');
        this.previousIframe = target;
    }

    //============================================================================

    startHandler(e) {
        const os = this.options;
        //start position
        os.e = e;
        os.startX = e.pageX;
        os.startY = e.pageY;
        os.currentX = os.startX;
        os.currentY = os.startY;
        this.hasMoved = false;
    }

    mouseMoveHandler(e) {
        Util.preventDefault(e);

        const os = this.options;
        os.e = e;
        //keep previous position
        os.previousX = os.currentX;
        os.previousY = os.currentY;
        //current position
        os.currentX = e.pageX;
        os.currentY = e.pageY;
        //current move offset from previous
        os.moveX = os.currentX - os.previousX;
        os.moveY = os.currentY - os.previousY;
        //current offset from start
        os.offsetX = os.currentX - os.startX;
        os.offsetY = os.currentY - os.startY;
        //position nothing change
        os.changed = !(os.offsetX === 0 && os.offsetY === 0);

        //moved but no changed, because position back to start point
        if (this.hasMoved) {
            this.trigger(EVENT.DRAG_MOVE, os);
            return;
        }

        this.hasMoved = true;
        this.trigger(EVENT.DRAG_START, os);
    }

    mouseUpHandler(e) {
        this.unbindEvents();
        const os = this.options;
        if (!this.hasMoved) {
            return;
        }
        os.e = e;
        Util.preventDefault(e);
        this.trigger(EVENT.DRAG_END, os);
    }

    destroy() {
        this.unbindEvents();
        this.unbind();
    }

}
