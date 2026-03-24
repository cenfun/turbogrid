import { Grid, $ } from '../../src/index.js';
import Data from '../data/data.js';
describe('Cache length', function() {

    let container;
    let grid;

    const data = Data.create();
    before(function() {
        container = $('<div/>').width(500).height(200).appendTo(document.body);
        grid = new Grid(container);
    });
    after(function() {
        grid.destroy();
        grid = null;
        container.remove();
        container = null;
    });

    it('Grid row cache length 0', async () => {
        grid.setOption({
            // default
            // rowCacheLength: 0
        });
        grid.setData(data);
        grid.render();

        await delay();

        const rows = grid.viewport.rows;
        const hh = grid.headerHeight;
        const rowHeight = grid.options.rowHeight;
        const len = Math.ceil((200 - hh) / rowHeight);
        assert.equal(rows.length, len);
        assert.equal(container.find('.tg-row').length, len);

    });

    it('Grid row cache length 3, scrollTop 0', async () => {
        grid.setOption({
            rowCacheLength: 3
        });
        grid.setData(data);
        grid.render();

        await delay();

        const rows = grid.viewport.rows;
        const hh = grid.headerHeight;
        const rowHeight = grid.options.rowHeight;
        const len = Math.ceil((200 - hh) / rowHeight) + 3;
        assert.equal(rows.length, len);
        assert.equal(container.find('.tg-row').length, len);
    });

    it('Grid row cache length 3, scrollTop (middle)', async () => {
        grid.setScrollTop(100);

        await delay();

        const rows = grid.viewport.rows;
        const hh = grid.headerHeight;
        const rowHeight = grid.options.rowHeight;
        const len = Math.ceil((200 - hh) / rowHeight) + 3 + 3;
        assert.equal(rows.length, len);
        assert.equal(container.find('.tg-row').length, len);
    });

    it('Grid row cache length 3, scroll to bottom (last row)', async () => {

        grid.scrollToRow(data.rows.length - 1);

        await delay();

        const rows = grid.viewport.rows;
        const hh = grid.headerHeight;

        // last row should no scrollbar height in
        const sh = grid.getScrollbarHeight();

        const rowHeight = grid.options.rowHeight;
        const len = Math.ceil((200 - hh - sh) / rowHeight) + 3;
        assert.equal(rows.length, len);
        assert.equal(container.find('.tg-row').length, len);

    });


    it('Grid column cache length 0', async () => {
        grid.setOption({
            // default
            // columnCacheLength: 0
        });
        grid.setData(data);
        grid.render();

        await delay();

        const columns = grid.viewport.columns;

        // first column width is 230
        const len = Math.ceil((500 - 230) / 81) + 1;
        assert.equal(columns.length, len);
        const firstRow = $(container.find('.tg-row').get(0));
        assert.equal(firstRow.find('.tg-cell').length, len);

    });


    it('Grid column cache length 1, scrollLeft 0', async () => {
        grid.setOption({
            columnCacheLength: 1
        });
        grid.setData(data);
        grid.render();

        await delay();

        const columns = grid.viewport.columns;

        // first column width is 230, left cache 1 right
        const len = Math.ceil((500 - 230) / 81) + 1 + 1;

        assert.equal(columns.length, len);
        const firstRow = $(container.find('.tg-row').get(0));
        assert.equal(firstRow.find('.tg-cell').length, len);

    });


    it('Grid column cache length 1, scrollLeft (middle)', async () => {
        // first column + 1 column + distance
        const left = 230 + 81 + 20;

        grid.setScrollLeft(left);

        await delay();

        const columns = grid.viewport.columns;

        // all column width are 81, middle cache 2 left and right
        const len = Math.ceil(500 / 81) + 2;

        assert.equal(columns.length, len);
        const firstRow = $(container.find('.tg-row').get(0));
        assert.equal(firstRow.find('.tg-cell').length, len);

    });

    it('Grid column cache length 1, scroll to right (last column)', async () => {

        // last blank column
        grid.scrollToColumn(data.columns.length - 1);

        await delay();

        const columns = grid.viewport.columns;

        // blank width is 0, right cache 1 left
        const len = Math.ceil((500 - 0) / 81) + 1 + 1;

        assert.equal(columns.length, len);
        const firstRow = $(container.find('.tg-row').get(0));
        assert.equal(firstRow.find('.tg-cell').length, len);

    });

    it('Grid cache deleteRowCache/deleteCellCache guards', function() {
        const oldObserver = grid.cellResizeObserver;
        const oldRemoveNode = grid.removeNode;

        let unobserveCount = 0;
        let removeCount = 0;
        try {
            grid.cellResizeObserver = {
                unobserve: () => {
                    unobserveCount += 1;
                },
                disconnect: () => {}
            };
            grid.removeNode = () => {
                removeCount += 1;
            };

            // guard: missing row cache
            grid.deleteRowCache('__missing__');

            const column = {
                key: 'name'
            };
            const cellNodes = new Map();
            const observerNodes = new Map();
            cellNodes.set(column, {
                id: 'cell'
            });
            observerNodes.set(column, {
                id: 'observer'
            });

            grid.deleteCellCache(column, cellNodes, observerNodes);
            assert.equal(unobserveCount, 1);
            assert.equal(removeCount, 1);
            assert.equal(cellNodes.has(column), false);
            assert.equal(observerNodes.has(column), false);

            // guards: null map inputs
            grid.deleteCellCache(column, null, null);

            grid.rowsCache.set('__row__', {
                rowNodes: {
                    each: (callback) => {
                        callback({
                            id: 'row-a'
                        });
                        callback({
                            id: 'row-b'
                        });
                    }
                },
                cellNodes: new Map(),
                observerNodes: new Map([
                    [1, {
                        id: 'obs-a'
                    }],
                    [2, null]
                ])
            });

            grid.deleteRowCache('__row__');
            assert.equal(unobserveCount, 2);
            assert.equal(removeCount, 3);
            assert.equal(grid.rowsCache.has('__row__'), false);
        } finally {
            grid.cellResizeObserver = oldObserver;
            grid.removeNode = oldRemoveNode;
        }
    });

    it('Grid cache node data with null node', function() {
        const node = document.createElement('div');
        const dataNode = {
            x: 1
        };

        grid.setNodeDataCache(node, dataNode);
        assert.equal(grid.getNodeDataCache(node), dataNode);

        assert.equal(typeof grid.setNodeDataCache(null, {
            y: 1
        }), 'undefined');
        assert.equal(typeof grid.getNodeDataCache(null), 'undefined');
    });

});
