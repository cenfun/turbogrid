import Util from '../core/util.js';

/*
data define:

data.rows:
rows: [1,2[subs],3]   //for tree, add/delete/setRows/export, reference to data.rows
viewRows: [ 1,2(group),sub1,sub2,3 ]   //for view rows, flat list

data.columns:
columns: [1,2[subs],3]   //for tree, add/delete/setColumns/export(no select/blank), reference to data.columns
viewColumns: [ select,1,sub1,sub2,3,blank ]   //for view columns, flat list
viewGroupColumns: \[ 2(group) \]   //for view columns group, flat list
viewAllColumns: \[ 1,sub1,sub2,3,2(group) \]   //for view header

*/


export default {


    initHandler: function() {

        // reset all
        this.reset();

        // init options/formatter, some of options from constructor,custom,data
        this.initOptionsHandler();

        // create columns and viewColumns
        this.initColumnsHandler();
        // create rows only, different from columns
        this.initRowsHandler();


        // options xxxOnInit handler, after columns and rows
        this.initSortOnInitHandler();
        this.initSelectAllOnInitHandler();
        this.initCollapseAllOnInitHandler();

        this.initScrollPane();

        this.bindEvents();

    },

    // =============================================================================================

    updateViewRowsAndSize: function() {
        // before create view rows need init rows tree like rowFilter, sort ...
        this.createViewRows();

        // update view after render
        // depends row number, row tree, options
        this.renderCollapseAllState();
        this.renderSelectAllState();

        // view rows changed alway resize for scrollPane
        this.resizeHandler();

        return this;
    },

    initSortOnInitHandler: function() {
        if (!this.options.sortOnInit) {
            return;
        }

        this.updateRowsSort();
        // not need update index
    },

    initSelectAllOnInitHandler: function() {

        // init global order for multi selection sorting
        this.globalSelectedIndex = 0;

        if (!this.options.selectMultiple) {
            // single select, init data only selected first one
            let selectedItem;
            this.forEachSelectableRow((rowItem) => {
                if (rowItem.selected) {
                    if (selectedItem) {
                        rowItem.selected = false;
                        return;
                    }
                    selectedItem = rowItem;
                }
            });
            return;
        }

        const selectAllOnInit = this.options.selectAllOnInit;
        // specified true
        if (selectAllOnInit === true) {
            this.updateAllRowsSelected(true);
            return;
        }
        // specified false
        if (selectAllOnInit === false) {
            this.updateAllRowsSelected(false);
        }
    },

    // for selectAllOnInit to data rows
    updateAllRowsSelected: function(selected) {
        this.forEachSelectableRow((rowItem) => {
            rowItem.selected = selected;
        });
    },

    initCollapseAllOnInitHandler: function() {
        const collapseAllOnInit = this.options.collapseAllOnInit;
        // collapse all tree, only handle true and false
        if (collapseAllOnInit === true) {
            this.updateAllRowsCollapsed(true);
            return;
        }
        if (collapseAllOnInit === false) {
            this.updateAllRowsCollapsed(false);
        }
    },

    // ===============================================================================================

    getToBeAddedItemList: function(rowInfo) {
        const list = [];
        const rowList = Util.toList(rowInfo);
        rowList.forEach((rowItem) => {
            // object
            if (rowItem && typeof rowItem === 'object') {
                // TODO should create snapshot ?
                list.push(rowItem);
                return;
            }
            // string, number, boolean
            if (typeof rowItem !== 'undefined') {
                list.push({
                    name: rowItem
                });
            }
        });
        return list;
    },

    getToBeAddedParentSubs: function(parentItem, rootList) {
        if (parentItem) {
            // update row to group
            if (!parentItem.subs) {
                parentItem.subs = [];
            }
            return parentItem.subs;
        }
        // root
        return rootList;
    },

    getToBeAddedPositionIndex: function(position, subs) {
        const len = subs.length;

        if (Util.isNum(position) && position >= 0 && position <= len) {
            return position | 0;
        }

        return len;
    },

    // ===============================================================================================

    // for input data, check exportData from output data
    generateDataSnapshot: function(data) {
        if (!data || typeof data !== 'object') {
            return data;
        }

        const rows = this.cleanTreeList(data.rows);
        const columns = this.cleanTreeList(data.columns);

        // convert number type
        this.convertNumberType(rows, columns);

        data.rows = rows;
        data.columns = columns;

        return data;
    },

    // correct tree item, remove tg_, init null item
    cleanTreeList: function(list) {

        if (!Util.isList(list)) {
            return [];
        }

        const generateTreeList = (newLs, ls) => {

            ls.forEach((item) => {
                if (!item || typeof item !== 'object') {
                    newLs.push({});
                    return;
                }
                const newItem = this.getItemSnapshot(item);
                const subs = item.subs;
                if (Array.isArray(subs)) {
                    newItem.subs = [];
                    generateTreeList(newItem.subs, subs);
                }
                newLs.push(newItem);
            });

        };

        const newList = [];
        generateTreeList(newList, list);

        return newList;
    },

    convertNumberType: function(rows, columns) {

        const idList = [];
        Util.forEachTree(columns, function(column) {
            if (column.type === 'number' && column.id) {
                idList.push(column.id);
            }
        });

        if (!idList.length) {
            return;
        }

        Util.forEachTree(rows, function(row) {
            idList.forEach(function(key) {
                row[key] = Util.convertNum(row[key]);
            });
        });

    }


};
