import { Grid, $ } from '../../src/index.js';
import Data from '../data/data.js';
describe('Row number', function() {

    let container;
    let grid;

    const data = Data.create();
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

    it('rowNumberVisible true', async () => {
        grid.setOption({
            rowNumberVisible: true
        });
        grid.setData(data);
        grid.render();

        await delay();

        // group row
        let cellNode = grid.getCellNode(0, 0);
        assert.equal(cellNode.innerHTML, '');

        // first row number
        cellNode = grid.getCellNode(1, 0);
        assert.equal(cellNode.innerHTML, '1');
        cellNode = grid.getCellNode(2, 0);
        assert.equal(cellNode.innerHTML, '2');

    });


});
