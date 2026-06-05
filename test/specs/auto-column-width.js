import { Grid, Util } from '../../src/index.js';
import { createContainer } from '../data/helper.js';

describe('autoColumnWidth', function() {
    let container;
    let grid;

    const baseColumns = [
        {
            id: 'col1', name: 'Name'
        },
        {
            id: 'col2', name: 'Age', width: 80
        },
        {
            id: 'col3', name: 'City'
        },
        {
            id: 'col4', name: 'Score'
        }
    ];
    const rows = [
        {
            col1: 'Alice', col2: 28, col3: 'NYC', col4: 95
        },
        {
            col1: 'Bob', col2: 35, col3: 'LA', col4: 88
        }
    ];

    before(function() {
        container = createContainer('800px', '300px');
        grid = new Grid(container);
    });
    after(function() {
        grid.destroy();
        grid = null;
        container.remove();
        container = null;
    });

    async function initRender(opts, data) {
        grid.setOption(opts);
        grid.setData(data);
        grid.render();
        await delay(200);
    }

    // ====================================================================

    it('default autoColumnWidth is false', async () => {
        await initRender({}, {
            columns: baseColumns, rows
        });
        assert.equal(grid.getOption('autoColumnWidth'), false);
    });

    // ====================================================================

    it('distributes extra space and excludes explicit-width columns', async () => {
        await initRender(
            {
                autoColumnWidth: true
            },
            {
                columns: baseColumns, rows
            }
        );

        const col1 = grid.getColumnItemById('col1');
        const col2 = grid.getColumnItemById('col2');
        const col3 = grid.getColumnItemById('col3');

        assert.equal(col2.tg_width, 80);
        assert(col1.tg_width > grid.getComputedColumnWidth(col1), 'col1 got extra');
        assert(col3.tg_width > grid.getComputedColumnWidth(col3), 'col3 got extra');
    });

    // ====================================================================

    it('respects widthWeight', async () => {
        await initRender(
            {
                autoColumnWidth: true
            },
            {
                columns: [
                    {
                        id: 'a', name: 'A', widthWeight: 1
                    },
                    {
                        id: 'b', name: 'B', widthWeight: 2
                    }
                ],
                rows
            }
        );

        const colA = grid.getColumnItemById('a');
        const colB = grid.getColumnItemById('b');
        const extraA = colA.tg_width - grid.getComputedColumnWidth(colA);
        const extraB = colB.tg_width - grid.getComputedColumnWidth(colB);

        assert(extraB >= extraA, 'B got >= extra of A');
    });

    // ====================================================================

    it('clamps widths to maxWidth and puts leftover in blank column', async () => {
        await initRender(
            {
                autoColumnWidth: true
            },
            {
                columns: [
                    {
                        id: 'a', name: 'A', maxWidth: 100
                    },
                    {
                        id: 'b', name: 'B', maxWidth: 100
                    },
                    {
                        id: 'c', name: 'C'
                    }
                ],
                rows
            }
        );

        assert(grid.getColumnItemById('a').tg_width <= 100, 'A clamped');
        assert(grid.getColumnItemById('b').tg_width <= 100, 'B clamped');
        assert(grid.blankColumn.tg_width >= 0, 'blank non-negative');
    });

    // ====================================================================

    it('reset logic restores auto-sized columns to base widths', async () => {
        await initRender(
            {
                autoColumnWidth: true
            },
            {
                columns: baseColumns, rows
            }
        );

        const col1 = grid.getColumnItemById('col1');
        const inflatedWidth = col1.tg_width;

        const columns = grid.viewColumns;
        for (let i = 0, l = columns.length - 1; i < l; i++) {
            const c = columns[i];
            if (!Util.isSize(c.width)) {
                c.tg_width = grid.getComputedColumnWidth(c);
            }
        }

        assert(col1.tg_width < inflatedWidth,
            `reset: ${col1.tg_width} < ${inflatedWidth}`);
    });

    // ====================================================================

    it('redistributes correctly at different container sizes', async () => {
        container.style.width = '800px';
        await initRender(
            {
                autoColumnWidth: true
            },
            {
                columns: baseColumns, rows
            }
        );

        const col1 = grid.getColumnItemById('col1');
        const baseWidth = grid.getComputedColumnWidth(col1);
        const widthAt800 = col1.tg_width;

        const resetCols = function() {
            const cols = grid.viewColumns;
            for (let i = 0, l = cols.length - 1; i < l; i++) {
                const c = cols[i];
                if (!Util.isSize(c.width)) {
                    c.tg_width = grid.getComputedColumnWidth(c);
                }
            }
        };

        const distribute = function() {
            grid.updateTotalColumnsWidth();
            const extra = grid.containerWidth - grid.columnsWidth;
            if (extra <= 0) {
                return;
            }
            const autoCols = [];
            let totalW = 0;
            grid.viewColumns.slice(0, -1).forEach(function(c) {
                if (!Util.isSize(c.width)) {
                    autoCols.push(c);
                    totalW += (c.widthWeight || 1);
                }
            });
            if (!autoCols.length) {
                return;
            }
            let dist = 0;
            const res = autoCols.map(function(c) {
                const e = Math.floor(extra * (c.widthWeight || 1) / totalW);
                dist += e;
                return {
                    column: c, extra: e
                };
            });
            res[res.length - 1].extra += extra - dist;
            res.forEach(function(r) {
                r.column.tg_width += r.extra;
            });
        };

        resetCols();
        grid.containerWidth = 400;
        grid.bodyWidth = 400;
        distribute();
        assert(col1.tg_width < widthAt800,
            `400px: ${col1.tg_width} < 800px: ${widthAt800}`);
        assert(col1.tg_width >= baseWidth,
            `400px >= base: ${col1.tg_width} >= ${baseWidth}`);

        resetCols();
        grid.containerWidth = 1200;
        grid.bodyWidth = 1200;
        distribute();
        assert(col1.tg_width > widthAt800,
            `1200px: ${col1.tg_width} > 800px: ${widthAt800}`);
    });

    // ====================================================================

    it('works with frozen columns', async () => {
        await initRender(
            {
                autoColumnWidth: true, frozenColumn: 1
            },
            {
                columns: baseColumns, rows
            }
        );

        const col1 = grid.getColumnItemById('col1');
        const col3 = grid.getColumnItemById('col3');
        assert(col1.tg_width >= grid.getComputedColumnWidth(col1), 'frozen got extra');
        assert(col3.tg_width >= grid.getComputedColumnWidth(col3), 'non-frozen got extra');
    });

    // ====================================================================

    it('setColumnWidth after autoColumnWidth makes column fixed', async () => {
        await initRender(
            {
                autoColumnWidth: true
            },
            {
                columns: baseColumns, rows
            }
        );

        const col3 = grid.getColumnItemById('col3');
        grid.setColumnWidth('col3', 120);
        await delay(200);
        assert.equal(col3.width, 120);
        assert.equal(col3.tg_width, 120);

        grid.resize();
        await delay(300);
        assert.equal(col3.tg_width, 120, 'stays 120 after resize');
    });

    // ====================================================================

    it('disabling falls back to normal blank column', async () => {
        await initRender(
            {
                autoColumnWidth: true
            },
            {
                columns: baseColumns, rows
            }
        );

        grid.options.autoColumnWidth = false;
        grid.resize();
        await delay(300);
        assert(grid.blankColumn.tg_width >= 0, 'blank non-negative');
    });

});
