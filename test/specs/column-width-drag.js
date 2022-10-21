import { Grid, $ } from '../../src/index.js';
import Data from '../data/data.js';
describe('Column width drag', function() {

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

    it('Grid column width drag', async () => {
        grid.setOption({});

        data.columns[0].width = 300;
        grid.setData(data);
        grid.render();

        await delay();

        // drag column 1
        const columnItem = grid.getColumnItem(1);
        const headerNode = grid.getHeaderItemNode(columnItem);
        const node = headerNode.querySelector('.tg-column-resizing');

        const rect = node.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        await page.mouse.move(x, y);

        const containerColumnLine = container.find('.tg-column-line');
        assert.equal(containerColumnLine.css('display'), 'block');

        const lineItem = containerColumnLine.find('.tg-column-line-item');
        assert.equal(lineItem.hasClass('tg-active'), false);

        await page.mouse.down();

        await page.mouse.move(x + 10, y);

        // active
        assert.equal(lineItem.hasClass('tg-active'), true);

        await page.mouse.move(x + 20, y);

        await page.mouse.up();

        // 81 + 20
        assert.equal(columnItem.tg_width, 101);

    });

    it('Grid column width drag subs column', async () => {

        const columnItem = grid.getColumnItem('number');
        assert.equal(columnItem.tg_width, 81);

        const headerNode = grid.getHeaderItemNode(columnItem);
        const node = headerNode.querySelector('.tg-column-resizing');

        const rect = node.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        await page.mouse.move(x, y);

        // column line visible
        const containerColumnLine = container.find('.tg-column-line');
        assert.equal(containerColumnLine.css('display'), 'block');


        const lineItem = containerColumnLine.find('.tg-column-line-item');
        assert.equal(lineItem.hasClass('tg-active'), false);

        await page.mouse.down();


        await page.mouse.move(x + 10, y);

        assert.equal(lineItem.hasClass('tg-active'), true);

        await page.mouse.move(x + 20, y);

        await page.mouse.up();

        assert.equal(columnItem.tg_width, 81 + 20);

        assert.equal(columnItem.tg_parent.tg_width, 81 + 20 + 81 * 2);

    });

});
