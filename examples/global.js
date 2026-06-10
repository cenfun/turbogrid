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
        id: 'index',
        name: 'Getting Started',
        selectable: true,
        nameClassMap: 'tg-row-top'
    }, {
        id: 'api',
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

export const init = function() {
    initFavicon();
    initThemes();
    initLogs();
    initDataSelect();

    initSource();
};
