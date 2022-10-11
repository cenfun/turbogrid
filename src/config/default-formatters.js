export default {

    //header formatter
    header: function(value, rowItem, columnItem, cellNode) {
        return value;
    },

    //====================================================================================
    //cell formatter by type

    null: function(value, rowItem, columnItem, cellNode) {
        if (rowItem && rowItem.tg_group) {
            return value;
        }
        if (value === null || typeof value === 'undefined') {
            return '—';
        }
        return value;
    },

    blank: function(value, rowItem, columnItem, cellNode) {
        return '';
    },

    //default
    string: function(value, rowItem, columnItem, cellNode) {
        return value;
    },

    number: function(value, rowItem, columnItem, cellNode) {
        //for Negative Number Align
        if (value) {
            const reg = /^\(.*\)$/g;
            const isNegative = reg.test(`${value}`);
            if (isNegative && cellNode) {
                cellNode.className += ' tg-cell-negative';
            }
        }
        return value;
    },

    //default to font-family:Webdings;
    icon: function(value, rowItem, columnItem, cellNode) {
        return `<span class="tg-symbols">${value}</span>`;
    },

    //====================================================================================

    select: function(value, rowItem, columnItem, cellNode) {
        if (!this.isRowSelectable(rowItem)) {
            return '';
        }
        return this.getSelectFormatterContent(rowItem);
    },

    rowDrag: function(value, rowItem, columnItem, cellNode) {
        return this.getRowDragFormatterContent(rowItem);
    },

    rowNumber: function(value, rowItem, columnItem, cellNode) {
        return rowItem.tg_row_number || '';
    },

    //====================================================================================

    tree: function(value, rowItem, columnItem, cellNode) {
        return this.getTreeFormatterContent(value, rowItem);
    }

};
