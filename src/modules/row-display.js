
export default {

    showRow: function(rowInfo) {
        return this.updateRowsInvisible(this.toRowItemList(rowInfo), false);
    },

    hideRow: function(rowInfo) {
        return this.updateRowsInvisible(this.toRowItemList(rowInfo), true);
    },

    updateRowsInvisible: function(rowList, invisible) {
        if (!rowList.length) {
            return false;
        }
        const changedList = [];
        rowList.forEach((rowItem) => {
            if (rowItem.invisible === invisible) {
                return;
            }
            rowItem.invisible = invisible;
            rowItem.tg_invisible = invisible;
            changedList.push(rowItem);
        });

        if (!changedList.length) {
            return false;
        }

        this.update();

        return true;

    }

};
