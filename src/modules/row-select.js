import E from '../core/event-types.js';
import $ from '../core/query.js';
import Util from '../core/util.js';

export default {

    //get single/first selected row (no order, need order should call getSelectedRows()[0])
    getSelectedRow: function() {
        let selectedRow = null;
        this.forEachSelectableRow(function(rowItem) {
            if (rowItem.selected) {
                selectedRow = rowItem;
                //break forEach
                return false;
            }
        });
        return selectedRow;
    },

    //get all selected rows
    getSelectedRows: function() {
        const selectedRows = [];
        this.forEachSelectableRow(function(rowItem) {
            if (rowItem.selected) {
                selectedRows.push(rowItem);
            }
        });
        if (selectedRows.length > 1) {
            //sort by order
            selectedRows.sort(function(a, b) {
                const av = a.tg_selected_index;
                const bv = b.tg_selected_index;
                if (av > bv) {
                    return 1;
                }
                if (av < bv) {
                    return -1;
                }
                return 0;
            });
        }
        return selectedRows;
    },


    //=============================================================================

    //select/unselect all
    selectAll: function(selected = true) {
        selected = Boolean(selected);

        this.globalSelectedIndex = 0;

        if (selected && !this.option.selectMultiple) {
            return this;
        }

        const changedList = this.getAllSelectedChangedList(selected);
        if (!changedList.length) {
            return this;
        }

        this.updateRowsSelectedState(changedList);

        return this;
    },

    //=============================================================================

    setRowSelected: function() {
        const handler = this.option.selectMultiple ? this.setRowMultipleSelected : this.setRowSingleSelected;
        return handler.apply(this, arguments);
    },

    //=============================================================================

    // radio single select
    setRowSingleSelected: function(rowInfo) {
        const rowItem = this.getRowItem(rowInfo);
        if (!rowItem) {
            return this;
        }

        if (!this.isRowSelectable(rowItem)) {
            return this;
        }

        if (rowItem.selected) {
            return this;
        }

        const changedList = [];
        //unselected
        const previousRow = this.getSelectedRow();
        if (previousRow && previousRow.selected) {
            changedList.push(previousRow);
        }
        if (!rowItem.selected) {
            changedList.push(rowItem);
        }

        if (!changedList.length) {
            return this;
        }

        this.updateRowsSelectedState(changedList);

        return this;
    },

    //=============================================================================

    // checkbox multiple select
    // (rowIndex)
    // ([rowIndex1,rowIndex2])
    // (rowIndex, e)
    // (rowIndex, false)
    setRowMultipleSelected: function(rowInfo, settings) {

        if (arguments.length === 0) {
            return this;
        }

        if (arguments.length === 1 && arguments[0] === false) {
            return this.selectAll(false);
        }

        const rowList = this.toRowItemList(rowInfo, (it) => this.isRowSelectable(it));
        if (!rowList.length) {
            return this;
        }

        //unselected
        if (settings === false) {
            this.setRowListUnselected(rowList);
            return this;
        }

        //selected
        if (Util.hasShiftKey(settings) && rowList.length === 1) {
            this.setRowBetweenListSelected(rowList[0]);
            return this;
        }

        this.updateRowsSelectedState(rowList);
        return this;
    },

    setRowListUnselected: function(rowList) {
        const unselectedChangedList = this.getSelectedChangedList(rowList, false);
        if (!unselectedChangedList.length) {
            return;
        }
        this.updateRowsSelectedState(unselectedChangedList);
    },

    setRowBetweenListSelected: function(rowItem) {
        const previousSelectedRow = this.previousSelectedRow;
        if (previousSelectedRow && previousSelectedRow !== rowItem) {
            const betweenList = this.getBetweenSelectedChangedList(previousSelectedRow, rowItem);
            if (!betweenList.length) {
                return;
            }
            this.updateRowsSelectedState(betweenList, true);
            return;
        }
        this.updateRowsSelectedState([rowItem]);
    },

    //=============================================================================

    getAllSelectedChangedList: function(selected) {
        const changedList = [];
        this.forEachSelectableRow((rowItem) => {
            if (this.isSelectedChanged(rowItem, selected)) {
                changedList.push(rowItem);
            }
        });
        return changedList;
    },

    getSelectedChangedList: function(rowList, selected) {
        const changedList = [];
        rowList.forEach((rowItem) => {
            if (this.isSelectedChanged(rowItem, selected)) {
                changedList.push(rowItem);
            }
        });
        return changedList;
    },

    getBetweenSelectedChangedList: function(previousItem, currentItem) {
        const previousIndex = previousItem.tg_index;
        const currentIndex = currentItem.tg_index;
        const indexList = [];
        if (previousIndex < currentIndex) {
            let i = previousIndex + 1;
            while (i <= currentIndex) {
                indexList.push(i);
                i++;
            }
        } else {
            let j = previousIndex - 1;
            while (j >= currentIndex) {
                indexList.push(j);
                j--;
            }
        }
        //console.log(indexList);
        return this.toRowItemList(indexList, (it) => this.isRowSelectable(it) && !it.selected);
    },

    updateRowsSelectedState: function(changedList, shiftKey) {
        let lastSelectedRow;
        changedList.forEach((rowItem) => {
            //toggle selected
            const selected = !rowItem.selected;
            rowItem.selected = selected;
            if (selected) {
                rowItem.tg_selected_index = this.globalSelectedIndex++;
                lastSelectedRow = rowItem;
            }
            this.renderRowSelectedState(rowItem);
        });

        if (!shiftKey) {
            this.previousSelectedRow = lastSelectedRow;
        }

        this.renderSelectAllState();

        this.onNextUpdated(() => {
            this.trigger(E.onSelectChanged, changedList);
        });

        this.render();

    },

    renderRowSelectedState: function(rowItem) {
        // viewport checking
        const row = rowItem.tg_view_index;
        if (!this.viewport.rows.includes(row)) {
            return;
        }
        //row tg-selected
        this.renderRowState(rowItem, 'selected');
        //select column: checkbox or radio
        this.flushCell(row, this.selectColumn.tg_view_index);
    },

    //=============================================================================

    // async update for checkbox all
    renderSelectAllState: function() {
        if (!this.isSelectAllVisible()) {
            return;
        }
        if (!this.asyncRenderSelectAllState) {
            this.asyncRenderSelectAllState = Util.microtask(this.renderSelectAllStateSync);
        }
        this.asyncRenderSelectAllState.apply(this, arguments);
    },

    renderSelectAllStateSync: function() {
        const selectAllState = this.getSelectAllState();
        const previousSelectAllState = this.previousSelectAllState;
        if (selectAllState === previousSelectAllState) {
            return;
        }
        this.previousSelectAllState = selectAllState;

        const columnItem = this.selectColumn;
        const node = this.getColumnHeaderNode(columnItem);
        const $node = $(node);
        const $selectIconAll = $node.find('.tg-select-icon-all');
        if (!$selectIconAll.length) {
            return;
        }

        $selectIconAll.removeClass('tg-selected tg-mixed');
        if (selectAllState) {
            $selectIconAll.addClass(`tg-${selectAllState}`);
        }

    },

    getSelectAllState: function() {
        let total = 0;
        this.forEachSelectableRow((item) => {
            total += 1;
        });

        const selectedRows = this.getSelectedRows();
        const selectedLength = selectedRows.length;

        //empty means mixed
        let selectAllState = 'mixed';
        if (selectedLength === 0) {
            selectAllState = '';
            //remove state if noting selected
            this.previousSelectedRow = null;
        } else if (selectedLength === total) {
            selectAllState = 'selected';
        }

        return selectAllState;
    },

    isSelectAllVisible: function() {
        const o = this.option;
        if (!o.selectVisible || !o.selectAllVisible || !o.selectMultiple) {
            return false;
        }
        return true;
    }
};
