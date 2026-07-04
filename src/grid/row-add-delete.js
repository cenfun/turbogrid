import E from '../core/event-types.js';
import Util from '../core/util.js';

export default {

    // after filter
    // eslint-disable-next-line complexity
    addRow: function(rowInfo, parent, position, scrollTo = true) {

        const rowList = this.getToBeAddedItemList(rowInfo);
        if (!rowList.length) {
            return false;
        }

        let parentItem;
        if (typeof parent !== 'undefined' && parent !== null) {
            parentItem = this.getRowItem(parent);
            // if defined parent but not found parent item, should be invalid operation
            if (!parentItem) {
                return false;
            }
        }

        const subs = this.getToBeAddedParentSubs(parentItem, this.rows);
        const positionIndex = this.getToBeAddedPositionIndex(position, subs);

        // Compute flushFromIndex before splice. positionIndex is an index into `subs`
        // (root-level rows or a parent's children array). We read the row directly from
        // `subs[positionIndex]` rather than using getRowItem(), because getRowItem uses
        // indexCache which is a flat list of ALL rows (including nested children), so
        // when positionIndex equals subs.length (append), getRowItem would incorrectly
        // return a child row from indexCache instead of undefined.
        let flushFromIndex;
        const isTreePre = this.rowsInfo.isTree;
        if (parentItem) {
            // parent itself may need re-render (collapsed state changed, or subs added)
            flushFromIndex = parentItem.tg_view_index;
        } else {
            const rowAtPosition = subs[positionIndex];
            flushFromIndex = rowAtPosition ? rowAtPosition.tg_view_index : 0;
        }

        // console.log('addRow', parentItem, positionIndex);

        const args = [positionIndex, 0].concat(rowList);
        subs.splice.apply(subs, args);

        this.initRowsHandler();

        if (parentItem) {
            // force to open for scroll to render
            parentItem.collapsed = false;
        }
        if (isTreePre !== this.rowsInfo.isTree) {
            flushFromIndex = 0;
        }

        this.flushRowFrom(flushFromIndex);

        this.onNextUpdated(function() {
            this.trigger(E.onRowAdded, rowList);
        });

        const renderSettings = {
            type: 'rows'
        };

        if (scrollTo) {
            renderSettings.scrollRow = rowList[rowList.length - 1];
        }

        this.render(renderSettings);

        return true;
    },

    // =============================================================================

    deleteRow: function(rowInfo) {
        const rowList = Util.toList(rowInfo);
        const deletedRowsList = [];
        rowList.forEach((rowIndex) => {
            const rowItem = this.getRowItem(rowIndex);
            if (!rowItem) {
                return;
            }
            // for "onRowRemoved" event
            deletedRowsList.push(rowItem);
        });

        if (!deletedRowsList.length) {
            return false;
        }

        const isTreePre = this.rowsInfo.isTree;
        const sortedRows = this.removeRowsHandler(deletedRowsList);

        this.initRowsHandler();

        const minIndex = this.getRemovedMinIndex(sortedRows);

        if (isTreePre === this.rowsInfo.isTree) {
            this.flushRowFrom(minIndex);
        } else {
            this.flushBody();
        }

        this.onNextUpdated(function() {
            this.trigger(E.onRowRemoved, deletedRowsList);
        });

        this.render('rows');

        return true;
    },

    getRemovedMinIndex: function(sortedRows) {
        // choose min index to flush
        let minIndex = 0;

        const item = sortedRows[sortedRows.length - 1];
        // flush from 0 if invisible
        if (this.isInvisible(item)) {
            return minIndex;
        }

        minIndex = item.tg_view_index;
        // refresh for neighbor tg-list-first and tg-list-last
        if (minIndex > 0) {
            minIndex -= 1;
        }

        // if parent collapsed
        let parent = item.tg_parent;
        while (parent) {
            if (parent.collapsed) {
                minIndex = parent.tg_view_index;
                // no need refresh for neighbor if collapsed
            }
            parent = parent.tg_parent;
        }

        return minIndex;
    },

    removeRowsHandler: function(deletedRowsList) {
        // remove with high performance, desc index
        const list = [].concat(deletedRowsList);
        list.sort(function(a, b) {
            return b.tg_index - a.tg_index;
        });

        // console.log(list);
        const results = [];
        list.forEach((row) => {
            const parentSubs = this.getRowParentSubs(row);
            parentSubs.splice(row.tg_sub_index, 1);
            results.push(row);
        });

        return results;
    }

};

