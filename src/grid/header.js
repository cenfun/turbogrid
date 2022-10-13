import E from '../core/event-types.js';
//import Util from '../core/util.js';
export default {

    renderHeader: function() {

        //update css always
        this.cssRulesInvalid = true;

        //remove header table
        this.$headerL.empty();
        this.$headerR.empty();

        this.resetCssDisplay();

        this.renderHeaderTables();

        //header sort and resize
        this.renderHeaderSort();

        //header created
        this.headerCreated = true;
        //console.log('headerCreated');

        //column rendered
        this.trigger(E.onHeaderUpdated, {
            node: this.$headerFrame.get(0)
        });

    },

    //call from resize
    initHeaderLayerHeight: function() {

        this.updateScrollPaneHiddenState();

        this.resetCssDisplay();

        this.viewAllColumns.forEach((column) => {
            this.updateColumnHeaderHeight(column);
        });

        this.resetCssDisplay('none');

        this.updateHeaderLayerHeight();

    },

    //use max height column as layer height
    //combination column need handler
    updateHeaderLayerHeight: function() {
        const headerLayerHeight = {};
        const maxLevel = this.columnsInfo.maxLevel;
        for (let i = 0; i <= maxLevel; i++) {
            headerLayerHeight[i] = 0;
        }

        const combinationList = [];

        this.viewAllColumns.forEach(function(column) {
            if (column.tg_combination) {
                combinationList.push(column);
            } else {
                const ch = column.tg_height;
                const layer = column.tg_layer;
                headerLayerHeight[layer] = Math.max(headerLayerHeight[layer], ch);
            }
        });

        //last layer
        combinationList.forEach(function(column) {
            let ch = column.tg_height;
            //210
            const combination = column.tg_combination;
            const list = combination.split('');
            const layer = list.pop();
            list.forEach(function(k) {
                ch -= headerLayerHeight[k] || 0;
            });
            headerLayerHeight[layer] = Math.max(headerLayerHeight[layer], ch);

        });

        const str = JSON.stringify(headerLayerHeight);
        //console.log(`headerLayerHeight: ${str}`);

        if (this.previousHeaderLayerHeight === str) {
            return;
        }
        this.previousHeaderLayerHeight = str;

        this.headerLayerHeight = headerLayerHeight;

        this.cssRulesInvalid = true;

    }

};
