import { Grid, $ } from '../../src/index.js';
import Data from '../data/data.js';
describe('Column display', function() {

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

    it('Grid rendered', function(done) {
        grid.setData(data);
        grid.setOption({
            frozenRow: 0,
            frozenColumn: 0
        });
        grid.onNextUpdated(function() {
            done();
        });
        grid.render();
    });

    it('Grid setColumnWidth', function(done) {
        grid.setColumnWidth();
        grid.setColumnWidth(0, 280);
        const pwl = grid.paneWidthL;
        assert.equal(pwl, 280);
        done();
    });

    it('Grid hideColumn', async () => {
        const column = grid.getColumnItem(0);
        assert.equal(column.id, 'name');
        grid.hideColumn();
        assert(!column.invisible);
        grid.hideColumn(0);
        assert(column.invisible);
        await delay();

        assert.notEqual(grid.getHeaderItemNode(0).getAttribute('data'), 'name');

    });

    it('Grid hideColumn group', async () => {

        const column = grid.getColumnItem('subs');
        assert.equal(column.id, 'subs');
        assert(!column.invisible);

        grid.hideColumn('subs');
        assert(column.invisible);

        await delay();

        //view_index 10 out of list length
        assert(!grid.getHeaderItemNode('subs'));

        ['number', 'icon', 'date'].forEach((id) => {
            assert.notEqual(grid.getHeaderItemNode(id).getAttribute('data'), id);
        });

    });

    it('Grid showColumn', async () => {
        grid.showColumn();
        grid.showColumn(0);
        assert.equal(grid.getColumnItem(0).tg_width, 280);
        await delay();
        assert.equal(grid.getHeaderItemNode(0).getAttribute('data'), 'name');
    });

    it('Grid showColumn group', async () => {
        grid.showColumn('subs');
        assert.equal(grid.getColumnItem('subs').tg_width, 81 * 3);
        assert.equal(grid.getColumnItem('number').tg_width, 81);
        assert.equal(grid.getColumnItem('icon').tg_width, 81);
        assert.equal(grid.getColumnItem('date').tg_width, 81);
        await delay();

        assert.equal(grid.getHeaderItemNode('subs').getAttribute('data'), 'subs');
        ['number', 'icon', 'date'].forEach((id) => {
            assert.equal(grid.getHeaderItemNode(id).getAttribute('data'), id);
        });
    });

    it('Grid column 1 invisible=true', async () => {
        //remove previous
        grid.destroy();
        grid = new Grid(container);
        const column1 = data.columns[1];
        column1.invisible = true;
        grid.setData(data);
        grid.setOption({
            frozenRow: 0,
            frozenColumn: 0
        });
        grid.render();
        await delay();
        assert.notEqual(grid.getColumnHeaderNode(1).getAttribute('data'), column1.id);
    });


    it('Grid column width', async () => {
        grid.destroy();
        container.width(700);
        grid = new Grid(container);
        data.columns = [{
            id: 'name',
            name: 'Name',
            width: 100
        }, {
            id: 'c1',
            //103
            name: '1234567890 '
        }, {
            id: 'c2',
            name: '1234567890 1234567890 12345'
        }, {
            id: 'c3',
            name: '1234567890 1234567890 1234567890 1234567890 12345'
        }, {
            id: 'c4',
            name: '1234567890 1234567890 1234567890 1234567890 1234567890'
        }, {
            id: 'c5'
        }];
        const row = data.rows[0];
        row.name = '10px/char';
        row.c1 = '103/10 1 line';
        row.c2 = '133/10*2 2 lines';
        row.c3 = '163/10*3 3 lines';
        row.c4 = '163/10*4 4 lines';
        row.c5 = '81px min width';
        grid.setData(data);
        grid.render();
        await delay();

        assert.equal(grid.getColumnHeaderNode(grid.getColumnItem('c1')).style.width, '103px');
        assert.equal(grid.getColumnHeaderNode(grid.getColumnItem('c2')).style.width, '133px');
        assert.equal(grid.getColumnHeaderNode(grid.getColumnItem('c3')).style.width, '163px');
        assert.equal(grid.getColumnHeaderNode(grid.getColumnItem('c4')).style.width, '163px');
        assert.equal(grid.getColumnHeaderNode(grid.getColumnItem('c5')).style.width, '81px');
    });

});
