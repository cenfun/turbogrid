import Util from './util.js';
import EventBase from './event-base.js';

const EVENT = {
    DRAG_START: 'drag_start',
    DRAG_MOVE: 'drag_move',
    DRAG_END: 'drag_end'
};

export default class extends EventBase {

    static EVENT = EVENT;

    createOption(data) {
        return {

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
            changed: false,

            ... data
        };
    }

    //============================================================================

    start(e, data) {
        if (!e) {
            return;
        }
        this.unbindEvents();
        this.bindEvents();
        this.option = this.createOption(data);
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
        const o = this.option;
        //start position
        o.e = e;
        o.startX = e.pageX;
        o.startY = e.pageY;
        o.currentX = o.startX;
        o.currentY = o.startY;
        this.hasMoved = false;
    }

    mouseMoveHandler(e) {
        Util.preventDefault(e);

        const o = this.option;
        o.e = e;
        //keep previous position
        o.previousX = o.currentX;
        o.previousY = o.currentY;
        //current position
        o.currentX = e.pageX;
        o.currentY = e.pageY;
        //current move offset from previous
        o.moveX = o.currentX - o.previousX;
        o.moveY = o.currentY - o.previousY;
        //current offset from start
        o.offsetX = o.currentX - o.startX;
        o.offsetY = o.currentY - o.startY;
        //position nothing change
        o.changed = !(o.offsetX === 0 && o.offsetY === 0);

        //moved but no changed, because position back to start point
        if (this.hasMoved) {
            this.trigger(EVENT.DRAG_MOVE, o);
            return;
        }

        this.hasMoved = true;
        this.trigger(EVENT.DRAG_START, o);
    }

    mouseUpHandler(e) {
        this.unbindEvents();
        const o = this.option;
        if (!this.hasMoved) {
            return;
        }
        o.e = e;
        Util.preventDefault(e);
        this.trigger(EVENT.DRAG_END, o);
    }

    destroy() {
        this.unbindEvents();
        this.unbind();
    }

}
