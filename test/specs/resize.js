import { Grid, $ } from '../../src/index.js';
import Data from '../data/data.js';
describe('Resize', function() {

    let container;
    let grid;

    const data = Data.create();

    before(function() {
        container = $('<div/>').width('100%').height('100%').appendTo(document.body);
        grid = new Grid(container);
    });
    after(function() {
        grid.destroy();
        grid = null;
        container.remove();
        container = null;
    });

    it('bindWindowResize false', async () => {
        grid.setOption({
            bindWindowResize: false
        });
        grid.setData(data);
        grid.render();
        await delay();

        const test_width = grid.containerWidth;
        const test_height = grid.containerHeight;
        //1260 900
        //console.log(test_width, test_height);
        assert(test_width);
        assert(test_height);

        let callResize = false;
        grid.once('onResize', function() {
            callResize = true;
        });

        window.dispatchEvent(new Event('resize'));

        await delay();
        assert(!callResize);

    });

    it('bindWindowResize true', async () => {
        grid.setOption({
            bindWindowResize: true
        });
        grid.render();
        await delay();

        let callResize = false;
        grid.once('onResize', function() {
            callResize = true;
        });
        container.width(300).height(500);
        window.dispatchEvent(new Event('resize'));

        await delay();
        assert(callResize);

    });

    it('resize with width / height', async () => {
        let callResize = 0;
        grid.bind('onResize', function() {
            callResize += 1;
        });
        assert.equal(callResize, 0);

        //let previous resize stop
        await delay(200);

        grid.resize(100);
        await delay();
        // leading call async render
        assert.equal(callResize, 1);

        // one call no trailing call
        await delay(200);
        assert.equal(callResize, 1);

        //reset another leading
        grid.resize(200);
        await delay();
        assert.equal(callResize, 2);

        await delay();
        //add trailing
        grid.resize(300);
        await delay();
        assert.equal(callResize, 2);

        //delay for trailing
        await delay(200);
        assert.equal(callResize, 3);

    });

    it('bindContainerResize true', async () => {
        grid.setOption({
            bindContainerResize: true
        });
        grid.render();
        await delay();

        let callResize = false;
        grid.once('onResize', function() {
            callResize = true;
        });

        container.width(500).height(300);

        //there are 2 microtask: ResizeObserver and resize/resizeSync
        await delay(10);
        assert(callResize);

    });

});
