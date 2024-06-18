import CONST from '../core/const.js';

import defaultRowProps from './default-row-props.js';
import defaultColumnProps from './default-column-props.js';
import defaultSortComparers from './default-sort-comparers.js';

export default function() {
    return {

        className: CONST.NS,

        theme: CONST.ID,

        headerVisible: true,

        // ==========================================================
        // row

        rowHeight: 32,

        // null or function (return true: visible or false: invisible)
        rowFilter: null,
        // sort options after rowFilter if no sortColumn set by user (for fuzzy search)
        // String: sortField or column id
        // Object: sort options or column item
        // Function: return null, String or Object
        rowFilteredSort: null,

        // handler for row not found
        rowNotFound: '',

        // boolean
        rowMoveCrossLevel: true,

        rowCacheLength: 0,
        rowProps: defaultRowProps,

        // ==========================================================
        // column

        columnTypes: {
            // type : props
            tree: {
                type: 'tree',
                formatter: 'tree',
                width: 230,
                minWidth: 120,
                maxWidth: 810
            },
            number: {
                type: 'number',
                align: 'right'
            },
            date: {
                type: 'date',
                align: 'right'
            },
            // id : type
            name: 'tree'
        },

        columnCacheLength: 0,
        columnProps: defaultColumnProps,

        // ==========================================================
        // collapse all only for row

        // true/false/null
        collapseAllOnInit: null,
        // true/false
        collapseAllVisible: true,

        // ==========================================================
        // select

        // true: select all, false: unselect all, or do nothing
        selectAllOnInit: null,

        selectVisible: false,
        selectAllVisible: true,

        // true: checkbox, false: radio
        selectMultiple: true,

        selectColumn: {
            private: true,
            id: 'tg-column-select',
            name: '',
            formatter: 'select',
            headerClassMap: 'tg-header-select',
            classMap: 'tg-cell-select',
            // padding 5px * 2
            // icon width 18px
            // border left/right 2px (when zoom out no cut)
            width: 36,
            align: 'center',
            resizable: false,
            sortable: false,
            exportable: false
        },

        // ==========================================================

        // boolean or function
        rowDragCrossLevel: true,

        rowDragVisible: false,

        // rowDragRight: false,

        rowDragColumn: {
            private: true,
            id: 'tg-column-row-drag',
            name: '',
            formatter: 'rowDrag',
            headerClassMap: 'tg-header-row-drag',
            classMap: 'tg-cell-row-drag',
            align: 'center',
            width: 36,
            resizable: false,
            sortable: false,
            exportable: false
        },

        // ==========================================================

        rowNumberWidth: 36,

        rowNumberFilter: null,
        rowNumberVisible: false,

        rowNumberColumn: {
            private: true,
            id: 'tg-column-row-number',
            name: '',
            formatter: 'rowNumber',
            headerClassMap: 'tg-header-row-number',
            classMap: 'tg-cell-row-number',
            align: 'center',
            maxWidth: 100,
            // resizable: false,
            sortable: false,
            exportable: false
        },

        // ==========================================================
        // blank
        blankColumn: {
            private: true,
            id: 'tg-column-blank',
            name: '',
            formatter: 'blank',
            headerClassMap: 'tg-header-blank',
            classMap: 'tg-cell-blank',
            width: 0,
            minWidth: 0,
            maxWidth: 1024 * 4,
            resizable: false,
            sortable: false,
            exportable: false
        },

        // ==========================================================
        // sort

        // single field, or a list for multiple compare
        sortField: '',
        sortAsc: true,

        // Configuration for Sort Blank Value Logic
        // true: Rows with blank values should always be at the bottom of the grid
        // false: Rows with blank values sort at the bottom for Descending Sort and at the Top for Ascending Sort
        sortBlankValueBottom: true,

        // customize own sort comparers, default comparers
        sortComparers: defaultSortComparers,

        sortOnInit: false,

        // h or v style
        sortIndicator: 'h',

        // ==========================================================
        highlightKeywords: {
            textKey: 'tg_text_',
            textGenerator: null,
            highlightKey: 'tg_highlight_',
            highlightPre: '<mark>',
            highlightPost: '</mark>'
        },

        // ==========================================================
        // frozen
        frozenRow: -1,
        frozenRowMax: 10,
        frozenRowHoverable: false,
        frozenBottom: false,

        frozenColumn: -1,
        frozenColumnMax: 10,
        frozenRight: false,

        // ==========================================================
        // scrollbar

        scrollbarSize: 12,
        scrollbarSizeH: null,
        scrollbarSizeV: null,

        scrollbarRound: false,

        scrollbarFade: false,
        scrollbarFadeTimeout: 1000,

        // auto, touch, classic
        scrollbarType: 'auto',

        // ==========================================================
        // scroll pane

        // min width and will be auto hide, two scrollbarSize
        scrollPaneMinWidth: 30,

        // depends scrollbarFade true
        scrollPaneGradient: 30,

        // ==========================================================
        // other

        autoHeight: false,

        // user can select text in grid
        textSelectable: false,

        // ==========================================================
        // auto resize when window resize
        bindWindowResize: false,

        // auto resize when container resize with ResizeObserver
        bindContainerResize: false,

        // cell resize observer
        cellResizeObserver: null
    };
}
