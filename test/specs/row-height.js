import { Grid } from '../../src/index.js';
import Data from '../data/data.js';
import { createContainer } from '../data/helper.js';

describe('Row height', function() {
    let container;
    let grid;

    const data = Data.create();
    data.columns.splice(1, 0, {
        id: 'tg_height',
        name: 'Height'
    });

    data.rows.unshift({
        id: 'total',
        name: 'Total',
        height: 30
    });

    // row1
    data.rows[1].height = 35;
    // row2
    data.rows[2].height = 50;
    // row3
    data.rows[3].height = 'name';
    data.rows[3].name = 'This is long text. This is long text. This is long text. This is long text.';
    // row21
    data.rows[4].height = 'no-define-key';
    // row22
    data.rows[5].height = null;


    before(function() {
        container = createContainer('500px', '500px');
        grid = new Grid(container);
    });
    after(function() {
        grid.destroy();
        grid = null;
        container.remove();
        container = null;
    });

    it('Grid default row height', async () => {

        grid.setData(data);
        grid.setOption({
            frozenRow: 1
        });
        grid.render();
        await delay();

        assert.equal(grid.getRowItem('total').tg_height, 30);
        assert.equal(container.querySelector('.tg-row[row="0"]').style.height, '30px');

        assert.equal(grid.getRowItem('row1').tg_height, 35);
        assert.equal(container.querySelector('.tg-row[row="1"]').style.height, '35px');

        assert.equal(typeof grid.getRowItem('row11').tg_height, 'undefined');
        // if default row height will be empty
        assert.equal(container.querySelector('.tg-row[row="2"]').style.height, '');

        assert.equal(grid.getRowItem('row2').tg_height, 50);
        assert.equal(container.querySelector('.tg-row[row="4"]').style.height, '50px');

        // id row3, index is 5
        assert.equal(typeof grid.getRowItem('row3').tg_height, 'undefined');
        assert.equal(container.querySelector('.tg-row[row="5"]').style.height, '');

        assert.equal(typeof grid.getRowItem('row21').tg_height, 'undefined');
        assert.equal(typeof grid.getRowItem('row22').tg_height, 'undefined');

    });

    it('Grid setRowHeight', async () => {
        grid.setRowHeight();
        grid.setRowHeight([]);

        grid.setRowHeight('total', 50);
        await delay();
        assert.equal(grid.getRowItem('total').tg_height, 50);
        assert.equal(container.querySelector('.tg-row[row="0"]').style.height, '50px');

        grid.setRowHeight('total');
        await delay();
        assert.equal(grid.getRowItem('total').tg_height, grid.options.rowHeight);
        assert.equal(container.querySelector('.tg-row[row="0"]').style.height, '');

        grid.setRowHeight('row2', 35);
        await delay();
        assert.equal(grid.getRowItem('row2').tg_height, 35);
        assert.equal(container.querySelector('.tg-row[row="4"]').style.height, '35px');

        grid.setRowHeight('row2', 35);
        await delay();
        assert.equal(grid.getRowItem('row2').tg_height, 35);

        grid.setRowHeight(['row2', 'row3'], 30);
        await delay();
        assert.equal(grid.getRowItem('row2').tg_height, 30);
        assert.equal(container.querySelector('.tg-row[row="4"]').style.height, '30px');
        assert.equal(grid.getRowItem('row3').tg_height, grid.options.rowHeight);
        assert.equal(container.querySelector('.tg-row[row="5"]').style.height, '');

        grid.setRowHeight(['row2', 'row3'], [25, 26]);
        await delay();
        assert.equal(grid.getRowItem('row2').tg_height, 25);
        assert.equal(container.querySelector('.tg-row[row="4"]').style.height, '25px');
        assert.equal(grid.getRowItem('row3').tg_height, 26);
        assert.equal(container.querySelector('.tg-row[row="5"]').style.height, '26px');

    });

});
