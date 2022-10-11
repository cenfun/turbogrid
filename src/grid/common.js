import Util from '../core/util.js';

export default {

    // init tree data, frozen, group, level, parent, subs_length
    initTreeInfo: function(treeList, frozenIndex) {

        const indexCache = [];
        let isTree = false;
        let level = 0;
        let index = 0;

        const invisibleHandler = (item) => {
            if (item.invisible) {
                item.tg_invisible = true;
                return;
            }
            if (item.tg_invisible) {
                item.tg_invisible = false;
            }
        };

        const frozenHandler = (item, i) => {
            if (i <= frozenIndex && !item.tg_invisible) {
                item.tg_frozen = true;
                return;
            }
            if (item.tg_frozen) {
                item.tg_frozen = false;
            }
        };

        const subsHandler = (item) => {
            if (Util.hasOwn(item, 'subs')) {
                if (Array.isArray(item.subs)) {
                    isTree = true;
                    item.tg_group = true;
                    item.tg_subs_length = item.subs.length;
                    return;
                }
                item.subs = null;
            }
            if (item.tg_group) {
                item.tg_group = false;
            }
        };

        const parentAndLevelHandler = (item, parent) => {
            //root tg_parent = undefined and tg_level = 0
            item.tg_parent = parent;
            let tg_level = 0;
            if (parent) {
                tg_level = parent.tg_level + 1;
                if (tg_level > level) {
                    level = tg_level;
                }
            }
            item.tg_level = tg_level;
        };

        const initItem = function(item, i, parent) {

            invisibleHandler(item);

            frozenHandler(item, index);

            subsHandler(item);

            parentAndLevelHandler(item, parent);

            //for delete invisible or collapsed rows
            item.tg_index = index;
            // for subs.splice()
            item.tg_sub_index = i;

            //add to cache
            indexCache.push(item);

            //next frozen index
            index += 1;
        };

        const initTree = function(list, parent) {
            //do NOT use forEach, because it doesn't support [].length = num
            let i = 0;
            const l = list.length;
            while (i < l) {
                let item = list[i];

                if (!item || typeof item !== 'object') {
                    item = {};
                    list[i] = item;
                }

                initItem(item, i, parent);

                //subs already init by initItem
                if (item.subs) {
                    initTree(item.subs, item);
                }

                i++;
            }
        };

        initTree(treeList);

        return {
            indexCache,
            isTree,
            //for render column header
            maxLevel: level,
            length: index
        };
    },

    initViewList: function(list, handler) {

        let i = 0;
        const l = list.length;
        let item;
        while (i < l) {
            item = list[i];
            item.tg_view_index = i;
            handler.call(this, item, i);
            i++;
        }

        if (item) {
            item.tg_view_last = true;
        }

        return this;
    },

    //=============================================================================

    forEachRow: function(callback) {
        Util.forEachTree(this.rows, callback);
        return this;
    },

    forEachColumn: function(callback) {
        Util.forEachTree(this.columns, callback);
        return this;
    },

    forEachSelectableRow: function(callback) {
        this.forEachRow((item, i, parent) => {
            if (this.isInvisible(item)) {
                return;
            }
            if (this.isRowSelectable(item)) {
                return callback(item, i, parent);
            }
        });
        return this;
    },

    toRowItemList: function(rowInfo, filter) {
        let rowList = Util.toList(rowInfo).map((it) => this.getRowItem(it)).filter((it) => it);
        if (typeof filter === 'function') {
            rowList = rowList.filter(filter);
        }
        return rowList;
    },

    toColumnItemList: function(columnInfo, filter) {
        let columnList = Util.toList(columnInfo).map((it) => this.getColumnItem(it)).filter((it) => it);
        if (typeof filter === 'function') {
            columnList = columnList.filter(filter);
        }
        return columnList;
    },

    //=============================================================================

    isRowLeaf: function(rowItem) {
        if (!rowItem) {
            return false;
        }
        if (rowItem.formatter === 'blank') {
            return false;
        }
        if (rowItem.tg_frozen || rowItem.tg_group) {
            return false;
        }
        return true;
    },

    isRowSelectable: function(rowItem) {
        if (!rowItem) {
            return false;
        }

        if (Util.hasOwn(rowItem, 'selectable')) {
            return Boolean(rowItem.selectable);
        }

        return this.isRowLeaf(rowItem);
    },

    //=============================================================================

    isEmptyGroup: function(item) {
        if (item && item.tg_group && item.tg_subs_length === 0) {
            return true;
        }
        return false;
    },

    isInvisible: function(item) {
        if (!item) {
            return false;
        }
        //filtered: temporary state
        //invisible: from user
        if (item.tg_filtered || item.tg_invisible) {
            return true;
        }
        if (this.isInvisible(item.tg_parent)) {
            return true;
        }
        return false;
    },

    isSortable: function(item) {
        if (!item) {
            return false;
        }
        if (!Util.hasOwn(item, 'sortable')) {
            return true;
        }
        return Boolean(item.sortable);
    },

    isCollapsedChanged: function(item, collapsed) {
        const prev = Boolean(item.collapsed);
        if (prev === collapsed) {
            return false;
        }
        return true;
    },

    isSelectedChanged: function(item, selected) {
        const prev = Boolean(item.selected);
        if (prev === selected) {
            return false;
        }
        return true;
    }

};

