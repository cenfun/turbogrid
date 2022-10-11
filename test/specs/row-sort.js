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
                'id': 'value',
                'name': 'Value',
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
            }],
            'rows': [{
                'id': 'row1',
                'name': 'Name1',
                'value': '1',
                'number': '1',
                'icon': '1',
                'date': '2017-05-20'
            }, {
                'id': 'row2',
                'name': 'Name2',
                'value': '1',
                'number': '2',
                'icon': '2',
                'date': '2017-05-21'
            }, {
                'id': 'row3',
                'name': 'Name3',
                'value': '3',
                'number': '3',
                'date': '1817-05-22'
            }, {
                'id': 'row4',
                'name': 'Name4',
                'value': '3',
                'number': 4,
                'date': '2017-05-21'
            }, {
                'id': 'row5',
                'name': 'Name5',
                'value': '3',
                'number': 5,
                'date': '2017-05-21'
            }, {
                'id': 'row6',
                'name': 'Name6',
                'value': '6',
                'number': 6,
                'date': '1917-05-21'
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
        container = $('<div/>').width(500).height(200).appendTo(document.body);
        grid = new Grid(container);
    });
    after(function() {
        grid.destroy();
        grid = null;
        container.remove();
        container = null;
    });


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
        //check header sort bar
        const columnItem = grid.getColumnItem('number');
        const $node = $(grid.getColumnHeaderNode(columnItem));
        const hasClass = $node.hasClass('tg-sort-desc');
        assert.equal(hasClass, true);

        //0 for sort fixed top
        const numbers = grid.getViewRows().map((it) => it.number).join(',');
        assert.equal(numbers, ',6,5,4,3,2,1,');
    });

    it('Grid click to sort number asc', async () => {

        let onSort = false;
        grid.once('onSort', function() {
            onSort = true;
        });

        //check header sort bar
        const columnItem = grid.getColumnItem('number');
        //click name to sort
        const $node = $(grid.getColumnHeaderNode(columnItem));
        $node.find('.tg-column-name').click();

        await delay();

        assert.equal(onSort, true);

        //check header sort bar
        const hasClass = $node.hasClass('tg-sort-asc');
        assert.equal(hasClass, true);

        const numbers = grid.getViewRows().map((it) => it.number).join(',');
        assert.equal(numbers, ',1,2,3,4,5,6,');

    });

    it('Grid click to sort string', async () => {

        let onSort = false;
        grid.once('onSort', function() {
            onSort = true;
        });

        //check header sort bar
        const columnItem = grid.getColumnItem('value');
        //click name to sort
        const $node = $(grid.getColumnHeaderNode(columnItem));
        $node.find('.tg-column-name').click();

        await delay();

        assert.equal(onSort, true);

        const hasClass = $node.hasClass('tg-sort-desc');
        assert.equal(hasClass, true);


        const values = grid.getViewRows().map((it) => it.value).join(',');
        assert.equal(values, ',6,3,3,3,1,1,');

        const numbers = grid.getViewRows().map((it) => it.number).join(',');
        assert.equal(numbers, ',6,3,4,5,1,2,');

    });

    it('Grid click to sort date', async () => {

        let onSort = false;
        grid.once('onSort', function() {
            onSort = true;
        });

        //check header sort bar
        const columnItem = grid.getColumnItem('date');
        //click name to sort
        const $node = $(grid.getColumnHeaderNode(columnItem));
        $node.find('.tg-column-name').click();

        await delay();

        assert.equal(onSort, true);

        //check header sort bar
        const hasClass = $node.hasClass('tg-sort-desc');
        assert.equal(hasClass, true);

        const dates = grid.getViewRows().map((it) => it.date).join(',');
        assert.equal(dates, ',2017-05-21,2017-05-21,2017-05-21,2017-05-20,1917-05-21,1817-05-22,');

        const numbers = grid.getViewRows().map((it) => it.number).join(',');
        assert.equal(numbers, ',2,4,5,1,6,3,');


    });


    it('Grid click to sort icon/blank value/stable sort', async () => {

        let onSort = false;
        grid.once('onSort', function() {
            onSort = true;
        });

        //reset order
        grid.setData(getData());
        grid.setOption({
            collapseAllOnInit: true
        });

        grid.render();

        await delay();

        const columnItem = grid.getColumnItem('icon');
        const $node = $(grid.getColumnHeaderNode(columnItem));
        $node.find('.tg-column-name').click();

        await delay();


        assert.equal(onSort, true);

        //check header sort bar
        const hasClass = $node.hasClass('tg-sort-asc');
        assert.equal(hasClass, true);


        const icons = grid.getViewRows().map((it) => it.icon).join(',');
        assert.equal(icons, ',1,2,,,,,');

        const numbers = grid.getViewRows().map((it) => it.number).join(',');
        assert.equal(numbers, ',1,2,3,4,5,6,');

    });


    it('Grid click to sort sortBlankValueBottom = false, asc', async () => {

        let onSort = false;
        grid.once('onSort', function() {
            onSort = true;
        });

        //reset order
        grid.setData(getData());
        grid.setOption({
            sortBlankValueBottom: false,
            collapseAllOnInit: true
        });

        grid.render();

        await delay();

        //check header sort bar
        const columnItem = grid.getColumnItem('icon');
        //click name to sort
        const $node = $(grid.getColumnHeaderNode(columnItem));
        $node.find('.tg-column-name').click();

        await delay();

        assert.equal(onSort, true);

        const hasClass = $node.hasClass('tg-sort-asc');
        assert.equal(hasClass, true);

        //check row order

        const icons = grid.getViewRows().map((it) => it.icon).join(',');
        assert.equal(icons, ',,,,,1,2,');

        const numbers = grid.getViewRows().map((it) => it.number).join(',');
        assert.equal(numbers, ',3,4,5,6,1,2,');

    });


    it('Grid click to sort sortBlankValueBottom = false, desc', async () => {

        let onSort = false;
        grid.once('onSort', function() {
            onSort = true;
        });

        //check header sort bar
        const columnItem = grid.getColumnItem('icon');
        //click name to sort
        const $node = $(grid.getColumnHeaderNode(columnItem));
        $node.find('.tg-column-name').click();

        await delay();

        assert.equal(onSort, true);

        const hasClass = $node.hasClass('tg-sort-desc');
        assert.equal(hasClass, true);


        const icons = grid.getViewRows().map((it) => it.icon).join(',');
        assert.equal(icons, ',2,1,,,,,');

        const numbers = grid.getViewRows().map((it) => it.number).join(',');
        assert.equal(numbers, ',2,1,3,4,5,6,');

    });


    it('Grid Comparers', function(done) {

        const list = [{
            name: '1'
        }, {
            name: '2',
            number: 1
        }, {
            name: '3',
            number: '2'
        }, {
            name: '4',
            number: ''
        }, {
            name: '5',
            number: ''
        }, {
            name: '6',
            number: 2
        }, {
            name: '7'
        }, {
            name: '8',
            number: '3'
        }];

        const Comparers = grid.option.sortComparers;

        list.sort(function(a, b) {
            return Comparers.number(a, b, {
                sortFactor: -1,
                sortBlankFactor: 1,
                sortField: 'number'
            }, []);
        });

        const str = list.map((item) => item.name).join('');
        console.log(str);
        assert.equal(str, '38265471');

        done();
    });
});
