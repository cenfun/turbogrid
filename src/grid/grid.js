
import CONST from '../core/const.js';
import $ from '../core/query.js';

import Cache from './cache.js';
import Cells from './cells.js';

import ColumnAddDelete from './column-add-delete.js';
import ColumnDisplay from './column-display.js';
import ColumnLine from './column-line.js';
import Columns from './columns.js';


import Common from './common.js';
import Css from './css.js';

import Destroy from './destroy.js';

import Events from './events.js';

import Export from './export.js';
import Flush from './flush.js';
import Formatter from './formatter.js';

import HeaderTable from './header-table.js';
import Header from './header.js';

import Create from './create.js';


import InitColumns from './init-columns.js';
import InitHeader from './init-header.js';
import InitOptions from './init-options.js';
import InitResize from './init-resize.js';
import InitRows from './init-rows.js';
import Init from './init.js';

import Loading from './loading.js';

import Navigation from './navigation.js';
import Node from './node.js';

import Render from './render.js';
import Resize from './resize.js';

import RowAddDelete from './row-add-delete.js';
import RowCollapse from './row-collapse.js';
import RowDisplay from './row-display.js';
import RowDrag from './row-drag.js';
import RowMove from './row-move.js';
import RowSelect from './row-select.js';
import RowState from './row-state.js';
import Rows from './rows.js';


import ScrollPane from './scroll-pane.js';
import ScrollState from './scroll-state.js';
import Scroll from './scroll.js';


import Sort from './sort.js';
import Theme from './theme.js';
import Update from './update.js';

import Viewport from './viewport.js';


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

        //key/value, not reset options
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

    //require after render
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

            //only pick columns, rows, rowsLength

            if (Array.isArray(data.columns)) {
                customData.columns = data.columns;
            }
            if (Array.isArray(data.rows)) {
                customData.rows = data.rows;
            }

            //init rows length
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

function extendsPrototype(props, list) {
    list.forEach((item) => {
        for (const k in item) {
            // for development checking
            if (Util.hasOwn(props, k)) {
                throw new Error(`ERROR: extends with an existing key: "${k}"`);
            }
            props[k] = item[k];
        }
    });
}

// all grid modules
extendsPrototype(Grid.prototype, [

    Cache,
    Cells,

    ColumnAddDelete,
    ColumnDisplay,
    ColumnLine,
    Columns,

    Common,
    Css,

    Destroy,

    Events,

    Export,
    Flush,

    Formatter,

    HeaderTable,
    Header,

    Create,

    InitColumns,
    InitHeader,
    InitOptions,
    InitResize,
    InitRows,
    Init,

    Loading,

    Navigation,
    Node,

    Render,
    Resize,

    RowAddDelete,
    RowCollapse,
    RowDisplay,
    RowDrag,
    RowMove,
    RowSelect,
    RowState,
    Rows,

    ScrollPane,
    ScrollState,
    Scroll,

    Sort,
    Theme,
    Update,

    Viewport
]);

export default Grid;
