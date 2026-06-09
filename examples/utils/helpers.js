export function getHash(key) {
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
}

function updateHash(hash) {
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
}

export function setHash(key, value) {
    if (!key) {
        return;
    }
    const hash = getHash();
    if (hash[key] === value) {
        return;
    }
    hash[key] = value;
    updateHash(hash);
}

export function delHash(key) {
    if (!key) {
        return;
    }
    const hash = getHash();
    delete hash[key];
    updateHash(hash);
}

export function getNum(str) {
    str = String(str).trim();
    let n = parseInt(str);
    if (str.endsWith('k')) {
        n *= 1000;
    } else if (str.endsWith('m')) {
        n *= 1000000;
    }
    return n;
}

// Button click handler: parses button text like "render()", "addRow()", "getSelectedRows()"
function initButtons(grid) {
    function getArgs(params) {
        let args = [];
        if (params) {
            if (window[params]) {
                args = [window[params]];
            } else {
                args = JSON.parse(`[${params}]`);
            }
        }
        return args;
    }

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
}

export function initCommonEvents(grid) {
    initButtons(grid);
}

let index = 1;

export function appendLog(type, d) {
    setTimeout(function() {
        appendLogSync(type, d);
    }, 100);
}

function appendLogSync(type, d) {
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
    if (content) {
        content.insertBefore(log, content.firstChild);
    }
}

export function showPage(content) {
    const html = `
    <html>
    <head>
        <link href="assets/prism.css" rel="stylesheet" />
        <script src="assets/prism.js" data-manual></script>
        <link href="assets/main.css" rel="stylesheet" />
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
            window.formatCodes();
        </script>
    </body>
    </html>
    `;

    const win = window.open('', '_blank');
    win.document.open();
    win.document.write(html);
    win.document.close();
}

function showJson(res) {
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
}
