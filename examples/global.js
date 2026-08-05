import { VERSION, Util } from '../src/index.js';
import Prism from 'prismjs';
import { shallowReactive } from 'vue';
import exampleList from './assets/example-list.json';
import apiList from './assets/api-list.json';

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

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
})[char]);

export const showPage = (content, title, targetWindow) => {
    const pageTitle = title || 'TurboGrid';
    const win = targetWindow || window.open('', '_blank');
    if (!win) {
        return null;
    }

    const html = `<!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>${escapeHtml(pageTitle)}</title>
            <style>
            body {
                padding: 10px;
                color: #1e1e1e;
                font-family: Arial, sans-serif;
                background: #fff;
            }
            pre {
                padding: 12px;
                border: 1px solid #ddd;
                overflow: auto;
                font-family: Consolas, Monaco, monospace;
                font-size: 13px;
                line-height: 1.5;
                background: #f5f5f5;
            }
            code {
                white-space: pre;
            }
            .token.comment,
            .token.prolog,
            .token.doctype,
            .token.cdata {
                color: slategray;
            }
            .token.punctuation {
                color: #999;
            }
            .token.property,
            .token.tag,
            .token.boolean,
            .token.number,
            .token.constant,
            .token.symbol,
            .token.deleted {
                color: #905;
            }
            .token.selector,
            .token.attr-name,
            .token.string,
            .token.char,
            .token.builtin,
            .token.inserted {
                color: #690;
            }
            .token.operator,
            .token.entity,
            .token.url,
            .token.variable {
                color: #9a6e3a;
            }
            .token.atrule,
            .token.attr-value,
            .token.function,
            .token.class-name {
                color: #dd4a68;
            }
            .token.keyword {
                color: #07a;
            }
            </style>
        </head>
        <body>${content}</body>
        </html>`;

    win.document.open();
    win.document.write(html);
    win.document.close();
    return win;
};

const showJson = (res) => {
    console.log(res);
    if (!res) {
        return;
    }
    const json = JSON.stringify(res, null, 4);
    const highlighted = Prism.highlight(json, Prism.languages.javascript, 'javascript');

    const content = `
            <h3>JSON</h3>
            <pre><code class="language-js">${highlighted}</code></pre>
        `;

    showPage(content, 'JSON');

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


let currentSource;

export const setCurrentSource = (source) => {
    currentSource = source;
};

export const showSource = async () => {
    if (!currentSource?.loader) {
        return;
    }

    // Open synchronously from the click handler so the browser does not block it.
    const win = window.open('', '_blank');
    if (!win) {
        return;
    }

    const sourceInfo = currentSource;
    const sourcePath = sourceInfo.path || 'Source';
    showPage('<p>Loading source...</p>', sourcePath, win);

    try {
        const result = await sourceInfo.loader();
        const source = typeof result === 'string' ? result : result.default;
        const highlighted = Prism.highlight(source, Prism.languages.markup, 'markup');
        const content = `
            <h3>${escapeHtml(sourcePath)}</h3>
            <pre><code class="language-markup">${highlighted}</code></pre>
        `;
        showPage(content, sourcePath, win);
    } catch (err) {
        const message = err instanceof Error ? err.message : err;
        showPage(`<h3>Failed to load source</h3><pre>${escapeHtml(message)}</pre>`, sourcePath, win);
    }
};

export const getExampleList = function() {
    return cloneJson(exampleList);
};

const initSource = function() {
    if (!document.querySelector('.grid-container')) {
        return;
    }

    const $header = document.querySelector('.controller-header');
    if (!$header) {
        return;
    }
    if ($header.querySelector('.bt-source')) {
        return;
    }
    $header.insertAdjacentHTML('beforeend', '<button class="bt-source">source</button>');
    const btSource = $header.querySelector('.bt-source');
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


// Auto-generated from public/api.html
// Contains all API anchor items for search functionality
export const getApiList = () => {
    return cloneJson(apiList);
};

export const init = function() {
    formatCodes();
    initLogs();
    initSource();
};

let focusedEl;
const removeFocusedHandler = function() {
    // console.log('removeFocusedHandler');
    if (focusedEl) {
        focusedEl.classList.remove('focused');
        focusedEl = null;
    }
};

export const updateApiPage = Util.microtask((route) => {

    const position = route.query.position;
    if (!position) {
        return;
    }

    // remove prev focus
    document.removeEventListener('click', removeFocusedHandler);
    removeFocusedHandler();

    const el = document.querySelector(`a[name="${position}"]`);
    if (el) {

        // console.log('scroll to', position);
        el.scrollIntoView();
        el.classList.add('focused');
        focusedEl = el;
        setTimeout(() => {
            document.addEventListener('click', removeFocusedHandler, {
                once: true
            });
        }, 10);

    }

});

export const initApiPage = function(route) {
    formatCodes();
    setTimeout(() => {
        updateApiPage(route);
    }, 100);
};
