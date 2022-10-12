import Event from './event.js';

const EventUtil = {

    getEventItem: function(target, context, handler, options) {
        context = String(context);
        if (!context) {
            return;
        }

        options = options || {};
        const arr = context.split('.');
        const type = arr.shift();
        const namespace = arr.join('.');

        return {
            type: type,
            target: target,
            context: context,
            namespace: namespace,
            handler: handler,
            once: options.once
        };
    },

    getEventListByString: function(target, types, handler, options) {
        const list = [];
        const arr = types.split(' ');
        arr.forEach(function(type) {
            const eventItem = EventUtil.getEventItem(target, type, handler, options);
            if (eventItem) {
                list.push(eventItem);
            }
        });
        return list;
    },

    getEventListByObject: function(target, types, options) {
        const list = [];
        const keys = Object.keys(types);
        keys.forEach(function(type) {
            const eventItem = EventUtil.getEventItem(target, type, types[type], options);
            if (eventItem) {
                list.push(eventItem);
            }
        });
        return list;
    },

    getEventList: function(target, types, handler, options) {
        if (!types) {
            return [];
        }

        if (typeof types === 'string') {
            return EventUtil.getEventListByString(target, types, handler, options);
        }

        if (typeof types === 'object') {
            return EventUtil.getEventListByObject(target, types, handler);
        }

        return [];
    },

    //=================================================================================================

    addEvent: function(eventListener, event, maxListeners) {
        if (eventListener.events.length >= maxListeners) {
            let msg = 'Possible Event memory leak detected. ';
            msg += `More than ${maxListeners} (max limit) listeners added. `;
            msg += 'Use setMaxListeners(n) to increase limit.';
            console.warn(msg, event);
            return;
        }
        eventListener.events.push(event);
    },

    addEvents: function(eventListeners, eventList, maxListeners) {
        eventList.forEach(function(event) {
            const type = event.type;
            if (!eventListeners[type]) {
                eventListeners[type] = {
                    events: []
                };
            }
            const handler = event.handler;
            if (typeof handler !== 'function') {
                return;
            }
            const eventListener = eventListeners[type];
            EventUtil.addEvent(eventListener, event, maxListeners);
        });
    },

    //=================================================================================================

    removeEventByNamespace: function(eventListeners, namespace) {
        const types = Object.keys(eventListeners);
        types.forEach(function(type) {
            const eventListener = eventListeners[type];
            const newEvents = [];
            eventListener.events.forEach(function(item) {
                if (item && item.namespace !== namespace) {
                    newEvents.push(item);
                }
            });
            eventListener.events = newEvents;
        });
    },

    removeEventByHandler: function(eventListeners, type, handler) {
        const eventListener = eventListeners[type];
        if (!eventListener) {
            return;
        }
        const newEvents = [];
        eventListener.events.forEach(function(item) {
            if (item && item.handler !== handler) {
                newEvents.push(item);
            }
        });
        eventListener.events = newEvents;
    },

    removeEventByType: function(eventListeners, type) {
        const eventListener = eventListeners[type];
        if (!eventListener) {
            return;
        }
        eventListener.events = [];
    },

    removeEvent: function(eventListeners, event) {
        const type = event.type;
        const namespace = event.namespace;
        if (!type && namespace) {
            EventUtil.removeEventByNamespace(eventListeners, namespace);
            return;
        }
        const handler = event.handler;
        if (typeof handler === 'function') {
            EventUtil.removeEventByHandler(eventListeners, type, handler);
            return;
        }
        EventUtil.removeEventByType(eventListeners, type);
    },

    removeEvents: function(eventListeners, eventList) {
        eventList.forEach(function(event) {
            EventUtil.removeEvent(eventListeners, event);
        });
    },

    removeAllEvents: function(eventListeners) {
        const types = Object.keys(eventListeners);
        types.forEach(function(type) {
            EventUtil.removeEventByType(eventListeners, type);
        });
    },

    //=================================================================================================

    sendEventList: function(target, eventListener, event, data) {
        //call each handler if not stopped
        const events = eventListener.events;
        for (let i = 0; i < events.length; i++) {
            const item = events[i];
            //skip once called, not removed but called
            if (item.onceCalled) {
                continue;
            }
            //tag before call handler, because in handler may trigger once again
            if (item.once) {
                item.onceCalled = true;
            }
            event.namespace = item.namespace;
            item.handler.call(target, event, data);
            // should be isImmediatePropagationStopped in native events
            // but custom event can not support bubbles
            if (event.isPropagationStopped) {
                break;
            }
        }

        //remove all onceCalled
        eventListener.events = events.filter((it) => !it.onceCalled);

    },

    sendEvent: function(target, eventListeners, type, data) {
        const eventListener = eventListeners[type];
        if (!eventListener) {
            return;
        }
        const event = new Event({
            type: type,
            target: target,
            currentTarget: target,
            data: data
        });

        EventUtil.sendEventList(target, eventListener, event, data);
    }

};

export default EventUtil;
