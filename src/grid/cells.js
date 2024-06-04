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

    renderCell: function(rowItem, columnItem, cellNode) {

        const value = this.getCellValue(rowItem, columnItem);

        let content = value;

        // 1, null formatter only for value
        if (this.nullFormatter) {
            content = this.nullFormatter.call(this, content, rowItem, columnItem, cellNode);
        }

        // 2, row formatter, high priority
        // 3, column formatter
        const formatter = rowItem.tg_formatter || columnItem.tg_formatter;

        // column formatter
        if (typeof formatter === 'function') {
            content = formatter.call(this, content, rowItem, columnItem, cellNode);
        }

        this.renderNodeContent(cellNode, content);

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

    getCellClass: function(rowItem, columnItem) {

        const column = columnItem.tg_view_index;

        const list = ['tg-cell'];

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

        const cellNode = document.createElement('div');
        // for event position
        cellNode.setAttribute('column', column);
        const classMap = this.getCellClass(rowItem, columnItem);
        cellNode.className = classMap;
        const cssText = Util.styleMap(columnItem.styleMap) + Util.styleMap(rowItem[`${columnItem.id}StyleMap`]);
        if (cssText) {
            cellNode.style.cssText = cssText;
        }

        const rowNodes = rowCache.rowNodes;
        const frozen = columnItem.tg_frozen;

        const rowNode = this.getCellRowNode(rowNodes, frozen);
        this.appendNode(rowNode, cellNode);

        this.renderCell(rowItem, columnItem, cellNode);

        // node and data cache
        rowCache.cellNodes.set(column, cellNode);
        this.setNodeDataCache(cellNode, {
            row,
            rowItem,
            rowNode,
            column,
            columnItem,
            cellNode
        });

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
