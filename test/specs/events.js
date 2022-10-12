import { Grid, $ } from '../../src/index.js';
import Data from '../data/data.js';
describe('Events', function() {

    let container;
    let grid;
    let eventTriggered = {};
    const data = Data.create();
    before(function() {
        container = $('<div/>').width(500).height(200).appendTo(document.body);
        grid = new Grid(container);
        grid.getAllEvents().forEach(function(type) {
            grid.bind(type, function(e, d) {
                if (!eventTriggered[e.type]) {
                    eventTriggered[e.type] = 1;
                    return;
                }
                eventTriggered[e.type] += 1;
            });
        });
    });
    after(function() {
        grid.destroy();
        grid = null;
        container.remove();
        container = null;
    });

    it('Grid header click event', async () => {
        grid.setOption({});
        grid.setData(data);
        eventTriggered = {};
        grid.render();

        await delay();

        const columnItem = grid.getColumnItem('name');
        const headerNode = grid.getHeaderItemNode(columnItem);

        headerNode.dispatchEvent(new MouseEvent('click'));

        //console.log(eventTriggered);

        assert.equal(eventTriggered.onClick, 1);

    });

    it('Grid row mouseenter mouseleave', async () => {
        grid.setOption({});
        grid.setData(data);
        eventTriggered = {};
        grid.render();

        await delay();

        const node = grid.container.querySelector('.tg-row[row="1"]');

        node.dispatchEvent(new MouseEvent('mouseenter'));
        node.dispatchEvent(new MouseEvent('mouseleave'));

        //console.log(eventTriggered);

        assert.equal(eventTriggered.onRowMouseEnter, 1);
        assert.equal(eventTriggered.onRowMouseLeave, 1);


    });

    it('Grid cell events', async () => {
        grid.setOption({});
        grid.setData(data);
        eventTriggered = {};
        grid.render();

        await delay();

        const row = grid.container.querySelector('.tg-row[row="1"]');
        const node = row.querySelector('.tg-cell[column="1"]');

        node.dispatchEvent(new MouseEvent('mouseover'));
        node.dispatchEvent(new MouseEvent('mouseout'));

        node.dispatchEvent(new MouseEvent('mouseenter'));
        node.dispatchEvent(new MouseEvent('mouseleave'));

        row.dispatchEvent(new MouseEvent('mouseenter'));
        row.dispatchEvent(new MouseEvent('mouseleave'));

        node.dispatchEvent(new MouseEvent('contextmenu'));

        node.dispatchEvent(new MouseEvent('click'));
        node.dispatchEvent(new MouseEvent('dblclick'));

        //console.log(eventTriggered);

        assert.equal(eventTriggered.onCellMouseEnter, 1);
        assert.equal(eventTriggered.onCellMouseLeave, 1);

        assert.equal(eventTriggered.onRowMouseEnter, 1);
        assert.equal(eventTriggered.onRowMouseLeave, 1);

        assert.equal(eventTriggered.onContextMenu, 1);
        assert.equal(eventTriggered.onClick, 1);
        assert.equal(eventTriggered.onDblClick, 1);
        assert.equal(eventTriggered.onMouseOver, 1);
        assert.equal(eventTriggered.onMouseOut, 1);

    });

    it('Grid wheel events', async () => {
        grid.setOption({});
        grid.setData(data);

        eventTriggered = {};

        grid.render();

        await delay();

        assert.equal(grid.scrollLeft, 0);
        assert.equal(grid.scrollTop, 0);


        grid.container.dispatchEvent(new WheelEvent('wheel', {
            deltaX: 10,
            deltaY: 0
        }));

        await delay();
        grid.container.dispatchEvent(new WheelEvent('wheel', {
            deltaX: 0,
            deltaY: 20
        }));

        await delay();

        assert.equal(eventTriggered.onMouseWheel, 2);
        assert.equal(eventTriggered.onScroll, 2);

        assert.equal(grid.scrollLeft, 10);
        assert.equal(grid.scrollTop, 20);


    });


});
