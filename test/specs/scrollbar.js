import {
    Grid, $, CONST
} from '../../src/index.js';
/* eslint-disable max-lines-per-function */
describe('Scrollbar', function() {

    const selector = `.${CONST.NS}`;
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

    const colWidth = 100;

    const getData = function() {
        const totalColumns = 10;
        const totalRows = 100;

        const columns = [];
        const appendColumns = function(parent) {
            for (let i = 0; i < totalColumns; i++) {
                const column = {
                    id: `c${i}`,
                    name: `C ${i}`,
                    width: colWidth
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

    it('Grid scrollbar init', async () => {
        grid.setOption({});
        grid.setData(getData());
        grid.render();

        await delay();

        assert.equal(grid.getScrollbarWidth(), 12);
        assert.equal(grid.getScrollbarHeight(), 12);

        assert.equal(grid.scrollLeft, 0);
        assert.equal(grid.scrollTop, 0);

    });

    it('Grid scrollbar thumb drag v', async () => {

        const scrollbarV = container.find('.tg-pane-top-left').find('.tg-scrollbar-v');
        assert.equal(scrollbarV.length, 1);

        const thumb = scrollbarV.find('.tg-scrollbar-thumb');

        const offset = thumb.offset();
        const x = offset.left;
        const y = offset.top + 10;

        await page.mouse.move(x, y);
        await page.mouse.down();

        assert.equal(thumb.hasClass('tg-scrollbar-thumb-hold'), true);

        await page.mouse.move(x, y + 5);
        await page.mouse.move(x, y + 10);
        await page.mouse.up();

        await delay();

        assert.equal(grid.scrollLeft, 0);
        assert.equal(grid.scrollTop, 72);

    });

    it('Grid scrollbar thumb drag h', async () => {

        const scrollbarV = container.find('.tg-pane-top-left').find('.tg-scrollbar-h');
        assert.equal(scrollbarV.length, 1);

        const thumb = scrollbarV.find('.tg-scrollbar-thumb');

        const offset = thumb.offset();
        const x = offset.left + 10;
        const y = offset.top;

        await page.mouse.move(x, y);
        await page.mouse.down();

        assert.equal(thumb.hasClass('tg-scrollbar-thumb-hold'), true);


        await page.mouse.move(x + 5, y);
        await page.mouse.move(x + 10, y);
        await page.mouse.up();

        await delay();

        assert.equal(grid.scrollLeft, 20);
        assert.equal(grid.scrollTop, 72);

    });


    it('Grid scrollbar track v click', async () => {

        const top = grid.scrollTop;

        const scrollbarV = container.find('.tg-pane-top-left').find('.tg-scrollbar-v');
        assert.equal(scrollbarV.length, 1);

        const $track = scrollbarV.find('.tg-scrollbar-track');

        // click track
        const offset = $track.offset();

        const x = offset.left + 10;
        const y = offset.top + $track.height() / 2;

        const track = scrollbarV.find('.tg-scrollbar-track').get(0);

        track.dispatchEvent(new MouseEvent('mousedown', {
            clientX: x,
            clientY: y
        }));

        await delay(100);

        track.dispatchEvent(new MouseEvent('mouseup', {
            clientX: x,
            clientY: y
        }));

        await delay();

        assert.equal(grid.scrollLeft, 20);
        assert.equal(grid.scrollTop > top, true);

    });


    it('Grid scrollbar track v motion', async () => {

        const scrollbarV = container.find('.tg-pane-top-left').find('.tg-scrollbar-v');
        assert.equal(scrollbarV.length, 1);

        const track = scrollbarV.find('.tg-scrollbar-track');

        // back to top 0px
        const offset = track.offset();
        const x = offset.left + 10;
        const y = offset.top;

        await page.mouse.move(x, y);
        await page.mouse.down();

        // > 200 duration
        await delay(300);

        await page.mouse.up();

        assert.equal(grid.scrollLeft, 20);
        assert.equal(grid.scrollTop, 0);

    });

    it('Grid scrollbarSize', async () => {
        grid.setOption({
            scrollbarSize: 10
        });
        grid.setData(getData());
        grid.render();

        await delay();

        assert.equal(grid.getScrollbarWidth(), 10);
        assert.equal(grid.getScrollbarHeight(), 10);
    });

    it('Grid scrollbarSize/scrollbarSizeH/scrollbarSizeV', async () => {
        grid.setOption({
            scrollbarSize: 10,
            scrollbarSizeH: 12,
            scrollbarSizeV: 13
        });
        grid.setData(getData());
        grid.render();

        await delay();

        assert.equal(grid.getScrollbarWidth(), 13);
        assert.equal(grid.getScrollbarHeight(), 12);

    });


    it('Grid scrollbarSize/scrollbarFade/scrollbarFadeTimeout', async () => {

        grid.setOption({
            scrollbarSize: 10,
            scrollbarFade: true,
            scrollbarFadeTimeout: 200
        });
        grid.setData(getData());
        grid.render();

        await delay();

        assert.equal(grid.getScrollbarWidth(), 0);
        assert.equal(grid.getScrollbarHeight(), 0);

        const pane = container.find('.tg-pane-top-left');
        assert.equal(pane.find('.tg-scroll-view').width(), pane.width());
        assert.equal(pane.find('.tg-scroll-view').height(), pane.height());

        assert.equal(pane.find('.tg-scrollbar-h').width(), pane.width() - 10);
        assert.equal(pane.find('.tg-scrollbar-v').height(), pane.height() - 10);

        assert.equal(pane.find('.tg-scrollbar-h').hasClass('tg-fade-in'), false);
        assert.equal(pane.find('.tg-scrollbar-v').hasClass('tg-fade-in'), false);

        await delay(300);

        assert.equal(pane.find('.tg-scrollbar-h').hasClass('tg-fade-out'), true);
        assert.equal(pane.find('.tg-scrollbar-v').hasClass('tg-fade-out'), true);


    });

    it('Grid scrollbarFadeTimeout 200 mouseenter/mousemove/mouseleave', async () => {
        const fadeContainer = container.find(selector);

        const offset = fadeContainer.offset();
        const x = offset.left + 10;
        const y = offset.top + 10;
        await page.mouse.move(x, y);

        const pane = container.find('.tg-pane-top-left');
        assert.equal(pane.find('.tg-scrollbar-h').hasClass('tg-fade-in'), true);
        assert.equal(pane.find('.tg-scrollbar-v').hasClass('tg-fade-in'), true);
        assert.equal(pane.find('.tg-scrollbar-h').hasClass('tg-fade-out'), false);
        assert.equal(pane.find('.tg-scrollbar-v').hasClass('tg-fade-out'), false);

        await delay(300);

        assert.equal(pane.find('.tg-scrollbar-h').hasClass('tg-fade-in'), false);
        assert.equal(pane.find('.tg-scrollbar-v').hasClass('tg-fade-in'), false);
        assert.equal(pane.find('.tg-scrollbar-h').hasClass('tg-fade-out'), true);
        assert.equal(pane.find('.tg-scrollbar-v').hasClass('tg-fade-out'), true);

    });

    it('Grid scrollbarFadeTimeout 0', async () => {
        grid.setOption({
            scrollbarFade: true,
            scrollbarFadeTimeout: 0
        });
        grid.setData(getData());
        grid.render();

        await delay();

        const pane = container.find('.tg-pane-top-left');
        assert.equal(pane.find('.tg-scrollbar-h').hasClass('tg-fade-out'), true);
        assert.equal(pane.find('.tg-scrollbar-v').hasClass('tg-fade-out'), true);

    });

    it('Grid scrollbarFadeTimeout 0 mouseenter/mousemove/mouseleave', async () => {
        const fadeContainer = container.find(selector);

        const offset = fadeContainer.offset();
        const x = offset.left + 10;
        const y = offset.top + 10;
        await page.mouse.move(x, y);

        const pane = container.find('.tg-pane-top-left');
        assert.equal(pane.find('.tg-scrollbar-h').hasClass('tg-fade-in'), true);
        assert.equal(pane.find('.tg-scrollbar-v').hasClass('tg-fade-in'), true);
        assert.equal(pane.find('.tg-scrollbar-h').hasClass('tg-fade-out'), false);
        assert.equal(pane.find('.tg-scrollbar-v').hasClass('tg-fade-out'), false);

        // x out of container
        await page.mouse.move(x + fadeContainer.width(), y);

        assert.equal(pane.find('.tg-scrollbar-h').hasClass('tg-fade-in'), false);
        assert.equal(pane.find('.tg-scrollbar-v').hasClass('tg-fade-in'), false);
        assert.equal(pane.find('.tg-scrollbar-h').hasClass('tg-fade-out'), true);
        assert.equal(pane.find('.tg-scrollbar-v').hasClass('tg-fade-out'), true);


    });

    it('Grid scrollbarFadeTimeout 0 drag mouseleave', async () => {

        const fadeContainer = container.find(selector);

        const offset = fadeContainer.offset();
        const x = offset.left + 10;
        const y = offset.top + 10;
        await page.mouse.move(x, y);

        const pane = container.find('.tg-pane-top-left');

        assert.equal(pane.find('.tg-scrollbar-h').hasClass('tg-fade-in'), true);
        assert.equal(pane.find('.tg-scrollbar-v').hasClass('tg-fade-in'), true);


        await page.mouse.move(x + fadeContainer.width(), y);

        assert.equal(pane.find('.tg-scrollbar-h').hasClass('tg-fade-in'), false);
        assert.equal(pane.find('.tg-scrollbar-v').hasClass('tg-fade-in'), false);

    });
});
