export default {

    //=============================================================================
    //hover single row, by API, no need keep

    setRowHover: function(rowIndex, hover) {
        const item = this.getRowItem(rowIndex);
        if (!item) {
            return this;
        }
        this.renderRowHover(item, hover);
        return this;
    },

    // API or from events
    renderRowHover: function(rowItem, hover) {

        //remove previous hover row, both for left and right pane
        if (this.previousHover) {
            this.previousHover.removeClass('tg-hover');
            this.previousHover = null;
        }

        if (!hover) {
            return this;
        }

        //add hover row not frozen, both for left and right pane
        if (rowItem.tg_frozen && !this.options.frozenRowHoverable) {
            return this;
        }

        //can not do previous cache, because frozen column need keep hover state

        const row = rowItem.tg_view_index;
        this.previousHover = this.$body.find(`.tg-row[row='${row}']`).addClass('tg-hover');

        return this;
    },

    //=============================================================================
    //change row state, the state will be add/remove as className
    //current support: selected

    setRowState: function(rowIndex, state, value = true) {
        const rowItem = this.getRowItem(rowIndex);
        if (!rowItem) {
            return this;
        }
        //keep state names (may from user) for getRowClass
        if (!rowItem.tg_state_names) {
            rowItem.tg_state_names = new Set();
        }
        rowItem.tg_state_names.add(state);

        rowItem[state] = value;

        this.renderRowState(rowItem, state);

        return this;
    },

    renderRowState: function(rowItem, state) {
        const rowNodes = this.getRowNodesByIndex(rowItem.tg_view_index);
        if (rowNodes) {
            const hasState = rowItem[state];
            const className = `tg-${state}`;
            if (hasState) {
                rowNodes.addClass(className);
            } else {
                rowNodes.removeClass(className);
            }
        }
    }

};

