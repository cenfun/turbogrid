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
