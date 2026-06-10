import { Grid, VERSION } from '../src/index.js';
import Prism from 'prismjs';
import { shallowReactive } from 'vue';

export const state = shallowReactive({
    version: VERSION,
    theme: '',
    themeOptions: [],
    flyoverVisible: false
});

const formatCode = function(code) {

    let html = code.innerHTML;
    if (!html) {
        return;
    }

    html = html.replace(/^\n/g, '');
    html = html.replace(/\n$/g, '');

    const p = html.match(/^\s+/);
    if (p && p[0]) {
        const len = p[0].length;
        const list = [];
        html.split(/\n/g).forEach(function(str) {
            list.push(str.substr(len));
        });
        html = list.join('\n');
    }

    let language = 'javascript';

    if (code.className) {
        const lang = code.className.split('-')[1].trim();
        if (lang !== 'js') {
            language = lang;
        }

    } else {
        code.className = 'language-js';
    }

    code.innerHTML = Prism.highlight(html, Prism.languages[language], language);

};

const formatList = function(list) {
    if (!list.length) {
        return;
    }
    const item = list.shift();
    for (let i = 0, l = item.length; i < l; i++) {
        const code = item[i];
        formatCode(code);
    }
    setTimeout(function() {
        formatList(list);
    }, 10);
};

export const formatCodes = function() {
    const codes = document.querySelectorAll('code');
    if (!codes) {
        return;
    }

    const list = [];
    let item = [];

    for (let i = 0, l = codes.length; i < l; i++) {
        const code = codes[i];
        if (item.length < 10) {
            item.push(code);
            continue;
        }
        list.push(item);
        item = [];
        item.push(code);
    }
    list.push(item);
    formatList(list);
};

export const getHash = function(key) {
    let hash = {};
    const h = window.location.hash.slice(1);
    if (h) {
        const usp = new URLSearchParams(h);
        hash = Object.fromEntries(usp);
    }
    if (key) {
        return hash[key];
    }
    return hash;
};

const updateHash = function(hash) {
    const usp = new URLSearchParams(hash);
    const hashStr = usp.toString();
    window.location.hash = hashStr;

    if (window.parent === window) {
        return;
    }

    window.parent.postMessage({
        type: 'hash',
        data: hashStr
    }, '*');

};

export const setHash = function(key, value) {
    if (!key) {
        return;
    }
    const hash = getHash();
    if (hash[key] === value) {
        return;
    }
    hash[key] = value;
    updateHash(hash);
};

export const delHash = function(key) {
    if (!key) {
        return;
    }
    const hash = getHash();
    delete hash[key];
    updateHash(hash);
};

export const getNum = function(str) {
    str = String(str).trim();
    let n = parseInt(str);
    if (str.endsWith('k')) {
        n *= 1000;
    } else if (str.endsWith('m')) {
        n *= 1000000;
    }
    return n;
};

const initThemes = function() {

    const $theme = document.querySelector('.st-theme');
    if (!$theme) {
        return;
    }

    $theme.title = 'theme';

    const hash = getHash();
    const allThemes = Grid.getAllThemes();
    allThemes.forEach((theme) => {
        const $option = document.createElement('option');
        $option.setAttribute('value', theme);
        if (hash.theme === theme) {
            $option.setAttribute('selected', 'selected');
        }
        $option.innerText = theme;
        $theme.appendChild($option);
    });

    $theme.addEventListener('change', function() {
        if (this.value === 'default') {
            delHash('theme');
            return;
        }
        setHash('theme', this.value);
    });
};

export const showPage = (content) => {
    const html = `
        <html>
        <head>
            <link href="assets/prism.css" rel="stylesheet" />
            <script src="assets/prism.js" data-manual></script>
            <link href="assets/main.css" rel="stylesheet" />
            <script src="assets/main.js"></script>
            <style>
            body {
                padding: 10px 10px;
            }
            pre {
                border: none;
                max-width: none;
                border-radius: unset;
                overflow-x: unset;
            }
            </style>
        </head>
        <body>
            ${content}
            <script>
                formatCodes();
            </script>
        </body>
        </html>
        `;

    const win = window.open('', '_blank');
    win.document.open();
    win.document.write(html);
    win.document.close();
};

const showJson = (res) => {
    console.log(res);
    if (!res) {
        return;
    }
    const json = JSON.stringify(res, null, 4);

    const content = `
            <h3>JSON</h3>
            <pre><code class="language-js">${json}</code></pre>
        `;

    showPage(content);

};

const initButtons = function(grid) {

    const getArgs = function(params) {
        let args = [];
        if (params) {
            if (window[params]) {
                args = [window[params]];
            } else {
                args = JSON.parse(`[${params}]`);
            }
        }
        return args;
    };

    const buttons = document.querySelectorAll('button');
    Array.from(buttons).forEach((button) => {
        button.addEventListener('click', function(e) {
            const str = `${this.innerText}`.trim();
            const arr = str.split('(');
            if (arr.length < 2) {
                return;
            }
            const cmd = arr[0];
            const fun = grid[cmd];
            if (typeof fun !== 'function') {
                return;
            }

            const params = arr[1].split(')')[0];
            // console.log(params);
            const args = getArgs(params);

            const res = fun.apply(grid, args);
            if (cmd === 'exportData') {
                showJson(res);
                return;
            }

            if (cmd.startsWith('get')) {
                console.log(res);
                return;
            }
            if (cmd === 'destroy') {
                console.log(grid);
            }

        });
    });
};

export const initCommonEvents = function(grid) {
    // console.log(grid);
    initButtons(grid);
};


let index = 1;
const appendLogSync = function(type, d) {
    console.log(index, type, d);

    const log = document.createElement('div');
    log.innerHTML = `${index++}, ${type}`;

    const detail = document.createElement('span');
    log.appendChild(detail);
    if (typeof d === 'object') {
        const keys = Object.keys(d);
        const list = [];
        keys.forEach(function(key) {
            list.push(`${key}:${d[key]}`);
        });
        detail.innerHTML = ` : {${list.join(', ')}}`;
    } else {
        detail.innerHTML = ` : ${d}`;
    }

    const content = document.querySelector('.log-content');
    content.insertBefore(log, content.firstChild);

};

export const appendLog = function(type, d) {
    setTimeout(function() {
        appendLogSync(type, d);
    }, 100);
};


const showSource = () => {
    const listJs = Array.from(document.querySelectorAll('script'));
    const listCss = Array.from(document.querySelectorAll('style'));

    const list = [];

    const js = listJs.map(function(elem) {
        const src = elem.getAttribute('src');
        if (src) {
            const ignore = ['livereload.js', 'prism.js'].find((it) => src.indexOf(it) !== -1);
            if (ignore) {
                return '';
            }
            return `<pre><code class="language-js">//${src}</code></pre>`;
        }

        return `<pre><code class="language-js">${elem.innerHTML}</code></pre>`;

    }).join('');

    if (js) {
        list.push('<h3>JS</h3>');
        list.push(js);
    }

    const css = listCss.map(function(elem) {
        if (elem.getAttribute('context')) {
            return '';
        }
        return `<pre><code class="language-css">${elem.innerHTML}</code></pre>`;
    }).join('');

    if (css) {
        list.push('<h3>CSS</h3>');
        list.push(css);
    }

    const content = list.join('');
    showPage(content);
};

export const getGridRows = function() {
    return [{
        id: 'api-doc',
        name: 'API reference',
        selectable: true,
        nameClassMap: 'tg-row-top'
    }, {
        name: 'Popular Demo',
        subs: [{
            id: 'formatter',
            name: 'Formatter'
        }, {
            id: 'style',
            name: 'Style'
        }, {
            id: 'tooltip',
            name: 'Tooltip'
        }, {
            id: 'popover',
            name: 'Popover'
        }, {
            id: 'scroll',
            name: 'Scroll'
        }, {
            id: 'scrollbar',
            name: 'Scrollbar'
        }, {
            id: 'sort',
            name: 'Sort'
        }, {
            id: 'events',
            name: 'Events'
        }, {
            id: 'lifecycle',
            name: 'Lifecycle'
        }, {
            id: 'performance-test',
            name: 'Performance Test'
        }]
    }, {
        name: 'Row',
        subs: [{
            id: 'row-add-delete',
            name: 'Row Add/Delete'
        }, {
            id: 'row-collapse',
            name: 'Row Collapse'
        }, {
            id: 'row-filter',
            name: 'Row Filter'
        }, {
            id: 'row-select',
            name: 'Row Select'
        }, {
            id: 'row-select-limit',
            name: 'Row Select Limit'
        }, {
            id: 'row-select-group',
            name: 'Row Select Group'
        }, {
            id: 'row-number',
            name: 'Row Number'
        }, {
            id: 'row-drag',
            name: 'Row Drag'
        }, {
            id: 'row-move',
            name: 'Row Move'
        }, {
            id: 'row-hover',
            name: 'Row Hover'
        }, {
            id: 'row-height',
            name: 'Row Height'
        }, {
            id: 'row-not-found',
            name: 'Row Not Found'
        }]
    }, {
        name: 'Column',
        subs: [{
            id: 'column-add-delete',
            name: 'Column Add/Delete'
        }, {
            id: 'column-display',
            name: 'Column Display'
        }, {
            id: 'column-set',
            name: 'Column Set'
        }]
    }, {
        name: 'Header',
        subs: [{
            id: 'header-display',
            name: 'Header Display'
        }, {
            id: 'header-group',
            name: 'Header Group'
        }]
    }, {
        name: 'Data',
        subs: [{
            id: 'infinite-scroll',
            name: 'Infinite Scroll'
        }, {
            id: 'load-cells',
            name: 'Load Cells'
        }, {
            id: 'load-rows',
            name: 'Load Rows'
        }, {
            id: 'load-subs',
            name: 'Load Subs'
        }, {
            id: 'set-rows',
            name: 'Set Rows'
        }, {
            id: 'skeleton-screen',
            name: 'Skeleton Screen'
        }, {
            id: 'pagination',
            name: 'Pagination'
        }, {
            id: 'loading',
            name: 'Loading'
        }, {
            id: 'export',
            name: 'Export'
        }]
    }, {
        name: 'Integration',
        subs: [{
            id: 'vue-editor',
            name: 'Vue Editor'
        }, {
            id: 'vue-component',
            name: 'Vue Component'
        }, {
            id: 'vue-integration',
            name: 'Vue Integration'
        }, {
            id: 'custom-element',
            name: 'Custom Element'
        }]
    }, {
        name: 'Frozen',
        subs: [{
            id: 'frozen',
            name: 'Frozen'
        }, {
            id: 'frozen-middle',
            name: 'Frozen Middle'
        }]
    }, {
        name: 'Other',
        subs: [{
            id: 'touch',
            name: 'Touch'
        }, {
            id: 'resize',
            name: 'Resize'
        }, {
            id: 'cache',
            name: 'Cache'
        }, {
            id: 'auto-height',
            name: 'Auto Height'
        }, {
            id: 'negative-number',
            name: 'Negative Number'
        }, {
            id: 'multiple-instance',
            name: 'Multiple Instance'
        }, {
            id: 'context-menu',
            name: 'Context Menu'
        }, {
            id: 'online-render',
            name: 'Online Render'
        }, {
            id: 'comfyui',
            name: 'ComfyUI'
        }, {
            id: 'poc',
            name: 'POC'
        }, {
            id: 'conflict',
            name: 'Conflict Test'
        }, {
            id: 'snake-game',
            name: 'Snake Game'
        }, {
            id: 'async',
            name: 'Async Test'
        }, {
            id: 'other',
            name: 'Other'
        }]
    }];
};

const initSource = function($header) {
    if (!document.querySelector('.grid-container')) {
        return;
    }

    $header.insertAdjacentHTML('beforeend', '<button class="bt-source">source</button>');
    const btSource = document.querySelector('.bt-source');
    btSource.title = 'Check demo source codes';
    btSource.addEventListener('click', function() {
        showSource();
    });

};

const initLogs = function() {
    const logClear = document.querySelector('.log-clear');
    if (logClear) {
        logClear.addEventListener('click', function() {
            document.querySelector('.log-content').innerHTML = '';
        });
    }
};

const initDataSelect = function() {
    const dataSelect = document.querySelector('.st-data');
    if (!dataSelect) {
        return;
    }
    dataSelect.addEventListener('change', function() {
        setHash('data', this.value);
    });

    const data = getHash('data');
    const item = Array.from(dataSelect.options).find((it) => it.value === data);
    if (item) {
        dataSelect.value = data;
    } else {
        delHash('data');
    }

};

const initFavicon = function() {
    const link = document.createElement('link');
    link.rel = 'shortcut icon';
    link.type = 'image/svg';
    link.href = 'assets/images/logo.svg';
    document.head.appendChild(link);
};

// Auto-generated from public/api.html
// Contains all API anchor items for search functionality
export const apiSearchItems = [
    {
        'name': 'turbogrid',
        'text': 'turbogrid',
        'type': 'turbogrid'
    },
    {
        'name': 'Grid',
        'text': 'Grid(container)',
        'type': 'turbogrid'
    },
    {
        'name': 'methods',
        'text': 'Methods',
        'type': 'methods'
    },
    {
        'name': 'setData',
        'text': 'setData(data)',
        'type': 'methods'
    },
    {
        'name': 'getData',
        'text': 'getData()',
        'type': 'methods'
    },
    {
        'name': 'setDataSnapshot',
        'text': 'setDataSnapshot(data)',
        'type': 'methods'
    },
    {
        'name': 'getItemSnapshot',
        'text': 'getItemSnapshot(item[, keysSettings])',
        'type': 'methods'
    },
    {
        'name': 'setOption',
        'text': 'setOption(options)',
        'type': 'methods'
    },
    {
        'name': 'getOption',
        'text': 'getOption([name])',
        'type': 'methods'
    },
    {
        'name': 'setFormatter',
        'text': 'setFormatter(formatters)',
        'type': 'methods'
    },
    {
        'name': 'getFormatter',
        'text': 'getFormatter(type)',
        'type': 'methods'
    },
    {
        'name': 'getDefaultFormatter',
        'text': 'getDefaultFormatter([type])',
        'type': 'methods'
    },
    {
        'name': 'bind',
        'text': 'bind(eventType, handler[, options])',
        'type': 'methods'
    },
    {
        'name': 'once',
        'text': 'once(eventType, handler)',
        'type': 'methods'
    },
    {
        'name': 'unbind',
        'text': 'unbind([eventType][, handler][, options])',
        'type': 'methods'
    },
    {
        'name': 'trigger',
        'text': 'trigger(eventType, eventData)',
        'type': 'methods'
    },
    {
        'name': 'getAllEvents',
        'text': 'getAllEvents()',
        'type': 'methods'
    },
    {
        'name': 'render',
        'text': 'render()',
        'type': 'methods'
    },
    {
        'name': 'rerender',
        'text': 'rerender()',
        'type': 'methods'
    },
    {
        'name': 'resize',
        'text': 'resize([w, [h]])',
        'type': 'methods'
    },
    {
        'name': 'destroy',
        'text': 'destroy()',
        'type': 'methods'
    },
    {
        'name': 'getColumnItem',
        'text': 'getColumnItem(columnIndex)',
        'type': 'methods'
    },
    {
        'name': 'getColumnItemById',
        'text': 'getColumnItemById(id)',
        'type': 'methods'
    },
    {
        'name': 'getColumnItemBy',
        'text': 'getColumnItemBy(key, value)',
        'type': 'methods'
    },
    {
        'name': 'getRowItem',
        'text': 'getRowItem(rowIndex)',
        'type': 'methods'
    },
    {
        'name': 'getRowItemById',
        'text': 'getRowItemById(id)',
        'type': 'methods'
    },
    {
        'name': 'getRowItemBy',
        'text': 'getRowItemBy(key, value)',
        'type': 'methods'
    },
    {
        'name': 'showLoading',
        'text': 'showLoading()',
        'type': 'methods'
    },
    {
        'name': 'hideLoading',
        'text': 'hideLoading()',
        'type': 'methods'
    },
    {
        'name': 'setLoading',
        'text': 'setLoading(loading)',
        'type': 'methods'
    },
    {
        'name': 'showMask',
        'text': 'showMask([styleMap])',
        'type': 'methods'
    },
    {
        'name': 'hideMask',
        'text': 'hideMask()',
        'type': 'methods'
    },
    {
        'name': 'expandAllRows',
        'text': 'expandAllRows()',
        'type': 'methods'
    },
    {
        'name': 'collapseAllRows',
        'text': 'collapseAllRows()',
        'type': 'methods'
    },
    {
        'name': 'toggleAllRows',
        'text': 'toggleAllRows()',
        'type': 'methods'
    },
    {
        'name': 'expandRow',
        'text': 'expandRow(rowIndex)',
        'type': 'methods'
    },
    {
        'name': 'collapseRow',
        'text': 'collapseRow(rowIndex)',
        'type': 'methods'
    },
    {
        'name': 'toggleRow',
        'text': 'toggleRow(rowIndex)',
        'type': 'methods'
    },
    {
        'name': 'expandRowLevel',
        'text': 'expandRowLevel(level)',
        'type': 'methods'
    },
    {
        'name': 'exportData',
        'text': 'exportData([keysSettings])',
        'type': 'methods'
    },
    {
        'name': 'setRowSubs',
        'text': 'setRowSubs(rowIndex, subs)',
        'type': 'methods'
    },
    {
        'name': 'setColumns',
        'text': 'setColumns(columnList)',
        'type': 'methods'
    },
    {
        'name': 'setRows',
        'text': 'setRows(rowList)',
        'type': 'methods'
    },
    {
        'name': 'getRows',
        'text': 'getRows()',
        'type': 'methods'
    },
    {
        'name': 'getColumns',
        'text': 'getColumns()',
        'type': 'methods'
    },
    {
        'name': 'getViewRows',
        'text': 'getViewRows()',
        'type': 'methods'
    },
    {
        'name': 'getViewColumns',
        'text': 'getViewColumns([all])',
        'type': 'methods'
    },
    {
        'name': 'getViewRowItem',
        'text': 'getViewRowItem(viewRowIndex)',
        'type': 'methods'
    },
    {
        'name': 'getViewColumnItem',
        'text': 'getViewColumnItem(viewColumnIndex)',
        'type': 'methods'
    },
    {
        'name': 'addRow',
        'text': 'addRow(rowInfo[, parent, position, scrollTo = true])',
        'type': 'methods'
    },
    {
        'name': 'deleteRow',
        'text': 'deleteRow(rowIndex)',
        'type': 'methods'
    },
    {
        'name': 'moveRowsToTop',
        'text': 'moveRowsToTop(rowList)',
        'type': 'methods'
    },
    {
        'name': 'moveRowsUp',
        'text': 'moveRowsUp(rowList)',
        'type': 'methods'
    },
    {
        'name': 'moveRowsDown',
        'text': 'moveRowsDown(rowList)',
        'type': 'methods'
    },
    {
        'name': 'moveRowsToBottom',
        'text': 'moveRowsToBottom(rowList)',
        'type': 'methods'
    },
    {
        'name': 'moveSelectedRowsToTop',
        'text': 'moveSelectedRowsToTop()',
        'type': 'methods'
    },
    {
        'name': 'moveSelectedRowsUp',
        'text': 'moveSelectedRowsUp()',
        'type': 'methods'
    },
    {
        'name': 'moveSelectedRowsDown',
        'text': 'moveSelectedRowsDown()',
        'type': 'methods'
    },
    {
        'name': 'moveSelectedRowsToBottom',
        'text': 'moveSelectedRowsToBottom()',
        'type': 'methods'
    },
    {
        'name': 'moveRows',
        'text': 'moveRows(rowList, offset)',
        'type': 'methods'
    },
    {
        'name': 'selectAll',
        'text': 'selectAll([selected = true])',
        'type': 'methods'
    },
    {
        'name': 'setRowSelected',
        'text': 'setRowSelected(rowInfo[, settings])',
        'type': 'methods'
    },
    {
        'name': 'getSelectedRow',
        'text': 'getSelectedRow()',
        'type': 'methods'
    },
    {
        'name': 'getSelectedRows',
        'text': 'getSelectedRows()',
        'type': 'methods'
    },
    {
        'name': 'setRowHover',
        'text': 'setRowHover(rowIndex, hover)',
        'type': 'methods'
    },
    {
        'name': 'setRowState',
        'text': 'setRowState(rowIndex, state, value = true)',
        'type': 'methods'
    },
    {
        'name': 'setSortColumn',
        'text': 'setSortColumn(sortColumn)',
        'type': 'methods'
    },
    {
        'name': 'removeSortColumn',
        'text': 'removeSortColumn()',
        'type': 'methods'
    },
    {
        'name': 'setColumnWidth',
        'text': 'setColumnWidth(columnIndex, width)',
        'type': 'methods'
    },
    {
        'name': 'showColumn',
        'text': 'showColumn(columnIndex)',
        'type': 'methods'
    },
    {
        'name': 'hideColumn',
        'text': 'hideColumn(columnIndex)',
        'type': 'methods'
    },
    {
        'name': 'addColumn',
        'text': 'addColumn(columnInfo[, parent, position, scrollTo = true])',
        'type': 'methods'
    },
    {
        'name': 'deleteColumn',
        'text': 'deleteColumn(columnIndex)',
        'type': 'methods'
    },
    {
        'name': 'scrollToRow',
        'text': 'scrollToRow(rowIndex)',
        'type': 'methods'
    },
    {
        'name': 'scrollToFirstRow',
        'text': 'scrollToFirstRow()',
        'type': 'methods'
    },
    {
        'name': 'scrollToLastRow',
        'text': 'scrollToLastRow()',
        'type': 'methods'
    },
    {
        'name': 'scrollToColumn',
        'text': 'scrollToColumn(columnIndex)',
        'type': 'methods'
    },
    {
        'name': 'scrollToFirstColumn',
        'text': 'scrollToFirstColumn()',
        'type': 'methods'
    },
    {
        'name': 'scrollToLastColumn',
        'text': 'scrollToLastColumn(end)',
        'type': 'methods'
    },
    {
        'name': 'scrollToCell',
        'text': 'scrollToCell(rowIndex, columnIndex)',
        'type': 'methods'
    },
    {
        'name': 'scrollRowIntoView',
        'text': 'scrollRowIntoView(rowIndex)',
        'type': 'methods'
    },
    {
        'name': 'scrollColumnIntoView',
        'text': 'scrollColumnIntoView(columnIndex)',
        'type': 'methods'
    },
    {
        'name': 'scrollCellIntoView',
        'text': 'scrollCellIntoView(rowIndex, columnIndex)',
        'type': 'methods'
    },
    {
        'name': 'setScrollTop',
        'text': 'setScrollTop(top)',
        'type': 'methods'
    },
    {
        'name': 'setScrollLeft',
        'text': 'setScrollLeft(left)',
        'type': 'methods'
    },
    {
        'name': 'getScrollTop',
        'text': 'getScrollTop()',
        'type': 'methods'
    },
    {
        'name': 'getScrollLeft',
        'text': 'getScrollLeft()',
        'type': 'methods'
    },
    {
        'name': 'updateRow',
        'text': 'updateRow(rowIndex[, rowData])',
        'type': 'methods'
    },
    {
        'name': 'updateCell',
        'text': 'updateCell(rowIndex, columnIndex[, cellValue])',
        'type': 'methods'
    },
    {
        'name': 'update',
        'text': 'update()',
        'type': 'methods'
    },
    {
        'name': 'flushBody',
        'text': 'flushBody()',
        'type': 'methods'
    },
    {
        'name': 'flushSort',
        'text': 'flushSort()',
        'type': 'methods'
    },
    {
        'name': 'flushRow',
        'text': 'flushRow(viewRowIndex)',
        'type': 'methods'
    },
    {
        'name': 'flushRowFrom',
        'text': 'flushRowFrom(viewRowIndex)',
        'type': 'methods'
    },
    {
        'name': 'flushColumn',
        'text': 'flushColumn(viewColumnIndex)',
        'type': 'methods'
    },
    {
        'name': 'flushColumnFrom',
        'text': 'flushColumnFrom(viewColumnIndex)',
        'type': 'methods'
    },
    {
        'name': 'flushCell',
        'text': 'flushCell(viewRowIndex, viewColumnIndex)',
        'type': 'methods'
    },
    {
        'name': 'getScrollbarWidth',
        'text': 'getScrollbarWidth()',
        'type': 'methods'
    },
    {
        'name': 'getScrollbarHeight',
        'text': 'getScrollbarHeight()',
        'type': 'methods'
    },
    {
        'name': 'getScrollViewWidth',
        'text': 'getScrollViewWidth()',
        'type': 'methods'
    },
    {
        'name': 'getScrollViewHeight',
        'text': 'getScrollViewHeight()',
        'type': 'methods'
    },
    {
        'name': 'getScrollPaneWidth',
        'text': 'getScrollPaneWidth()',
        'type': 'methods'
    },
    {
        'name': 'getScrollPaneHeight',
        'text': 'getScrollPaneHeight()',
        'type': 'methods'
    },
    {
        'name': 'getColumnsLength',
        'text': 'getColumnsLength(total)',
        'type': 'methods'
    },
    {
        'name': 'getRowsLength',
        'text': 'getRowsLength(total)',
        'type': 'methods'
    },
    {
        'name': 'getRowsHeight',
        'text': 'getRowsHeight()',
        'type': 'methods'
    },
    {
        'name': 'getRowHeight',
        'text': 'getRowHeight(rowIndex)',
        'type': 'methods'
    },
    {
        'name': 'getViewport',
        'text': 'getViewport()',
        'type': 'methods'
    },
    {
        'name': 'find',
        'text': 'find(selector[, container])',
        'type': 'methods'
    },
    {
        'name': 'getRowNodes',
        'text': 'getRowNodes(rowIndex)',
        'type': 'methods'
    },
    {
        'name': 'getCellNode',
        'text': 'getCellNode(rowIndex, columnIndex)',
        'type': 'methods'
    },
    {
        'name': 'getCellValue',
        'text': 'getCellValue(rowItem, columnItem)',
        'type': 'methods'
    },
    {
        'name': 'getHeaderItemNode',
        'text': 'getHeaderItemNode(columnIndex)',
        'type': 'methods'
    },
    {
        'name': 'getColumnHeaderNode',
        'text': 'getColumnHeaderNode(columnIndex)',
        'type': 'methods'
    },
    {
        'name': 'forEachColumn',
        'text': 'forEachColumn(callback)',
        'type': 'methods'
    },
    {
        'name': 'forEachRow',
        'text': 'forEachRow(callback)',
        'type': 'methods'
    },
    {
        'name': 'isRowSelectable',
        'text': 'isRowSelectable(rowItem)',
        'type': 'methods'
    },
    {
        'name': 'isRowLeaf',
        'text': 'isRowLeaf(rowItem)',
        'type': 'methods'
    },
    {
        'name': 'highlightKeywordsFilter',
        'text': 'highlightKeywordsFilter(rowItem, columns, keywords)',
        'type': 'methods'
    },
    {
        'name': 'onNextUpdated',
        'text': 'onNextUpdated(handler)',
        'type': 'methods'
    },
    {
        'name': 'data',
        'text': 'Data',
        'type': 'data'
    },
    {
        'name': 'data.columns',
        'text': 'columns',
        'type': 'data'
    },
    {
        'name': 'data.rows',
        'text': 'rows',
        'type': 'data'
    },
    {
        'name': 'data.options',
        'text': 'options',
        'type': 'data'
    },
    {
        'name': 'data.rowsLength',
        'text': 'rowsLength',
        'type': 'data'
    },
    {
        'name': 'options',
        'text': 'Options',
        'type': 'options'
    },
    {
        'name': 'options.className',
        'text': 'className = "tg-turbogrid"',
        'type': 'options'
    },
    {
        'name': 'options.theme',
        'text': 'theme = "[theme-name]"',
        'type': 'options'
    },
    {
        'name': 'options.rowHeight',
        'text': 'rowHeight = 32',
        'type': 'options'
    },
    {
        'name': 'options.rowCacheLength',
        'text': 'rowCacheLength = 0',
        'type': 'options'
    },
    {
        'name': 'options.columnCacheLength',
        'text': 'columnCacheLength = 0',
        'type': 'options'
    },
    {
        'name': 'options.autoHeight',
        'text': 'autoHeight = false',
        'type': 'options'
    },
    {
        'name': 'options.autoColumnWidth',
        'text': 'autoColumnWidth = false',
        'type': 'options'
    },
    {
        'name': 'options.headerVisible',
        'text': 'headerVisible = true',
        'type': 'options'
    },
    {
        'name': 'options.collapseAllVisible',
        'text': 'collapseAllVisible = true',
        'type': 'options'
    },
    {
        'name': 'options.collapseAllOnInit',
        'text': 'collapseAllOnInit = null',
        'type': 'options'
    },
    {
        'name': 'options.selectVisible',
        'text': 'selectVisible = false',
        'type': 'options'
    },
    {
        'name': 'options.selectAllVisible',
        'text': 'selectAllVisible = true',
        'type': 'options'
    },
    {
        'name': 'options.selectAllOnInit',
        'text': 'selectAllOnInit = null',
        'type': 'options'
    },
    {
        'name': 'options.selectMultiple',
        'text': 'selectMultiple = true',
        'type': 'options'
    },
    {
        'name': 'options.rowNumberVisible',
        'text': 'rowNumberVisible = false',
        'type': 'options'
    },
    {
        'name': 'options.rowNotFound',
        'text': "rowNotFound = ''",
        'type': 'options'
    },
    {
        'name': 'options.rowDragCrossLevel',
        'text': 'rowDragCrossLevel = true',
        'type': 'options'
    },
    {
        'name': 'options.rowMoveCrossLevel',
        'text': 'rowMoveCrossLevel = true',
        'type': 'options'
    },
    {
        'name': 'options.sortField',
        'text': 'sortField = ""',
        'type': 'options'
    },
    {
        'name': 'options.sortAsc',
        'text': 'sortAsc = true',
        'type': 'options'
    },
    {
        'name': 'options.sortBlankValueBottom',
        'text': 'sortBlankValueBottom = true',
        'type': 'options'
    },
    {
        'name': 'options.sortOnInit',
        'text': 'sortOnInit = false',
        'type': 'options'
    },
    {
        'name': 'options.sortIndicator',
        'text': 'sortIndicator = "h"',
        'type': 'options'
    },
    {
        'name': 'options.sortComparers',
        'text': 'sortComparers = {defaultSortComparers}',
        'type': 'options'
    },
    {
        'name': 'options.rowFilter',
        'text': 'rowFilter',
        'type': 'options'
    },
    {
        'name': 'options.rowFilteredSort',
        'text': 'rowFilteredSort = null',
        'type': 'options'
    },
    {
        'name': 'options.columnTypes',
        'text': 'columnTypes = {...}',
        'type': 'options'
    },
    {
        'name': 'options.rowProps',
        'text': 'rowProps = ',
        'type': 'options'
    },
    {
        'name': 'options.columnProps',
        'text': 'columnProps = ',
        'type': 'options'
    },
    {
        'name': 'options.frozenColumn',
        'text': 'frozenColumn = -1',
        'type': 'options'
    },
    {
        'name': 'options.frozenRow',
        'text': 'frozenRow = -1',
        'type': 'options'
    },
    {
        'name': 'options.frozenBottom',
        'text': 'frozenBottom = false',
        'type': 'options'
    },
    {
        'name': 'options.frozenRight',
        'text': 'frozenRight = false',
        'type': 'options'
    },
    {
        'name': 'options.frozenColumnMax',
        'text': 'frozenColumnMax = 10',
        'type': 'options'
    },
    {
        'name': 'options.frozenRowMax',
        'text': 'frozenRowMax = 10',
        'type': 'options'
    },
    {
        'name': 'options.frozenRowHoverable',
        'text': 'frozenRowHoverable = false',
        'type': 'options'
    },
    {
        'name': 'options.scrollbarSize',
        'text': 'scrollbarSize = 12',
        'type': 'options'
    },
    {
        'name': 'options.scrollbarSizeH',
        'text': 'scrollbarSizeH = null',
        'type': 'options'
    },
    {
        'name': 'options.scrollbarSizeV',
        'text': 'scrollbarSizeV = null',
        'type': 'options'
    },
    {
        'name': 'options.scrollbarRound',
        'text': 'scrollbarRound = false',
        'type': 'options'
    },
    {
        'name': 'options.scrollbarFade',
        'text': 'scrollbarFade = false',
        'type': 'options'
    },
    {
        'name': 'options.scrollbarFadeTimeout',
        'text': 'scrollbarFadeTimeout = 1000',
        'type': 'options'
    },
    {
        'name': 'options.scrollbarType',
        'text': 'scrollbarType = "auto"',
        'type': 'options'
    },
    {
        'name': 'options.scrollPaneMinWidth',
        'text': 'scrollPaneMinWidth = 30',
        'type': 'options'
    },
    {
        'name': 'options.scrollPaneGradient',
        'text': 'scrollPaneGradient = false',
        'type': 'options'
    },
    {
        'name': 'options.rowDragVisible',
        'text': 'rowDragVisible = false',
        'type': 'options'
    },
    {
        'name': 'options.rowDragColumn',
        'text': 'rowDragColumn = {...}',
        'type': 'options'
    },
    {
        'name': 'options.rowNumberWidth',
        'text': 'rowNumberWidth = 36',
        'type': 'options'
    },
    {
        'name': 'options.rowNumberFilter',
        'text': 'rowNumberFilter = null',
        'type': 'options'
    },
    {
        'name': 'options.rowNumberColumn',
        'text': 'rowNumberColumn = {...}',
        'type': 'options'
    },
    {
        'name': 'options.selectColumn',
        'text': 'selectColumn = {...}',
        'type': 'options'
    },
    {
        'name': 'options.blankColumn',
        'text': 'blankColumn = {...}',
        'type': 'options'
    },
    {
        'name': 'options.highlightKeywords',
        'text': 'highlightKeywords = {...}',
        'type': 'options'
    },
    {
        'name': 'options.highlightKeywords.textKey',
        'text': 'textKey = "tg_text_"',
        'type': 'options'
    },
    {
        'name': 'options.highlightKeywords.textGenerator',
        'text': 'textGenerator = null',
        'type': 'options'
    },
    {
        'name': 'options.highlightKeywords.highlightKey',
        'text': 'highlightKey = "tg_highlight_"',
        'type': 'options'
    },
    {
        'name': 'options.highlightKeywords.highlightPre',
        'text': 'highlightPre = "&lt;mark&gt;"',
        'type': 'options'
    },
    {
        'name': 'options.highlightKeywords.highlightPost',
        'text': 'highlightPost = "&lt;/mark&gt;"',
        'type': 'options'
    },
    {
        'name': 'options.textSelectable',
        'text': 'textSelectable = false',
        'type': 'options'
    },
    {
        'name': 'options.bindWindowResize',
        'text': 'bindWindowResize = false',
        'type': 'options'
    },
    {
        'name': 'options.bindContainerResize',
        'text': 'bindContainerResize = false',
        'type': 'options'
    },
    {
        'name': 'options.cellResizeObserver',
        'text': 'cellResizeObserver = null',
        'type': 'options'
    },
    {
        'name': 'events',
        'text': 'Events',
        'type': 'events'
    },
    {
        'name': 'onUpdated',
        'text': 'onUpdated',
        'type': 'events'
    },
    {
        'name': 'onFirstUpdated',
        'text': 'onFirstUpdated',
        'type': 'events'
    },
    {
        'name': 'onHeaderUpdated',
        'text': 'onHeaderUpdated',
        'type': 'events'
    },
    {
        'name': 'onSort',
        'text': 'onSort',
        'type': 'events'
    },
    {
        'name': 'onColumnAdded',
        'text': 'onColumnAdded',
        'type': 'events'
    },
    {
        'name': 'onColumnRemoved',
        'text': 'onColumnRemoved',
        'type': 'events'
    },
    {
        'name': 'onColumnWidthChanged',
        'text': 'onColumnWidthChanged',
        'type': 'events'
    },
    {
        'name': 'onRowAdded',
        'text': 'onRowAdded',
        'type': 'events'
    },
    {
        'name': 'onRowRemoved',
        'text': 'onRowRemoved',
        'type': 'events'
    },
    {
        'name': 'onRowExpanded',
        'text': 'onRowExpanded',
        'type': 'events'
    },
    {
        'name': 'onRowCollapsed',
        'text': 'onRowCollapsed',
        'type': 'events'
    },
    {
        'name': 'onRowSubsRequest',
        'text': 'onRowSubsRequest',
        'type': 'events'
    },
    {
        'name': 'onRowDragged',
        'text': 'onRowDragged',
        'type': 'events'
    },
    {
        'name': 'onRowDropped',
        'text': 'onRowDropped',
        'type': 'events'
    },
    {
        'name': 'onRowMoved',
        'text': 'onRowMoved',
        'type': 'events'
    },
    {
        'name': 'onRowMouseEnter',
        'text': 'onRowMouseEnter',
        'type': 'events'
    },
    {
        'name': 'onRowMouseLeave',
        'text': 'onRowMouseLeave',
        'type': 'events'
    },
    {
        'name': 'onSelectChanged',
        'text': 'onSelectChanged',
        'type': 'events'
    },
    {
        'name': 'onCellUpdated',
        'text': 'onCellUpdated',
        'type': 'events'
    },
    {
        'name': 'onCellMouseEnter',
        'text': 'onCellMouseEnter',
        'type': 'events'
    },
    {
        'name': 'onCellMouseLeave',
        'text': 'onCellMouseLeave',
        'type': 'events'
    },
    {
        'name': 'onClick',
        'text': 'onClick',
        'type': 'events'
    },
    {
        'name': 'onDblClick',
        'text': 'onDblClick',
        'type': 'events'
    },
    {
        'name': 'onContextMenu',
        'text': 'onContextMenu',
        'type': 'events'
    },
    {
        'name': 'onMouseOver',
        'text': 'onMouseOver',
        'type': 'events'
    },
    {
        'name': 'onMouseOut',
        'text': 'onMouseOut',
        'type': 'events'
    },
    {
        'name': 'onTouchStart',
        'text': 'onTouchStart',
        'type': 'events'
    },
    {
        'name': 'onTouchMove',
        'text': 'onTouchMove',
        'type': 'events'
    },
    {
        'name': 'onTouchEnd',
        'text': 'onTouchEnd',
        'type': 'events'
    },
    {
        'name': 'onScroll',
        'text': 'onScroll',
        'type': 'events'
    },
    {
        'name': 'onScrollStateChanged',
        'text': 'onScrollStateChanged',
        'type': 'events'
    },
    {
        'name': 'onMouseWheel',
        'text': 'onMouseWheel',
        'type': 'events'
    },
    {
        'name': 'onResize',
        'text': 'onResize',
        'type': 'events'
    },
    {
        'name': 'onLayout',
        'text': 'onLayout',
        'type': 'events'
    },
    {
        'name': 'onKeyDown',
        'text': 'onKeyDown',
        'type': 'events'
    },
    {
        'name': 'onDestroy',
        'text': 'onDestroy',
        'type': 'events'
    },
    {
        'name': 'lifecycle',
        'text': 'Lifecycle',
        'type': 'lifecycle'
    },
    {
        'name': 'tg',
        'text': 'tg',
        'type': 'tg'
    }
];

export const init = function() {
    initFavicon();
    initThemes();
    initLogs();
    initDataSelect();

    initSource();
};

export const updateApiPage = function(route) {

    // const name = hash.replace('#', '');
    // if (!name) {
    //     return;
    // }
    // nextTick(() => {
    //     const el = document.querySelector(`.api-container a[name="${name}"]`);
    //     if (el) {
    //         el.scrollIntoView();
    //         el.classList.add('selected');
    //         setTimeout(() => {
    //             el.classList.remove('selected');
    //         }, 2000);
    //     }
    // });

};

export const initApiPage = function(route) {


};
