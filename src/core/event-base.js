import Extend from './extend.js';
import EventUtil from './event-util.js';

export default Extend.extend({

    maxListeners: 10,

    setMaxListeners: function(n) {
        this.maxListeners = Number(n) || 10;
    },

    getMaxListeners: function() {
        return this.maxListeners;
    },

    getEventListeners: function() {
        if (!this.eventListeners) {
            this.eventListeners = {};
        }
        return this.eventListeners;
    },

    delEventListeners: function() {
        this.eventListeners = null;
    },

    //=======================================================

    bind: function(types, handler, option) {
        const eventList = EventUtil.getEventList(this, types, handler, option);
        if (!eventList.length) {
            return this;
        }
        const eventListeners = this.getEventListeners();
        EventUtil.addEvents(eventListeners, eventList, this.maxListeners);
        return this;
    },

    once: function(types, handler) {
        return this.bind(types, handler, {
            once: true
        });
    },

    unbind: function(types, handler, option) {
        const eventListeners = this.getEventListeners();
        if (!arguments.length) {
            EventUtil.removeAllEvents(eventListeners);
            return this;
        }
        const eventList = EventUtil.getEventList(this, types, handler, option);
        if (!eventList.length) {
            return this;
        }
        EventUtil.removeEvents(eventListeners, eventList);
        return this;
    },

    trigger: function(type, data) {
        const eventListeners = this.getEventListeners();
        EventUtil.sendEvent(this, eventListeners, type, data);
        return this;
    }

});
