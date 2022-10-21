import Util from '../core/util.js';

export default {

    // create columns and viewColumns
    initColumnsHandler: function() {
        this.columns = this.data.columns;
        // init data columns, need check null and undefined before concat
        // because this.columns could be used lot directly
        this.columns.forEach((item, i) => {
            if (!item || typeof item !== 'object') {
                this.columns[i] = {};
            }
        });

        // need cache own columns too, but any column related change should be data columns
        const privateColumns = this.getPrivateColumns();
        this.columnsInfo = this.initTreeInfo(privateColumns, this.frozenInfo.column);

        // no dependence, so create view columns directly
        // view columns
        const viewColumns = [];
        const viewGroupColumns = [];

        const digList = (ls, parent) => {
            if (!Util.isList(ls)) {
                return;
            }

            let list_index = 0;
            let list_item;
            ls.forEach((columnItem) => {

                if (this.isInvisible(columnItem)) {
                    return;
                }

                if (columnItem.tg_group) {

                    // no empty for column, can not resize width
                    if (this.isEmptyGroup(columnItem)) {
                        return;
                    }

                    viewGroupColumns.push(columnItem);
                    digList(columnItem.subs, columnItem);

                } else {

                    // update list index, not for column group (not in list)
                    columnItem.tg_list_index = list_index;
                    list_index += 1;

                    columnItem.tg_list_last = false;
                    list_item = columnItem;

                    viewColumns.push(columnItem);

                }

            });

            if (list_item) {
                list_item.tg_list_last = true;
            }

        };

        digList(privateColumns);

        // init item
        viewColumns.forEach((columnItem) => {
            this.initColumnItemHandler(columnItem);
        });

        this.viewColumns = viewColumns;
        this.viewGroupColumns = viewGroupColumns;

        // grid column list include all columns and groups
        this.viewAllColumns = [].concat(viewColumns).concat(viewGroupColumns);

        this.initViewList(this.viewAllColumns, (item, i) => {

        });

        // init column header data
        this.initHeaderHandler(privateColumns);

        this.initSortColumn();
    },

    getPrivateColumns: function() {
        const o = this.options;

        // own columns and remove from user columns
        this.selectColumn = o.selectColumn;
        this.rowDragColumn = o.rowDragColumn;
        this.rowNumberColumn = o.rowNumberColumn;
        this.blankColumn = o.blankColumn;

        let privateColumns = [];

        const appendPrivateColumns = () => {
            // first, add select column if options selectVisible
            if (o.selectVisible) {
                privateColumns.push(this.selectColumn);
            }
            // row drag
            if (o.rowDragVisible) {
                privateColumns.push(this.rowDragColumn);
            }
            // row number
            if (o.rowNumberVisible) {
                this.rowNumberColumn.width = o.rowNumberWidth;
                privateColumns.push(this.rowNumberColumn);
            }
        };

        // do not move private columns to right, should after frozen column
        if (this.frozenInfo.right) {
            const fc = this.frozenInfo.column;
            this.columns.forEach((item, i) => {
                privateColumns.push(item);
                if (i === fc) {
                    appendPrivateColumns();
                }
            });
        } else {
            appendPrivateColumns();
            privateColumns = privateColumns.concat(this.columns);
        }

        // last, add blank column always
        privateColumns.push(this.blankColumn);

        return privateColumns;
    },

    // change columns dynamic, outer operation
    setColumns: function(inputColumns) {
        this.data.columns = Util.toList(inputColumns);
        this.rerender();
    },

    getColumns: function() {
        return this.columns;
    },

    getViewColumns: function(all) {
        if (all) {
            return this.viewAllColumns;
        }
        return this.viewColumns;
    },

    initColumnItemHandler: function(columnItem) {
        // options handler
        this.initColumnProps(columnItem);
        // formatter handler
        this.initColumnFormatter(columnItem);
        // width handler
        this.initColumnWidth(columnItem);
    },

    // =============================================================================
    initColumnProps: function(columnItem) {

        const columnTypes = this.options.columnTypes;

        // 1, id type
        if (!Util.hasOwn(columnItem, 'type')) {
            const idType = columnTypes[columnItem.id];
            if (typeof idType === 'string') {
                columnItem.type = idType;
            }
        }

        // copy to column with default props
        let defaultProps = this.options.columnProps;

        // 2, type props
        const typeProps = columnTypes[columnItem.type];
        if (typeProps && typeof typeProps === 'object') {
            defaultProps = Util.merge(defaultProps, typeProps);
        }

        // update column with default props
        for (const k in defaultProps) {
            if (!Util.hasOwn(columnItem, k)) {
                columnItem[k] = defaultProps[k];
            }
        }
    },

    // =============================================================================
    // formatter handler
    initColumnFormatter: function(columnItem) {

        // header formatter, name is header
        this.initColumnFormatterByName(columnItem, 'headerFormatter', 'header');

        // cell formatter, user custom name
        // using formatter string first, then type
        let formatterName = columnItem.type;
        const formatter = columnItem.formatter;
        if (typeof formatter === 'string') {
            formatterName = formatter;
        }

        this.initColumnFormatterByName(columnItem, 'formatter', formatterName);

    },

    initColumnFormatterByName: function(columnItem, key, formatterName) {

        let formatter = columnItem[key];
        // already is function
        if (typeof formatter === 'function') {
            columnItem[`tg_${key}`] = formatter.bind(this);
            return;
        }

        formatter = this.getFormatter(formatterName);
        if (formatter) {
            // already bind this
            columnItem[`tg_${key}`] = formatter;
            return;
        }

        // default string formatter
        columnItem[`tg_${key}`] = this.getFormatter('string');

    },

    // =============================================================================

    initColumnWidth: function(columnItem) {
        // do NOT change blank column width
        if (columnItem === this.blankColumn) {
            columnItem.tg_width = 0;
            return;
        }

        // read custom width
        if (Util.isNum(columnItem.width) && columnItem.width >= 0) {
            columnItem.tg_width = columnItem.width;
            // fix min and max width
            columnItem.minWidth = Math.min(columnItem.minWidth, columnItem.tg_width);
            columnItem.maxWidth = Math.max(columnItem.maxWidth, columnItem.tg_width);
            return;
        }

        // calculate width by text
        this.initColumnWidthByName(columnItem);

    },

    initColumnWidthByName: function(columnItem) {
        const width = this.getComputedColumnWidth(columnItem);
        if (!Util.isNum(width)) {
            return;
        }
        columnItem.tg_width = width;
    },

    getComputedColumnWidth: function(columnItem) {
        const str = columnItem.name || '';
        const len = Util.getCharLen(str);
        // font size: 14px, single char width:
        const charWidth = 10;
        let width = Math.round(len * charWidth);
        // min width: 73
        if (width > 103) {
            // 2 lines
            width = Math.max(103, Math.round(len * charWidth / 2));
            if (width > 133) {
                // 3 lines
                width = Math.max(133, Math.round(len * charWidth / 3));
                if (width > 163) {
                    // 4 lines
                    width = Math.max(163, Math.round(len * charWidth / 4));
                    // max width: 300
                }
            }
        }
        return Util.clamp(width, columnItem.minWidth, columnItem.maxWidth);
    },

    // =============================================================================

    initSortColumn: function() {

        // for sort on init every time
        this.sortColumn = null;

        const o = this.options;
        const sortField = o.sortField;
        if (!sortField) {
            return;
        }

        const columnItem = this.getColumnItemById(sortField);
        if (!columnItem) {
            return;
        }

        if (!this.isColumnSortable(columnItem)) {
            return;
        }

        if (!Util.hasOwn(columnItem, 'sortAsc')) {
            columnItem.sortAsc = o.sortAsc;
        }

        // for sort data every time
        this.sortColumn = columnItem;

        return this;
    }

};
