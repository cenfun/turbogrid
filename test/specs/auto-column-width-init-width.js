import { Grid } from '../../src/index.js';
import { createContainer } from '../data/helper.js';

describe('autoColumnWidth initWidth', function() {
    let container;
    let grid;

    const rows = [{
        fixed: 'fixed',
        numberInit: 'number init',
        functionInit: 'function init'
    }];

    before(function() {
        container = createContainer('800px', '300px');
        grid = new Grid(container);
    });

    after(function() {
        grid.destroy();
        grid = null;
        container.remove();
        container = null;
    });

    it('uses initWidth as auto-sized base width', async () => {
        grid.setOption({
            autoColumnWidth: true
        });
        grid.setData({
            columns: [{
                id: 'fixed', name: 'Fixed', width: 120
            }, {
                id: 'numberInit', name: 'Number Init', initWidth: 140
            }, {
                id: 'functionInit',
                name: 'Function Init',
                initWidth: function(columnItem) {
                    assert.equal(this, grid);
                    assert.equal(columnItem.id, 'functionInit');
                    return 160;
                }
            }],
            rows
        });
        grid.render();
        await delay(200);

        const fixed = grid.getColumnItemById('fixed');
        const numberInit = grid.getColumnItemById('numberInit');
        const functionInit = grid.getColumnItemById('functionInit');

        assert.equal(fixed.tg_width, 120, 'width stays fixed');
        assert.equal(grid.getComputedColumnWidth(numberInit), 140, 'number initWidth is base width');
        assert.equal(grid.getComputedColumnWidth(functionInit), 160, 'function initWidth is base width');
        assert(numberInit.tg_width > 140, 'number initWidth column got extra');
        assert(functionInit.tg_width > 160, 'function initWidth column got extra');
    });

});
