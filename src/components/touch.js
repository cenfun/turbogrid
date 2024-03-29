import Util from '../core/util.js';
import CONST from '../core/const.js';
import Motion from '../components/motion.js';
import EventBase from '../core/event-base.js';

const EVENT = {
    TOUCH_START: 'touch_start',
    TOUCH_MOVE: 'touch_move',
    TOUCH_END: 'touch_end',
    TOUCH_INERTIA: 'touch_inertia'
};

export default class Touch extends EventBase {

    static EVENT = EVENT;

    generateOptions(options) {
        const defaultOptions = {

            type: 'touch',

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

            touchLength: 0,
            direction: '',

            inertia: false,
            inertiaTime: 200

        };

        return Util.merge(defaultOptions, options);
    }

    // ============================================================================

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
        this.touchEvents = {
            touchmove: {
                handler: (e) => {
                    this.touchMoveHandler(e);
                },
                options: {
                    passive: false
                }
            },
            touchend: {
                handler: (e) => {
                    this.touchEndHandler(e);
                },
                options: {
                    passive: false,
                    once: true
                }
            },
            touchcancel: {
                handler: (e) => {
                    this.touchCancelHandler(e);
                },
                options: {
                    passive: false,
                    once: true
                }
            }
        };
        // safari use window has issue
        Util.bindEvents(this.touchEvents, document.body);
    }

    unbindEvents() {
        this.motionStop();
        Util.unbindEvents(this.touchEvents);
        this.touchEvents = null;
    }

    // ============================================================================

    startHandler(e) {

        this.trackingPoints = [];

        const touches = e.touches;
        const touchItem = touches[0];
        if (!touchItem) {
            // console.log('Not found touch item');
            return;
        }

        const os = this.options;
        os.e = e;
        // start position
        os.startX = touchItem.clientX;
        os.startY = touchItem.clientY;
        os.currentX = os.startX;
        os.currentY = os.startY;
        os.touchLength = touches.length;

        this.addTrackingPoint(os);

        // console.log(E.TOUCH_START);
        this.trigger(EVENT.TOUCH_START, os);
    }

    touchMoveHandler(e) {
        const touches = e.touches;
        const touchItem = touches[0];
        if (!touchItem) {
            // console.log('Not found touch item');
            return;
        }

        const os = this.options;
        os.e = e;
        // keep previous position
        os.previousX = os.currentX;
        os.previousY = os.currentY;
        // current position
        os.currentX = touchItem.clientX;
        os.currentY = touchItem.clientY;

        // current move offset from previous
        os.moveX = os.currentX - os.previousX;
        os.moveY = os.currentY - os.previousY;

        // current offset from start
        os.offsetX = os.currentX - os.startX;
        os.offsetY = os.currentY - os.startY;
        os.changed = !(os.offsetX === 0 && os.offsetY === 0);

        os.touchLength = touches.length;

        os.direction = this.getDirection(os);
        // console.log('direction', o.direction);

        this.addTrackingPoint(os);

        // console.log(E.TOUCH_MOVE);
        this.trigger(EVENT.TOUCH_MOVE, os);

    }

    touchEndHandler(e) {
        this.unbindEvents();

        const os = this.options;
        os.e = e;
        // console.log(E.TOUCH_END);
        this.trigger(EVENT.TOUCH_END, os);

        const changedTouches = e.changedTouches;
        const touchItem = changedTouches[0];
        if (!touchItem) {
            // console.log('Not found touch item');
            return;
        }

        const touches = e.touches;
        os.touchLength = touches.length;

        // should no touches when leave, multiple and not all leave
        if (os.touchLength > 0) {
            return;
        }

        os.currentX = touchItem.clientX;
        os.currentY = touchItem.clientY;

        this.addTrackingPoint(os);

        this.motionStart();

    }

    touchCancelHandler(e) {

        // console.log(e.type, e);

        this.unbindEvents();
        // end for cancel
        this.trigger(EVENT.TOUCH_END, this.options);
    }

    // ============================================================================

    getMotionInfo() {
        const points = this.trackingPoints;
        if (points.length < 2) {
            return;
        }

        this.filterTrackingPoints(points);
        if (points.length < 2) {
            return;
        }

        const fp = points[0];
        const lp = points[points.length - 1];

        const offsetTime = lp.t - fp.t;
        if (offsetTime <= 0) {
            return;
        }

        // calculate inertia

        let offsetX = lp.x - fp.x;
        let offsetY = lp.y - fp.y;

        const ax = Math.abs(offsetX);
        const ay = Math.abs(offsetY);

        // inertia only for one direction
        if (ax > ay) {
            offsetY = 0;
        } else {
            offsetX = 0;
        }

        // max offset distance
        const offsetDistance = Math.max(ax, ay);

        return {
            offsetDistance,
            offsetTime,
            offsetX,
            offsetY
        };

    }

    motionStart() {
        const os = this.options;
        if (!os.inertia) {
            return;
        }

        const motionInfo = this.getMotionInfo();
        if (!motionInfo) {
            return;
        }

        // one time avg touch distance
        const baseDistance = 50;
        const baseDuration = 500;
        const expectDuration = baseDuration * motionInfo.offsetDistance / baseDistance;

        const minDuration = 20;
        const maxDuration = 2000;
        const duration = Util.clamp(expectDuration, minDuration, maxDuration);

        // speed, px/ms
        const speedX = motionInfo.offsetX / motionInfo.offsetTime;
        const speedY = motionInfo.offsetY / motionInfo.offsetTime;

        // console.log('sx', sx, 'sy', sy, 'duration', duration);

        // fps 60/s = 1000/60 = 16.7ms / frame
        // fps 50/s = 20ms / frame
        const s = 20;

        // one frame offset
        const from = {
            x: speedX * s,
            y: speedY * s
        };
        const till = {
            x: 0,
            y: 0
        };

        this.motion = new Motion();
        this.motion.bind(Motion.EVENT.MOTION_MOVE, (e, d) => {
            os.touchInertiaX = d.x;
            os.touchInertiaY = d.y;
            this.trigger(EVENT.TOUCH_INERTIA, os);
        });
        this.motion.start({
            duration: duration,
            from: from,
            till: till
        });
    }

    motionStop() {
        if (this.motion) {
            this.motion.destroy();
            this.motion = null;
        }
    }

    // ============================================================================

    getDirection(o) {
        const ox = o.offsetX;
        const oy = o.offsetY;

        const ax = Math.abs(ox);
        const ay = Math.abs(oy);

        // single direction
        if (ax < ay) {
            if (oy > 0) {
                return CONST.UP;
            }
            if (oy < 0) {
                return CONST.DOWN;
            }
        }

        if (ax > ay) {
            if (ox > 0) {
                return CONST.LEFT;
            }
            if (ox < 0) {
                return CONST.RIGHT;
            }
        }

        return '';
    }

    filterTrackingPoints(points) {
        points.reverse();
        const len = points.length;
        const t = Date.now();
        const inertiaTime = this.options.inertiaTime;
        for (let i = 0; i < len; i++) {
            // remove time > inertiaTime
            if (t - points[i].t > inertiaTime) {
                points.length = i;
                break;
            }
        }
        points.reverse();
        // console.log(points.length, points.map((it) => `${it.t - t}`));
    }

    addTrackingPoint(o) {

        if (!o.inertia) {
            return;
        }

        const x = o.currentX;
        const y = o.currentY;
        const t = Date.now();

        const points = this.trackingPoints;

        points.push({
            x, y, t
        });

        // cache 100 points
        if (points.length > 100) {
            this.filterTrackingPoints(points);
        }

    }

    // ============================================================================

    destroy() {
        this.unbindEvents();
        this.unbind();
    }

}

