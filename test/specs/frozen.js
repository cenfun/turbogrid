import { Grid, $ } from '../../src/index.js';

describe('Frozen', function() {

    let container;
    let grid;
    before(function() {
        container = $('<div/>').css('background', '#f5f5f5').appendTo(document.body);
        grid = new Grid(container);
    });
    after(function() {
        grid.destroy();
        grid = null;
        container.remove();
        container = null;
    });
    const getData = function(totalColumns, totalRows, columnWidth) {
        const columns = [];
        const appendColumns = function(parent) {
            for (let i = 0; i < totalColumns; i++) {
                const column = {
                    id: `c${i}`,
                    name: `C ${i}`,
                    width: columnWidth
                };
                columns.push(column);
            }
        };
        appendColumns(columns);
        const rows = [];
        const appendRows = function(parent) {
            for (let i = 0; i < totalRows; i++) {
                const row = {
                    name: `R ${i}`
                };
                rows.push(row);
            }
        };
        appendRows(rows);
        return {
            columns: columns,
            rows: rows
        };
    };

    const createItem = function(width, height, options, callback) {
        return new Promise((resolve) => {
            container.width(width).height(height);
            grid.setOption(options);
            const totalColumns = 5;
            const totalRows = 10;
            const columnWidth = 100;
            grid.setData(getData(totalColumns, totalRows, columnWidth));
            grid.once('onFirstUpdated', function() {
                const hh = container.find('.tg-header-frame').height();
                const bh = container.height() - hh;
                const bw = container.width();
                const o = {
                    width,
                    height,
                    totalColumns,
                    totalRows,
                    columnWidth,
                    headerHeight: hh,
                    bodyHeight: bh,
                    bodyWidth: bw,
                    rowHeight: grid.options.rowHeight,
                    scrollbarWidth: grid.getScrollbarWidth(),
                    scrollbarHeight: grid.getScrollbarHeight()
                };
                o.blankWidth = Math.max(bw - totalColumns * columnWidth, 0);
                o.frozenWidth = o.columnWidth + o.blankWidth + o.scrollbarWidth;
                o.frozenHeight = o.rowHeight + o.scrollbarHeight;
                const panes = {
                    TL: container.find('.tg-pane-top-left'),
                    TR: container.find('.tg-pane-top-right'),
                    BL: container.find('.tg-pane-bottom-left'),
                    BR: container.find('.tg-pane-bottom-right')
                };
                Object.keys(panes).forEach((k) => {
                    const p = panes[k];
                    o[k] = p;
                    o[`${k}W`] = p.width();
                    o[`${k}H`] = p.height();
                    o[`${k}D`] = p.css('display');
                });
                const res = callback.call(grid, o);
                resolve(res);
            });
            grid.render();
        });

    };

    const createGrids = async (sizeList, o, callback) => {
        const options = {
            frozenColumn: o[0] ? 0 : -1,
            frozenRow: o[1] ? 0 : -1,
            frozenRight: Boolean(o[2]),
            frozenBottom: Boolean(o[3])
        };
        for (const item of sizeList) {
            await createItem(item[0], item[1], options, callback);
        }
    };

    const sizeList = [
        //no scrollbar
        [600, 500],
        //has h/v scrollbar both
        [400, 300]
    ];

    it('Grid frozen C0R0 (default)', async () => {

        await createGrids(sizeList, [0, 0, 0, 0], function(o) {
            assert.equal(o.TLW, o.bodyWidth);
            assert.equal(o.TLH, o.bodyHeight);
            assert.equal(o.TRD, 'none');
            assert.equal(o.BLD, 'none');
            assert.equal(o.BRD, 'none');
            assert.equal(grid.getRowNodes(0).length, 1);
        });

    });

    it('Grid frozen C0R1B0', async () => {

        await createGrids(sizeList, [0, 1, 0, 0], function(o) {
            assert.equal(o.TLW, o.bodyWidth);
            assert.equal(o.TLH, o.rowHeight);
            assert.equal(o.TRD, 'none');
            assert.equal(o.BLW, o.bodyWidth);
            assert.equal(o.BLH, o.bodyHeight - o.rowHeight);
            assert.equal(o.BRD, 'none');
        });

    });

    it('Grid frozen C0R1B1', async () => {
        await createGrids(sizeList, [0, 1, 0, 1], function(o) {
            assert.equal(o.TLW, o.bodyWidth);
            assert.equal(o.TLH, o.bodyHeight - o.frozenHeight);
            assert.equal(o.TRD, 'none');
            assert.equal(o.BLW, o.bodyWidth);
            assert.equal(o.BLH, o.frozenHeight);
            assert.equal(o.BRD, 'none');
        });

    });

    it('Grid frozen C1R0R0', async () => {

        await createGrids(sizeList, [1, 0, 0, 0], function(o) {
            assert.equal(o.TLW, o.columnWidth);
            assert.equal(o.TLH, o.bodyHeight);
            assert.equal(o.TRW, o.bodyWidth - o.columnWidth);
            assert.equal(o.TRH, o.bodyHeight);
            assert.equal(o.BLD, 'none');
            assert.equal(o.BRD, 'none');
            assert.equal(grid.getRowNodes(0).length, 2);
        });

        await createGrids([[100, 300]], [1, 0, 0, 0], function(o) {
            assert.equal(o.TLW, o.columnWidth - o.scrollbarWidth);
            assert.equal(o.TRW, o.scrollbarWidth);
        });

    });

    it('Grid frozen C1R0R1', async () => {

        await createGrids(sizeList, [1, 0, 1, 0], function(o) {
            assert.equal(o.TLW, o.bodyWidth - o.frozenWidth);
            assert.equal(o.TLH, o.bodyHeight);
            assert.equal(o.TRW, o.frozenWidth);
            assert.equal(o.TRH, o.bodyHeight);
            assert.equal(o.BLD, 'none');
            assert.equal(o.BRD, 'none');
        });

        await createGrids([[100, 300]], [1, 0, 1, 0], function(o) {
            assert.equal(o.TLW, 0);
            assert.equal(o.TRW, o.columnWidth);
        });

    });

    it('Grid frozen C1R1R0B0', async () => {

        await createGrids(sizeList, [1, 1, 0, 0], function(o) {
            assert.equal(o.TLW, o.columnWidth);
            assert.equal(o.TLH, o.rowHeight);
            assert.equal(o.TRW, o.bodyWidth - o.columnWidth);
            assert.equal(o.TRH, o.rowHeight);
            assert.equal(o.BLW, o.columnWidth);
            assert.equal(o.BLH, o.bodyHeight - o.rowHeight);
            assert.equal(o.BRW, o.bodyWidth - o.columnWidth);
            assert.equal(o.BRH, o.bodyHeight - o.rowHeight);
        });

        await createGrids([[100, 300]], [1, 1, 0, 0], function(o) {
            assert.equal(o.TLW, o.columnWidth - o.scrollbarWidth);
            assert.equal(o.TRW, o.scrollbarWidth);
        });

    });

    it('Grid frozen C1R1R0B1', async () => {

        await createGrids(sizeList, [1, 1, 0, 1], function(o) {
            assert.equal(o.TLW, o.columnWidth);
            assert.equal(o.TLH, o.bodyHeight - o.frozenHeight);
            assert.equal(o.TRW, o.bodyWidth - o.columnWidth);
            assert.equal(o.TRH, o.bodyHeight - o.frozenHeight);
            assert.equal(o.BLW, o.columnWidth);
            assert.equal(o.BLH, o.frozenHeight);
            assert.equal(o.BRW, o.bodyWidth - o.columnWidth);
            assert.equal(o.BRH, o.frozenHeight);
        });

        await createGrids([[100, 300]], [1, 1, 0, 1], function(o) {
            assert.equal(o.TLW, o.columnWidth - o.scrollbarWidth);
            assert.equal(o.TRW, o.scrollbarWidth);
        });

    });

    it('Grid frozen C1R1R1B0', async () => {

        await createGrids(sizeList, [1, 1, 1, 0], function(o) {
            assert.equal(o.TLW, o.bodyWidth - o.frozenWidth);
            assert.equal(o.TLH, o.rowHeight);
            assert.equal(o.TRW, o.frozenWidth);
            assert.equal(o.TRH, o.rowHeight);
            assert.equal(o.BLW, o.bodyWidth - o.frozenWidth);
            assert.equal(o.BLH, o.bodyHeight - o.rowHeight);
            assert.equal(o.BRW, o.frozenWidth);
            assert.equal(o.BRH, o.bodyHeight - o.rowHeight);
        });

        await createGrids([[100, 300]], [1, 1, 1, 0], function(o) {
            assert.equal(o.TLW, 0);
            assert.equal(o.TRW, o.columnWidth);
        });

    });

    it('Grid frozen C1R1R1B1', async () => {

        await createGrids(sizeList, [1, 1, 1, 1], function(o) {
            assert.equal(o.TLW, o.bodyWidth - o.frozenWidth);
            assert.equal(o.TLH, o.bodyHeight - o.frozenHeight);
            assert.equal(o.TRW, o.frozenWidth);
            assert.equal(o.TRH, o.bodyHeight - o.frozenHeight);
            assert.equal(o.BLW, o.bodyWidth - o.frozenWidth);
            assert.equal(o.BLH, o.frozenHeight);
            assert.equal(o.BRW, o.frozenWidth);
            assert.equal(o.BRH, o.frozenHeight);
        });

        await createGrids([[100, 300]], [1, 1, 1, 1], function(o) {
            assert.equal(o.TLW, 0);
            assert.equal(o.TRW, o.columnWidth);
        });

    });


});
