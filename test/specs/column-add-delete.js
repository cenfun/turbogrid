import { Grid, $ } from '../../src/index.js';
import Data from '../data/data.js';
describe('Column add/delete', function() {

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

    it('Grid column add init', (done) => {
        grid.setData(data);
        grid.once('onFirstUpdated', () => {
            const prevLen = grid.getColumns().length;
            assert.ok(prevLen);
            done();
        });
        grid.render();
    });


    it('Grid column addColumn normal', async () => {
        const prevLen = grid.getColumns().length;
        grid.addColumn({
            id: 'add_1',
            name: 'Add Name'
        });
        await delay();
        const columns = grid.getColumns();
        assert.equal(columns.length, prevLen + 1);
        assert.equal(grid.getScrollLeft(), 552);
    });

    it('Grid column addColumn empty', async () => {
        const prevLen = grid.getColumns().length;
        grid.addColumn();
        await delay();
        const columnsAddNothing = grid.getColumns();
        assert.equal(columnsAddNothing.length, prevLen);
        assert.equal(grid.getScrollLeft(), 552);
    });

    it('Grid column addColumn string', async () => {
        const prevLen = grid.getColumns().length;
        grid.addColumn('Name');
        await delay();
        const columnsAddNothing = grid.getColumns();
        assert.equal(columnsAddNothing.length, prevLen + 1);
        //column width 81 + 622 = 630
        assert.equal(grid.getScrollLeft(), 633);
    });

    it('Grid column addColumn null and 0', async () => {
        const prevLen = grid.getColumns().length;
        grid.addColumn([null, 0]);
        await delay();
        const columnsAddNothing = grid.getColumns();
        assert.equal(columnsAddNothing.length, prevLen + 2);
    });

    it('Grid column addColumn', async () => {
        const prevLen = grid.getColumns().length;
        grid.addColumn({
            id: 'add_2',
            name: 'Add Name'
        });
        await delay();
        const columns = grid.getColumns();
        assert.equal(columns.length, prevLen + 1);
    });

    it('Grid column addColumn list', async () => {
        const prevLen = grid.getColumns().length;
        grid.addColumn([{
            id: 'add_3',
            name: 'Add Name'
        }, {
            id: 'add_4',
            name: 'Add Name'
        }]);
        await delay();
        const columns = grid.getColumns();
        assert.equal(columns.length, prevLen + 2);
    });

    it('Grid column addColumn To column with subs', async () => {
        const prevLen = grid.getColumns().length;
        grid.addColumn({
            id: 'add_sub_1',
            name: 'Add Name'
        }, 0);
        await delay();
        const columns = grid.getColumns();
        //console.log(columns);
        assert.equal(columns.length, prevLen);
        //index 0 is name, but change to group, the index not 0 anymore
        assert.equal(grid.getColumnItem('name').subs.length, 1);
    });

    it('Grid column addColumn To column without subs', async () => {
        const prevLen = grid.getColumns().length;
        const prevSubs = grid.getColumnItem('add_1').subs;
        assert.equal(typeof prevSubs, 'undefined');
        grid.addColumn({
            id: 'add_sub_2',
            name: 'Add Name'
        }, 'add_1');
        await delay();
        const columns = grid.getColumns();
        assert.equal(columns.length, prevLen);
        assert.equal(grid.getColumnItem('add_1').subs.length, 1);
    });

    it('Grid column addColumn invalid column', async () => {
        const prevLen = grid.getColumns().length;
        grid.addColumn({
            id: 'add_sub_3',
            name: 'Add Name'
        }, 'add_1_invalid');
        await delay();
        const columns = grid.getColumns();
        assert.equal(columns.length, prevLen);
    });

    //=================================================================================

    it('Grid column deleteColumn', async () => {
        const prevLen = grid.getColumns().length;
        grid.deleteColumn('add_1');
        await delay();
        const columnsDel = grid.getColumns();
        assert.equal(columnsDel.length, prevLen - 1);
    });

    it('Grid column deleteColumn list', async () => {
        const prevLen = grid.getColumns().length;
        grid.deleteColumn(['add_2', 'add_3', 'add_invalid']);
        await delay();
        const columnsDel = grid.getColumns();
        assert.equal(columnsDel.length, prevLen - 2);
    });

    it('Grid column deleteColumn empty', async () => {
        const prevLen = grid.getColumns().length;
        grid.deleteColumn(['add_invalid']);
        await delay();
        const columnsDel = grid.getColumns();
        assert.equal(columnsDel.length, prevLen);
    });

    //=================================================================================

    it('Grid column onColumnAdded', function(done) {
        const id = Math.round(Math.random() * 100).toString();

        grid.once('onColumnAdded', function(e, d) {
            assert.equal(d[0].id, id);
            done();
        });

        grid.addColumn({
            id: id,
            name: `Column ${id}`
        });
    });

    it('Grid column onColumnRemoved', function(done) {
        const id = Math.round(Math.random() * 100).toString();

        grid.once('onColumnRemoved', function(e, d) {
            assert.equal(d[0].id, id);
            done();
        });

        grid.once('onColumnAdded', function(e, d) {
            assert.equal(d[0].id, id);
            grid.deleteColumn(id);
        });

        grid.addColumn({
            id: id,
            name: `Column ${id}`
        });
    });

});
