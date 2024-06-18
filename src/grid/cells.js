import E from '../core/event-types.js';
import Util from '../core/util.js';

export default {

    renderCells: function(rows, columns) {
        rows.forEach((row) => {
            this.drawRowCells(row, columns);
        });
    },

    getCellValue: function(rowItem, columnItem) {
        return rowItem[columnItem.id];
    },

    renderCell: function(cellData) {

        const {
            rowItem, columnItem, cellNode, observerNode
        } = cellData;

        const value = this.getCellValue(rowItem, columnItem);

        let content = value;

        // 1, null formatter only for value
        if (this.nullFormatter) {
            content = this.nullFormatter.call(this, content, rowItem, columnItem, cellNode, observerNode);
        }

        // 2, row formatter, high priority
        // 3, column formatter
        const formatter = rowItem.tg_formatter || columnItem.tg_formatter;

        // column formatter
        if (typeof formatter === 'function') {
            content = formatter.call(this, content, rowItem, columnItem, cellNode, observerNode);
        }

        const parentNode = observerNode || cellNode;
        this.renderNodeContent(parentNode, content);

        const { highlightKey } = this.options.highlightKeywords;
        const hasHighlight = rowItem[highlightKey + columnItem.id];
        if (hasHighlight) {
            this.renderSettings.highlightCells.push(cellNode);
        }

        this.trigger(E.onCellUpdated, {
            value: value,
            rowItem: rowItem,
            columnItem: columnItem,
            node: cellNode
        });

    },

    getPreRenderColumnList: function(row, columns) {
        const list = [];
        if (!columns.length) {
            return list;
        }

        for (let i = 0, l = columns.length; i < l; i++) {
            const column = columns[i];
            const cellNode = this.getCellNodeByIndex(row, column);
            if (!cellNode) {
                list.push(column);
            }
        }
        return list;
    },

    drawRowCells: function(row, columns) {
        const list = this.getPreRenderColumnList(row, columns);
        if (!list.length) {
            return;
        }

        // console.log(columns, list);

        list.forEach((column) => {
            this.createCellNode(row, column);
        });
    },

    getCellClass: function(rowItem, columnItem, resizable) {

        const column = columnItem.tg_view_index;

        const list = ['tg-cell'];

        if (resizable) {
            list.push('tg-cell-observer');
        }

        list.push(`tg-c-${column}`);

        if (columnItem.align) {
            list.push(`tg-align-${columnItem.align}`);
        }

        // list index first
        if (columnItem.tg_list_index === 0) {
            list.push('tg-list-first');
        }
        if (columnItem.tg_list_last) {
            list.push('tg-list-last');
        }

        list.push(Util.classMap(columnItem.classMap));
        list.push(Util.classMap(rowItem[`${columnItem.id}ClassMap`]));

        return Util.classMap(list);
    },

    cellResizeObserverHandler: function(rowItem, columnItem) {
        const cellResizeObserver = this.options.cellResizeObserver;
        if (typeof cellResizeObserver === 'function') {
            return cellResizeObserver.apply(this, [rowItem, columnItem]);
        }
    },

    cellResizeHandler: function(entries) {

        // console.log(this.dataCache);

        const rowMap = new Map();
        entries.forEach((entry) => {
            const { target } = entry;
            const dataCache = this.getNodeDataCache(target.parentNode);
            if (!dataCache) {
                return;
            }
            const { row, rowItem } = dataCache;
            rowMap.set(row, rowItem);
        });

        // console.log('cell resize', rowMap);

        let hasChanged = false;
        rowMap.forEach((rowItem, row) => {
            const rowCache = this.getRowCache(row);
            if (!rowCache) {
                return;
            }
            const observerNodes = rowCache.observerNodes;
            if (!observerNodes) {
                return;
            }

            const { rowHeight, rowMinHeight } = this.options;
            let height = Math.max(rowMinHeight || rowHeight, 1);

            observerNodes.forEach((observerNode) => {
                if (observerNode) {
                    // padding 5 + 5 + border 1
                    const rh = observerNode.clientHeight + 11;
                    if (rh > height) {
                        height = rh;
                    }
                }
            });
            const ph = this.getRowHeight(rowItem);
            if (ph === height) {
                return;
            }

            rowItem.tg_height = height;
            hasChanged = true;
        });

        if (hasChanged) {
            this.render('rows_cache');
        }

    },

    createCellNode: function(row, column) {

        const rowCache = this.getRowCache(row);
        if (!rowCache) {
            return;
        }

        // from view list
        const rowItem = this.getViewRowItem(row);
        const columnItem = this.getViewColumnItem(column);
        if (!rowItem || !columnItem) {
            return;
        }

        const resizable = this.cellResizeObserverHandler(rowItem, columnItem);

        const cellNode = document.createElement('div');
        // for event position
        cellNode.setAttribute('column', column);
        const classMap = this.getCellClass(rowItem, columnItem, resizable);
        cellNode.className = classMap;
        const cssText = Util.styleMap(columnItem.styleMap) + Util.styleMap(rowItem[`${columnItem.id}StyleMap`]);
        if (cssText) {
            cellNode.style.cssText = cssText;
        }

        const rowNodes = rowCache.rowNodes;
        const frozen = columnItem.tg_frozen;

        const rowNode = this.getCellRowNode(rowNodes, frozen);
        this.appendNode(rowNode, cellNode);

        let observerNode;
        if (resizable) {
            observerNode = document.createElement('div');
            observerNode.className = 'tg-observer';
            cellNode.appendChild(observerNode);
            this.cellResizeObserver.observe(observerNode);
            rowCache.observerNodes.set(column, observerNode);
        }

        const cellData = {
            row,
            rowItem,
            rowNode,
            column,
            columnItem,
            cellNode,
            observerNode
        };

        this.setNodeDataCache(cellNode, cellData);

        // node and data cache
        rowCache.cellNodes.set(column, cellNode);

        this.renderCell(cellData);

    },

    getCellRowNode: function(rowNodes, frozen) {
        const rowL = rowNodes.get(0);
        if (this.frozenInfo.columns) {
            const rowR = rowNodes.get(1);
            if (this.frozenInfo.right) {
                if (frozen) {
                    return rowR;
                }
                return rowL;
            }
            if (frozen) {
                return rowL;
            }
            return rowR;
        }
        return rowL;
    }
};
