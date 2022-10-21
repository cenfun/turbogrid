import { Grid, $ } from '../../src/index.js';
import Data from '../data/data.js';
describe('Row display', function() {

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
        grid.onNextUpdated(function() {
            done();
        });
        grid.render();
    });

    it('Grid hideRow', function(done) {
        // can not hide group if subs has visible
        const row = grid.getRowItem('row11');
        assert.equal(Boolean(row.tg_invisible), false);
        grid.onNextUpdated(function() {
            assert.equal(row.tg_invisible, true);
            done();
        });
        // empty
        grid.hideRow();
        grid.hideRow('row11');
        // same
        grid.hideRow('row11');
    });

    it('Grid showRow', function(done) {
        const row = grid.getRowItem('row11');
        grid.onNextUpdated(function() {
            assert.equal(row.tg_invisible, false);
            done();
        });
        grid.showRow();
        grid.showRow('row11');
        grid.showRow('row11');
    });

});
