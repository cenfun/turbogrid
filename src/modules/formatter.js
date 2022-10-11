import CONST from '../core/const.js';
import Icon from '../core/icon.js';
import Util from '../core/util.js';

import defaultFormatters from '../config/default-formatters.js';

export default {

    //formatter API
    setFormatter: function() {
        this.renderType = 'all';
        const args = Array.from(arguments);
        if (args.length === 0) {
            this.formatters = Util.merge(defaultFormatters);
            return this;
        }
        const firstArg = args[0];
        if (args.length === 1) {
            this.formatters = Util.merge(defaultFormatters, firstArg);
            return this;
        }
        if (typeof firstArg === 'string') {
            //keep formatters for single formatter change
            this.formatters[firstArg] = args[1];
            return this;
        }
        //multiple formatters, concat require Array type
        const list = [defaultFormatters].concat(args);
        this.formatters = Util.merge.apply(null, list);
        return this;
    },

    getFormatter: function(name) {
        if (!name) {
            return;
        }
        const formatter = this.formatters[name];
        if (typeof formatter !== 'function') {
            return;
        }
        return formatter.bind(this);
    },

    getDefaultFormatter: function(name) {
        const formatter = defaultFormatters[name] || defaultFormatters.string;
        return formatter.bind(this);
    },

    //======================================================================================
    //checkbox and radio

    getSelectFormatterContent: function(rowItem) {
        let type = 'radio';
        if (this.option.selectMultiple) {
            type = 'checkbox';
        }

        const icon = Icon.getIcon(type);

        const className = Util.classMap(['tg-select-icon', `tg-${type}`, {
            'tg-selected': rowItem.selected
        }]);

        return `<div class="${className}">${icon}</div>`;
    },

    getRowDragFormatterContent: function(rowItem) {
        if (rowItem.tg_frozen) {
            return '';
        }

        const icon = Icon.getIcon('drag');
        return `<div class="tg-row-drag-icon">${icon}</div>`;
    },

    //======================================================================================
    //tree

    getTreeIndentWidth: function(isTree, isGroup, rowLevel) {

        if (!isTree) {
            return 0;
        }

        // 15 + 5 = 20px first indent
        let indentWidth = 5;

        //first level fix, group tree icon is 15px
        if (!isGroup) {
            indentWidth += CONST.TREE_INDENT;
        }

        indentWidth += rowLevel * CONST.TREE_INDENT;

        return indentWidth;
    },

    getTreeFormatterContent: function(value, rowItem) {
        const isTree = this.rowsInfo.isTree;
        const isGroup = rowItem.tg_group;
        const isEmptyGroup = this.isEmptyGroup(rowItem);
        if (isEmptyGroup) {
            rowItem.collapsed = true;
        }
        const isCollapsed = rowItem.collapsed;
        const rowLevel = Util.toNum(rowItem.tg_level);
        const indentWidth = this.getTreeIndentWidth(isTree, isGroup, rowLevel);

        //console.log('isGroup', isGroup, 'isEmptyGroup', isEmptyGroup, 'isCollapsed', isCollapsed);

        const list = [];

        list.push(`<div class="tg-tree" style="padding-left:${indentWidth}px;">`);

        if (isGroup) {
            const classMap = {
                'tg-tree-icon': true,
                'tg-tree-icon-collapsed': isCollapsed,
                'tg-tree-icon-expanded': !isCollapsed,
                'tg-tree-icon-empty': isEmptyGroup
            };
            const icon = Icon.getIcon('tree');
            const iconElem = `<div class="${Util.classMap(classMap)}">${icon}</div>`;
            list.push(iconElem);
        }

        list.push(`<div class="tg-tree-name">${value}</div>`);

        list.push('</div>');

        return list.join('');
    }

};
