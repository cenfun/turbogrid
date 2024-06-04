import { Grid } from '../../src/index.js';
import { createContainer } from '../data/helper.js';

const createData = function() {

    const rows = [];

    for (let i = 0; i < 20; i++) {
        rows.push({
            name: `Row${i}`,
            value: i,
            invisible: i === 15
        });
    }

    return {
        columns: [{
            id: 'name',
            name: 'Name'
        }, {
            id: 'value',
            name: 'Value'
        }],
        rows
    };
};

describe('rowFilter and rowFilteredSort (invisible 15)', function() {
    let container;
    let grid;
    let keywords;

    before(function() {
        container = createContainer('500px', '500px');
        grid = new Grid(container);
    });
    after(function() {
        grid.destroy();
        grid = null;
        container.remove();
        container = null;
    });

    it('Grid rowFilter with keywords: empty', async () => {
        keywords = '';

        const data = createData();
        grid.setData(data);
        grid.setOption({
            rowNotFound: 'No Results',
            rowFilter: function(rowItem) {
                if (rowItem.name.indexOf(keywords) !== -1) {
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

        const rows = grid.getViewRows();
        assert.equal(rows.length, len - 1);

        const values = grid.getViewRows().map((it) => it.value).join(',');
        assert.equal(values, '0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,16,17,18,19');

        const $elem = grid.find('.tg-body-message');
        assert.equal($elem.length, 1);
        assert.equal($elem.width(), 0);

    });

    it('Grid rowFilter with keywords: 1', async () => {
        keywords = '1';
        grid.update();
        await delay();

        // 19 include 1
        const rows = grid.getViewRows();
        assert.equal(rows.length, 10);

        const values = grid.getViewRows().map((it) => it.value).join(',');
        assert.equal(values, '1,10,11,12,13,14,16,17,18,19');

        const $elem = grid.find('.tg-body-message');
        assert.equal($elem.length, 1);
        assert.equal($elem.width(), 0);

    });

    it('Grid rowFilter with keywords: nothing matched', async () => {
        keywords = 'nothing matched';
        grid.update();
        await delay();

        const rows = grid.getViewRows();
        assert.equal(rows.length, 0);

        const values = grid.getViewRows().map((it) => it.value).join(',');
        assert.equal(values, '');

        const $elem = grid.find('.tg-body-message');
        assert.equal($elem.length, 1);
        assert.equal($elem.css('display'), 'block');
    });

    it('Grid rowFilteredSort: name, with keywords: 1', async () => {
        keywords = '1';

        const data = createData();
        grid.setData(data);
        grid.setOption({
            rowNotFound: 'No Results',
            rowFilter: function(rowItem) {
                if (rowItem.name.indexOf(keywords) !== -1) {
                    return true;
                }
                return false;
            },
            rowFilteredSort: 'name'
        });

        grid.render();

        await delay();

        const rows = grid.getViewRows();
        assert.equal(rows.length, 10);

        const values = grid.getViewRows().map((it) => it.value).join(',');
        assert.equal(values, '1,10,11,12,13,14,16,17,18,19');
    });


    it('Grid rowFilteredSort: function, sortAsc: false, with keywords: 1', async () => {
        keywords = '1';

        const data = createData();
        grid.setData(data);
        grid.setOption({
            rowNotFound: 'No Results',
            rowFilter: function(rowItem) {
                if (rowItem.name.indexOf(keywords) !== -1) {
                    return true;
                }
                return false;
            },
            rowFilteredSort: function() {
                return {
                    // id == sortField
                    id: 'name',
                    sortAsc: false
                };
            }
        });

        grid.render();

        await delay();

        const rows = grid.getViewRows();
        assert.equal(rows.length, 10);

        const values = grid.getViewRows().map((it) => it.value).join(',');
        assert.equal(values, '19,18,17,16,14,13,12,11,10,1');
    });


    it('Grid rowFilteredSort with sortColumn', async () => {

        grid.setSortColumn('value');

        await delay();

        const values = grid.getViewRows().map((it) => it.value).join(',');
        assert.equal(values, '1,10,11,12,13,14,16,17,18,19');
    });

    it('Grid rowFilteredSort with sortColumn change keywords should no change', async () => {
        keywords = '2';
        grid.update();
        await delay();

        let values = grid.getViewRows().map((it) => it.value).join(',');
        assert.equal(values, '2,12');

        keywords = '1';
        grid.update();
        await delay();

        values = grid.getViewRows().map((it) => it.value).join(',');
        assert.equal(values, '1,10,11,12,13,14,16,17,18,19');

    });


    it('Grid rowFilteredSort: invalid', async () => {

        const data = createData();
        grid.setData(data);
        grid.setOption({
            rowNotFound: 'No Results',
            rowFilter: function(rowItem) {
                if (rowItem.name.indexOf(keywords) !== -1) {
                    return true;
                }
                return false;
            },
            rowFilteredSort: {}
        });

        grid.render();

        await delay();

        const rows = grid.getViewRows();
        assert.equal(rows.length, 10);

        const values = grid.getViewRows().map((it) => it.value).join(',');
        assert.equal(values, '1,10,11,12,13,14,16,17,18,19');
    });

    it('Grid rowFilter: invalid', async () => {

        const data = createData();
        grid.setData(data);
        grid.setOption({
            rowNotFound: 'No Results',
            rowFilter: null,
            rowFilteredSort: {}
        });

        grid.render();

        await delay();

        const rows = grid.getViewRows();
        assert.equal(rows.length, 19);

        const values = grid.getViewRows().map((it) => it.value).join(',');
        assert.equal(values, '0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,16,17,18,19');
    });

    it('Grid rowFilter: highlightKeywordsFilter', async () => {

        keywords = '1';

        const data = createData();
        grid.setData(data);
        grid.setOption({
            rowNotFound: 'No Results',
            rowFilter: function(rowItem) {
                return this.highlightKeywordsFilter(rowItem, ['name'], keywords);
            }
        });

        grid.render();

        // 1 for nextTick
        await delay(1);

        const rows = grid.getViewRows();
        assert.equal(rows.length, 10);

        const values = grid.getViewRows().map((it) => it.value).join(',');
        assert.equal(values, '1,10,11,12,13,14,16,17,18,19');

        // check mark tag
        const row1 = grid.getViewRows()[0];

        const cellNode = grid.getCellNode(row1, 'name');
        const mark = cellNode.querySelector('mark');
        assert.ok(mark);
        assert.equal(mark.innerText, keywords);
    });

    it('Grid rowFilter: highlightKeywordsFilter html', async () => {

        keywords = 're';

        const data = createData();
        data.rows.push({
            name: 'See <font color="red">red</font>'
        });
        grid.setData(data);
        grid.setOption({
            rowNotFound: 'No Results',
            rowFilter: function(rowItem) {
                return this.highlightKeywordsFilter(rowItem, ['name'], keywords);
            }
        });

        grid.render();

        // 1 for nextTick
        await delay(1);

        // check mark tag
        const row1 = grid.getViewRows()[0];

        const cellNode = grid.getCellNode(row1, 'name');
        const mark = cellNode.querySelector('font mark');
        assert.ok(mark);
        assert.equal(mark.innerText, keywords);
    });

});
