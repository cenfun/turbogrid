
export default {

    createCache: function() {
        this.headerCache = new Map();
        this.bodyCache = new Map();
        this.dataCache = new WeakMap();
        this.cellResizeObserver = this.createResizeObserver((entries) => {
            this.cellResizeHandler(entries);
        });
    },

    // =============================================================================

    setHeaderCache: function(column, headerNode) {
        this.headerCache.set(column, headerNode);
    },

    getHeaderCache: function(column) {
        return this.headerCache.get(column);
    },

    clearHeaderCache: function() {
        // console.log('clearHeaderCache', this.id);
        // nodes already removed by $header.empty()
        this.headerCache.clear();
    },

    // =============================================================================

    setRowCache: function(row, rowNodes) {
        this.bodyCache.set(row, {
            rowNodes,
            cellNodes: new Map()
        });
    },

    getRowCache: function(row) {
        return this.bodyCache.get(row);
    },

    deleteRowCache: function(row) {
        const rowCache = this.getRowCache(row);
        if (!rowCache) {
            return;
        }
        this.bodyCache.delete(row);

        const rowNodes = rowCache.rowNodes;
        if (rowNodes) {
            rowNodes.each((node) => {
                this.removeNode(node);
            });
        }

        const cellNodes = rowCache.cellNodes;
        if (cellNodes) {
            cellNodes.forEach((cellNode) => {
                this.cellResizeObserver.unobserve(cellNode);
            });
        }
    },

    deleteCellCache: function(cellNodes, column) {
        if (!cellNodes) {
            return;
        }
        const cellNode = cellNodes.get(column);
        if (cellNode) {
            this.cellResizeObserver.unobserve(cellNode);
            this.removeNode(cellNode);
        }
        cellNodes.delete(column);
    },

    // =============================================================================

    // there are 2 rows if frozenInfo.rows (left and right)
    getRowNodesByIndex: function(row) {
        const rowCache = this.getRowCache(row);
        if (rowCache) {
            return rowCache.rowNodes;
        }
    },

    getCellNodeByIndex: function(row, column) {
        const rowCache = this.getRowCache(row);
        if (rowCache) {
            return rowCache.cellNodes.get(column);
        }
    },

    // =============================================================================

    // callback(row, rowNodes, cellNodes)
    forEachBodyCache: function(callback) {
        this.bodyCache.forEach((bodyCache, row) => {
            callback.call(this, row, bodyCache.rowNodes, bodyCache.cellNodes);
        });
    },

    // =============================================================================

    // max height fixing
    updateRowCacheTopOffset: function() {
        // console.log("updateRowCacheTopOffset", this.scrollTopOffset);
        const fr = this.frozenInfo.row;
        this.forEachBodyCache((row, rowNodes, cellNodes) => {
            // do NOT update frozen row
            if (row <= fr) {
                return;
            }
            if (rowNodes) {
                const rowItem = this.getViewRowItem(row);
                const rowTop = this.getViewRowTop(rowItem);
                rowNodes.css('top', rowTop);
            }
        });
    },

    // =============================================================================

    setNodeDataCache: function(node, data) {
        if (node) {
            return this.dataCache.set(node, data);
        }
    },

    getNodeDataCache: function(node) {
        if (node) {
            return this.dataCache.get(node);
        }
    },

    // =============================================================================

    removeCache: function() {
        this.headerCache = null;
        this.bodyCache = null;
        this.dataCache = null;
        if (this.cellResizeObserver) {
            this.cellResizeObserver.disconnect();
            this.cellResizeObserver = null;
        }
    }

};

