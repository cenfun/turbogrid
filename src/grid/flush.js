import Util from '../core/util.js';

export default {

    // all using tg_view_index

    flushRow: function(rowInfo) {
        const rowList = Util.toList(rowInfo);
        rowList.forEach((row) => {
            this.deleteRowCache(row);
        });
    },

    flushRowFrom: function(fromIndex) {
        if (!Util.isNum(fromIndex)) {
            return;
        }
        if (fromIndex === 0) {
            this.flushBody();
            return;
        }

        this.forEachRowsCache((row) => {
            if (row >= fromIndex) {
                this.deleteRowCache(row);
            }
        });

    },

    // =============================================================================

    flushBody: function() {
        this.forEachRowsCache((row) => {
            this.deleteRowCache(row);
        });
    },

    flushSort: function() {
        if (this.frozenInfo.rows) {
            this.flushRowFrom(this.frozenInfo.rows);
        } else {
            this.flushBody();
        }
    },

    // =============================================================================

    flushColumn: function(columnInfo) {
        const columnList = Util.toList(columnInfo);
        this.forEachRowsCache((row, rowNodes, cellNodes, observerNodes) => {
            columnList.forEach((column) => {
                this.deleteCellCache(column, cellNodes, observerNodes);
            });
        });
    },

    flushColumnFrom: function(fromIndex) {
        if (!Util.isNum(fromIndex)) {
            return;
        }
        this.forEachRowsCache((row, rowNodes, cellNodes, observerNodes) => {
            cellNodes.forEach((cellNode, column) => {
                if (column >= fromIndex) {
                    this.deleteCellCache(column, cellNodes, observerNodes);
                }
            });
        });
    },

    // =============================================================================

    flushCell: function(rowInfo, columnInfo) {
        const rowList = Util.toList(rowInfo);
        const columnList = Util.toList(columnInfo);
        rowList.forEach((row) => {
            const rowCache = this.getRowCache(row);
            if (!rowCache) {
                return;
            }
            const cellNodes = rowCache.cellNodes;
            const observerNodes = rowCache.observerNodes;
            columnList.forEach((column) => {
                this.deleteCellCache(column, cellNodes, observerNodes);
            });
        });
    },

    // =============================================================================


    // clean handler, remove out of viewport
    flushWithViewport: function() {
        const { rows, columns } = this.viewport;
        this.forEachRowsCache((row, rowNodes, cellNodes, observerNodes) => {
            if (!rows.includes(row)) {
                // remove out of rows (include all columns)
                this.deleteRowCache(row);
                return;
            }
            // remove out of columns
            cellNodes.forEach((cellNode, column) => {
                if (!columns.includes(column)) {
                    this.deleteCellCache(column, cellNodes, observerNodes);
                }
            });

        });
    }


};

