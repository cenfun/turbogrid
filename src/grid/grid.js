
import CONST from '../core/const.js';
import $ from '../core/query.js';
import OptionBase from '../core/option-base.js';

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
import InitData from './init-data.js';
import InitHeader from './init-header.js';
import InitOptions from './init-options.js';
import InitResize from './init-resize.js';
import InitRows from './init-rows.js';

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
import defaultOptions from '../config/default-options.js';
//test if be changed
// setTimeout(function() {
//     console.log(defaultOptions());
// }, 2000);


function hasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

function extend(props, list) {
    list.forEach((item) => {
        for (const k in item) {
            if (hasOwn(props, k)) {
                console.log(`ERROR: concat with an existing key: "${k}"`);
            }
            props[k] = item[k];
        }
    });
}

class Grid extends OptionBase {

    static $ = $;
    static getInstance = Util.getInstance;
    static getAllThemes = Theme.getAllThemes;
    static getAllEvents = Events.getAllEvents;
    static VERSION = CONST.VERSION;
    static TIMESTAMP = CONST.TIMESTAMP;

    $ = $;
    VERSION = CONST.VERSION;
    TIMESTAMP = CONST.TIMESTAMP;

    constructor(holder) {
        super();
        this.create(holder);
    }

    getDefaultOption(option) {
        const d = defaultOptions();
        const t = this.getThemeOptions(option && option.theme);
        if (t) {
            return Util.merge(d, t);
        }
        return d;
    }

    setOption() {
        this.renderType = 'all';
        super.setOption.apply(this, arguments);
        return this;
    }

    setData(data) {
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
    }

    setDataSnapshot(data) {
        this.setData(this.getDataSnapshot(data));
        return this;
    }

    getData() {
        return this.data;
    }

    toString() {
        return '[object Grid]';
    }
}

extend(Grid.prototype, [

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
    InitData,
    InitHeader,
    InitOptions,
    InitResize,
    InitRows,

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
