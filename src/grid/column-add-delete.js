import E from '../core/event-types.js';

export default {

    addColumn: function(columnInfo, parent, position, scrollTo = true) {

        const columnList = this.getToBeAddedItemList(columnInfo);
        if (!columnList.length) {
            return false;
        }

        let parentItem;
        if (typeof parent !== 'undefined' && parent !== null) {
            parentItem = this.getColumnItem(parent);
            // if defined parent but not found parent item, should be invalid operation
            if (!parentItem) {
                return false;
            }
        }

        const subs = this.getToBeAddedParentSubs(parentItem, this.columns);
        const positionIndex = this.getToBeAddedPositionIndex(position, subs);

        // console.log('addColumn', parentItem, positionIndex);

        const args = [positionIndex, 0].concat(columnList);
        subs.splice.apply(subs, args);

        this.onNextUpdated(function() {
            this.trigger(E.onColumnAdded, columnList);
        });

        const renderSettings = {
            type: 'columns'
        };

        if (scrollTo) {
            renderSettings.scrollColumn = columnList[columnList.length - 1];
        }

        this.render(renderSettings);

        return true;
    },


    // =============================================================================

    deleteColumn: function(columnInfo) {

        const columnList = this.toColumnItemList(columnInfo, (it) => !it.private);
        if (!columnList.length) {
            return false;
        }

        this.removeColumnsHandler(columnList);

        this.onNextUpdated(function() {
            this.trigger(E.onColumnRemoved, columnList);
        });

        this.render('columns');

        return true;
    },

    removeColumnsHandler: function(deletedColumnsList) {

        // remove with high performance, desc index
        const list = [].concat(deletedColumnsList);
        list.sort(function(a, b) {
            return b.tg_index - a.tg_index;
        });

        list.forEach((columnItem) => {

            // remove sort state if column sorted
            if (columnItem === this.sortColumn) {
                this.removeSortColumn();
            }

            let parentSubs;
            // two ways to delete column
            if (columnItem.tg_parent) {
                // quick delete by sub index
                parentSubs = columnItem.tg_parent.subs;
                parentSubs.splice(columnItem.tg_sub_index, 1);
            } else {
                parentSubs = this.columns;
                // sub index is for private columns this moment
                // using for match delete
                const index = parentSubs.findIndex((it) => it === columnItem);
                if (index !== -1) {
                    parentSubs.splice(index, 1);
                }
            }

            // remove subs if subs is empty
            if (!parentSubs.length && columnItem.tg_parent) {
                columnItem.tg_parent.subs = null;
            }

        });

    }

};
