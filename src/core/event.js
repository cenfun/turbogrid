class Event {

    constructor(o) {
        Object.assign(this, o);
        this.timeStamp = Date.now();
        this.cancelable = true;
        this.defaultPrevented = false;
        this.isPropagationStopped = false;
        this.isImmediatePropagationStopped = false;
    }

    // removed not native
    preventDefault() {
        this.defaultPrevented = true;
    }

    // just stopped if multiple bind
    stopPropagation() {
        this.isPropagationStopped = true;
    }

    // useless for custom events
    stopImmediatePropagation() {
        this.isImmediatePropagationStopped = true;
        this.stopPropagation();
    }

}

export default Event;
