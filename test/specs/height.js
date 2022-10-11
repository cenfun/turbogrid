import { Grid, $ } from '../../src/index.js';

describe('Height', function() {

    let container;
    let grid;
    const data = {
        columns: [{
            id: 'name',
            name: 'Name'
        }, {
            id: 'value',
            name: 'Value'
        }],
        rows: [{
            name: 'Row 1',
            value: '1'
        }, {
            name: 'Row 2',
            value: '2'
        }, {
            name: 'Row 3',
            value: '3'
        }]
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

    it('Grid without container size', function(done) {
        clean();
        container = $('<div/>').appendTo(document.body);
        grid = new Grid(container);
        grid.setData(data);
        grid.once('onFirstUpdated', function() {
            const hh = grid.headerHeight;
            assert.equal(hh, 0);
            const ch = grid.containerHeight;
            assert.equal(ch, 0);
            done();
        });
        grid.render();
    });

    it('Grid without container size, autoHeight = true', function(done) {
        clean();
        container = $('<div/>').appendTo(document.body);
        grid = new Grid(container);
        grid.setData(data);
        grid.setOption({
            autoHeight: true
        });
        grid.once('onFirstUpdated', function() {
            const hh = grid.headerHeight;
            assert.equal(hh, 43);
            const ch = grid.containerHeight;
            const h = 3 * grid.option.rowHeight;
            assert.equal(ch, h + hh);
            done();
        });
        grid.render();
    });

    it('Grid with container size, autoHeight = true', function(done) {
        clean();
        container = $('<div/>').height(200).appendTo(document.body);
        grid = new Grid(container);
        grid.setData(data);
        grid.setOption({
            autoHeight: true
        });
        grid.once('onFirstUpdated', function() {
            const hh = grid.headerHeight;
            assert.equal(hh, 43);
            const ch = grid.containerHeight;
            const h = 3 * grid.option.rowHeight;
            assert.equal(ch, h + hh);
            done();
        });
        grid.render();
    });

    it('Grid with container size, autoHeight = false', function(done) {
        clean();
        container = $('<div/>').height(200).appendTo(document.body);
        grid = new Grid(container);
        grid.setData(data);
        grid.setOption({
            autoHeight: false
        });
        grid.once('onFirstUpdated', function() {
            const hh = grid.headerHeight;
            assert.equal(hh, 43);
            const bh = grid.bodyHeight;
            assert.equal(bh, 200 - hh);
            const ch = grid.containerHeight;
            assert.equal(ch, 200);
            done();
        });
        grid.render();
    });


});
