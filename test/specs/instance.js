import {
    Grid, $, CONST
} from '../../src/index.js';

describe('Instance', function() {

    const sampleData = {
        columns: [{
            id: 'name',
            name: 'Name'
        }, {
            id: 'value',
            name: 'Value'
        }],
        rows: [{
            name: 'Row 1',
            value: '1',
            name_background: '#ff0000'
        }, {
            name: 'Row 2',
            value: '2'
        }]
    };


    it('Grid getInstance', async () => {

        const container = $('<div/>').width(500).height(200).appendTo(document.body);
        const grid = new Grid(container);
        grid.setData(sampleData);
        grid.render();

        await delay();

        assert(!Grid.getInstance());

        const selector = `.${CONST.NS}`;
        const elem = document.querySelector(selector);
        assert(elem);

        const id = elem.getAttribute('id');
        assert(id);

        assert.equal(Grid.getInstance(id), grid);

        grid.destroy();
        container.remove();

        assert(!Grid.getInstance(id));

    });


});
