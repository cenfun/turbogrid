
export default {

    createCache: function() {
        this.headerCache = new Map();
        this.rowsCache = new Map();
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
        this.rowsCache.set(row, {
            rowNodes,
            cellNodes: new Map(),
            observerNodes: new Map()
        });
    },

    getRowCache: function(row) {
        return this.rowsCache.get(row);
    },

    deleteRowCache: function(row) {
        const rowCache = this.getRowCache(row);
        if (!rowCache) {
            return;
        }
        this.rowsCache.delete(row);

        const observerNodes = rowCache.observerNodes;
        if (observerNodes) {
            observerNodes.forEach((observerNode) => {
                if (observerNode) {
                    this.cellResizeObserver.unobserve(observerNode);
                }
            });
        }

        const rowNodes = rowCache.rowNodes;
        if (rowNodes) {
            rowNodes.each((node) => {
                this.removeNode(node);
            });
        }

    },

    deleteCellCache: function(column, cellNodes, observerNodes) {

        if (observerNodes) {
            const observerNode = observerNodes.get(column);
            if (observerNode) {
                this.cellResizeObserver.unobserve(observerNode);
            }
            observerNodes.delete(column);
        }

        if (cellNodes) {
            this.removeNode(cellNodes.get(column));
            cellNodes.delete(column);
        }
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
    forEachRowsCache: function(callback) {
        this.rowsCache.forEach((rowCache, row) => {
            callback.call(this, row, rowCache.rowNodes, rowCache.cellNodes, rowCache.observerNodes);
        });
    },

    // =============================================================================

    // max height fixing
    updateRowCacheTopOffset: function() {
        // console.log("updateRowCacheTopOffset", this.scrollTopOffset);
        const fr = this.frozenInfo.row;
        this.forEachRowsCache((row, rowNodes) => {
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
        this.rowsCache = null;
        this.dataCache = null;

        if (this.cellResizeObserver) {
            this.cellResizeObserver.disconnect();
            this.cellResizeObserver = null;
        }
    }

};

