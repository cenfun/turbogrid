import { Grid } from '../../src/index.js';
import Data from '../data/data.js';
import { createContainer } from '../data/helper.js';

describe('Rows', function() {
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

    it('Grid row filter', async () => {
        grid.setFormatter({});
        grid.setData(data);
        grid.setOption({
            rowFilter: function(rowItem) {
                if (rowItem.tg_group) {
                    return true;
                }
                return false;
            }
        });

        const len = data.rows.length;
        grid.render();

        await delay();

        const rowsData = grid.getRows();
        assert.equal(rowsData.length, len);

        //only one group left
        const rows = grid.getViewRows();
        assert.equal(rows.length, 1);

    });

    it('Grid row setRowHover', function() {
        grid.setRowHover(0, true);
        const rowNode = container.querySelector('.tg-row[row="0"]');
        assert.equal(rowNode.classList.contains('tg-hover'), true);
        grid.setRowHover(0, false);
        assert.equal(rowNode.classList.contains('tg-hover'), false);
    });

    it('Grid row hover', async () => {

        //remove previous
        grid.destroy();

        grid = new Grid(container);
        grid.setOption({});
        grid.setData(data);
        grid.render();

        await delay();

        //only one row, because row filter group
        const node = container.querySelector('.tg-row[row="0"]');

        node.dispatchEvent(new MouseEvent('mouseenter'));

        assert.equal(node.classList.contains('tg-hover'), true);

        node.dispatchEvent(new MouseEvent('mouseleave'));

        assert.equal(node.classList.contains('tg-hover'), false);

    });

    it('Grid row setRows invalid', async () => {
        grid.setRows(null);

        await delay();

        assert.equal(grid.getRows().length, 1);
        assert.ok(grid.getRowItem(0));
    });

    it('Grid row setRows empty', async () => {
        grid.setRows();
        await delay();

        assert.equal(grid.getRows().length, 0);
    });

    it('Grid row setRows normal', async () => {

        grid.setRows([{
            id: 'row1',
            name: 'Row1'
        }]);
        await delay();

        assert.equal(grid.getRows().length, 1);
    });

    it('Grid row setRowSubs', async () => {
        grid.setRowSubs('row1', [{
            id: 'sub1',
            name: 'sub1'
        }]);
        await delay();

        assert.equal(grid.getRowItem('row1').subs.length, 1);
    });

    it('Grid row set invalid Row Subs', () => {
        grid.setRowSubs('row_invalid', [{
            id: 'sub1',
            name: 'sub1'
        }]);
        assert.equal(grid.getRowItem('row_invalid'), null);
    });

});
