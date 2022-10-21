import E from '../core/event-types.js';
import Util from '../core/util.js';

export default {

    getColumnItem: function(context) {
        if (Util.isNum(context)) {
            if (context < 0) {
                context = this.columnsInfo.length + context;
            }
            return this.columnsInfo.indexCache[context];
        }
        if (!context) {
            return;
        }
        if (Util.isNum(context.tg_index)) {
            return context;
        }
        return this.getColumnItemById(context.id || context);
    },

    getColumnItemById: function(id) {
        return this.getColumnItemBy('id', id);
    },

    getColumnItemBy: function(key, value) {
        if (typeof value === 'undefined') {
            return;
        }
        return this.columnsInfo.indexCache.find((item) => item[key] === value);
    },

    getColumnsLength: function(total) {
        if (total) {
            return this.columnsInfo.length;
        }
        return this.viewColumns.length;
    },

    getViewColumnItem: function(columnIndex) {
        return this.viewAllColumns[columnIndex];
    },

    // ==========================================================================================


    isColumnSortable: function(columnItem) {
        if (!columnItem) {
            return false;
        }
        if (columnItem.tg_group) {
            return false;
        }
        if (!columnItem.name || !columnItem.id) {
            return false;
        }
        return this.isSortable(columnItem);
    },

    isColumnResizable: function(columnItem) {
        if (!columnItem) {
            return false;
        }
        if (columnItem.tg_group) {
            return false;
        }
        // default is true
        if (!Util.hasOwn(columnItem, 'resizable')) {
            return true;
        }
        return Boolean(columnItem.resizable);
    },

    // ==========================================================================================
    // only single column
    updateViewColumnWidth: function(columnItem) {

        // sync width to tg_width
        columnItem.tg_width = columnItem.width;

        this.updateColumnHeaderSize(columnItem);

        this.updateTotalColumnsWidth();
        this.updateHeaderLayerHeight();
        this.cssRulesInvalid = true;
        this.resizeBodyHandler();

        // console.log('onColumnWidthChanged', columnItem.name);
        this.trigger(E.onColumnWidthChanged, columnItem);

        return true;
    },

    // depends columns changed: add/delete/show/hide/invisible
    // frozenColumn/frozenRight changed
    updateTotalColumnsWidth: function() {

        // reset blank column
        this.blankColumn.tg_width = 0;

        const columns = this.viewColumns;

        // update left right total width
        let columnsWidthL = 0;
        let columnsWidthR = 0;

        const fcs = this.frozenInfo.columns;

        const len = columns.length;
        // x position
        let left = 0;
        for (let i = 0; i < len; i++) {
            const column = columns[i];
            column.tg_left = left;

            const width = column.tg_width;
            if (width > 0) {
                left += width;
                if (fcs && i >= fcs) {
                    columnsWidthR += width;
                } else {
                    columnsWidthL += width;
                }
            }
        }

        if (this.frozenInfo.right) {
            const columnsWidthTemp = columnsWidthL;
            columnsWidthL = columnsWidthR;
            columnsWidthR = columnsWidthTemp;
        }

        this.columnsWidthL = columnsWidthL;
        this.columnsWidthR = columnsWidthR;

        // total width
        this.columnsWidth = columnsWidthL + columnsWidthR;

    },

    // ==========================================================================================

    updateColumnHeaderSize: function(columnItem) {
        // change width for column elements, both for all parent container
        this.updateColumnHeaderWidth(columnItem);
        this.updateColumnHeaderHeight(columnItem, true);
        this.updateColumnGroupWidth(columnItem);
    },

    updateColumnHeaderWidth: function(columnItem) {

        const node = this.getColumnHeaderNode(columnItem);
        if (!node) {
            return;
        }

        const w = columnItem.tg_width;
        if (this.isInvisible(columnItem) || w <= 0) {
            node.style.display = 'none';
        } else {
            node.style.display = '';
            // do NOT use $node.width(width), it has column border issue
            node.style.width = `${w}px`;
        }

    },

    // update height depends width and display state
    // because width could be 0, then column is hidden
    updateColumnHeaderHeight: function(columnItem, force) {

        // default to 0
        columnItem.tg_height = 0;

        // no width column
        if (columnItem.tg_width <= 0) {
            return;
        }

        if (this.isInvisible(columnItem)) {
            return;
        }

        // force means force update, remove cache
        if (force) {
            columnItem.tg_element_height = 0;
        }

        // use cache if exist
        const eh = columnItem.tg_element_height;
        if (eh) {
            columnItem.tg_height = eh;
            return;
        }

        const ch = this.getColumnHeaderHeight(columnItem);
        // console.log(ch);
        columnItem.tg_height = ch;
        // cache element height
        columnItem.tg_element_height = ch;

    },

    getColumnHeaderHeight: function(columnItem) {
        const node = this.getColumnHeaderNode(columnItem);
        if (!node) {
            return 0;
        }
        // get real height
        return node.clientHeight;
    },

    updateColumnGroupWidth: function(columnItem) {
        const group = columnItem.tg_parent;
        if (!group) {
            return;
        }
        const width = this.getColumnGroupWidth(group);
        if (group.tg_width === width) {
            return;
        }
        group.tg_width = width;
        this.updateColumnHeaderSize(group);
    },

    getColumnGroupWidth: function(group) {
        if (this.isInvisible(group)) {
            return 0;
        }
        let width = 0;
        if (group.subs) {
            group.subs.forEach((item) => {
                if (this.isInvisible(item)) {
                    return;
                }
                if (Util.isNum(item.tg_width)) {
                    width += item.tg_width;
                }
            });
        }
        return width;
    }

};
