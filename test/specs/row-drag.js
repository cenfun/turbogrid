import { Grid, $ } from '../../src/index.js';
import Data from '../data/data.js';
import { triggerTouch } from '../data/helper.js';

describe('Row drag', function() {

    let container;
    let grid;

    const data = Data.create();
    before(function() {
        container = $('<div/>').width(500).height(300).appendTo(document.body);
        grid = new Grid(container);
        grid.bind('onRowDragged', (e, d) => {
            console.log('onRowDragged', d);
        });
        grid.bind('onRowDropped', (e, d) => {
            console.log('onRowDropped', d);
        });
    });

    after(function() {
        grid.destroy();
        grid = null;
        container.remove();
        container = null;
    });

    it('Grid row drag 1 row height', async () => {
        grid.setOption({
            rowDragVisible: true,
            rowNumberVisible: true
        });

        grid.setData(data);
        grid.render();

        await delay();

        const fromIndex = 3;
        const rowHeight = grid.options.rowHeight;

        const rowItem = grid.getRowItem(fromIndex);
        assert.equal(rowItem.tg_index, fromIndex);

        const cellNode = grid.getCellNode(fromIndex, 0);
        assert(cellNode);

        const rect = cellNode.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        await page.mouse.move(x, y);
        await page.mouse.down();

        await page.mouse.move(x, y + 10);
        await page.mouse.move(x, y + rowHeight * 1.5);
        await page.mouse.up();

        await delay();

        assert.equal(rowItem.tg_index, fromIndex + 1);

    });

    it('Grid row drag 2 row height', async () => {

        const fromIndex = 3;
        const rowHeight = grid.options.rowHeight;

        const rowItem = grid.getRowItem(fromIndex);
        assert.equal(rowItem.tg_index, fromIndex);

        const cellNode = grid.getCellNode(fromIndex, 0);
        assert(cellNode);

        const rect = cellNode.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        await page.mouse.move(x, y);
        await page.mouse.down();

        await page.mouse.move(x, y + 10);
        await page.mouse.move(x, y + rowHeight * 2.5);
        await page.mouse.up();

        await delay();

        assert.equal(rowItem.tg_index, fromIndex + 2);

    });


    it('Grid row touch 1 row height', async () => {

        const fromIndex = 3;
        const rowHeight = grid.options.rowHeight;

        const rowItem = grid.getRowItem(fromIndex);
        assert.equal(rowItem.tg_index, fromIndex);

        const cellNode = grid.getCellNode(fromIndex, 0);
        assert(cellNode);

        const rect = cellNode.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        const node = cellNode.querySelector('.tg-row-drag-icon');

        triggerTouch(node, 'touchstart', x, y);
        await delay();
        triggerTouch(document.body, 'touchmove', x, y + 10);
        await delay();
        triggerTouch(document.body, 'touchmove', x, y + rowHeight * 1.5);
        await delay();
        triggerTouch(document.body, 'touchend', x, y + rowHeight * 1.5);

        await delay();

        assert.equal(rowItem.tg_index, fromIndex + 1);

    });

    it('Grid row touch auto scroll down', async () => {

        const fromIndex = 3;

        const rowItem = grid.getRowItem(fromIndex);
        assert.equal(rowItem.tg_index, fromIndex);

        const cellNode = grid.getCellNode(fromIndex, 0);
        assert(cellNode);

        const rect = cellNode.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        const node = cellNode.querySelector('.tg-row-drag-icon');

        triggerTouch(node, 'touchstart', x, y);
        await delay();
        triggerTouch(document.body, 'touchmove', x, y + 500);
        await delay();
        triggerTouch(document.body, 'touchend', x, y + 500);

        await delay();

        assert.equal(rowItem.tg_index, 11);

    });

    it('Grid row touch auto scroll up', async () => {

        const fromIndex = 11;

        const rowItem = grid.getRowItem(fromIndex);
        assert.equal(rowItem.tg_index, fromIndex);

        const cellNode = grid.getCellNode(fromIndex, 0);
        assert(cellNode);

        const rect = cellNode.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        const node = cellNode.querySelector('.tg-row-drag-icon');

        triggerTouch(node, 'touchstart', x, y);
        await delay();
        triggerTouch(document.body, 'touchmove', x, y - 500);
        await delay();
        triggerTouch(document.body, 'touchend', x, y - 500);

        await delay(200);

        assert.equal(rowItem.tg_index, 0);

    });

});
