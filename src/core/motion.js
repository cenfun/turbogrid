import OptionBase from './option-base.js';
import Util from './util.js';
import Easing from './easing.js';

const E = {
    MOTION_START: 'motion_start',
    MOTION_MOVE: 'motion_move',
    MOTION_END: 'motion_end',
    MOTION_STOP: 'motion_stop'
};


export default OptionBase.extend({

    //if stopped then stop everything
    stopped: true,

    constructorOption: null,

    constructor: function(option) {
        this.constructorOption = option;
    },

    getDefaultOption: function() {
        return Util.merge({
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
        }, this.constructorOption);
    },

    stop: function() {
        if (this.stopped) {
            return this;
        }
        //stop everything now
        this.stopped = true;
        this.cancelAnimationFrame();
        this.trigger(E.MOTION_STOP, this.data);
        return this;
    },

    start: function() {
        this.stop();
        this.stopped = false;
        this.setOption.apply(this, arguments);
        //ready
        this.initCalculation();
        //first time move, start potion
        this.data = this.calculateHandler(0);
        this.trigger(E.MOTION_START, this.data);
        //if call stop in start callback
        if (this.stopped) {
            return this;
        }
        //init start time
        this.time = Date.now();
        this.requestAnimationFrame(this.moveHandler);
        return this;
    },

    requestAnimationFrame: function(callback) {
        this.requestId = window.requestAnimationFrame(() => {
            callback.apply(this);
        });
    },

    cancelAnimationFrame: function() {
        window.cancelAnimationFrame(this.requestId);
    },

    getEasing: function(easing) {
        if (typeof easing !== 'function') {
            easing = Util.getValue(Easing, easing, Easing.Linear.None);
        }
        return easing;
    },

    moveHandler: function() {
        //move
        const now = Date.now();
        const t = now - this.time;
        const d = this.duration;
        if (t < d) {
            const k = t / d;
            this.data = this.calculateHandler(k);
            this.trigger(E.MOTION_MOVE, this.data);
            this.requestAnimationFrame(this.moveHandler);
            return;
        }
        //====================================
        //end
        this.cancelAnimationFrame();
        //require last time move
        this.data = this.calculateHandler(1);
        this.trigger(E.MOTION_MOVE, this.data);
        //end
        this.trigger(E.MOTION_END, this.data);
    },

    //================================================================================

    initCalculation: function() {

        const o = this.option;
        this.duration = Util.toNum(o.duration, true) || 100;
        this.easing = this.getEasing(o.easing);
        //console.log(this.easing);

        //for object keys cache
        this.calculateKeys = null;

        const from = o.from;
        const till = o.till;

        if (Util.isNum(from) && Util.isNum(till)) {
            this.calculateType = this.calculateNumber;
            return;
        }

        if (from && typeof from === 'object' && till && typeof till === 'object') {
            this.calculateType = this.calculateObject;
            return;
        }

        this.calculateType = this.calculateNone;
    },

    calculateHandler: function(k) {
        const p = this.easing(k);
        const o = this.option;
        return this.calculateType(p, o.from, o.till);
    },

    calculateObject: function(p, from, till) {
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
    },

    calculateNumber: function(p, from, till) {
        return (till - from) * p + from;
    },

    calculateNone: function(p, from, till) {
        return from;
    },

    //================================================================================

    destroy: function() {
        this.stop();
        this.unbind();
    }

}, E);

