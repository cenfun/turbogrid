import E from '../core/event-types.js';

export default {

    update: function() {
        this.flushBody();
        this.render('rows');
        return this;
    },

    updateRow: function(rowIndex, rowData) {
        const rowItem = this.getRowItem(rowIndex);
        if (!rowItem) {
            return this;
        }
        if (rowData && typeof rowData === 'object') {
            const snapshot = this.getItemSnapshot(rowData);
            Object.keys(snapshot).forEach(function(k) {
                rowItem[k] = snapshot[k];
            });
        }
        // may in for loop require async
        this.flushRow(rowItem.tg_view_index);
        this.render('rows');
        return this;
    },

    updateCell: function(rowIndex, columnIndex, value) {
        const rowItem = this.getRowItem(rowIndex);
        if (!rowItem) {
            return this;
        }
        const columnItem = this.getColumnItem(columnIndex);
        if (!columnItem) {
            return this;
        }
        if (arguments.length > 2) {
            rowItem[columnItem.id] = value;
        }
        // may in for loop require async
        this.flushCell(rowItem.tg_view_index, columnItem.tg_view_index);
        this.render('rows');
        return this;
    },

    onNextUpdated: function(callback) {
        if (typeof callback !== 'function') {
            return this;
        }
        this.once(E.onUpdated, callback);
        return this;
    }

};
