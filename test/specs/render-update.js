import { Grid, $ } from '../../src/index.js';

describe('Render update', function() {

    let container;
    let grid;

    const data = {
        'columns': [{
            id: 'id'
        }, {
            'id': 'c1',
            'type': 'string',
            'name': 'Column Name 1'
        }],
        'rows': [{
            'id': 'id0',
            'state': 'loaded',
            'c1': 'asdf',
            'selected': false,
            'rendered': true,
            'focused': true
        }, {
            'id': 'id1',
            'state': 'loaded',
            'c1': 'asdf',
            'selected': false,
            'rendered': true,
            'focused': false
        }, {
            'id': 'id2',
            'state': 'loaded',
            'c1': 'asdf',
            'selected': false,
            'rendered': true,
            'focused': false
        }, {
            'id': 'id3',
            'state': 'loaded',
            'c1': 'asdf',
            'selected': false,
            'rendered': true,
            'focused': false
        }, {
            'id': 'id4',
            'state': 'loaded',
            'c1': 'asdf',
            'selected': false,
            'rendered': true,
            'focused': false
        }, {
            'id': 'id5',
            'state': 'loaded',
            'c1': 'asdf',
            'selected': false,
            'rendered': true,
            'focused': false
        }, {
            'id': 'id6',
            'state': 'loaded',
            'c1': 'asdf',
            'selected': false,
            'rendered': true,
            'focused': false
        }, {
            'id': 'id7',
            'state': 'loaded',
            'c1': 'asdf',
            'selected': false,
            'rendered': true,
            'focused': false
        }, {
            'id': 'id8',
            'state': 'loaded',
            'c1': 'asdf',
            'selected': false,
            'rendered': true,
            'focused': false
        }, {
            'id': 'id9',
            'state': 'loaded',
            'c1': 'asdf',
            'selected': false,
            'rendered': true,
            'focused': false
        }]
    };
    before(function() {
        container = $('<div/>').width(500).height(500).appendTo(document.body);
        grid = new Grid(container);
    });
    after(function() {
        grid.destroy();
        grid = null;
        container.remove();
        container = null;
    });


    it('render', async () => {
        grid.setData(data);
        grid.render();
        await delay();
        const elemRow = document.querySelectorAll('.tg-row');
        assert.equal(elemRow.length, 10);
    });

    it('update', async () => {

        //cache DOMs
        const headerNode = document.querySelector(".tg-header-item[column='0']");
        const rowNode = document.querySelector(".tg-row[row='0']");

        assert(headerNode);
        assert(rowNode);

        grid.update();
        await delay();

        const headerNodeNew = document.querySelector(".tg-header-item[column='0']");
        const rowNodeNew = document.querySelector(".tg-row[row='0']");

        assert(headerNodeNew);
        assert(rowNodeNew);

        assert.equal(headerNode, headerNodeNew);

        assert.notEqual(rowNode, rowNodeNew);
    });

    it('rerender', async () => {

        //cache DOMs
        const headerNode = document.querySelector(".tg-header-item[column='0']");
        const rowNode = document.querySelector(".tg-row[row='0']");

        assert(headerNode);
        assert(rowNode);

        grid.rerender();
        await delay();

        const headerNodeNew = document.querySelector(".tg-header-item[column='0']");
        const rowNodeNew = document.querySelector(".tg-row[row='0']");

        assert(headerNodeNew);
        assert(rowNodeNew);

        assert.notEqual(headerNode, headerNodeNew);

        assert.notEqual(rowNode, rowNodeNew);
    });

});
