import { Grid, $ } from '../../src/index.js';
import Data from '../data/data.js';
describe('Row add/delete', function() {

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

    it('Grid row add init', (done) => {
        grid.setData(data);
        grid.once('onFirstUpdated', () => {
            const prevLen = grid.getRows().length;
            assert.ok(prevLen);
            done();
        });
        grid.render();
    });


    it('Grid row addRow normal', async () => {
        const prevLen = grid.getRows().length;
        grid.addRow({
            id: 'add_1',
            name: 'Add Name'
        });
        await delay();
        const rows = grid.getRows();
        assert.equal(rows.length, prevLen + 1);
    });

    it('Grid row addRow empty', async () => {
        const prevLen = grid.getRows().length;
        grid.addRow();
        await delay();
        const rowsAddNothing = grid.getRows();
        assert.equal(rowsAddNothing.length, prevLen);
    });

    it('Grid row addRow string', async () => {
        const prevLen = grid.getRows().length;
        grid.addRow('Name');
        await delay();
        const rowsAddNothing = grid.getRows();
        assert.equal(rowsAddNothing.length, prevLen + 1);
    });

    it('Grid row addRow null and 0', async () => {
        const prevLen = grid.getRows().length;
        grid.addRow([null, 0]);
        await delay();
        const rowsAddNothing = grid.getRows();
        assert.equal(rowsAddNothing.length, prevLen + 2);
    });

    it('Grid row addRow 2', async () => {
        const prevLen = grid.getRows().length;
        grid.addRow({
            id: 'add_2',
            name: 'Add Name'
        });
        await delay();
        const rows = grid.getRows();
        assert.equal(rows.length, prevLen + 1);
    });

    it('Grid row addRow 3,4', async () => {
        const prevLen = grid.getRows().length;
        grid.addRow([{
            id: 'add_3',
            name: 'Add Name'
        }, {
            id: 'add_4',
            name: 'Add Name'
        }]);
        await delay();
        const rows = grid.getRows();
        assert.equal(rows.length, prevLen + 2);
    });

    it('Grid row addRow To row with subs', async () => {
        const prevLen = grid.getRows().length;
        const prevSubLen = grid.getRowItem(0).subs.length;
        grid.addRow({
            id: 'add_sub_1',
            name: 'Add Name'
        }, 0);
        await delay();
        const rows = grid.getRows();
        assert.equal(rows.length, prevLen);
        assert.equal(grid.getRowItem(0).subs.length, prevSubLen + 1);
    });

    it('Grid row addRow To row without subs', async () => {
        const prevLen = grid.getRows().length;
        const prevSubs = grid.getRowItem('add_1').subs;
        assert.equal(typeof prevSubs, 'undefined');
        grid.addRow({
            id: 'add_sub_2',
            name: 'Add Name'
        }, 'add_1');
        await delay();
        const rows = grid.getRows();
        assert.equal(rows.length, prevLen);
        assert.equal(grid.getRowItem('add_1').subs.length, 1);
    });

    it('Grid row addRow To invalid row', async () => {
        const prevLen = grid.getRows().length;
        grid.addRow({
            id: 'add_sub_3',
            name: 'Add Name'
        }, 'add_1_invalid');
        await delay();
        const rows = grid.getRows();
        assert.equal(rows.length, prevLen);
    });

    // =================================================================================

    it('Grid row deleteRow', async () => {
        const prevLen = grid.getRows().length;
        grid.deleteRow('add_1');
        await delay();
        const rowsDel = grid.getRows();
        assert.equal(rowsDel.length, prevLen - 1);
    });

    it('Grid row deleteRow list', async () => {
        const prevLen = grid.getRows().length;
        grid.deleteRow(['add_2', 'add_3', 'add_invalid']);
        await delay();
        const rowsDel = grid.getRows();
        assert.equal(rowsDel.length, prevLen - 2);
    });

    it('Grid row deleteRow empty', async () => {
        const prevLen = grid.getRows().length;
        grid.deleteRow(['add_invalid']);
        await delay();
        const rowsDel = grid.getRows();
        assert.equal(rowsDel.length, prevLen);
    });

    it('Grid row deleteRow invisible or collapsed', async () => {
        const prevLen = grid.getRowsLength();
        const prevTotalLen = grid.getRowsLength(true);
        // no invisible equal
        assert.equal(prevLen, prevTotalLen);
        // add invisible row
        grid.addRow({
            id: 'parent_row',
            name: 'parent_row',
            subs: [{
                id: 'sub_row_invisible',
                name: 'sub_row_invisible',
                invisible: true
            }, {
                id: 'sub_row',
                name: 'sub_row'
            }, {
                id: 'sub_row_collapsed',
                name: 'sub_row_collapsed'
            }]
        });
        // add 4 but 1 invisible
        await delay();
        assert.equal(grid.getRowsLength(true), prevTotalLen + 4);
        assert.equal(grid.getRowsLength(), prevLen + 3);

        // remove a sub row
        grid.deleteRow('sub_row');
        await delay();
        assert.equal(grid.getRowsLength(true), prevTotalLen + 3);
        assert.equal(grid.getRowsLength(), prevLen + 2);

        // collapsed and remove a sub row
        grid.collapseRow('parent_row');
        await delay();
        assert.equal(grid.getRowsLength(), prevLen + 1);

        await delay();
        grid.deleteRow('sub_row_collapsed');
        await delay();
        assert.equal(grid.getRowsLength(true), prevTotalLen + 2);
        assert.equal(grid.getRowsLength(), prevLen + 1);

        // collapsed and remove a sub invisible row
        grid.deleteRow('sub_row_invisible');
        await delay();
        assert.equal(grid.getRowsLength(true), prevTotalLen + 1);
        assert.equal(grid.getRowsLength(), prevLen + 1);

    });

    // =================================================================================

    it('Grid row onRowAdded', function(done) {
        const id = Math.round(Math.random() * 100);

        grid.once('onRowAdded', function(e, d) {
            assert.equal(d[0].id, id);
            done();
        });

        grid.addRow({
            id: id,
            name: `Row ${id}`
        });
    });

    it('Grid row onRowRemoved', function(done) {
        const id = Math.round(Math.random() * 100);

        grid.once('onRowRemoved', function(e, d) {
            assert.equal(d[0].id, id);
            done();
        });

        grid.once('onRowAdded', function(e, d) {
            grid.deleteRow({
                id: id
            });
        });

        grid.addRow({
            id: id,
            name: `Row ${id}`
        });
    });

});
