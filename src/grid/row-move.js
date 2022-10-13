import E from '../core/event-types.js';
import Util from '../core/util.js';
export default {

    //private API

    getMoveFocusRow: function(moveList, offset) {
        //-1 move up, first one
        let focusRow = moveList[0];
        //+1 move down, last one
        if (offset > 0) {
            focusRow = moveList[moveList.length - 1];
        }
        return focusRow;
    },

    getMoveLengthInList: function(moveList, list) {
        let length = 0;
        moveList.forEach((item) => {
            const ls = this.getRowParentSubs(item);
            if (ls === list) {
                length += 1;
            }
        });
        return length;
    },

    getMoveInfo: function(moveList, offset, focusRow) {
        const list = this.getRowParentSubs(focusRow);
        let index = focusRow.tg_sub_index + offset;

        const parent = focusRow.tg_parent;
        if (parent && this.options.rowMoveCrossLevel) {

            const startIndex = 0;
            const endIndex = parent.tg_subs_length - 1;

            //up to parent
            if (index < startIndex) {
                //offset 0 = insert before
                const parentUpOffset = index + 1;
                return this.getMoveInfo(moveList, parentUpOffset, parent);
            }

            //down to parent
            if (index > endIndex) {
                const parentDownOffset = index - endIndex;
                return this.getMoveInfo(moveList, parentDownOffset, parent);
            }

        }

        //fix multiple selections if move down
        //reduce the number if exist in current list
        if (offset > 0) {
            const lengthInList = this.getMoveLengthInList(moveList, list);
            index -= lengthInList - 1;
        }

        index = Util.clamp(index, 0, list.length);

        return {
            list: list,
            index: index
        };
    },

    moveRowsHandler: function(moveList, offset) {

        //remove rows by desc
        moveList = this.removeRowsHandler(moveList);
        //sort by asc
        moveList.reverse();

        const focusRow = this.getMoveFocusRow(moveList, offset);
        //insert rows
        const info = this.getMoveInfo(moveList, offset, focusRow);
        //console.log("focus row: " + focusRow.name, info);

        const args = [info.index, 0].concat(moveList);
        info.list.splice.apply(info.list, args);

        //remove cache
        this.initRowsHandler();

        //scroll and event
        this.onNextUpdated(function() {
            this.scrollRowIntoView(focusRow);
            this.trigger(E.onRowMoved, moveList);
        });

        //remove sort state
        this.removeSortColumn();
        //flush all rows
        this.update();

        return true;
    },

    //=============================================================================

    moveRows: function(rowList, offset) {
        rowList = Util.toList(rowList);
        const moveList = [];
        rowList.forEach((rowIndex) => {
            const rowItem = this.getRowItem(rowIndex);
            if (!rowItem) {
                return;
            }
            moveList.push(rowItem);
        });
        //no rows
        if (!moveList.length) {
            return false;
        }
        //select all
        if (moveList.length >= this.getRowsLength()) {
            return false;
        }
        offset = Util.toNum(offset, true);
        //no move
        if (offset === 0) {
            return false;
        }
        return this.moveRowsHandler(moveList, offset);
    },

    moveRowsUp: function(rowList) {
        return this.moveRows(rowList, -1);
    },

    moveRowsDown: function(rowList) {
        return this.moveRows(rowList, 1);
    },

    moveRowsToTop: function(rowList) {
        return this.moveRows(rowList, -this.getRowsLength(true));
    },

    moveRowsToBottom: function(rowList) {
        return this.moveRows(rowList, this.getRowsLength(true));
    },

    moveSelectedRowsUp: function() {
        return this.moveRows(this.getSelectedRows(), -1);
    },

    moveSelectedRowsDown: function() {
        return this.moveRows(this.getSelectedRows(), 1);
    },

    moveSelectedRowsToTop: function() {
        return this.moveRows(this.getSelectedRows(), -this.getRowsLength(true));
    },

    moveSelectedRowsToBottom: function() {
        return this.moveRows(this.getSelectedRows(), this.getRowsLength(true));
    }

};
