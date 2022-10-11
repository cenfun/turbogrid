import isObject from './is-object.js';
import merge from './merge.js';
import Microtask from './microtask.js';

const gridInstanceMap = new WeakMap();

const Util = {

    isObject: isObject,
    merge: merge,

    hasOwn: function(obj, key) {
        return Object.prototype.hasOwnProperty.call(obj, key);
    },

    uid: function(len = 8, prefix = '') {
        const dict = '0123456789abcdefghijklmnopqrstuvwxyz';
        const dictLen = dict.length;
        let str = prefix;
        while (len--) {
            str += dict[Math.random() * dictLen | 0];
        }
        return str;
    },

    //=================================================================================
    //number
    //if is valid number
    isNum: function(num) {
        if (typeof num !== 'number' || isNaN(num)) {
            return false;
        }
        const isInvalid = function(n) {
            if (n === Number.MAX_VALUE || n === Number.MIN_VALUE || n === Number.NEGATIVE_INFINITY || n === Number.POSITIVE_INFINITY) {
                return true;
            }
            return false;
        };
        if (isInvalid(num)) {
            return false;
        }
        return true;
    },
    // format to a valid number
    toNum: function(num, toInt) {
        if (typeof num !== 'number') {
            num = parseFloat(num);
        }
        if (isNaN(num)) {
            num = 0;
        }
        if (toInt && !Number.isInteger(num)) {
            num = Math.round(num);
        }
        return num;
    },

    //try to convert number if it is a string number
    convertNum: function(str) {
        if (typeof str === 'string') {
            //keep string if can not be converted
            const reg = /^[-+]?\d+(\.\d+)?$/ig;
            if (reg.test(str)) {
                return parseFloat(str);
            }
        }
        return str;
    },

    clamp: function(num, min, max) {
        return Math.max(Math.min(num, max), min);
    },

    per: function(num) {
        num = Util.toNum(num);
        num = Util.clamp(num, 0, 1);
        return num;
    },

    //string replace {name}
    replace: function(str, obj) {
        str = `${str}`;
        if (!obj) {
            return str;
        }
        str = str.replace(/\{([^}]+)\}/g, function(match, key) {
            if (!Util.hasOwn(obj, key)) {
                return match;
            }
            return obj[key];
        });
        return str;
    },

    //whether data is array with length
    isArray: function(data) {
        if (data && data instanceof Array) {
            return true;
        }
        return false;
    },

    toList: function(data) {
        if (data instanceof Array) {
            return data;
        }
        if (typeof data === 'undefined') {
            return [];
        }
        //string has length, must be first
        if (typeof data === 'string') {
            return [data];
        }
        if (data && Util.hasOwn(data, 'length')) {
            return Array.from(data);
        }
        return [data];
    },

    isList: function(data) {
        if (Util.isArray(data) && data.length > 0) {
            return true;
        }
        return false;
    },
    //whether item in list
    inList: function(item, list) {
        if (!Util.isList(list)) {
            return false;
        }

        for (let i = 0, l = list.length; i < l; i++) {
            if (list[i] === item) {
                return true;
            }
        }

        return false;
    },

    isDate: function(date) {
        if (!date || !(date instanceof Date)) {
            return false;
        }
        //is Date Object but Date {Invalid Date}
        if (isNaN(date.getTime())) {
            return false;
        }
        return true;
    },

    isPromise: function(obj) {
        return Boolean(obj) && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
    },

    //getValue({a:{b:1}}, "a.b", 0)
    getValue: function(data, path, defaultValue) {
        if (!path) {
            return defaultValue;
        }
        let current = data;
        const list = path.split('.');
        const lastKey = list.pop();
        while (current && list.length) {
            const item = list.shift();
            current = current[item];
        }
        if (current && Util.hasOwn(current, lastKey)) {
            const value = current[lastKey];
            if (typeof value !== 'undefined') {
                return value;
            }
        }
        return defaultValue;
    },

    forEachTree: function(tree, callback) {
        const forEachAll = (ls, parent) => {
            if (!Util.isList(ls)) {
                return;
            }
            let i = 0;
            const l = ls.length;
            while (i < l) {
                const item = ls[i];
                const result = callback(item, i, parent);
                if (result === false) {
                    return false;
                }
                const subResult = forEachAll(item.subs, item);
                if (subResult === false) {
                    return false;
                }
                i++;
            }
        };
        forEachAll(tree);
    },

    removePreProps: function(target, pre) {
        if (!target || !pre) {
            return;
        }
        Object.keys(target).filter((it) => it.startsWith(pre)).forEach((k) => {
            target[k] = null;
        });
    },

    hasShiftKey: function(e) {
        let shiftKey = false;
        if (e) {
            shiftKey = e.shiftKey;
        }
        return shiftKey;
    },

    isMobile: function() {
        return 'ontouchstart' in window;
    },

    contains: function(container, target) {
        if (!container || !target) {
            return false;
        }
        if (container === target) {
            return true;
        }
        if (typeof container.contains === 'function') {
            return container.contains(target);
        }
        let parent = target.parentNode;
        while (parent) {
            if (parent === container) {
                return true;
            }
            parent = parent.parentNode;
        }
        return false;
    },

    /*eslint-disable complexity */
    //https://github.com/mysticatea/eaw
    isNarrowCharacter: function(character) {
        const cp = character.codePointAt(0);
        return (
            (cp >= 0x20 && cp <= 0x7E)
            || cp === 0xA2
            || cp === 0xA3
            || cp === 0xA5
            || cp === 0xA6
            || cp === 0xAC
            || cp === 0xAF
            || cp === 0x20A9
            || (cp >= 0x27E6 && cp <= 0x27ED)
            || cp === 0x2985
            || cp === 0x2986
            || (cp >= 0xFF61 && cp <= 0xFFBE)
            || (cp >= 0xFFC2 && cp <= 0xFFC7)
            || (cp >= 0xFFCA && cp <= 0xFFCF)
            || (cp >= 0xFFD2 && cp <= 0xFFD7)
            || (cp >= 0xFFDA && cp <= 0xFFDC)
            || (cp >= 0xFFE8 && cp <= 0xFFEE)
        );
    },
    /*eslint-enable */

    getCharLen: function(text) {
        let len = 0;
        if (!text) {
            return len;
        }
        for (const c of String(text)) {
            len += Util.isNarrowCharacter(c) ? 1 : 2;
        }
        return len;
    },

    pascalToKebabCase: function(text) {
        return (`${text}`).trim()
            .replace(/([a-z])([A-Z])/g, '$1-$2')
            .replace(/\W/g, (m) => ((/[À-ž]/).test(m) ? m : '-'))
            .replace(/^-+|-+$/g, '')
            .replace(/-{2,}/g, '-')
            .toLowerCase();
    },

    classMap: function(obj) {
        if (typeof obj === 'string') {
            return obj.trim();
        }
        if (Array.isArray(obj)) {
            let ls = obj.filter((it) => it);
            ls = ls.map((it) => {
                if (it && typeof it === 'object') {
                    return Util.classMap(it);
                }
                return String(it).trim();
            });
            ls = ls.filter((it) => it);
            ls = Array.from(new Set(ls));
            return ls.join(' ');
        }
        if (obj && typeof obj === 'object') {
            const ls = [];
            Object.keys(obj).forEach((key) => {
                if (obj[key]) {
                    ls.push(key);
                }
            });
            return ls.join(' ');
        }
        return '';
    },

    styleMap: function(obj) {
        if (typeof obj === 'string') {
            return obj.trim();
        }
        if (Array.isArray(obj)) {
            let ls = obj.filter((it) => it);
            ls = ls.map((it) => {
                const str = String(it).trim();
                if (!str) {
                    return '';
                }
                // format: color: red;
                if (str.indexOf(':') === -1) {
                    return '';
                }
                if (str.endsWith(';')) {
                    return str;
                }
                return `${str};`;

            });
            ls = ls.filter((it) => it);
            ls = Array.from(new Set(ls));
            return ls.join(' ');
        }
        if (obj && typeof obj === 'object') {
            const ls = [];
            Object.keys(obj).forEach((key) => {
                const v = obj[key];
                if (v || v === 0) {
                    const s = String(v).trim();
                    if (s) {
                        ls.push(`${Util.pascalToKebabCase(key)}: ${s};`);
                    }
                }
            });
            return ls.join(' ');
        }
        return '';
    },

    // for auto test
    // get current page instance
    // turbogrid.Grid.getInstance(document.querySelector(".tg-turbogrid").getAttribute("id"))
    getInstance: function(id) {
        if (id) {
            const container = document.getElementById(id);
            if (container) {
                return gridInstanceMap.get(container);
            }
        }
    },

    setInstance: function(container, instance) {
        if (container) {
            gridInstanceMap.set(container, instance);
        }
    },

    bindEvents: function(events, target) {
        if (!events) {
            return;
        }
        Util.unbindEvents(events);
        Object.keys(events).forEach((type) => {
            const item = events[type];
            item.target = item.target || target;
            item.target.addEventListener(type, item.handler, item.options);
        });
    },

    unbindEvents: function(events) {
        if (!events) {
            return;
        }
        Object.keys(events).forEach((type) => {
            const item = events[type];
            if (item.target) {
                item.target.removeEventListener(type, item.handler, item.options);
            }
        });
    },

    //prevent native events default
    preventDefault: function(e) {
        if (e && typeof e.preventDefault === 'function' && e.cancelable) {
            e.preventDefault();
        }
    },


    debounce: function(callback, delay = 100) {
        let timeout;
        const handler = function() {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                callback.apply(this, arguments);
            }, delay);
        };
        handler.cancel = () => {
            clearTimeout(timeout);
        };
        return handler;
    },

    throttle: function(callback, delay = 100) {
        let last = 0;
        let timeout;
        const handler = function() {
            const now = Date.now();
            if (now > last + delay) {
                clearTimeout(timeout);
                last = now;
                callback.apply(this, arguments);
                return;
            }

            clearTimeout(timeout);
            timeout = setTimeout(() => {
                last = now;
                callback.apply(this, arguments);
            }, delay);

        };
        handler.cancel = () => {
            clearTimeout(timeout);
            last = 0;
        };
        return handler;
    },

    microtask: function(callback) {
        const mt = new Microtask();
        const handler = function() {
            mt.start(() => {
                callback.apply(this, arguments);
            });
        };
        handler.cancel = () => {
            mt.cancel();
        };
        return handler;
    },

    cancelAsync: function(target) {
        if (!target) {
            return;
        }

        Object.keys(target).filter((it) => it.startsWith('async') && typeof target[it] === 'function').forEach((k) => {
            const fun = target[k];
            if (typeof fun.cancel === 'function') {
                fun.cancel();
                target[k] = null;
            }
        });

        Object.keys(target).filter((it) => it.startsWith('timeout')).forEach((k) => {
            clearTimeout(target[k]);
        });

    }

};

export default Util;
