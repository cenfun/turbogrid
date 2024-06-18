import { Grid } from '../../src/index.js';
import Data from '../data/data.js';
import { createContainer } from '../data/helper.js';

describe('Row height', function() {
    let container;
    let grid;

    const data = Data.create();
    data.columns.splice(1, 0, {
        id: 'tg_height',
        name: 'Height'
    });

    data.rows.unshift({
        id: 'total',
        name: 'Total'
    });


    data.rows[3].name = 'This is long text. This is long text. This is long text. This is long text.';


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

    it('Grid default row height', async () => {

        grid.setData(data);
        grid.setOption({
            frozenRow: 1
        });
        grid.render();
        await delay();

        assert.equal(typeof grid.getRowItem('total').tg_height, 'undefined');
        assert.equal(container.querySelector('.tg-row[row="0"]').style.height, '');

    });

});
