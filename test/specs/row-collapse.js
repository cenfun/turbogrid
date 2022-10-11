import { Grid } from '../../src/index.js';
import Data from '../data/data.js';
import { createContainer } from '../data/helper.js';

describe('Row collapse', function() {

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

    it('Grid option collapseAllOnInit', async () => {
        grid.setOption({
            collapseAllOnInit: true
        });

        //more level data
        data.rows[0].subs[0].subs = JSON.parse(JSON.stringify(data.rows[0].subs));


        grid.setData(data);
        grid.render();
        await delay();
        const rowItem = grid.getRowItem('row1');
        assert.equal(rowItem.collapsed, true);
    });

    it('Grid toggleAllRows()', async () => {
        grid.toggleAllRows();
        await delay();
        const rowItem = grid.getRowItem('row1');
        assert.equal(rowItem.collapsed, false);
    });

    it('Grid collapseAllRows()', async () => {
        grid.collapseAllRows();
        await delay();
        const rowItem = grid.getRowItem('row1');
        assert.equal(rowItem.collapsed, true);
    });

    it('Grid toggleRow()', async () => {
        grid.toggleRow('row1');
        await delay();
        const rowItem = grid.getRowItem('row1');
        assert.equal(rowItem.collapsed, false);
    });

    it('Grid collapseRow()', async () => {
        grid.collapseRow('row1');
        await delay();
        const rowItem = grid.getRowItem('row1');
        assert.equal(rowItem.collapsed, true);
    });

    it('Grid expandAllRows()', async () => {
        grid.expandAllRows();
        await delay();
        const rowItem = grid.getRowItem('row1');
        assert.equal(rowItem.collapsed, false);
    });

    it('Grid expandRowLevel()', async () => {
        grid.expandRowLevel(0);
        await delay();
        assert.equal(grid.getRowItem('row1').collapsed, false);

        grid.collapseAllRows();
        await delay();
        assert.equal(grid.getRowItem('row1').collapsed, true);

        grid.expandRowLevel(0);
        await delay();
        assert.equal(grid.getRowItem('row1').collapsed, false);
    });

    it('Grid header tg-tree-icon-all', async () => {
        grid.expandAllRows();
        await delay();
        const icon = grid.find('.tg-tree-icon-all');
        icon.click();
        await delay();
        const rowItem = grid.getRowItem('row1');
        assert.equal(rowItem.collapsed, true);
    });

    it('Grid row item tg-tree-icon', async () => {
        const icon = container.querySelector('.tg-row[row="0"]').querySelector('.tg-tree-icon');
        icon.click();
        await delay();
        const rowItem = grid.getRowItem('row1');
        assert.equal(rowItem.collapsed, false);
    });

    it('Grid row collapse triggers event', async () => {

        const icon = container.querySelector('.tg-row[row="0"]').querySelector('.tg-tree-icon');
        icon.click();
        await delay();

        const d = grid.getRowItem('row1');
        assert.equal(d.id, 'row1');
        assert.equal(d.collapsed, true);
    });

    it('Grid row expand triggers event', async () => {

        const icon = container.querySelector('.tg-row[row="0"]').querySelector('.tg-tree-icon');
        // collapse
        icon.click();
        await delay();
        // expand
        icon.click();
        await delay();

        const d = grid.getRowItem('row1');
        assert.equal(d.id, 'row1');
        assert.equal(d.collapsed, false);


    });
});
