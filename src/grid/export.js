import Util from '../core/util.js';

export default {

    // data snapshot for export excel
    exportData: function(keysSettings) {
        const data = this.getData();

        const columns = this.getTreeSnapshot(data.columns, keysSettings);
        const rows = this.getTreeSnapshot(data.rows, keysSettings);

        return {
            columns: columns,
            rows: rows
        };
    },

    isItemExportable: function(item) {
        if (!item) {
            return false;
        }
        if (!Util.hasOwn(item, 'exportable')) {
            return true;
        }
        return Boolean(item.exportable);
    },

    getTreeSnapshot: function(tree, keysSettings) {
        const snapshotAll = (newLs, ls) => {
            if (!Util.isList(ls)) {
                return;
            }
            ls.forEach((item) => {
                if (!this.isItemExportable(item)) {
                    return;
                }
                const newItem = this.getItemSnapshot(item, keysSettings);
                const subs = item.subs;
                if (Array.isArray(subs)) {
                    newItem.subs = [];
                    snapshotAll(newItem.subs, subs);
                }
                newLs.push(newItem);
            });
        };
        const newList = [];
        snapshotAll(newList, tree);
        return newList;
    },


    getItemSnapshot: function(item, keysSettings = {}) {
        const newItem = {};
        Object.keys(item).forEach((k) => {
            // user custom keys settings
            if (keysSettings[k] === true) {
                newItem[k] = item[k];
                return;
            }
            if (keysSettings[k] === false) {
                return;
            }

            // ignore subs and all tg_ properties
            if (k === 'subs' || k.indexOf('tg_') === 0) {
                return;
            }
            newItem[k] = item[k];
        });
        return newItem;
    }

};
