import Icon from '../core/icon.js';
import Util from '../core/util.js';

export default {

    // render headers
    renderHeaderTables: function() {

        // remove header items only
        this.clearHeaderCache();

        const columns = this.viewColumns;
        const fcs = this.frozenInfo.columns;

        this.hasTreeColumn = false;
        this.hasSortColumn = false;
        let columnsL = [];
        let columnsR = [];

        for (let i = 0, l = columns.length; i < l; i++) {
            const columnItem = columns[i];
            if (this.isColumnSortable(columnItem)) {
                this.hasSortColumn = true;
            }
            if (fcs && i >= fcs) {
                columnsR.push(columnItem);
            } else {
                columnsL.push(columnItem);
            }
        }

        // console.log(this.hasSortColumn);

        if (this.frozenInfo.right) {
            const columnsTemp = columnsL;
            columnsL = columnsR;
            columnsR = columnsTemp;
        }

        this.renderHeaderTable(columnsL, this.$headerL);
        this.renderHeaderTable(columnsR, this.$headerR);

    },

    renderHeaderTable: function(columns, container) {

        const headerTable = document.createElement('div');

        const list = ['tg-header-table'];
        if (this.hasSortColumn) {
            list.push('tg-header-sortable');
            list.push(`tg-header-sort-${this.options.sortIndicator}`);
        }
        headerTable.className = Util.classMap(list);

        const len = columns.length;
        if (len) {

            let lastColumn = columns[len - 1];
            if (lastColumn && lastColumn.id === 'tg-column-blank') {
                lastColumn = columns[len - 2];
            }

            columns.forEach((columnItem) => {
                this.renderHeaderItem(columnItem, headerTable, lastColumn);
            });
        }

        container.append(headerTable);

    },

    renderHeaderItem: function(columnItem, container, lastColumn) {

        const column = columnItem.tg_view_index;
        const hasHeaderNode = this.getHeaderCache(column);
        if (hasHeaderNode) {
            return;
        }

        const className = this.getHeaderItemClass(columnItem, lastColumn);
        const cssText = Util.styleMap(columnItem.headerStyleMap);

        const attr = {
            'column': column,
            'class': className,
            'data': columnItem.id
        };

        if (cssText) {
            attr.style = cssText;
        }

        const columnHeader = this.createColumnHeader(columnItem);
        const children = [columnHeader];
        if (this.isColumnResizable(columnItem)) {
            const columnResizing = this.createColumnResizing(columnItem);
            children.push(columnResizing);
        }

        const headerNode = this.createElement('div', attr, children);
        container.appendChild(headerNode);

        // cache
        this.setHeaderCache(column, headerNode);
        this.setNodeDataCache(headerNode, {
            rowItem: this.headerRowItem,
            column,
            columnItem,
            headerNode
        });

        // render group
        if (columnItem.tg_parent) {
            this.renderHeaderItem(columnItem.tg_parent, container);
        }

    },

    createColumnHeader: function(columnItem) {

        const className = this.getHeaderClass(columnItem);
        const cssText = this.getHeaderStyle(columnItem);

        const attr = {
            'class': className,
            'style': cssText
        };

        const columnName = this.createColumnName(columnItem);
        const children = [columnName];

        if (this.hasSortColumn && !columnItem.tg_group) {
            const columnSort = this.createColumnSort(columnItem);
            children.push(columnSort);
        }

        return this.createElement('div', attr, children);
    },

    createColumnName: function(columnItem) {

        const list = ['tg-column-name'];
        if (columnItem.tg_group) {
            list.push('tg-header-group-name');
        }
        const className = list.join(' ');

        const attr = {
            'class': className
        };

        const value = columnItem.name;
        let content = value;

        const formatter = columnItem.tg_headerFormatter;
        // formatter
        if (typeof formatter === 'function') {
            // value, rowItem, columnItem, cellNode
            content = formatter.call(this, content, this.headerRowItem, columnItem);
        }

        if (columnItem.formatter === 'tree') {
            content = this.createHeaderTreeName(content);
        } else if (columnItem === this.selectColumn && this.isSelectAllVisible()) {
            content = this.createHeaderSelectName();
        }

        return this.createElement('div', attr, content);
    },

    // created tree no matter isTree
    createHeaderTreeName: function(content) {
        this.hasTreeColumn = true;

        const children = [];

        if (this.options.collapseAllVisible) {

            const icon = Icon.getIcon('tree');
            const treeIcon = this.createElement('div', {
                'class': 'tg-tree-icon tg-tree-icon-all'
            }, icon);

            children.push(treeIcon);

        } else {

            const treeIconEmpty = this.createElement('div', {
                'class': 'tg-tree-icon'
            });
            children.push(treeIconEmpty);
        }

        const headerName = this.createElement('div', {
            'class': 'tg-tree-name'
        }, content);

        children.push(headerName);

        const attr = {
            'class': 'tg-tree'
        };
        return this.createElement('div', attr, children);
    },

    createHeaderSelectName: function() {
        const icon = Icon.getIcon('checkbox');
        const attr = {
            'class': 'tg-select-icon-all tg-checkbox'
        };
        return this.createElement('div', attr, icon);
    },

    // ================================================================================================

    createColumnSort: function(columnItem) {
        const attr = {
            'class': 'tg-column-sort'
        };
        let content;
        if (this.isColumnSortable(columnItem)) {
            if (this.options.sortIndicator === 'h') {
                content = this.createSortIndicatorH(columnItem);
            } else {
                content = this.createSortIndicatorV(columnItem);
            }
        }
        return this.createElement('div', attr, content);
    },

    createSortIndicatorH: function(columnItem) {
        const attr = {
            'class': 'tg-sort-indicator'
        };
        const icon = Icon.getIcon('sort-h');
        const children = [
            this.createElement('div', {
                'class': 'tg-sort-indicator-line'
            }),
            this.createElement('div', {
                'class': 'tg-sort-indicator-icon'
            }, icon)
        ];
        return this.createElement('div', attr, children);
    },

    createSortIndicatorV: function(columnItem) {
        const attr = {
            'class': 'tg-sort-indicator'
        };
        const icon = Icon.getIcon('sort-v');
        const children = [
            this.createElement('div', {
                'class': 'tg-sort-indicator-icon'
            }, icon)
        ];
        return this.createElement('div', attr, children);
    },

    // =================================================================================================

    createColumnResizing: function() {
        const attr = {
            'class': 'tg-column-resizing'
        };
        return this.createElement('div', attr);
    },

    // =================================================================================================
    getHeaderItemClass: function(columnItem, lastColumn) {

        const list = ['tg-header-item'];
        if (columnItem.tg_group) {
            list.push('tg-header-group-item');
        }

        if (columnItem === lastColumn) {
            list.push('tg-header-column-last');
        }

        list.push(`tg-c-${columnItem.tg_view_index}`);
        list.push(`tg-h-${columnItem.tg_layer}`);
        if (columnItem.tg_combination) {
            list.push(`tg-h-${columnItem.tg_combination}`);
        }

        // custom class, last append
        list.push(Util.classMap(columnItem.headerClassMap));

        return Util.classMap(list);
    },

    // =================================================================================================

    getHeaderClass: function(columnItem) {

        const list = ['tg-column-header'];

        if (columnItem.formatter === 'tree') {
            list.push('tg-tree-header');
            if (this.rowsInfo.isTree) {
                list.push('tg-tree-header-indent');
            }
        }

        if (this.isColumnSortable(columnItem)) {
            list.push(`tg-column-sortable tg-column-sort-${this.options.sortIndicator}`);
        }

        if (columnItem.align) {
            list.push(`tg-align-${columnItem.align}`);
        }

        return list.join(' ');
    },

    getHeaderStyle: function(columnItem) {
        const cssText = Util.styleMap(columnItem.headerStyleMap);
        const list = [cssText];
        const w = columnItem.tg_width;
        if (this.isInvisible(columnItem) || w <= 0) {
            list.push('display:none;');
        } else {
            list.push(`width:${w}px;`);
        }
        return list.join('');
    }

};
