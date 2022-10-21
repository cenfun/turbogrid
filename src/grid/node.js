import $ from '../core/query.js';
import Util from '../core/util.js';

export default {

    // high performance render node content
    renderNodeContent: function(node, content) {
        if (!node) {
            return;
        }

        // support DOM
        if (content && content.nodeType) {
            this.emptyNode(node);
            node.appendChild(content);
            return;
        }

        // support array DOM
        if (Array.isArray(content)) {
            this.emptyNode(node);
            content.forEach((item) => {
                if (item && item.nodeType) {
                    node.appendChild(item);
                }
            });
            return;
        }

        if (typeof content === 'undefined') {
            content = '';
        }

        // fast render html
        node.innerHTML = content;

    },

    emptyNode: function(node) {
        if (!node) {
            return;
        }
        // fast empty children, 400 times faster than innerHTML = ''
        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }
    },

    removeNode: function(node) {
        if (node && node.parentNode) {
            node.parentNode.removeChild(node);
        }
    },

    appendNode: function(parentNode, node) {
        if (parentNode && node) {
            parentNode.appendChild(node);
        }
    },

    createElement: function(name, attr, children) {
        const elem = document.createElement(name);

        if (attr) {
            Object.keys(attr).forEach(function(k) {
                const v = attr[k];
                if (typeof v !== 'undefined') {
                    elem.setAttribute(k, v);
                }
            });
        }

        if (!Util.isArray(children)) {
            children = [children];
        }

        // must be same type in list
        let html = '';
        children.forEach(function(child) {
            // append DOM
            if (child && child.nodeType) {
                elem.appendChild(child);
                return;
            }

            // append string, number, 0, true/false, null
            if (typeof child !== 'undefined') {
                html += child;
            }

        });

        if (html) {
            elem.innerHTML = html;
        }

        return elem;
    },

    // =========================================================================================================
    // node api

    find: function(context, container) {
        return $(container || this.$container).find(context);
    },

    // return Query
    getRowNodes: function(rowIndex) {
        const item = this.getRowItem(rowIndex);
        if (!item) {
            return;
        }
        return this.getRowNodesByIndex(item.tg_view_index);
    },

    // return Element
    getCellNode: function(rowIndex, columnIndex) {
        const rowItem = this.getRowItem(rowIndex);
        if (!rowItem) {
            return;
        }
        const columnItem = this.getColumnItem(columnIndex);
        if (!columnItem) {
            return;
        }
        return this.getCellNodeByIndex(rowItem.tg_view_index, columnItem.tg_view_index);
    },

    getHeaderItemNode: function(columnInfo) {
        const columnItem = this.getColumnItem(columnInfo);
        if (!columnItem) {
            return;
        }
        return this.getHeaderCache(columnItem.tg_view_index);
    },

    getColumnHeaderNode: function(columnIndex) {
        const headerItemNode = this.getHeaderItemNode(columnIndex);
        if (!headerItemNode) {
            return;
        }
        return headerItemNode.querySelector('.tg-column-header');
    }

};
