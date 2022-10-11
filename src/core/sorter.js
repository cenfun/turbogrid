import Util from './util.js';
export default class {

    constructor(option) {
        this.option = Util.merge({
            ignore: null,
            sortField: '',
            sortFactor: 1,
            sortBlankFactor: 1,
            sortComparer: null
        }, option);
    }


    sortList(list) {

        if (!Util.isList(list) || list.length === 1) {
            return false;
        }

        this.ignoreExcludeHandler(list);
        const sortChanged = this.comparerHandler(list);
        this.ignoreIncludeHandler(list);

        return sortChanged;
    }

    comparerHandler(list) {

        const o = this.option;
        const sortField = o.sortField;
        const sortFactor = o.sortFactor;
        const sortBlankFactor = o.sortBlankFactor;
        const sortComparer = o.sortComparer;

        if (typeof sortComparer !== 'function') {
            return false;
        }

        list.sort((a, b) => {
            return sortComparer.call(this, a, b, {
                sortField,
                sortFactor,
                sortBlankFactor
            });
        });

        return true;
    }

    ignoreExcludeHandler(list) {

        const ignoreHandler = this.option.ignore;

        this.ignoreListTop = [];
        this.ignoreListBottom = [];

        const indexList = [];
        for (let i = 0, l = list.length; i < l; i++) {
            const item = list[i];
            const ignoreItem = ignoreHandler(item);
            if (ignoreItem) {
                if (ignoreItem.top) {
                    this.ignoreListTop.unshift(ignoreItem);
                } else {
                    this.ignoreListBottom.push(ignoreItem);
                }
                indexList.push(i);
            }
        }
        //remove from old list
        indexList.reverse();
        indexList.forEach(function(index) {
            list.splice(index, 1);
        });
    }

    ignoreIncludeHandler(list) {

        this.ignoreListTop.forEach((ignoreItem) => {
            list.unshift(ignoreItem.item);
        });

        this.ignoreListBottom.forEach((ignoreItem) => {
            list.push(ignoreItem.item);
        });

    }

}

