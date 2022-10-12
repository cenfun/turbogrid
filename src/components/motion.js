import EventBase from '../core/event-base.js';
import Util from '../core/util.js';

const Easing = {
    Linear: {
        None: function(k) {
            return k;
        }
    }
};

const EVENT = {
    MOTION_START: 'motion_start',
    MOTION_MOVE: 'motion_move',
    MOTION_END: 'motion_end',
    MOTION_STOP: 'motion_stop'
};


export default class Motion extends EventBase {

    static EVENT = EVENT;

    constructor(options) {
        super();
        this.constructorOptions = options;
        //if stopped then stop everything
        this.stopped = true;
    }

    generateOptions(options) {
        const defaultOptions = {
            //default is Easing.linear
            easing: null,

            //total time
            duration: 100,

            //from data
            from: 0,
            //till data
            till: 1,
            //current data(private)
            data: 0
        };
        return Util.merge(defaultOptions, this.constructorOptions, options);
    }

    stop() {
        if (this.stopped) {
            return this;
        }
        //stop everything now
        this.stopped = true;
        this.cancelAnimationFrame();
        this.trigger(EVENT.MOTION_STOP, this.data);
        return this;
    }

    start(options) {
        this.stop();
        this.stopped = false;
        this.options = this.generateOptions(options);

        //ready
        this.initCalculation();
        //first time move, start potion
        this.data = this.calculateHandler(0);
        this.trigger(EVENT.MOTION_START, this.data);
        //if call stop in start callback
        if (this.stopped) {
            return this;
        }
        //init start time
        this.time = Date.now();
        this.requestAnimationFrame(this.moveHandler);
        return this;
    }

    requestAnimationFrame(callback) {
        this.requestId = window.requestAnimationFrame(() => {
            callback.apply(this);
        });
    }

    cancelAnimationFrame() {
        window.cancelAnimationFrame(this.requestId);
    }

    getEasing(easing) {
        if (typeof easing !== 'function') {
            easing = Util.getValue(Easing, easing, Easing.Linear.None);
        }
        return easing;
    }

    moveHandler() {
        //move
        const now = Date.now();
        const t = now - this.time;
        const d = this.duration;
        if (t < d) {
            const k = t / d;
            this.data = this.calculateHandler(k);
            this.trigger(EVENT.MOTION_MOVE, this.data);
            this.requestAnimationFrame(this.moveHandler);
            return;
        }
        //====================================
        //end
        this.cancelAnimationFrame();
        //require last time move
        this.data = this.calculateHandler(1);
        this.trigger(EVENT.MOTION_MOVE, this.data);
        //end
        this.trigger(EVENT.MOTION_END, this.data);
    }

    //================================================================================

    initCalculation() {

        const os = this.options;
        this.duration = Util.toNum(os.duration, true) || 100;
        this.easing = this.getEasing(os.easing);
        //console.log(this.easing);

        //for object keys cache
        this.calculateKeys = null;

        const from = os.from;
        const till = os.till;

        if (Util.isNum(from) && Util.isNum(till)) {
            this.calculateType = this.calculateNumber;
            return;
        }

        if (from && typeof from === 'object' && till && typeof till === 'object') {
            this.calculateType = this.calculateObject;
            return;
        }

        this.calculateType = this.calculateNone;
    }

    calculateHandler(k) {
        const p = this.easing(k);
        const os = this.options;
        return this.calculateType(p, os.from, os.till);
    }

    calculateObject(p, from, till) {
        const d = {};
        if (this.calculateKeys) {
            this.calculateKeys.forEach((k) => {
                d[k] = this.calculateNumber(p, from[k], till[k]);
            });
            return d;
        }
        //first time cache calculate keys
        this.calculateKeys = [];
        Object.keys(from).forEach((k) => {
            const fv = from[k];
            const tv = till[k];
            //first time number checking
            if (Util.isNum(fv) && Util.isNum(tv)) {
                d[k] = this.calculateNumber(p, fv, tv);
                this.calculateKeys.push(k);
            }
        });
        return d;
    }

    calculateNumber(p, from, till) {
        return (till - from) * p + from;
    }

    calculateNone(p, from, till) {
        return from;
    }

    //================================================================================

    destroy() {
        this.stop();
        this.unbind();
    }

}

