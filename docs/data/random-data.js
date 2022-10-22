
const dataCache = new Map();

window.randomData = function(dataStr = '') {

    const cache = dataCache.get(dataStr);
    if (cache) {
        return cache;
    }

    const list = dataStr.match(/\d+[k]?x\d+[km]?/g);
    if (!list) {
        return;
    }

    let str = list.shift().toLowerCase();
    str = str.split('k').join('000');
    str = str.split('m').join('000000');
    const [totalColumns = 10, totalRows = 100] = str.split('x').map((it) => Number(it));

    let hasSubs;
    if (dataStr.indexOf('no-subs') !== -1) {
        hasSubs = false;
    } else if (dataStr.indexOf('subs') !== -1) {
        hasSubs = true;
    }
    if (typeof hasSubs !== 'boolean') {
        hasSubs = totalRows > 200;
    }

    const columns = [];
    const appendColumns = function() {
        for (let i = 0; i < totalColumns; i++) {
            const column = {
                id: `c${i}`,
                name: `Str ${i}`
            };

            if (Math.random() > 0.6) {
                column.type = 'number';
                column.name = `Num ${i}`;
            }

            columns.push(column);
        }
    };

    appendColumns();

    const rows = [];
    let index = 0;

    const getRow = function() {
        const row = {
            id: `r_${index}`,
            name: `Row Name ${index.toLocaleString()}`,
            index: index
        };
        columns.forEach(function(column) {
            const id = column.id;

            if (column.type === 'number') {
                row[id] = index;
            } else {
                row[id] = `Str ${index.toLocaleString()}`;
            }

        });
        return row;
    };

    const appendSubRows = function(row) {
        if (hasSubs && Math.random() > 0.8) {
            row.subs = [];
            const numSubs = Math.round(10 * Math.random());
            for (let i = 0; i < numSubs; i++) {
                if (index >= totalRows) {
                    break;
                }
                const sub = getRow();
                row.subs.push(sub);
                index++;
            }
        }

    };

    while (index < totalRows) {
        const row = getRow();
        index++;
        appendSubRows(row);
        rows.push(row);
    }

    if (totalColumns > 2) {
        columns.unshift({
            id: 'index',
            name: 'Index'
        });

        columns.unshift({
            id: 'name',
            name: 'Name'
        });
    }

    const data = {
        columns: columns,
        rows: rows
    };

    dataCache.set(dataStr, data);

    return data;
};
