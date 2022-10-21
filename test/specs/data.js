import { Grid, $ } from '../../src/index.js';
describe('Data', function() {

    let container;
    let grid;

    before(function() {
        container = $('<div/>').width(500).height(500).appendTo(document.body);
        grid = new Grid(container);
    });
    after(function() {
        grid.destroy();
        grid = null;
        container.remove();
        container = null;
    });

    it('Grid setData/getData/rowsLength', function() {
        grid.setData();
        assert.equal(grid.getData().rows.length, 0);
        assert.equal(grid.getData().columns, length, 0);

        grid.setData({
            columns: [{
                id: 'name',
                name: 'Name'
            }, {
                id: 'value',
                name: 'Value'
            }],
            rowsLength: 100
        });

        assert.equal(grid.getData().rows.length, 100);
        assert.equal(typeof grid.getData().rowsLength, 'undefined');

    });

    it('Grid rowsLength = 10000', async () => {

        const rowHeight = 30;

        grid.setOption({
            rowHeight,
            frozenRow: 0
        });
        grid.setData({
            columns: [{
                id: 'name',
                name: 'Name'
            }, {
                id: 'value',
                name: 'Value'
            }],
            rowsLength: 10000
        });

        grid.render();

        await delay();

        assert.equal(grid.getData().rows.length, 10000);
        assert.equal(grid.scrollTopOffset, 0);

        // frozen row
        let top = 0;
        assert.equal(container.find('.tg-row[row="0"]').get(0).style.top, `${top}px`);
        // first row
        assert.equal(container.find('.tg-row[row="1"]').get(0).style.top, `${top}px`);

        // top position need reduce one rowHeight
        // scrollTopOffset = scrollTop - (scrollTop % 10000);
        grid.scrollToRow(334);
        await delay();
        assert.equal(grid.scrollTopOffset, 0);

        // 339 in cache
        top = rowHeight * 339 - rowHeight;
        assert.equal(container.find('.tg-row[row="339"]').get(0).style.top, `${top}px`);

        grid.scrollToRow(335);
        await delay();
        assert.equal(grid.scrollTopOffset, 10000);

        // cache need update top
        top = rowHeight * 339 - grid.scrollTopOffset - rowHeight;
        assert.equal(container.find('.tg-row[row="339"]').get(0).style.top, `${top}px`);

    });


});
