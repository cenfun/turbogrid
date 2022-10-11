import E from '../core/event-types.js';
import Util from '../core/util.js';

export default {

    renderCollapseAllState: function() {
        if (!this.hasTreeColumn) {
            return;
        }
        if (!this.asyncRenderCollapseAllState) {
            this.asyncRenderCollapseAllState = Util.microtask(this.renderCollapseAllStateSync);
        }
        this.asyncRenderCollapseAllState.apply(this, arguments);
    },

    renderCollapseAllStateSync: function() {

        // update tree indent
        // setRows will not create header again
        const $treeHeader = this.$header.find('.tg-tree-header');
        const isTree = this.rowsInfo.isTree;
        if (isTree) {
            $treeHeader.addClass('tg-tree-header-indent');
        } else {
            $treeHeader.removeClass('tg-tree-header-indent');
        }

        this.renderCollapseAllIcon();

    },

    //========================================================================================


    checkCollapseAllState: function(collapsed) {
        if (collapsed === this.allRowsCollapsed) {
            return;
        }

        //for rows first level check all group collapsed
        if (collapsed) {
            let i = 0;
            const l = this.rows.length;
            while (i < l) {
                const rowItem = this.rows[i];
                if (rowItem.tg_group && !rowItem.collapsed) {
                    return;
                }
                i++;
            }
        } else {
            let notAll = false;
            this.forEachRow((rowItem) => {
                if (rowItem.tg_group && rowItem.tg_subs_length && rowItem.collapsed) {
                    notAll = true;
                    return false;
                }
            });
            if (notAll) {
                return;
            }
        }

        this.allRowsCollapsed = collapsed;

        this.renderCollapseAllIcon();

    },

    //========================================================================================
    //tree handler collapsed

    expandAllRows: function() {
        return this.renderAllRowsCollapsed(false);
    },

    collapseAllRows: function() {
        return this.renderAllRowsCollapsed(true);
    },

    toggleAllRows: function() {
        if (this.allRowsCollapsed) {
            return this.expandAllRows();
        }
        return this.collapseAllRows();
    },

    //========================================================================================

    renderAllRowsCollapsed: function(collapsed) {

        const toBeCollapsedList = this.updateAllRowsCollapsed(collapsed);
        if (!toBeCollapsedList.length) {
            return this;
        }

        this.flushBody();

        this.onNextUpdated(() => {

            this.renderCollapseAllIcon();

            if (collapsed) {
                this.trigger(E.onRowCollapsed, toBeCollapsedList);
            } else {
                this.trigger(E.onRowExpanded, toBeCollapsedList);
            }

        });

        this.render('rows');

        return this;
    },

    updateAllRowsCollapsed: function(collapsed) {
        this.allRowsCollapsed = collapsed;
        const toBeCollapsedList = [];
        this.forEachRow((rowItem) => {
            if (rowItem.subs && rowItem.tg_subs_length) {
                if (this.isCollapsedChanged(rowItem, collapsed)) {
                    rowItem.collapsed = collapsed;
                    toBeCollapsedList.push(rowItem);
                }
            }
        });
        return toBeCollapsedList;
    },

    //========================================================================================

    expandRow: function(rowIndex) {
        const rowItem = this.getRowItem(rowIndex);
        if (!rowItem) {
            return this;
        }

        //empty group
        if (this.isEmptyGroup(rowItem)) {
            this.trigger(E.onRowSubsRequest, rowItem);
            return this;
        }

        if (!this.isCollapsedChanged(rowItem, false)) {
            return this;
        }

        rowItem.collapsed = false;

        this.flushRowFrom(rowItem.tg_view_index);

        this.renderCollapseIcon(rowItem);

        this.onNextUpdated(() => {
            this.checkCollapseAllState(false);
            this.trigger(E.onRowExpanded, rowItem);
        });

        this.render('rows');

        return this;
    },

    collapseRow: function(rowIndex) {
        const rowItem = this.getRowItem(rowIndex);
        if (!rowItem) {
            return this;
        }

        //has subs but length = 0
        if (!rowItem.subs || !rowItem.tg_subs_length) {
            return this;
        }

        if (!this.isCollapsedChanged(rowItem, true)) {
            return this;
        }

        rowItem.collapsed = true;

        this.flushRowFrom(rowItem.tg_view_index);

        this.renderCollapseIcon(rowItem);

        this.onNextUpdated(() => {
            this.checkCollapseAllState(true);
            this.trigger(E.onRowCollapsed, rowItem);
        });

        this.render('rows');

        return this;
    },

    toggleRow: function(rowIndex) {
        const rowItem = this.getRowItem(rowIndex);
        if (!rowItem) {
            return this;
        }
        if (rowItem.collapsed) {
            this.expandRow(rowItem);
        } else {
            this.collapseRow(rowItem);
        }
        return this;
    },

    //========================================================================================

    expandRowLevel: function(level) {

        level = Util.toNum(level, true);

        const collapsedList = [];
        const expandedList = [];

        this.forEachRow((rowItem) => {
            if (rowItem.subs && rowItem.tg_subs_length) {
                if (rowItem.tg_level <= level) {

                    if (this.isCollapsedChanged(rowItem, false)) {
                        rowItem.collapsed = false;
                        expandedList.push(rowItem);
                    }

                } else {

                    if (this.isCollapsedChanged(rowItem, true)) {
                        rowItem.collapsed = true;
                        collapsedList.push(rowItem);
                    }

                }
            }
        });

        //console.log(collapsedList, expandedList);

        if (!collapsedList.length && !expandedList.length) {
            return this;
        }

        this.flushBody();

        this.onNextUpdated(() => {
            if (collapsedList.length) {
                this.trigger(E.onRowCollapsed, collapsedList);
            }
            if (expandedList.length) {
                this.trigger(E.onRowExpanded, expandedList);
            }
        });

        this.render('rows');

        return this;
    },


    //========================================================================================

    renderCollapseAllIcon: function() {
        if (!this.option.collapseAllVisible || !this.hasTreeColumn) {
            return;
        }
        const $node = this.$header.find('.tg-tree-icon-all');
        this.renderTreeIcon($node, this.allRowsCollapsed);
    },

    renderCollapseIcon: function(rowItem) {
        if (!this.headerCreated) {
            return;
        }
        const rowNodes = this.getRowNodesByIndex(rowItem.tg_view_index);
        if (!rowNodes) {
            return;
        }
        const $node = rowNodes.find('.tg-tree-icon');
        this.renderTreeIcon($node, rowItem.collapsed);
    },

    renderTreeIcon: function($node, collapsed) {
        if (!$node) {
            return;
        }
        if (collapsed) {
            $node.removeClass('tg-tree-icon-expanded').addClass('tg-tree-icon-collapsed');
        } else {
            $node.removeClass('tg-tree-icon-collapsed').addClass('tg-tree-icon-expanded');
        }
    }

};
