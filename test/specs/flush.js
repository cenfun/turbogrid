import { Grid } from '../../src/index.js';
import Data from '../data/data.js';
import { createContainer } from '../data/helper.js';

describe('Flush', function() {

    let container;
    let grid;

    const data = Data.create();

    before(function() {
        container = createContainer('500px', '200px');
        grid = new Grid(container);
    });

    after(function() {
        grid.destroy();
        grid = null;
        container.remove();
        container = null;
    });

    it('Grid row flush init', async () => {
        grid.setOption({});
        grid.setData(data);
        grid.render();
        await delay();

        // total columns
        const columnLength = container.querySelector('.tg-row[row="0"]').children.length;

        const cl = Math.ceil((500 - 230) / 81) + 1;

        assert.equal(columnLength, cl);
        assert.equal(grid.viewport.columns.length, cl);


        // total rows
        const rowLength = grid.$bodyTL.children().length;

        const rl = Math.ceil((200 - grid.headerHeight) / grid.options.rowHeight);

        assert.equal(rowLength, rl);
        assert.equal(grid.viewport.rows.length, rl);

    });


    it('Grid row flush cell', async () => {

        const cl = Math.ceil((500 - 230) / 81) + 1;

        grid.flushCell([0, 1], [1]);
        assert.equal(container.querySelector('.tg-row[row="0"]').children.length, cl - 1);
        assert.equal(container.querySelector('.tg-row[row="1"]').children.length, cl - 1);
        assert.equal(container.querySelector('.tg-row[row="2"]').children.length, cl);

        grid.render();

        await delay();

        assert.equal(container.querySelector('.tg-row[row="0"]').children.length, cl);
        assert.equal(container.querySelector('.tg-row[row="1"]').children.length, cl);
        assert.equal(container.querySelector('.tg-row[row="2"]').children.length, cl);

        grid.flushCell(0, 1);

        assert.equal(container.querySelector('.tg-row[row="0"]').children.length, cl - 1);
        assert.equal(container.querySelector('.tg-row[row="1"]').children.length, cl);
        assert.equal(container.querySelector('.tg-row[row="2"]').children.length, cl);
        grid.render();
        await delay();

        assert.equal(container.querySelector('.tg-row[row="0"]').children.length, cl);
        assert.equal(container.querySelector('.tg-row[row="1"]').children.length, cl);
        assert.equal(container.querySelector('.tg-row[row="2"]').children.length, cl);

    });

    it('Grid row flush columns', async () => {

        const cl = Math.ceil((500 - 230) / 81) + 1;

        grid.flushColumnFrom(2);
        assert.equal(container.querySelector('.tg-row[row="0"]').children.length, 2);

        grid.render();
        await delay();

        assert.equal(container.querySelector('.tg-row[row="0"]').children.length, cl);

        grid.flushColumn([1]);
        assert.equal(container.querySelector('.tg-row[row="0"]').children.length, cl - 1);

        grid.render();
        await delay();
        assert.equal(container.querySelector('.tg-row[row="0"]').children.length, cl);

        grid.flushColumn(0);
        assert.equal(container.querySelector('.tg-row[row="0"]').children.length, cl - 1);

        grid.render();
        await delay();
        assert.equal(container.querySelector('.tg-row[row="0"]').children.length, cl);

    });

    it('Grid row flush rows', async () => {

        const c = grid.$bodyTL;

        grid.flushRowFrom(2);
        assert.equal(c.children().length, 2);

        grid.render();
        await delay();
        grid.flushRow([2]);
        assert.equal(c.children().length, 4);

        grid.render();
        await delay();
        grid.flushRow(1);
        assert.equal(c.children().length, 4);
    });

    it('Grid row flush body', async () => {

        const c = grid.$bodyTL;

        grid.render();
        await delay();
        grid.flushBody();
        assert.equal(c.children().length, 0);

    });
});
