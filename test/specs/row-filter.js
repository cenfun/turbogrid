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

        // 100 for debounce
        await delay(100);

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

        // 100 for debounce
        await delay(100);

        // check mark tag
        const row1 = grid.getViewRows()[0];

        const cellNode = grid.getCellNode(row1, 'name');
        const mark = cellNode.querySelector('font mark');
        assert.ok(mark);
        assert.equal(mark.innerText, keywords);
    });

});

describe('highlightKeywordsFilter patterns and options', function() {
    let container;
    let grid;

    before(async function() {
        container = createContainer('500px', '500px');
        grid = new Grid(container);
        grid.setData({
            columns: [{
                id: 'name',
                name: 'Name'
            }, {
                id: 'title',
                name: 'Title'
            }],
            rows: []
        });
        grid.render();
        await delay();
    });

    after(function() {
        grid.destroy();
        container.remove();
    });

    it('supports string, object, array and matching options', () => {
        const rowItem = {
            name: 'Foo quick brown fox',
            title: 'Bar'
        };
        const columns = ['name', 'title'];
        const filter = (patterns, options = {}) => {
            Object.assign(grid.options.highlightKeywords, {
                caseSensitive: false,
                matchMode: 'and',
                negatedPrefix: '-'
            }, options);
            return grid.highlightKeywordsFilter(rowItem, columns, patterns);
        };

        // default matchMode 'and': every positive pattern must match
        assert.equal(filter('foo missing'), false);
        assert.equal(filter('foo bar'), true);
        assert.equal(filter('foo missing', {
            matchMode: 'or'
        }), true);
        assert.equal(filter('case:foo'), false);
        assert.equal(filter('case:Foo'), true);
        assert.equal(filter('F*fox'), true);
        assert.equal(filter('F\\*fox'), false);
        rowItem.name = 'F*fox';
        assert.equal(filter('F\\*fox'), true);
        rowItem.name = 'Foo quick brown fox';
        assert.equal(filter('-case:foo'), true);
        assert.equal(filter('-case:Foo'), false);
        assert.equal(filter('foo missing', {
            matchMode: 'and'
        }), false);
        assert.equal(filter('foo bar', {
            matchMode: 'and'
        }), true);
        assert.equal(filter({
            pattern: 'FOO'
        }), true);
        assert.equal(filter({
            pattern: 'FOO'
        }, {
            caseSensitive: true
        }), false);
        assert.equal(filter([{
            pattern: 'F*fox',
            caseSensitive: true
        }]), true);
        assert.equal(filter({
            pattern: /^foo/
        }), true);
        assert.equal(filter({
            pattern: /^foo/,
            caseSensitive: true
        }), false);
        assert.equal(filter({
            pattern: function(text, matchedRowItem, columnItem) {
                if (this === grid && matchedRowItem === rowItem && columnItem.id === 'title' && text === 'Bar') {
                    return 'Bar';
                }
                return '';
            }
        }), true);
        assert.equal(filter('!missing', {
            negatedPrefix: '!'
        }), true);
        assert.equal(filter('!foo', {
            negatedPrefix: '!'
        }), false);
        assert.equal(filter('foo -foo', {
            matchMode: 'negatedFirst'
        }), false);
        assert.equal(filter('foo -foo', {
            matchMode: 'positiveFirst'
        }), true);
    });

    it('uses fixed internal text and highlight cache keys', () => {
        const rowItem = {
            name: '<b>Foo</b>'
        };
        Object.assign(grid.options.highlightKeywords, {
            textKey: 'custom_text_',
            highlightKey: 'custom_highlight_'
        });

        assert.equal(grid.highlightKeywordsFilter(rowItem, ['name'], 'Foo'), true);
        assert.equal(rowItem.tg_text_name, 'Foo');
        assert.ok(rowItem.tg_highlight_name);
        assert.equal(typeof rowItem.custom_text_name, 'undefined');
        assert.equal(typeof rowItem.custom_highlight_name, 'undefined');

        delete grid.options.highlightKeywords.textKey;
        delete grid.options.highlightKeywords.highlightKey;
    });

    it('records a match score for case, order, occurrences and columns', () => {
        const score = (rowItem, columns, patterns) => {
            assert.equal(grid.highlightKeywordsFilter(rowItem, columns, patterns), true);
            return rowItem.tg_match_score;
        };

        assert.ok(score({
            name: 'Foo'
        }, ['name'], 'Foo') > score({
            name: 'foo'
        }, ['name'], 'Foo'));

        assert.ok(score({
            name: 'Foo Bar'
        }, ['name'], 'Foo Bar') > score({
            name: 'Bar Foo'
        }, ['name'], 'Foo Bar'));

        assert.ok(score({
            name: 'Foo Foo'
        }, ['name'], 'Foo') > score({
            name: 'Foo'
        }, ['name'], 'Foo'));

        assert.ok(score({
            name: 'Foo',
            title: 'Foo'
        }, ['name', 'title'], 'Foo') > score({
            name: 'Foo',
            title: ''
        }, ['name', 'title'], 'Foo'));

        const unmatched = {
            name: 'Bar'
        };
        assert.equal(grid.highlightKeywordsFilter(unmatched, ['name'], 'Foo'), false);
        assert.equal(unmatched.tg_match_score, 0);
    });

    it('sorts match scores with rowFilteredSort', async () => {
        grid.setData({
            columns: [{
                id: 'name',
                name: 'Name'
            }],
            rows: [{
                name: 'foo'
            }, {
                name: 'Foo Foo'
            }, {
                name: 'Foo'
            }]
        });
        grid.setOption({
            rowFilter: function(rowItem) {
                return this.highlightKeywordsFilter(rowItem, ['name'], 'Foo');
            },
            rowFilteredSort: {
                sortField: 'tg_match_score',
                sortAsc: false,
                comparer: 'number'
            }
        });
        grid.render();
        await delay();

        assert.deepEqual(grid.getViewRows().map((rowItem) => rowItem.name), ['Foo Foo', 'Foo', 'foo']);
    });

    it('highlights the string returned by a custom matcher', async () => {
        grid.setData({
            columns: [{
                id: 'name',
                name: 'Name'
            }],
            rows: [{
                name: 'Foo quick fox'
            }]
        });
        grid.setOption({
            rowFilter: function(rowItem) {
                return this.highlightKeywordsFilter(rowItem, ['name'], {
                    pattern: function(text, matchedRowItem, columnItem) {
                        assert.equal(matchedRowItem, rowItem);
                        assert.equal(columnItem.id, 'name');
                        return text.includes('quick') ? 'quick' : '';
                    }
                });
            }
        });
        grid.render();
        await delay(100);

        const cellNode = grid.getCellNode(grid.getViewRows()[0], 'name');
        assert.equal(cellNode.querySelector('mark').innerText, 'quick');
    });

    it('highlights every text node covered by a cross-node match', async () => {
        grid.setData({
            columns: [{
                id: 'name',
                name: 'Name'
            }],
            rows: [{
                name: '<b>foo</b><span>middle</span><i>bar</i>'
            }]
        });
        Object.assign(grid.options.highlightKeywords, {
            caseSensitive: false,
            matchMode: 'and',
            negatedPrefix: '-'
        });
        grid.setOption({
            rowFilter: function(rowItem) {
                return this.highlightKeywordsFilter(rowItem, ['name'], 'foo*bar');
            }
        });
        grid.render();
        await delay(100);

        const cellNode = grid.getCellNode(grid.getViewRows()[0], 'name');
        const marks = cellNode.querySelectorAll('mark');
        assert.equal(marks.length, 3);
        assert.equal(marks[0].innerText, 'foo');
        assert.equal(marks[1].innerText, 'middle');
        assert.equal(marks[2].innerText, 'bar');
    });
});
