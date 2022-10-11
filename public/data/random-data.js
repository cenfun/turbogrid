
let rdCache;
let rdKey;

window.randomData = function(totalColumns, totalRows, noSubs, cache) {

    if (cache) {
        const key = `${totalColumns}_${totalRows}_${noSubs}`;
        if (key === rdKey && rdCache) {
            return rdCache;
        }
        rdKey = key;
    }

    const columns = [];
    const appendColumns = function(parent) {
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

    appendColumns(columns);

    const rows = [];
    let index = 0;

    const getRow = function() {
        const row = {
            id: `r_${index}`,
            name: `This Is Row Name ${index}`,
            index: index
        };
        columns.forEach(function(column) {
            const id = column.id;

            if (column.type === 'number') {
                row[id] = Math.round(Math.random() * 1000);
            } else {
                row[id] = `str_${index}`;
            }

        });
        return row;
    };

    const appendSubRows = function(row) {
        if (!noSubs && Math.random() > 0.8) {
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
            name: 'Index',
            type: 'number'
        });

        columns.unshift({
            id: 'name',
            name: 'Name',
            type: 'tree',
            width: 200
        });
    }

    const data = {
        columns: columns,
        rows: rows
    };

    if (cache) {
        rdCache = data;
    }

    return data;
};
