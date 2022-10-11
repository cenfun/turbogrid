import Util from '../core/util.js';

export default {

    //all using tg_view_index

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

        this.forEachBodyCache((row, rowNodes, cellNodes) => {
            if (row >= fromIndex) {
                this.deleteRowCache(row);
            }
        });

    },

    //=============================================================================

    flushBody: function() {
        this.forEachBodyCache((row, rowNodes, cellNodes) => {
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

    //=============================================================================

    flushColumn: function(columnInfo) {
        const columnList = Util.toList(columnInfo);
        this.forEachBodyCache((row, rowNodes, cellNodes) => {
            columnList.forEach((column) => {
                this.deleteCellCache(cellNodes, column);
            });
        });
    },

    flushColumnFrom: function(fromIndex) {
        if (!Util.isNum(fromIndex)) {
            return;
        }
        this.forEachBodyCache((row, rowNodes, cellNodes) => {
            cellNodes.forEach((cellNode, column) => {
                if (column >= fromIndex) {
                    this.deleteCellCache(cellNodes, column);
                }
            });
        });
    },

    //=============================================================================

    flushCell: function(rowInfo, columnInfo) {
        const rowList = Util.toList(rowInfo);
        const columnList = Util.toList(columnInfo);
        rowList.forEach((row) => {
            const rowCache = this.getRowCache(row);
            if (!rowCache) {
                return;
            }
            const cellNodes = rowCache.cellNodes;
            columnList.forEach((column) => {
                this.deleteCellCache(cellNodes, column);
            });
        });
    },

    //=============================================================================


    //clean handler, remove out of viewport
    flushWithViewport: function() {
        const { rows, columns } = this.viewport;
        this.forEachBodyCache((row, rowNodes, cellNodes) => {
            if (!rows.includes(row)) {
                //remove out of rows (include all columns)
                this.deleteRowCache(row);
                return;
            }
            //remove out of columns
            cellNodes.forEach((cellNode, column) => {
                if (!columns.includes(column)) {
                    this.deleteCellCache(cellNodes, column);
                }
            });

        });
    }


};

