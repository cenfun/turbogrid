(function(window) {
    'use strict';

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

        code.innerHTML = window.Prism.highlight(html, window.Prism.languages[language], language);

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

    window.formatCodes = function() {
        const codes = document.querySelectorAll('code');
        if (!codes) {
            return;
        }

        if (!window.Prism) {
            console.log('not found window.Prism');
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

    window.getHash = function(key) {
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

    window.setHash = function(key, value) {
        if (!key) {
            return;
        }
        const hash = window.getHash();
        if (hash[key] === value) {
            return;
        }
        hash[key] = value;
        updateHash(hash);
    };

    window.delHash = function(key) {
        if (!key) {
            return;
        }
        const hash = window.getHash();
        delete hash[key];
        updateHash(hash);
    };

    window.getNum = function(str) {
        str = String(str).trim();
        let n = parseInt(str);
        if (str.endsWith('k')) {
            n *= 1000;
        } else if (str.endsWith('m')) {
            n *= 1000000;
        }
        return n;
    };

    const initThemes = function(grid) {

        const $theme = document.querySelector('.st_theme');
        if (!$theme) {
            return;
        }

        if (!grid) {
            grid = window.turbogrid && window.turbogrid.Grid;
            if (!grid) {
                console.error('Not found defined Grid');
                return;
            }
        }

        $theme.title = 'theme';

        const hash = window.getHash();

        const allThemes = grid.getAllThemes();
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
                window.delHash('theme');
                return;
            }
            window.setHash('theme', this.value);
        });
    };

    window.showPage = (content) => {
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
            </style>
        </head>
        <body>
            ${content}
            <script>
                window.formatCodes();
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

        window.showPage(content);

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
                //console.log(params);
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

    window.initCommonEvents = function(grid) {
        console.log(grid);
        initThemes(grid);
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

    window.appendLog = function(type, d) {
        setTimeout(function() {
            appendLogSync(type, d);
        }, 100);
    };


    const showSource = () => {
        const listCss = [].concat(Array.from(document.querySelectorAll('style')));

        const listJs = [].concat(Array.from(document.querySelectorAll('script')));

        const css = listCss.map(function(elem) {
            if (elem.getAttribute('context')) {
                return '';
            }
            return `<pre><code class="language-css">${elem.innerHTML}</code></pre>`;
        });

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

        });

        const content = `
            <h3>JS</h3>
            ${js.join('')}
            <h3>CSS</h3>
            ${css.join('')}
        `;

        window.showPage(content);
    };

    const initSource = function() {
        const bt_source = document.querySelector('.bt_source');
        if (!bt_source) {
            return;
        }
        bt_source.title = 'Check source codes';
        bt_source.addEventListener('click', function() {
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

    const initHeaderTitle = function() {
        const headerTitle = document.querySelector('.header-title');
        if (!headerTitle) {
            return;
        }
        if (window.parent === window) {
            headerTitle.classList.add('header-title-disable');
            return;
        }
        headerTitle.title = 'Open in new window';
        headerTitle.style.cursor = 'pointer';
        headerTitle.addEventListener('click', function() {
            let url = location.href;
            const hash = window.getHash();
            delete hash.page;
            const usp = new URLSearchParams(hash);
            const str = usp.toString();
            if (str) {
                url += `#${str}`;
            }
            window.open(url);
        });
    };

    const initDataSelect = function() {
        const dataSelect = document.querySelector('.st_data');
        if (!dataSelect) {
            return;
        }
        dataSelect.addEventListener('change', function() {
            window.setHash('data', this.value);
        });

        const data = window.getHash('data');
        const item = Array.from(dataSelect.options).find((it) => it.value === data);
        if (item) {
            dataSelect.value = data;
        } else {
            window.delHash('data');
        }

    };

    window.addEventListener('load', function() {
        initSource();
        initLogs();
        initHeaderTitle();
        initDataSelect();
    });


})(window);
