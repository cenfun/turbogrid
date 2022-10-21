import EventUtil from './event-util.js';
export default class EventBase {

    maxListeners = 10;

    setMaxListeners(n) {
        this.maxListeners = Number(n) || 10;
    }

    getMaxListeners() {
        return this.maxListeners;
    }

    getEventListeners() {
        if (!this.eventListeners) {
            this.eventListeners = {};
        }
        return this.eventListeners;
    }

    delEventListeners() {
        this.eventListeners = null;
    }

    // =======================================================

    bind(types, handler, options) {
        const eventList = EventUtil.getEventList(this, types, handler, options);
        if (!eventList.length) {
            return this;
        }
        const eventListeners = this.getEventListeners();
        EventUtil.addEvents(eventListeners, eventList, this.maxListeners);
        return this;
    }

    once(types, handler) {
        return this.bind(types, handler, {
            once: true
        });
    }

    unbind(types, handler, options) {
        const eventListeners = this.getEventListeners();
        if (!arguments.length) {
            EventUtil.removeAllEvents(eventListeners);
            return this;
        }
        const eventList = EventUtil.getEventList(this, types, handler, options);
        if (!eventList.length) {
            return this;
        }
        EventUtil.removeEvents(eventListeners, eventList);
        return this;
    }

    trigger(type, data) {
        const eventListeners = this.getEventListeners();
        EventUtil.sendEvent(this, eventListeners, type, data);
        return this;
    }

}
