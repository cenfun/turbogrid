import { VERSION } from '../src/index.js';
import Prism from 'prismjs';
import { shallowReactive } from 'vue';
import exampleList from './assets/example-list.json';
import apiList from './assets/api-list.json';
// import { debounce } from 'async-tick';

export const state = shallowReactive({
    version: VERSION,
    theme: '',
    themeOptions: [],
    flyoverVisible: false
});

const cloneJson = (data) => JSON.parse(JSON.stringify(data));

const formatCode = function(code) {

    let html = code.innerHTML;
    if (!html) {
        return;
    }

    html = html.replace(/^\n/g, '');
    html = html.replace(/\n$/g, '');

    html = html.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

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

export const formatCodes = function() {
    const codes = Array.from(document.querySelectorAll('pre code'));
    if (!codes.length) {
        return;
    }
    codes.forEach((code) => {
        formatCode(code);
    });
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
    return cloneJson(exampleList);
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
export const apiSearchItems = cloneJson(apiList);

export const init = function() {
    initFavicon();
    initLogs();
    initDataSelect();
    initSource();
};

export const updateApiPage = function(route) {

    const position = route.query.position;
    if (!position) {
        return;
    }

    const el = document.querySelector(`a[name="${position}"]`);
    if (el) {
        el.scrollIntoView();
        el.classList.add('selected');
        setTimeout(() => {
            el.classList.remove('selected');
        }, 2000);
    }

};

export const initApiPage = function(route) {
    formatCodes();
    setTimeout(() => {
        updateApiPage(route);
    }, 100);
};
