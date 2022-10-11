import Util from '../core/util.js';

export default {

    getViewport: function() {

        //update scroll position
        this.scrollLeft = this.getScrollLeft();
        this.scrollTop = this.getScrollTop();

        const rows = this.getViewportRows();
        const columns = this.getViewportColumns();

        return {
            rows,
            columns
        };
    },

    //==========================================================================================

    getViewportRows: function() {

        const list = [];

        const rows = this.viewRows;
        const rowsLength = rows.length;
        if (!rowsLength) {
            return list;
        }

        // > 0 and < max row length
        let rowCacheLength = this.option.rowCacheLength;
        rowCacheLength = Util.clamp(Util.toNum(rowCacheLength, true), 0, rowsLength);
        //console.log(rowCacheLength);

        const start = this.frozenInfo.rows;
        if (start) {
            let index = 0;
            while (index < start) {
                list.push(index);
                index += 1;
            }
        }
        const end = rowsLength - 1;

        //get from and till index
        const topPosition = this.scrollTop;
        let from = this.getRowByPosition(rows, start, end, topPosition);
        from -= rowCacheLength;
        from = Math.max(from, start);

        const bottomPosition = this.scrollTop + (this.bodyHeight - this.frozenRowsHeight);
        let till = this.getRowByPosition(rows, start, end, bottomPosition);
        till += rowCacheLength;
        till = Math.min(till, end);

        while (from <= till) {
            list.push(from);
            from += 1;
        }

        //do NOT remove touching row
        this.protectedItemHandler(list, 'row');

        //console.log('visible row list:', list);

        return list;
    },


    getRowByPosition: function(rows, start, end, position) {
        while (end - start > 1) {
            const i = Math.floor((start + end) * 0.5);
            const row = rows[i];
            const t = this.getRowTop(row);
            const h = this.getRowHeight(row);
            if (position < t) {
                end = i;
                continue;
            }
            if (position > t + h) {
                start = i;
                continue;
            }
            return i;
        }
        //last two rows, less than end top is start
        const endRow = rows[end];
        const endTop = this.getRowTop(endRow);
        if (position < endTop) {
            return start;
        }
        return end;
    },

    //==========================================================================================

    getViewportColumns: function() {

        const listFrozen = this.getColumnListFromFrozen();

        //normal case, no frozen list
        let from = this.scrollLeft;
        from = Math.max(from, 0);
        //from frozen left
        if (this.frozenInfo.columns) {
            if (this.frozenInfo.right) {
                from += this.columnsWidthR;
            } else {
                from += this.columnsWidthL;
            }
        }

        let till = this.scrollLeft + this.bodyWidth;
        till = Math.min(till, this.columnsWidth);

        //console.log('from', from, 'till', till, 'columnsWidth', this.columnsWidth);

        const listRange = this.getColumnListFromRange(from, till);

        //console.log('listRange', listRange);

        const list = [].concat(listFrozen).concat(listRange);

        //do NOT remove touching column
        this.protectedItemHandler(list, 'column');

        //console.log('visible column list', list);

        return list;
    },

    getColumnListFromFrozen: function() {
        const columns = this.frozenInfo.columns;
        //no frozen list
        if (!columns) {
            return [];
        }
        //all frozen column should be visible
        const list = [];
        let index = 0;
        while (index < columns) {
            list.push(index);
            index++;
        }
        return list;
    },

    getColumnListFromRange: function(from, till) {
        if (from >= till) {
            return [];
        }
        const list = [];
        const startIndex = this.frozenInfo.columns;
        const columns = this.viewColumns;
        for (let i = startIndex, l = columns.length; i < l; i++) {
            const columnItem = columns[i];
            if (this.isColumnInRange(columnItem, from, till)) {
                list.push(i);
            }
        }
        //console.log('before add cache', list.join(','));
        this.updateColumnListFromCache(list);
        //console.log(list);
        return list;
    },

    updateColumnListFromCache: function(list) {
        if (!list.length) {
            return;
        }

        const columnsLength = this.viewColumns.length;

        //handler cache
        let columnCacheLength = this.option.columnCacheLength;
        columnCacheLength = Util.clamp(Util.toNum(columnCacheLength, true), 0, columnsLength);

        const fc = this.frozenInfo.column;
        while (columnCacheLength > 0) {
            //unshift to left
            const cl = list[0] - 1;
            if (cl > fc) {
                list.unshift(cl);
            }
            //push to right
            const cr = list[list.length - 1] + 1;
            if (cr < columnsLength) {
                list.push(cr);
            }

            columnCacheLength -= 1;
        }

    },

    isColumnInRange: function(columnItem, from, till) {

        //remove invisible column
        if (this.isInvisible(columnItem)) {
            return false;
        }

        const left = columnItem.tg_left;
        const right = left + columnItem.tg_width;

        //console.log(`from: ${from}`, `till: ${till}`, `left: ${left}`, `right: ${right}`);

        //out of range
        if (left > till) {
            return false;
        }
        if (right < from) {
            return false;
        }

        //in range
        return true;

    },

    //==========================================================================================

    protectedItemHandler: function(list, type) {
        if (!this.protectedItem) {
            return;
        }
        const index = this.protectedItem[type];
        if (!Util.isNum(index)) {
            return;
        }
        if (list.includes(index)) {
            return;
        }
        list.push(index);
        list.sort(function(a, b) {
            return a - b;
        });
    }


};
