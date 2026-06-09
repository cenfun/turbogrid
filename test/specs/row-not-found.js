import { Grid, $ } from '../../src/index.js';
import Data from '../data/data.js';
describe('Row not found', function() {

    let container;
    let grid;

    const data = Data.create();
    let keywords = '';

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

    it('pane message display none default', function(done) {
        grid.setData(data);
        grid.setOption({
            rowNotFound: 'No Results',
            rowFilter: function(rowItem) {
                if (!keywords) {
                    return true;
                }
                if (rowItem.tg_frozen) {
                    return true;
                }
                let name = rowItem.name;
                if (name) {
                    name = name.toLowerCase();
                    if (name.indexOf(keywords) !== -1) {
                        return true;
                    }
                }
                return false;
            }
        });
        grid.once('onFirstUpdated', function() {
            const $elem = grid.find('.tg-body-message');
            assert.equal($elem.length, 1);
            assert.equal($elem.width(), 0);
            done();
        });
        grid.render();
    });

    it('no rows when filter', function(done) {
        keywords = 'random-words';
        grid.once('onUpdated', function() {
            const $elem = grid.find('.tg-body-message');
            assert.equal($elem.length, 1);
            assert.equal($elem.css('display'), 'block');
            done();
        });
        grid.update();
    });

    it('show rows when no filter', function(done) {
        keywords = '';
        grid.once('onUpdated', function() {
            const $elem = grid.find('.tg-body-message');
            assert.equal($elem.length, 1);
            assert.equal($elem.css('display'), 'none');
            done();
        });
        grid.update();
    });

    it('set rowNotFound with function', function(done) {
        grid.setOption({
            rowNotFound: function() {
                return 'No Results';
            }
        });
        grid.once('onUpdated', function() {
            const $elem = grid.find('.tg-body-message');
            assert.equal($elem.length, 1);
            assert.equal($elem.css('display'), 'none');
            done();
        });
        grid.update();
    });

    it('no rows when delete all rows', function(done) {
        grid.once('onRowRemoved', function() {
            const $elem = grid.find('.tg-body-message');
            assert.equal($elem.length, 1);
            assert.equal($elem.css('display'), 'block');
            done();
        });
        grid.deleteRow(grid.getViewRows());
    });

    it('show rows when addRow', function(done) {
        grid.once('onRowAdded', function() {
            const $elem = grid.find('.tg-body-message');
            assert.equal($elem.length, 1);
            assert.equal($elem.css('display'), 'none');
            done();
        });
        grid.addRow('New Row');
    });

});

describe('Row not found with autoHeight', function() {

    let container;
    let grid;

    const data = {
        columns: [{
            id: 'name',
            name: 'Name'
        }],
        rows: []
    };

    const clean = function() {
        if (grid) {
            grid.destroy();
            grid = null;
        }
        if (container) {
            container.remove();
            container = null;
        }
    };

    after(function() {
        clean();
    });

    it('autoHeight should include rowNotFound message height', async () => {
        clean();
        container = $('<div/>').width(240).height(200).appendTo(document.body);
        grid = new Grid(container);
        grid.setData(data);
        grid.setOption({
            autoHeight: true,
            rowNotFound: 'No Results'
        });

        grid.render();
        await delay();

        const $elem = grid.find('.tg-body-message');
        assert.equal($elem.length, 1);
        assert.equal($elem.css('display'), 'block');
        assert.equal(grid.getViewRows().length, 0);
        assert(grid.bodyMessageHeight > 0);
        assert.equal(grid.containerHeight, grid.headerHeight + grid.totalRowsHeight + grid.bodyMessageHeight + grid.getScrollbarHeight());
        assert.equal(grid.bodyHeight, grid.containerHeight - grid.headerHeight);
    });

    it('autoHeight should recalculate rowNotFound height after resize', async () => {
        clean();
        container = $('<div/>').width(360).height(200).appendTo(document.body);
        grid = new Grid(container);
        grid.setData(data);
        grid.setOption({
            autoHeight: true,
            rowNotFound: 'Row not found message should wrap into multiple lines when container width becomes smaller and update auto height correctly.'
        });

        grid.render();
        await delay();

        const initialHeight = grid.bodyMessageHeight;
        assert(initialHeight > 0);
        assert.equal(grid.containerHeight, grid.headerHeight + grid.totalRowsHeight + grid.bodyMessageHeight + grid.getScrollbarHeight());

        container.width(120);
        grid.resize();
        await delay(150);
        await delay();

        const narrowHeight = grid.bodyMessageHeight;
        assert(narrowHeight >= initialHeight);
        assert.equal(grid.containerHeight, grid.headerHeight + grid.totalRowsHeight + grid.bodyMessageHeight + grid.getScrollbarHeight());

        container.width(360);
        grid.resize();
        await delay(150);
        await delay();

        const wideHeight = grid.bodyMessageHeight;
        assert(wideHeight <= narrowHeight);
        assert.equal(grid.containerHeight, grid.headerHeight + grid.totalRowsHeight + grid.bodyMessageHeight + grid.getScrollbarHeight());
    });

});
