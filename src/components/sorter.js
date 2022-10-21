import Util from '../core/util.js';
export default class Sorter {

    constructor(options) {
        this.options = this.generateOptions(options);
    }

    generateOptions(options) {
        const defaultOptions = {
            ignore: null,
            sortField: '',
            sortFactor: 1,
            sortBlankFactor: 1,
            sortComparer: null
        };
        return Util.merge(defaultOptions, options);
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

        const os = this.options;
        const sortField = os.sortField;
        const sortFactor = os.sortFactor;
        const sortBlankFactor = os.sortBlankFactor;
        const sortComparer = os.sortComparer;

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

        const ignoreHandler = this.options.ignore;

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
        // remove from old list
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

