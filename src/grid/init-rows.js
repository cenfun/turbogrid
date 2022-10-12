import Util from '../core/util.js';

export default {

    //only create rows, diff with init columns
    initRowsHandler: function() {
        this.rows = this.data.rows;
        this.rowsInfo = this.initTreeInfo(this.rows, this.frozenInfo.row);
        // depends others, can NOT create view rows here
        // do NOT create view rows here
        // do NOT init options here
    },

    getRows: function() {
        return this.rows;
    },

    getViewRows: function() {
        return this.viewRows;
    },

    createViewRows: function() {

        this.initRowFilterHandler();

        const viewRows = [];

        //update row index
        const rowNumberFilter = this.getRowNumberFilter();

        let rowNumber = 1;
        const rowNumberHandler = (rowItem, i) => {
            if (rowNumberFilter.call(this, rowItem, i)) {
                rowItem.tg_row_number = rowNumber;
                rowNumber += 1;
                return;
            }
            rowItem.tg_row_number = '';
        };

        const digList = (ls, parent, collapsed) => {
            if (!Util.isList(ls)) {
                return;
            }

            let list_index = 0;
            let list_item;
            ls.forEach((rowItem) => {

                if (this.isInvisible(rowItem)) {
                    return;
                }

                //update list index, both and group (in list)
                rowItem.tg_list_index = list_index;
                list_index += 1;

                rowItem.tg_list_last = false;
                list_item = rowItem;

                //only row formatter
                this.gridRowItemHandler(rowItem);

                //need row number even collapsed, and need frozen info first too
                rowNumberHandler(rowItem, list_index);

                if (!collapsed) {
                    viewRows.push(rowItem);
                }

                const rowCollapsed = collapsed || (rowItem.tg_group && rowItem.collapsed);
                digList(rowItem.subs, rowItem, rowCollapsed);

            });

            if (list_item) {
                list_item.tg_list_last = true;
            }

        };

        digList(this.rows);

        this.viewRows = viewRows;
        //console.log(this.viewRows, rows);

        let top = 0;
        let lastItem;
        this.initViewList(this.viewRows, (rowItem, i) => {
            rowItem.tg_top = top;
            this.initRowHeight(rowItem);
            top += this.getRowHeight(rowItem);

            //fix group line
            rowItem.tg_group_line = false;
            if (rowItem.collapsed) {
                rowItem.tg_group_line = true;
            }

            if (lastItem) {
                if (rowItem.tg_group || rowItem.tg_level < lastItem.tg_level) {
                    lastItem.tg_group_line = true;
                }
            }

            lastItem = rowItem;

        });

        return this;
    },

    getRowNumberFilter: function() {
        const rowNumberFilter = this.options.rowNumberFilter;
        if (typeof rowNumberFilter === 'function') {
            return rowNumberFilter;
        }
        return function(rowItem, i) {
            if (rowItem.tg_group || rowItem.tg_frozen) {
                return false;
            }
            return true;
        };
    },

    //current for formatter
    gridRowItemHandler: function(row) {

        let formatter = row.formatter;
        if (!formatter) {
            return;
        }
        if (typeof formatter === 'function') {
            row.tg_formatter = formatter.bind(this);
            return;
        }

        // default string formatter is not required
        formatter = this.getFormatter(formatter);
        if (formatter) {
            row.tg_formatter = formatter;
        }

    },

    //========================================================================================

    initRowHeight: function(item) {
        if (!Util.hasOwn(item, 'height')) {
            return;
        }
        if (Util.isNum(item.height)) {
            item.tg_height = item.height | 0;
            return;
        }
        //console.log('item.height', item.height);
        //height is column id, using this column value to compute height
        const column = this.getColumnItem(item.height);
        if (column) {
            const h = this.getComputedRowHeight(item, column);
            if (Util.isNum(h)) {
                item.tg_height = h;
            }
        }
    },

    getComputedRowHeight: function(rowItem, columnItem) {
        const dh = this.options.rowHeight;
        const str = rowItem[columnItem.id] || '';
        const len = (`${str}`).length;
        //a char average width 5px
        const width = len * 5;
        if (width <= columnItem.tg_width) {
            return dh;
        }
        //text line height is 16 when font size is 14px
        //padding top and bottom is 6
        return Math.ceil(width / columnItem.tg_width) * 16 + 6;
    },

    setRowHeight: function(rowInfo, heightInfo) {

        const rowList = Util.toList(rowInfo);
        if (!rowList.length) {
            return this;
        }

        const heightList = Util.toList(heightInfo);
        heightList.length = rowList.length;

        const defaultHeight = this.options.rowHeight;
        rowList.forEach((rowIndex, i) => {
            const rowItem = this.getRowItem(rowIndex);
            if (!rowItem) {
                return;
            }
            const h = heightList[i] || defaultHeight;
            rowItem.height = h;
            delete rowItem.tg_height;
            this.initRowHeight(rowItem);
            this.flushRowFrom(rowItem.tg_view_index);
        });

        this.render('rows');

        return this;
    },

    //=============================================================================
    //filter handler

    initRowFilterHandler: function() {

        const rowFilter = this.options.rowFilter;
        if (typeof rowFilter !== 'function') {
            return;
        }
        //return true:visible or false:invisible
        this.forEachRow(function(rowItem, i, parent) {

            //already invisible
            if (rowItem.tg_invisible) {
                return;
            }

            //visible rows for filter only
            const filtered = !rowFilter.call(this, rowItem, i, parent);
            rowItem.tg_filtered = filtered;

            //parent should be visible if any sub is visible
            if (!filtered) {
                let current = rowItem;
                while (current.tg_parent) {
                    current.tg_parent.tg_filtered = false;
                    current = current.tg_parent;
                }
            }


        });

    },

    //=============================================================================

    //row subs
    setRowSubs: function(rowIndex, subs) {
        const item = this.getRowItem(rowIndex);
        if (!item) {
            return this;
        }
        //update data
        if (Util.isList(subs)) {
            //open subs default
            item.collapsed = false;
        }
        item.subs = subs;
        this.initRowsHandler();
        //render
        this.flushRowFrom(item.tg_view_index);
        this.render('rows');
        return this;
    },

    //dynamic set new row list
    setRows: function(rows) {
        this.data.rows = Util.toList(rows);
        this.initRowsHandler();
        this.flushBody();
        this.render('rows');
    },

    //=============================================================================

    getRowParentSubs: function(rowItem) {
        return rowItem.tg_parent ? rowItem.tg_parent.subs : this.rows;
    }

};
