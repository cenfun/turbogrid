
import CONST from '../core/const.js';
import $ from '../core/query.js';

import Events from './events.js';
import Theme from './theme.js';
import applyMixins from './apply-mixins.js';
import gridModules from './grid-modules.js';

import Util from '../core/util.js';
import EventBase from '../core/event-base.js';

class Grid extends EventBase {

    static $ = $;
    static getInstance = Util.getInstance;
    static getAllThemes = Theme.getAllThemes;
    static getAllEvents = Events.getAllEvents;
    static VERSION = CONST.VERSION;
    static TIMESTAMP = CONST.TIMESTAMP;

    $ = $;
    VERSION = CONST.VERSION;
    TIMESTAMP = CONST.TIMESTAMP;

    constructor(options) {
        super();
        this.create(options);
    }

    // setOption(key, value)
    // setOption(object)
    setOption(key, value) {
        this.renderType = 'all';

        let options = key;

        // key/value, not reset options
        if (typeof key === 'string') {
            if (this.options) {
                this.options[key] = value;
                return this;
            }

            // first time
            options = {};
            options[key] = value;
        }

        this.customOptions = options;

        return this;
    }

    // require after render
    getOption(key) {
        const os = this.options;
        if (arguments.length) {
            if (os) {
                return os[key];
            }
            return;
        }
        return os;
    }

    setData(data) {
        this.renderType = 'all';

        const customData = {
            columns: [],
            rows: []
        };

        let dataOptions;

        if (data && typeof data === 'object') {

            // only pick columns, rows, rowsLength

            if (Array.isArray(data.columns)) {
                customData.columns = data.columns;
            }
            if (Array.isArray(data.rows)) {
                customData.rows = data.rows;
            }

            // init rows length
            const rowsLength = data.rowsLength;
            if (Number.isInteger(rowsLength) && rowsLength > 0) {
                customData.rows.length = rowsLength;
            }

            dataOptions = data.options;

        }

        this.data = customData;
        this.dataOptions = dataOptions;

        return this;
    }

    setDataSnapshot(data) {
        this.setData(this.generateDataSnapshot(data));
        return this;
    }

    getData() {
        return this.data;
    }

    toString() {
        return '[object Grid]';
    }
}

applyMixins(Grid, gridModules);

export default Grid;
