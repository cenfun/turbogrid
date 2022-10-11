import { Grid, $ } from '../../src/index.js';
import Data from '../data/data.js';
describe('keydown', function() {

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

    it('keydown end', async () => {
        grid.setOption();
        grid.setData(data);
        grid.render();

        await delay();

        //9: tab
        grid.container.dispatchEvent(new KeyboardEvent('keydown', {
            keyCode: 9
        }));
        //13: enter
        grid.container.dispatchEvent(new KeyboardEvent('keydown', {
            keyCode: 13
        }));
        //27: esc
        grid.container.dispatchEvent(new KeyboardEvent('keydown', {
            keyCode: 27
        }));

        assert.equal(grid.scrollTop, 0);
        assert.equal(grid.scrollLeft, 0);

        //33,34: page up,page down
        grid.container.dispatchEvent(new KeyboardEvent('keydown', {
            keyCode: 34
        }));

        assert.equal(grid.scrollTop, 119);
        assert.equal(grid.scrollLeft, 0);

        grid.container.dispatchEvent(new KeyboardEvent('keydown', {
            keyCode: 33
        }));

        assert.equal(grid.scrollTop, 0);
        assert.equal(grid.scrollLeft, 0);

        //35,36: end,home
        grid.container.dispatchEvent(new KeyboardEvent('keydown', {
            keyCode: 35
        }));

        assert.equal(grid.scrollTop, 265);
        assert.equal(grid.scrollLeft, 0);

        grid.container.dispatchEvent(new KeyboardEvent('keydown', {
            keyCode: 36
        }));

        assert.equal(grid.scrollTop, 0);
        assert.equal(grid.scrollLeft, 0);

        //37,38,39,40: left,up,right,down
        grid.container.dispatchEvent(new KeyboardEvent('keydown', {
            keyCode: 39
        }));

        assert.equal(grid.scrollTop, 0);
        assert.equal(grid.scrollLeft, 20);

        grid.container.dispatchEvent(new KeyboardEvent('keydown', {
            keyCode: 37
        }));

        assert.equal(grid.scrollTop, 0);
        assert.equal(grid.scrollLeft, 0);

        grid.container.dispatchEvent(new KeyboardEvent('keydown', {
            keyCode: 40
        }));

        assert.equal(grid.scrollTop, 20);
        assert.equal(grid.scrollLeft, 0);

        grid.container.dispatchEvent(new KeyboardEvent('keydown', {
            keyCode: 38
        }));

        assert.equal(grid.scrollTop, 0);
        assert.equal(grid.scrollLeft, 0);


    });


});
