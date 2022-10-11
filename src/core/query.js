import Util from './util.js';

const cssNumber = {
    'animationIterationCount': true,
    'columnCount': true,
    'fillOpacity': true,
    'flexGrow': true,
    'flexShrink': true,
    'fontWeight': true,
    'lineHeight': true,
    'opacity': true,
    'order': true,
    'orphans': true,
    'widows': true,
    'zIndex': true,
    'zoom': true
};

const isWindow = function(obj) {
    return obj !== null && typeof obj !== 'undefined' && obj === obj.window;
};

const isDocument = function(obj) {
    return obj !== null && obj.nodeType === 9;
};

const isElement = function(obj) {
    return obj !== null && obj.nodeType === 1;
};

const camelCase = function(string) {
    return string.replace(/-([a-z])/g, function(all, letter) {
        return letter.toUpperCase();
    });
};

const getStyle = function(elem) {
    let view = elem.ownerDocument.defaultView;
    if (!view || !view.opener) {
        view = window;
    }
    return view.getComputedStyle(elem);
};

const elementDisplay = {};
const getDefaultDisplay = function(nodeName) {
    if (!elementDisplay[nodeName]) {
        const element = document.createElement(nodeName);
        document.body.appendChild(element);
        const display = getStyle(element).display;
        element.parentNode.removeChild(element);
        elementDisplay[nodeName] = display;
    }
    return elementDisplay[nodeName];
};

const getElementDimension = function(node, dimension) {
    if (isWindow(node)) {
        return node[`inner${dimension}`];
    }

    if (isDocument(node)) {
        node = node.body;
    }

    //when container width is 0
    //clientWidth 0, offsetWidth 0, but scrollWidth may not be 0

    //node[`offset${dimension}`] || node[`scroll${dimension}`]
    return node[`client${dimension}`];
};

const Query = function(selector) {
    this.list = [];
    if (!selector) {
        return this;
    }
    return this.create(selector);
};

Query.prototype = {

    constructor: Query,

    Query: 'Query',

    list: [],

    create: function(selector) {
        if (selector instanceof Query) {
            return selector;
        }
        if (typeof selector === 'string') {
            return this.createFromString(selector);
        }
        if (selector.nodeType || selector === window) {
            this.list = [selector];
        }
        return this;
    },

    createFromString: function(selector) {
        selector = selector.trim();
        if (selector[0] === '<' && selector[selector.length - 1] === '>' && selector.length >= 3) {
            this.parseHTML(selector);
        } else {
            const nodeList = document.querySelectorAll(selector);
            for (let i = 0, l = nodeList.length; i < l; i++) {
                this.list[i] = nodeList[i];
            }
        }
        return this;
    },

    parseHTML: function(str) {
        const div = document.createElement('div');
        div.innerHTML = str;

        let n = div.firstChild;
        while (n) {
            if (isElement(n)) {
                this.list.push(n);
            }
            n = n.nextSibling;
        }

        return this;
    },

    //====================================================================================

    get: function(i) {
        return this.list[i];
    },

    each: function(callback) {
        if (typeof callback !== 'function') {
            return this;
        }
        const list = this.list;
        for (let i = 0, l = list.length; i < l; i++) {
            const node = list[i];
            const res = callback.call(this, node, i);
            if (res === false) {
                break;
            }
        }
        return this;
    },

    add: function(item) {
        if (!item) {
            return this;
        }
        const list = this.list;
        if (item instanceof Query) {
            item.each(function(node) {
                list.push(node);
            });
            return this;
        }
        if (item.nodeType) {
            list.push(item);
        }
        return this;
    },

    empty: function() {
        this.each(function(node) {
            node.innerHTML = '';
        });
        return this;
    },

    remove: function() {
        this.each(function(node, i) {
            if (node && node.parentNode) {
                node.parentNode.removeChild(node);
            }
        });
        this.list = [];
        return this;
    },

    find: function(selector) {
        const results = new Query();
        if (!selector || typeof selector !== 'string') {
            return results;
        }
        this.each(function(node) {
            if (node && node.querySelectorAll) {
                const nodeList = node.querySelectorAll(selector);
                for (let i = 0, l = nodeList.length; i < l; i++) {
                    results.add(nodeList[i]);
                }
            }
        });
        return results;
    },

    prepend: function(selector) {
        if (!selector) {
            return this;
        }
        const child = new Query(selector);
        this.each(function(parentNode) {
            child.each(function(childNode) {
                parentNode.insertBefore(childNode, parentNode.firstChild);
            });
        });
        return this;
    },

    append: function(selector) {
        if (!selector) {
            return this;
        }
        const child = new Query(selector);
        this.each(function(parentNode) {
            child.each(function(childNode) {
                parentNode.appendChild(childNode);
            });
        });
        return this;
    },

    appendTo: function(selector) {
        if (!selector) {
            return this;
        }
        const parent = new Query(selector);
        this.each(function(node) {
            parent.append(node);
        });
        return this;
    },

    html: function(str) {
        if (arguments.length === 0) {
            const node = this.get(0);
            if (node) {
                return node.innerHTML;
            }
            return '';
        }
        this.each(function(node) {
            node.innerHTML = str;
        });
        return this;
    },

    width: function(value) {
        if (arguments.length === 0) {
            const node = this.get(0);
            if (node) {
                return getElementDimension(node, 'Width');
            }
            return 0;
        }
        this.css('width', value);
        return this;
    },

    height: function(value) {
        if (arguments.length === 0) {
            const node = this.get(0);
            if (node) {
                return getElementDimension(node, 'Height');
            }
            return 0;
        }
        this.css('height', value);
        return this;
    },

    css: function(key, value) {
        if (!key) {
            return this;
        }
        if (arguments.length === 1) {
            if (typeof key === 'object') {
                Object.keys(key).forEach((k) => {
                    this.css(k, key[k]);
                });
            } else {
                const node = this.get(0);
                if (node) {
                    const style = getStyle(node);
                    return style[camelCase(key)];
                }
                return;
            }
        }
        this.each(function(node) {
            let v = value;
            if (typeof v === 'number' && !cssNumber[key]) {
                v += 'px';
            }
            node.style[key] = v;
        });
        return this;
    },

    attr: function(key, value) {
        if (!key) {
            return this;
        }

        if (arguments.length === 1) {
            //set obj
            if (typeof key === 'object') {
                Object.keys(key).forEach((k) => {
                    this.attr(k, key[k]);
                });
                return this;
            }

            //get key
            const node = this.get(0);
            if (node) {
                return node.getAttribute(key);
            }
            //if no attribute
            return;
        }

        //set key value
        this.each(function(node) {
            node.setAttribute(key, value);
        });
        return this;
    },

    removeAttr: function(key) {
        if (!key) {
            return this;
        }
        this.each(function(node) {
            if (node.hasAttribute(key)) {
                node.removeAttribute(key);
            }
        });
        return this;
    },

    removeClass: function(str) {
        if (!arguments.length) {
            //remove all
            this.each(function(node) {
                node.className = '';
            });
            return this;
        }
        if (!str || typeof str !== 'string') {
            return this;
        }
        const arr = str.split(' ');
        this.each(function(node) {
            arr.forEach(function(item) {
                if (item) {
                    node.classList.remove(item);
                }
            });
        });
        return this;
    },

    addClass: function(str) {
        if (!str || typeof str !== 'string') {
            return this;
        }
        const arr = str.split(' ');
        this.each(function(node) {
            arr.forEach(function(item) {
                if (item) {
                    node.classList.add(item);
                }
            });
        });
        return this;
    },

    hasClass: function(str) {
        if (!str || typeof str !== 'string') {
            return false;
        }
        let has = false;
        this.each(function(node) {
            const res = node.classList.contains(str);
            if (res) {
                has = true;
                return false;
            }
        });
        return has;
    },

    show: function() {
        this.each(function(node) {
            if (!isElement(node)) {
                return;
            }
            const display = getDefaultDisplay(node.nodeName);
            node.style.display = display;
        });
        return this;
    },

    hide: function() {
        this.each(function(node) {
            if (!isElement(node)) {
                return;
            }
            const display = node.style.display;
            if (display === 'none') {
                return;
            }
            node.style.display = 'none';
        });
        return this;
    },

    click: function() {
        const node = this.get(0);
        if (node && typeof node.click === 'function') {
            node.click();
        }
        return this;
    },

    offset: function() {
        const rect = {
            left: 0,
            top: 0
        };
        const node = this.get(0);
        if (node) {
            const br = node.getBoundingClientRect();
            rect.left = br.left + window.scrollX;
            rect.top = br.top + window.scrollY;
        }
        return rect;
    },

    clone: function() {
        const q = new Query();
        this.each(function(node) {
            if (node && node.cloneNode) {
                const copy = node.cloneNode(true);
                q.add(copy);
            }
        });
        return q;
    },

    children: function() {
        const q = new Query();
        this.each(function(node) {
            let n = node.firstChild;
            while (n) {
                q.add(n);
                n = n.nextSibling;
            }
        });
        return q;
    },

    parent: function() {
        const node = this.get(0);
        if (node) {
            return new Query(node.parentNode);
        }
        return new Query();
    },

    is: function(str) {
        if (!str) {
            return false;
        }
        const arr = str.split(',');
        let res = true;
        this.each(function(node) {
            //window no nodeName
            if (!node.nodeName) {
                res = false;
                return false;
            }
            const name = node.nodeName.toLowerCase();
            if (!Util.inList(name, arr)) {
                res = false;
                return false;
            }
        });
        return res;
    }

};

Object.defineProperty(Query.prototype, 'length', {
    get: function() {
        return this.list.length;
    }
});

export default function(selector) {
    return new Query(selector);
}

