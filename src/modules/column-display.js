import Util from '../core/util.js';

export default {

    setColumnWidth: function(columnIndex, width) {
        const changed = this.updateColumnWidth(columnIndex, width);
        if (!changed) {
            return this;
        }
        //sync
        this.resize();
        return this;
    },

    //=============================================================================
    //for set column width and adjust column width
    updateColumnWidth: function(columnIndex, width) {
        const column = this.getColumnItem(columnIndex);
        if (!column) {
            return false;
        }
        if (!Util.isNum(width)) {
            return false;
        }

        width = Math.round(width);
        width = Math.max(0, width);

        if (column.tg_width === width) {
            return false;
        }

        column.width = width;
        //force to update width range
        column.minWidth = Math.min(column.minWidth, width);
        column.maxWidth = Math.max(column.maxWidth, width);

        this.updateViewColumnWidth(column);

        return true;
    },

    //=============================================================================

    showColumn: function(columnInfo) {
        return this.updateColumnsInvisible(this.toColumnItemList(columnInfo), false);
    },

    hideColumn: function(columnInfo) {
        return this.updateColumnsInvisible(this.toColumnItemList(columnInfo), true);
    },

    updateColumnsInvisible: function(columnList, invisible) {
        if (!columnList.length) {
            return false;
        }
        const changedList = [];
        columnList.forEach((columnItem) => {
            if (columnItem.invisible === invisible) {
                return;
            }
            columnItem.invisible = invisible;
            columnItem.tg_invisible = invisible;
            changedList.push(columnItem);
        });

        if (!changedList.length) {
            return false;
        }

        this.render('columns');

        return true;
    }
};

