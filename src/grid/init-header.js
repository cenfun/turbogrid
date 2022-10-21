import Util from '../core/util.js';

export default {

    // grid column header
    // after initColumnItemHandler
    initHeaderHandler: function(privateColumns) {

        this.initHeaderRowItem();
        // from last to first, for best performance
        this.viewGroupColumns.reverse();

        // update width and layer
        this.initGroupColumnsWidth();
        this.initGroupColumnsLayer(privateColumns);
    },

    initHeaderRowItem: function() {
        // for header formatter rowItem argument
        this.headerRowItem = {
            tg_index: -1,
            tg_view_index: -1
        };
        this.viewAllColumns.forEach((c) => {
            if (Util.hasOwn(c, 'id')) {
                this.headerRowItem[c.id] = c.name;
            }
        });
    },

    // ==============================================================================

    initGroupColumnsWidth: function() {
        this.viewGroupColumns.forEach((groupColumn) => {
            let w = 0;
            groupColumn.subs.forEach((item) => {
                // do not include invisible column
                if (this.isInvisible(item)) {
                    return;
                }
                w += item.tg_width;
            });
            groupColumn.tg_width = w;
        });
    },

    // ==============================================================================

    initGroupColumnsLayer: function(privateColumns) {

        // tg_layer: reverse level, tg-h-3
        // tg_combination: multiple layer, tg-h-3210

        const maxLevel = this.columnsInfo.maxLevel;
        // console.log(`maxLevel：${maxLevel}`);

        // init column
        this.viewColumns.forEach(function(columnItem) {
            columnItem.tg_layer = maxLevel;
            if (columnItem.tg_parent) {
                columnItem.tg_parent.tg_layer = maxLevel - 1;
            }
        });

        // sort from last to first
        this.viewGroupColumns.forEach(function(groupColumn) {
            const groupLayer = groupColumn.tg_layer;
            const groupParent = groupColumn.tg_parent;
            if (groupParent) {
                let parentLayer = groupLayer - 1;
                if (Util.isNum(groupParent.tg_layer)) {
                    parentLayer = Math.min(parentLayer, groupParent.tg_layer);
                }
                groupParent.tg_layer = parentLayer;
            }
        });

        // console.log(this.viewColumns, this.viewGroupColumns);

        this.initColumnRowspanHandler(privateColumns, 0);

    },

    initColumnRowspanHandler: function(columns, minLayer) {
        columns.forEach((columnItem) => {
            const rowspan = this.initColumnCombinationHandler(columnItem, minLayer);
            if (columnItem.tg_group) {
                this.initColumnRowspanHandler(columnItem.subs, minLayer + rowspan);
            }
        });
    },

    initColumnCombinationHandler: function(columnItem, minLayer) {
        const list = [];
        const maxLayer = columnItem.tg_layer;
        while (minLayer <= maxLayer) {
            list.push(minLayer);
            minLayer += 1;
        }
        // tg-h-3210
        list.reverse();
        const rowspan = list.length;

        // combination must be string
        let combination = '';
        if (rowspan > 1) {
            combination = list.join('');
        }
        columnItem.tg_combination = combination;

        return rowspan;
    }

};
