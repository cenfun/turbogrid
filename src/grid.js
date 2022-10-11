import $ from './core/query.js';
import Util from './core/util.js';
import GridModules from './modules/index.js';
import defaultOptions from './config/default-options.js';

//test if be changed
// setTimeout(function() {
//     console.log(defaultOptions());
// }, 2000);

export default GridModules.extend({

    constructor: function(holder) {
        this.create(holder);
    },

    getDefaultOption: function(option) {
        const d = defaultOptions();
        const t = this.getThemeOptions(option && option.theme);
        if (t) {
            return Util.merge(d, t);
        }
        return d;
    },

    setOption: function() {
        this.renderType = 'all';
        GridModules.prototype.setOption.apply(this, arguments);
        return this;
    },

    setData: function(data) {
        this.renderType = 'all';

        //init data object
        if (!data || typeof data !== 'object') {
            data = {};
        }

        //init array
        if (!Array.isArray(data.columns)) {
            data.columns = [];
        }
        if (!Array.isArray(data.rows)) {
            data.rows = [];
        }

        //init rows length
        const rowsLength = data.rowsLength;
        if (Util.isNum(rowsLength)) {
            delete data.rowsLength;
            data.rows.length = rowsLength | 0;
        }

        this.data = data;

        return this;
    },

    setDataSnapshot: function(data) {
        this.setData(this.getDataSnapshot(data));
        return this;
    },

    getData: function() {
        return this.data;
    },

    toString: function() {
        return '[object Grid]';
    }

}, {
    $: $,
    getInstance: Util.getInstance,
    getAllThemes: GridModules.prototype.getAllThemes,
    getAllEvents: GridModules.prototype.getAllEvents
});
