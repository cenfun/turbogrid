import Util from './util.js';
import CONST from './const.js';
import Motion from './motion.js';
import EventBase from './event-base.js';

const EVENT = {
    TOUCH_START: 'touch_start',
    TOUCH_MOVE: 'touch_move',
    TOUCH_END: 'touch_end',
    TOUCH_INERTIA: 'touch_inertia'
};

export default class extends EventBase {

    static EVENT = EVENT;

    createOption(data) {
        return {

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
            inertiaTime: 200,

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
        //safari use window has issue
        Util.bindEvents(this.touchEvents, document.body);
    }

    unbindEvents() {
        this.motionStop();
        Util.unbindEvents(this.touchEvents);
        this.touchEvents = null;
    }

    //============================================================================

    startHandler(e) {

        this.trackingPoints = [];

        const touches = e.touches;
        const touchItem = touches[0];
        if (!touchItem) {
            //console.log('Not found touch item');
            return;
        }

        const o = this.option;
        o.e = e;
        //start position
        o.startX = touchItem.clientX;
        o.startY = touchItem.clientY;
        o.currentX = o.startX;
        o.currentY = o.startY;
        o.touchLength = touches.length;

        this.addTrackingPoint(o);

        //console.log(E.TOUCH_START);
        this.trigger(EVENT.TOUCH_START, o);
    }

    touchMoveHandler(e) {
        const touches = e.touches;
        const touchItem = touches[0];
        if (!touchItem) {
            //console.log('Not found touch item');
            return;
        }

        const o = this.option;
        o.e = e;
        //keep previous position
        o.previousX = o.currentX;
        o.previousY = o.currentY;
        //current position
        o.currentX = touchItem.clientX;
        o.currentY = touchItem.clientY;

        //current move offset from previous
        o.moveX = o.currentX - o.previousX;
        o.moveY = o.currentY - o.previousY;

        //current offset from start
        o.offsetX = o.currentX - o.startX;
        o.offsetY = o.currentY - o.startY;
        o.changed = !(o.offsetX === 0 && o.offsetY === 0);

        o.touchLength = touches.length;

        o.direction = this.getDirection(o);
        //console.log('direction', o.direction);

        this.addTrackingPoint(o);

        //console.log(E.TOUCH_MOVE);
        this.trigger(EVENT.TOUCH_MOVE, o);

    }

    touchEndHandler(e) {
        this.unbindEvents();

        const o = this.option;
        o.e = e;
        //console.log(E.TOUCH_END);
        this.trigger(EVENT.TOUCH_END, o);

        const changedTouches = e.changedTouches;
        const touchItem = changedTouches[0];
        if (!touchItem) {
            //console.log('Not found touch item');
            return;
        }

        const touches = e.touches;
        o.touchLength = touches.length;

        //should no touches when leave, multiple and not all leave
        if (o.touchLength > 0) {
            return;
        }

        o.currentX = touchItem.clientX;
        o.currentY = touchItem.clientY;

        this.addTrackingPoint(o);

        this.motionStart();

    }

    touchCancelHandler(e) {

        console.log(e.type, e);

        this.unbindEvents();
        //end for cancel
        this.trigger(EVENT.TOUCH_END, this.option);
    }

    //============================================================================

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

        //calculate inertia

        let offsetX = lp.x - fp.x;
        let offsetY = lp.y - fp.y;

        const ax = Math.abs(offsetX);
        const ay = Math.abs(offsetY);

        //inertia only for one direction
        if (ax > ay) {
            offsetY = 0;
        } else {
            offsetX = 0;
        }

        //max offset distance
        const offsetDistance = Math.max(ax, ay);

        return {
            offsetDistance,
            offsetTime,
            offsetX,
            offsetY
        };

    }

    motionStart() {
        const o = this.option;
        if (!o.inertia) {
            return;
        }

        const motionInfo = this.getMotionInfo();
        if (!motionInfo) {
            return;
        }

        //one time avg touch distance
        const baseDistance = 50;
        const baseDuration = 500;
        const expectDuration = baseDuration * motionInfo.offsetDistance / baseDistance;

        const minDuration = 20;
        const maxDuration = 2000;
        const duration = Util.clamp(expectDuration, minDuration, maxDuration);

        //speed, px/ms
        const speedX = motionInfo.offsetX / motionInfo.offsetTime;
        const speedY = motionInfo.offsetY / motionInfo.offsetTime;

        //console.log('sx', sx, 'sy', sy, 'duration', duration);

        //fps 60/s = 1000/60 = 16.7ms / frame
        //fps 50/s = 20ms / frame
        const s = 20;

        //one frame offset
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
            o.touchInertiaX = d.x;
            o.touchInertiaY = d.y;
            this.trigger(EVENT.TOUCH_INERTIA, o);
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

    //============================================================================

    getDirection(o) {
        const ox = o.offsetX;
        const oy = o.offsetY;

        const ax = Math.abs(ox);
        const ay = Math.abs(oy);

        const minV = Math.min(ax, ay);
        const maxV = Math.max(ax, ay);

        //the direction slope
        const getSlope = function() {
            if (maxV < 5) {
                return 0.5;
            }
            if (maxV < 10) {
                return 0.4;
            }
            if (maxV < 20) {
                return 0.3;
            }
            return 0.2;
        };
        const slope = getSlope();
        //console.log(slope);

        const s = minV / maxV;
        //console.log(s);

        //mixing direction
        if (s > slope) {
            return '';
        }

        //single direction
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

    }

    filterTrackingPoints(points) {
        points.reverse();
        const len = points.length;
        const t = Date.now();
        const inertiaTime = this.option.inertiaTime;
        for (let i = 0; i < len; i++) {
            //remove time > inertiaTime
            if (t - points[i].t > inertiaTime) {
                points.length = i;
                break;
            }
        }
        points.reverse();
        //console.log(points.length, points.map((it) => `${it.t - t}`));
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

        //cache 100 points
        if (points.length > 100) {
            this.filterTrackingPoints(points);
        }

    }

    //============================================================================

    destroy() {
        this.unbindEvents();
        this.unbind();
    }

}

