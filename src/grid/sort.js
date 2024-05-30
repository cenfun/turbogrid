import Sorter from '../components/sorter.js';
import Util from '../core/util.js';

export default {

    // remove sort state
    removeSortColumn: function() {
        this.sortColumn = null;
        // remove column sorted
        if (this.$header) {
            this.$header.find('.tg-column-sorted').removeClass('tg-column-sorted');
        }
        return this;
    },

    // sort API
    setSortColumn: function(columnItem) {

        columnItem = this.getColumnItem(columnItem);
        if (!columnItem) {
            return;
        }

        if (!this.isColumnSortable(columnItem)) {
            return;
        }

        // same sort column
        if (columnItem === this.sortColumn) {
            // change sortAsc if click same column
            columnItem.sortAsc = !columnItem.sortAsc;
        } else {
            // set default sortAsc
            if (!Util.hasOwn(columnItem, 'sortAsc')) {
                columnItem.sortAsc = this.options.sortAsc;
            }
        }

        // new sort column
        this.sortColumn = columnItem;

        const rowsLength = this.getRowsLength();
        if (rowsLength - this.frozenInfo.rows < 2) {
            return;
        }

        if (!this.headerCreated) {
            return;
        }

        const sortChanged = this.updateRowsSort();
        if (!sortChanged) {
            return;
        }

        this.renderHeaderSort();

        // sort without frozen rows
        this.flushSort();

        // not need update index (init rows)

        this.render('rows');

    },

    renderHeaderSort: function() {
        const sortColumn = this.sortColumn;
        if (!sortColumn) {
            return this;
        }

        if (!this.isColumnSortable(sortColumn)) {
            return this;
        }

        this.$header.find('.tg-column-sorted').removeClass('tg-column-sorted');

        // add new column sorted
        const column = sortColumn.tg_view_index;
        const $headerItem = this.$header.find(`.tg-header-item[column='${column}']`);

        const $columnHeader = $headerItem.find('.tg-column-header').addClass('tg-column-sorted');

        // sort asc
        if (sortColumn.sortAsc) {
            $columnHeader.removeClass('tg-sort-desc').addClass('tg-sort-asc');
        } else {
            $columnHeader.removeClass('tg-sort-asc').addClass('tg-sort-desc');
        }

        return this;
    },

    // =============================================================================

    // just use type, do NOT use formatter, this is only for sorting
    getSortComparer: function(sortColumn) {

        // function
        const comparer = sortColumn.comparer;
        if (typeof comparer === 'function') {
            return comparer;
        }

        // string name
        const sortComparers = this.options.sortComparers;
        const comparerName = comparer || sortColumn.type;
        const sortComparer = sortComparers[comparerName];
        if (typeof sortComparer === 'function') {
            return sortComparer;
        }

        // default to string, can be override may not function
        return sortComparers.string;
    },

    // just sort data
    updateRowsSort: function() {

        const sortColumn = this.sortColumn;
        if (!sortColumn) {
            return false;
        }

        const sortField = sortColumn.id;
        if (!sortField) {
            return false;
        }

        return this.sortRows(sortField, sortColumn);
    },

    sortRows: function(sortField, sortOptions = {}) {

        const sortFactor = sortOptions.sortAsc ? -1 : 1;
        const sortBlankFactor = this.options.sortBlankValueBottom ? 1 : sortFactor;
        const sortComparer = this.getSortComparer(sortOptions);

        // sort handler
        let sortChanged = false;
        const sorter = new Sorter({
            ignore: function(item) {
                // frozen always top
                if (item.tg_frozen) {
                    return {
                        item: item,
                        top: true
                    };
                }
                if (item.sortFixed) {
                    return {
                        item: item,
                        top: item.sortFixed === 'top'
                    };
                }
            },

            sortField,
            sortFactor,
            sortBlankFactor,
            sortComparer
        });
        const sortAll = function(rows) {
            const sorted = sorter.sortList(rows);
            if (sorted) {
                sortChanged = true;
            }
            rows.forEach(function(row, i) {

                // update tg_sub_index after sort
                row.tg_sub_index = i;

                if (row.subs) {
                    sortAll(row.subs);
                }
            });
        };

        sortAll(this.rows);

        // update rows indexCache after sort
        if (sortChanged) {
            this.initRowsHandler();
        }

        // console.log('sortChanged', sortChanged);

        return sortChanged;
    }

};

