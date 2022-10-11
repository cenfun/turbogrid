import { Grid } from '../../src/index.js';
import Data from '../data/data.js';
import { createContainer } from '../data/helper.js';

describe('Row select', function() {

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

    const getTotal = function(g) {
        let total = 0;
        g.forEachRow(function(row) {
            if (g.isRowSelectable(row)) {
                total += 1;
            }
        });
        return total;
    };

    it('Grid selectMultiple true', async () => {
        grid.setData(data);
        grid.setOption({
            selectMultiple: true,
            selectVisible: true
        });
        grid.render();

        await delay();

        //do NOT use 0, 0 is group, not selectable by default

        grid.setRowSelected(1);
        assert.equal(grid.getSelectedRows().length, 1);
        assert.equal(container.querySelector('.tg-row[row="1"]').classList.contains('tg-selected'), true);

        assert.equal(grid.getSelectedRow().tg_index, 1);

        grid.setRowSelected(3);
        assert.equal(grid.getSelectedRows().length, 2);


        grid.setRowSelected(2);
        assert.equal(grid.getSelectedRows().length, 3);

        grid.setRowSelected(1, false);
        assert.equal(grid.getSelectedRows().length, 2);
        assert.equal(container.querySelector('.tg-row[row="1"]').classList.contains('tg-selected'), false);

    });

    it('Grid selectMultiple true shiftKey', async () => {
        grid.setData(data);
        grid.setOption({
            selectAllOnInit: true,
            selectVisible: true
        });
        grid.render();
        await delay();

        assert.equal(grid.getSelectedRows().length, getTotal(grid));

        grid.selectAll(false);

        grid.setRowSelected(1, {});
        assert.equal(grid.getSelectedRows().length, 1);

        grid.setRowSelected(3, {
            shiftKey: true
        });
        assert.equal(grid.getSelectedRows().length, 3);

    });

    it('Grid selectAll', async () => {
        const total = getTotal(grid);

        grid.selectAll();
        await delay(10);
        assert.equal(grid.getSelectedRows().length, total);

        grid.selectAll(false);
        await delay(10);
        assert.equal(grid.getSelectedRows().length, 0);

        let $checkboxAll = container.querySelector('.tg-select-icon-all');
        assert($checkboxAll);

        $checkboxAll.click();
        await delay(10);
        assert.equal(grid.getSelectedRows().length, total);
        //assert.equal(checkboxAll.hasClass("tg-selected"), true);

        //will be recreated
        $checkboxAll = container.querySelector('.tg-select-icon-all');
        $checkboxAll.click();
        await delay(10);
        assert.equal(grid.getSelectedRows().length, 0);
        //assert.equal(checkboxAll.hasClass("tg-selected"), false);

        grid.setRowSelected(1);
        await delay(10);
        $checkboxAll = container.querySelector('.tg-select-icon-all');
        assert.equal($checkboxAll.classList.contains('tg-mixed'), true);

    });

    it('Grid single select', function(done) {
        grid.setData(data);
        grid.setOption({
            selectMultiple: false,
            selectVisible: true
        });
        grid.once('onFirstUpdated', function() {

            grid.setRowSelected(1);
            assert.equal(grid.getSelectedRows().length, 1);
            assert.equal(grid.getSelectedRow().tg_index, 1);

            grid.setRowSelected(3);
            assert.equal(grid.getSelectedRows().length, 1);
            assert.equal(grid.getSelectedRow().tg_index, 3);

            done();
        });
        grid.render();
    });


    it('Grid row item tg-select-icon', async () => {
        const rowNode = container.querySelector('.tg-row[row="1"]');
        const icon = rowNode.querySelector('.tg-select-icon');
        icon.click();
        await delay();

        assert.equal(grid.getSelectedRows().length, 1);
    });

    it('Grid checkbox width', function(done) {
        grid.setData(data);
        grid.setOption({
            selectVisible: true
        });
        grid.once('onFirstUpdated', function() {
            const checkboxHeader = container.querySelector('.tg-header-select');
            const width = checkboxHeader.clientWidth;
            assert.equal(width, 36);
            done();
        });
        grid.render();
    });


});
