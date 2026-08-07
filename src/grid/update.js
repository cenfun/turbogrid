import E from '../core/event-types.js';
import { clearHighlightCache } from '../core/highlight.js';

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
                // clear the highlight cache of the changed column
                clearHighlightCache(rowItem, k);
            });
        }
        // The row may have been mutated before updateRow(rowIndex), and a
        // textGenerator may make one column depend on another column.
        clearHighlightCache(rowItem);
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
        // clear the highlight/text caches of the changed cell
        clearHighlightCache(rowItem, columnItem.id);
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
