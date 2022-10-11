const Event = function(o) {
    Object.assign(this, o);
    this.timeStamp = new Date().getTime();
};

Event.prototype = {
    constructor: Event,
    cancelable: true,

    //removed not native
    defaultPrevented: false,
    preventDefault: function() {
        this.defaultPrevented = true;
    },

    //just stopped if multiple bind
    isPropagationStopped: false,
    stopPropagation: function() {
        this.isPropagationStopped = true;
    },

    //useless for custom events
    isImmediatePropagationStopped: false,
    stopImmediatePropagation: function() {
        this.isImmediatePropagationStopped = true;
        this.stopPropagation();
    }

};

export default Event;
