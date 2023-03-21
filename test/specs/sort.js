import { Grid, $ } from '../../src/index.js';
/* eslint-disable max-lines-per-function */
describe('Row sort', function() {

    let container;
    let grid;

    const getData = function() {
        return {
            'columns': [{
                'id': 'name',
                'name': 'Name',
                'width': 180,
                'type': 'tree'
            }, {
                'id': 'string',
                'name': 'String',
                'type': 'string'
            }, {
                'id': 'number',
                'name': 'Number',
                'type': 'number'
            }, {
                'id': 'icon',
                'name': 'Icon',
                'type': 'icon'
            }, {
                'id': 'date',
                'name': 'Date',
                'width': 100,
                'type': 'date'
            }, {
                'id': 'boolean',
                'name': 'Boolean',
                'type': 'boolean'
            }, {
                'id': 'custom',
                'name': 'Custom',
                'comparer': 'custom_comparer'
            }],
            'rows': [{
                'id': 'row1',
                'name': 'Name1',
                'string': 'string1',
                'number': '1',
                'icon': '1',
                'date': '2017-05-21',
                'boolean': true
            }, {
                'id': 'row2',
                'name': 'Name2',
                'string': 'string1',
                'number': '2',
                'icon': '2',
                'date': '2017-05-20'
            }, {
                'id': 'row3',
                'name': 'Name3',
                'string': 'string3',
                'number': '3',
                'date': '2017-05-21',
                'boolean': true
            }, {
                'id': 'row4',
                'name': 'Name4',
                'string': 'string3',
                'number': 4,
                'date': 'invalid date',
                'boolean': false
            }, {
                'id': 'row5',
                'name': 'Name5',
                'string': 'string3',
                'number': 5,
                'date': '1800-01-01',
                'boolean': 'string'
            }, {
                'id': 'row6',
                'name': 'Name6',
                'string': 'string6',

                // new Date("2017-05-21").getTime(); equal 2017-05-21
                'date': 1495324800000,

                'number': 6
            }, {
                'name': '(sortFixed: true)',
                'sortFixed': true
            }, {
                'name': 'sortFixed: top',
                'sortFixed': 'top'
            }]
        };
    };
    before(function() {
        container = $('<div/>').width(600).height(400).appendTo(document.body);
        grid = new Grid(container);
    });
    // after(function() {
    //     grid.destroy();
    //     grid = null;
    //     container.remove();
    //     container = null;
    // });

    const resetGrid = async (options = {}) => {
        grid.setOption(options);
        grid.setData(getData());
        grid.render();
        await delay();
    };


    it('Grid sort on init number', async () => {
        grid.setOption({
            sortOnInit: true,
            collapseAllOnInit: true,
            sortField: 'number',
            sortAsc: false
        });
        grid.setData(getData());
        grid.render();

        await delay();
        // check header sort bar
        const columnItem = grid.getColumnItem('number');
        const $node = $(grid.getColumnHeaderNode(columnItem));

        assert.equal($node.hasClass('tg-sort-desc'), true);

        // 0 for sort fixed top
        assert.equal(grid.getViewRows().map((it) => it.number).join(','), ',6,5,4,3,2,1,');
    });

    it('Grid click to sort number asc', async () => {

        let onSort = false;
        grid.once('onSort', function() {
            onSort = true;
        });

        // check header sort bar
        const columnItem = grid.getColumnItem('number');
        // click name to sort
        const $node = $(grid.getColumnHeaderNode(columnItem));
        $node.find('.tg-column-name').click();

        await delay();

        assert.equal(onSort, true);

        assert.equal($node.hasClass('tg-sort-asc'), true);
        assert.equal(grid.getViewRows().map((it) => it.number).join(','), ',1,2,3,4,5,6,');

    });

    it('Grid click to sort string', async () => {

        await resetGrid();
        // default order
        assert.equal(grid.getViewRows().map((it) => it.id).join(','), 'row1,row2,row3,row4,row5,row6,,');

        let onSort = false;
        grid.once('onSort', function() {
            onSort = true;
        });

        // check header sort bar
        const columnItem = grid.getColumnItem('string');
        // click name to sort
        const $node = $(grid.getColumnHeaderNode(columnItem));
        $node.find('.tg-column-name').click();

        await delay();

        assert.equal(onSort, true);

        assert.equal($node.hasClass('tg-sort-asc'), true);
        assert.equal(grid.getViewRows().map((it) => it.string).join(','), ',string1,string1,string3,string3,string3,string6,');
        assert.equal(grid.getViewRows().map((it) => it.id).join(','), ',row1,row2,row3,row4,row5,row6,');

        $node.find('.tg-column-name').click();
        await delay();

        assert.equal($node.hasClass('tg-sort-desc'), true);
        assert.equal(grid.getViewRows().map((it) => it.string).join(','), ',string6,string3,string3,string3,string1,string1,');
        assert.equal(grid.getViewRows().map((it) => it.id).join(','), ',row6,row3,row4,row5,row1,row2,');

    });

    it('Grid click to sort date', async () => {

        let onSort = false;
        grid.once('onSort', function() {
            onSort = true;
        });

        // check header sort bar
        const columnItem = grid.getColumnItem('date');
        // click name to sort
        const $node = $(grid.getColumnHeaderNode(columnItem));
        $node.find('.tg-column-name').click();
        await delay();

        assert.equal(onSort, true);

        assert.equal($node.hasClass('tg-sort-asc'), true);
        assert.equal(grid.getViewRows().map((it) => it.date).join(','), ',invalid date,1800-01-01,2017-05-20,2017-05-21,2017-05-21,1495324800000,');
        assert.equal(grid.getViewRows().map((it) => it.id).join(','), ',row4,row5,row2,row1,row3,row6,');

        $node.find('.tg-column-name').click();
        await delay();

        assert.equal($node.hasClass('tg-sort-desc'), true);
        assert.equal(grid.getViewRows().map((it) => it.date).join(','), ',2017-05-21,2017-05-21,1495324800000,2017-05-20,1800-01-01,invalid date,');
        assert.equal(grid.getViewRows().map((it) => it.id).join(','), ',row1,row3,row6,row2,row5,row4,');

    });

    it('Grid click to sort boolean', async () => {

        let onSort = false;
        grid.once('onSort', function() {
            onSort = true;
        });

        // check header sort bar
        const columnItem = grid.getColumnItem('boolean');
        // click name to sort
        const $node = $(grid.getColumnHeaderNode(columnItem));
        $node.find('.tg-column-name').click();
        await delay();

        assert.equal(onSort, true);

        assert.equal($node.hasClass('tg-sort-asc'), true);
        assert.equal(grid.getViewRows().map((it) => it.boolean).join(','), ',string,false,true,true,,,');
        assert.equal(grid.getViewRows().map((it) => it.id).join(','), ',row5,row4,row1,row3,row2,row6,');

        $node.find('.tg-column-name').click();
        await delay();

        // all value is true, should no change
        assert.equal($node.hasClass('tg-sort-desc'), true);
        assert.equal(grid.getViewRows().map((it) => it.boolean).join(','), ',true,true,false,string,,,');
        assert.equal(grid.getViewRows().map((it) => it.id).join(','), ',row1,row3,row4,row5,row2,row6,');

    });


    it('Grid click to sort icon/blank string/stable sort', async () => {

        await resetGrid();
        // default order
        assert.equal(grid.getViewRows().map((it) => it.id).join(','), 'row1,row2,row3,row4,row5,row6,,');

        let onSort = false;
        grid.once('onSort', function() {
            onSort = true;
        });

        const columnItem = grid.getColumnItem('icon');
        const $node = $(grid.getColumnHeaderNode(columnItem));
        $node.find('.tg-column-name').click();

        await delay();


        assert.equal(onSort, true);

        assert.equal($node.hasClass('tg-sort-asc'), true);
        assert.equal(grid.getViewRows().map((it) => it.icon).join(','), ',1,2,,,,,');
        assert.equal(grid.getViewRows().map((it) => it.number).join(','), ',1,2,3,4,5,6,');

    });


    it('Grid click to sort sortBlankValueBottom = false, asc', async () => {

        await resetGrid({
            sortBlankValueBottom: false
        });
        // default order
        assert.equal(grid.getViewRows().map((it) => it.id).join(','), 'row1,row2,row3,row4,row5,row6,,');

        let onSort = false;
        grid.once('onSort', function() {
            onSort = true;
        });

        // check header sort bar
        const columnItem = grid.getColumnItem('icon');
        // click name to sort
        const $node = $(grid.getColumnHeaderNode(columnItem));
        $node.find('.tg-column-name').click();

        await delay();

        assert.equal(onSort, true);

        assert.equal($node.hasClass('tg-sort-asc'), true);
        assert.equal(grid.getViewRows().map((it) => it.icon).join(','), ',,,,,1,2,');
        assert.equal(grid.getViewRows().map((it) => it.number).join(','), ',3,4,5,6,1,2,');

    });


    it('Grid click to sort sortBlankValueBottom = false, desc', async () => {

        let onSort = false;
        grid.once('onSort', function() {
            onSort = true;
        });

        // check header sort bar
        const columnItem = grid.getColumnItem('icon');
        // click name to sort
        const $node = $(grid.getColumnHeaderNode(columnItem));
        $node.find('.tg-column-name').click();

        await delay();

        assert.equal(onSort, true);

        assert.equal($node.hasClass('tg-sort-desc'), true);
        assert.equal(grid.getViewRows().map((it) => it.icon).join(','), ',2,1,,,,,');
        assert.equal(grid.getViewRows().map((it) => it.number).join(','), ',2,1,3,4,5,6,');

    });

    it('Grid click to sort custom comparer (inverted)', async () => {

        let onSort = false;
        grid.once('onSort', function() {
            onSort = true;
        });

        // reset order
        grid.setData(getData());
        grid.setOption({
            sortComparers: {
                custom_comparer: function(a, b, o) {
                    // console.log('custom', a, b, o);
                    o.sortField = 'number';
                    const valueComparer = this.getDefaultComparer('value');
                    return valueComparer(a, b, o, function(av, bv) {
                        return av - bv;
                    });
                }
            }
        });

        grid.render();

        await delay();

        // check header sort bar
        const columnItem = grid.getColumnItem('custom');

        grid.scrollToColumn(columnItem);

        // click name to sort
        const $node = $(grid.getColumnHeaderNode(columnItem));
        $node.find('.tg-column-name').click();

        await delay();

        assert.equal(onSort, true);

        assert.equal($node.hasClass('tg-sort-asc'), true);
        assert.equal(grid.getViewRows().map((it) => it.number).join(','), ',6,5,4,3,2,1,');

    });


    it('Grid Comparers', function(done) {

        const list = [{
            name: 'undefined1'
        }, {
            name: 'number1',
            number: 1
        }, {
            name: 'string2',
            number: '2'
        }, {
            name: 'empty',
            number: ''
        }, {
            name: 'null',
            number: null
        }, {
            name: 'number2',
            number: 2
        }, {
            name: 'undefined2'
        }, {
            name: 'string3',
            number: '3'
        }];

        // create tg_index required
        list.forEach((item, i) => {
            item.tg_index = i;
        });

        const Comparers = grid.options.sortComparers;

        list.sort(function(a, b) {
            return Comparers.number(a, b, {
                // sortAsc true
                sortFactor: -1,
                // sortBlankValueBottom true
                sortBlankFactor: 1,
                sortField: 'number'
            }, []);
        });

        const str = list.map((item) => item.name).join(',');
        // console.log(str);
        assert.equal(str, 'empty,string2,string3,number1,number2,undefined1,null,undefined2');

        done();
    });
});
