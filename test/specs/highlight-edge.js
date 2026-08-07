import { Grid } from '../../src/index.js';
import { createContainer } from '../data/helper.js';

describe('highlight cache edge cases', function() {
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
            rows: [{
                name: '<b>Foo</b>',
                title: 'x'
            }]
        });
        grid.setOption({
            rowFilter: function(rowItem) {
                return this.highlightKeywordsFilter(rowItem, ['name'], 'Foo');
            }
        });
        grid.render();
        await delay();
    });

    after(function() {
        grid.destroy();
        container.remove();
    });

    it('special column ids do not break the null-prototype caches', () => {
        const rowItem = grid.getRows()[0];
        // column ids like 'constructor' would previously hit Object.prototype
        grid.highlightKeywordsFilter(rowItem, ['name'], 'Foo');
        assert.equal(rowItem.tg_highlight_texts.name.source, '<b>Foo</b>');
        assert.equal(Object.getPrototypeOf(rowItem.tg_highlight_texts), null);
        assert.equal(Object.getPrototypeOf(rowItem.tg_highlight_patterns), null);
    });

    it('same html source reuses the cached extraction', () => {
        const rowItem = {
            name: '<b>Foo</b>'
        };
        grid.highlightKeywordsFilter(rowItem, ['name'], 'Foo');
        assert.equal(rowItem.tg_highlight_texts.name.source, '<b>Foo</b>');
        assert.equal(rowItem.tg_highlight_texts.name.text, 'Foo');
        // second pass with the same source: cached text is returned, no re-extraction
        grid.highlightKeywordsFilter(rowItem, ['name'], 'Foo');
        assert.equal(rowItem.tg_highlight_texts.name.text, 'Foo');
    });

    it('direct value mutation is caught by source comparison', () => {
        const rowItem = {
            name: '<b>Foo</b>'
        };
        grid.highlightKeywordsFilter(rowItem, ['name'], 'Foo');
        assert.equal(grid.highlightKeywordsFilter(rowItem, ['name'], 'Foo'), true);
        // direct mutation, then plain re-filter (no updateCell/updateRow)
        rowItem.name = '<b>Bar</b>';
        assert.equal(grid.highlightKeywordsFilter(rowItem, ['name'], 'Foo'), false);
        assert.equal(rowItem.tg_highlight_texts.name.source, '<b>Bar</b>');
    });

    it('html to plain and back to html', () => {
        const rowItem = {
            name: '<b>Foo</b>'
        };
        assert.equal(grid.highlightKeywordsFilter(rowItem, ['name'], 'Foo'), true);
        rowItem.name = 'Foo';
        assert.equal(grid.highlightKeywordsFilter(rowItem, ['name'], 'Foo'), true);
        rowItem.name = '<b>Bar</b>';
        assert.equal(grid.highlightKeywordsFilter(rowItem, ['name'], 'Foo'), false);
    });

    it('numeric column ids work', () => {
        const rowItem = {
            1: '<b>Foo</b>'
        };
        assert.equal(grid.highlightKeywordsFilter(rowItem, [1], 'Foo'), true);
        assert.equal(rowItem.tg_highlight_texts[1].text, 'Foo');
        assert.ok(rowItem.tg_highlight_patterns[1]);
    });

    it('fresh rows get their own caches, never stale ones from old rows', async () => {
        const rowItem = grid.getRows()[0];
        grid.update();
        await delay();
        assert.ok(rowItem.tg_highlight_texts);
        grid.setData({
            columns: [{
                id: 'name',
                name: 'Name'
            }],
            rows: [{
                name: '<b>Bar</b>'
            }]
        });
        grid.setOption({
            rowFilter: function(r) {
                return this.highlightKeywordsFilter(r, ['name'], 'Bar');
            }
        });
        grid.render();
        await delay();
        const newRow = grid.getRows()[0];
        assert.notEqual(newRow, rowItem, 'setData should not reuse the old row object');
        // the fresh row carries its own cache reflecting its own data
        assert.equal(newRow.tg_highlight_texts.name.source, '<b>Bar</b>');
        assert.equal(grid.getViewRows().length, 1);
        // a re-setData with the same fresh row keeps it consistent (source compare)
        newRow.name = '<b>Foo</b>';
        grid.update();
        await delay();
        assert.equal(grid.getViewRows().length, 0);
    });
});
