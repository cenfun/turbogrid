import { Grid, $ } from '../../src/index.js';

describe('Cell', function() {

    let container;
    let grid;

    const sampleData = {
        columns: [{
            id: 'name',
            name: 'Name'
        }, {
            id: 'value',
            name: 'Value'
        }],
        rows: [{
            name: 'row1',
            value: 'value1',
            name_background: '#ff0000'
        }, {
            name: 'row2',
            value: 'value2'
        }]
    };

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

    it('Grid cell content (NOT String) formatter', function(done) {
        grid.setFormatter({
            content: function(v) {
                const elem = document.createElement('div');
                elem.innerHTML = `name${v}`;
                return elem;
            },
            contentList: function(v) {
                const elem1 = document.createElement('div');
                elem1.innerHTML = `1${v}`;
                const elem2 = document.createElement('div');
                elem2.innerHTML = `2${v}`;
                return [elem1, elem2, ''];
            }
        });
        sampleData.columns[0].formatter = 'content';
        sampleData.columns[1].formatter = 'contentList';
        grid.setData(sampleData);

        grid.once('onFirstUpdated', function() {

            let cellNode = this.getCellNode(0, 0);
            assert.equal(cellNode.innerText, 'namerow1');

            cellNode = this.getCellNode(0, 1);
            assert.equal(cellNode.innerText, '1value1\n2value1');

            done();
        });
        grid.render();
    });


    it('Grid updateRow', async () => {

        grid.updateRow(100);
        await delay(10);
        assert.equal(grid.getCellNode(0, 0).innerText, 'namerow1');
        assert.equal(grid.getCellNode(0, 1).innerText, '1value1\n2value1');

        grid.updateRow(0);
        await delay(10);
        assert.equal(grid.getCellNode(0, 0).innerText, 'namerow1');
        assert.equal(grid.getCellNode(0, 1).innerText, '1value1\n2value1');

        grid.updateRow(0, {
            name: 'new-name',
            value: 'new-value'
        });
        await delay(10);
        assert.equal(grid.getCellNode(0, 0).innerText, 'namenew-name');
        assert.equal(grid.getCellNode(0, 1).innerText, '1new-value\n2new-value');

    });

    it('Grid updateCell', async () => {

        grid.updateCell(100);
        await delay(10);
        assert.equal(grid.getCellNode(0, 0).innerText, 'namenew-name');

        grid.updateCell(0, 100);
        await delay(10);
        assert.equal(grid.getCellNode(0, 0).innerText, 'namenew-name');

        grid.updateCell(0, 0, 'newname');
        await delay(10);
        assert.equal(grid.getCellNode(0, 0).innerText, 'namenewname');

    });

    it('Grid isEmptyGroup', function() {
        assert.equal(grid.isEmptyGroup(), false);
        assert.equal(grid.isEmptyGroup({
            tg_group: true,
            subs: []
        }), false);
        assert.equal(grid.isEmptyGroup({
            tg_group: true,
            subs: [],
            tg_subs_length: 0
        }), true);

    });

    it('Grid isRowLeaf', function() {
        assert.equal(grid.isRowLeaf(), false);

    });

    it('Grid isRowSelectable', function() {
        assert.equal(grid.isRowSelectable(), false);
        assert.equal(grid.isRowSelectable({
            selectable: true
        }), true);
        assert.equal(grid.isRowSelectable({
            selectable: false
        }), false);

    });

    it('Grid forEachColumn', function() {

        let str = '';
        grid.forEachColumn(function(item) {
            str += item.name;
        });

        assert.equal(str, 'NameValue');

    });
});
