import {
    Grid, $, CONST
} from '../../src/index.js';

describe('Instance', function() {

    const sampleData = {
        columns: [{
            id: 'name',
            name: 'Name',
            formatter: function(value) {
                return value;
            },
            headerFormatter: function(value) {
                return value;
            }
        }, {
            id: 'value',
            name: 'Value'
        }],
        rows: [{
            name: 'Row 1',
            value: '1',
            name_background: '#ff0000',
            formatter: function(value) {
                return value;
            }
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
        assert.equal(elem.getInstance(), grid);
        assert.equal(sampleData.columns[0].tg_formatter, sampleData.columns[0].formatter);
        assert.equal(sampleData.columns[0].tg_headerFormatter, sampleData.columns[0].headerFormatter);
        assert.equal(sampleData.rows[0].tg_formatter, sampleData.rows[0].formatter);

        const scrollPane = grid.scrollPane;
        const scrollbar = scrollPane.scrollbarV;
        let autoScrollDestroyed = false;
        grid.autoScrollMotion = {
            destroy: function() {
                autoScrollDestroyed = true;
            }
        };

        grid.destroy();
        container.remove();

        assert(!Grid.getInstance(id));
        // the getInstance helper is removed from the container on destroy
        assert.equal(typeof elem.getInstance, 'undefined');
        assert.equal('getInstance' in elem, false);
        assert(autoScrollDestroyed);
        assert.equal(sampleData.columns[0].tg_formatter, sampleData.columns[0].formatter);
        assert.equal(sampleData.columns[0].tg_headerFormatter, sampleData.columns[0].headerFormatter);
        assert.equal(sampleData.rows[0].tg_formatter, sampleData.rows[0].formatter);
        assert.equal(scrollPane.options, null);
        assert.equal(scrollbar.$holder, null);
        assert.equal(scrollbar.options, null);

    });


});
