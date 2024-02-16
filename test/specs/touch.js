import { Grid, $ } from '../../src/index.js';
import Data from '../data/data.js';
import { triggerTouch } from '../data/helper.js';

describe('Touch', function() {

    let container;
    let grid;

    const data = Data.create();
    before(function() {
        container = $('<div/>').width(500).height(300).appendTo(document.body);
        grid = new Grid(container);
    });
    after(function() {
        grid.destroy();
        grid = null;
        container.remove();
        container = null;
    });

    it('Grid touch scroll init', async () => {
        grid.setOption({});
        grid.setData(data);
        grid.render();

        await delay();

        assert.equal(grid.getScrollLeft(), 0);
        assert.equal(grid.getScrollTop(), 0);
    });

    it('Grid touch scroll and motion', async () => {

        const node = grid.container;

        // node.addEventListener('touchstart', (e) => {
        //     console.log(e);
        // });
        // node.addEventListener('touchmove', (e) => {
        //     console.log(e);
        // });
        // node.addEventListener('touchend', (e) => {
        //     console.log(e);
        // });

        const rect = node.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        triggerTouch(node, 'touchstart', x, y);
        triggerTouch(node, 'touchmove', x - 10, y - 20);
        triggerTouch(node, 'touchend', x - 10, y - 20);

        assert.equal(grid.getScrollLeft(), 0);
        assert.equal(grid.getScrollTop(), 20);

        triggerTouch(node, 'touchstart', x, y);
        triggerTouch(node, 'touchmove', x - 10, y);
        await delay();
        triggerTouch(node, 'touchmove', x - 30, y);
        await delay();
        triggerTouch(node, 'touchend', x - 30, y);

        await delay();

        assert.equal(grid.getScrollLeft(), 30);
        assert.equal(grid.getScrollTop(), 20);

    });


    it('Grid touch column width', async () => {

        // back scroll to 0
        grid.scrollToFirstColumn();

        assert.equal(grid.getScrollLeft(), 0);

        const node = grid.$header.find('.tg-column-resizing').get(0);

        const rect = node.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        triggerTouch(node, 'touchstart', x, y);

        await delay();

        assert.equal(grid.$columnLineItem.hasClass('tg-active'), true);

        const columnItem = grid.getColumnItem(0);
        const width = columnItem.tg_width;


        triggerTouch(node, 'touchmove', x + 10, y);
        await delay();

        triggerTouch(node, 'touchend', x + 10, y);
        await delay();

        assert.equal(columnItem.tg_width, width + 10);

    });


});
