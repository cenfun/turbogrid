import { createApp, nextTick } from 'vue';
import { createMemoryHistory, createRouter } from 'vue-router';
import { createContainer } from '../data/helper.js';

describe('Tooltip example', function() {
    let container;
    let app;
    let grid;
    const value = 'Long cell value '.repeat(12);
    const label = 'Long tree label '.repeat(12);

    before(async () => {
        container = createContainer('640px', '320px');
        const { default: Demo } = await import('../../examples/pages/tooltip.vue');
        const router = createRouter({
            history: createMemoryHistory(),
            routes: [{
                path: '/tooltip', component: Demo
            }]
        });
        await router.push('/tooltip');
        app = createApp(Demo);
        app.use(router);
        app.mount(container);
        container.querySelector('.main').style.cssText = 'height:100%; display:flex; flex-direction:column;';
        container.querySelector('.grid-container').style.cssText = 'flex:1; min-height:0;';
        await nextTick();
        await delay(1);
        grid = container.querySelector('.tg-turbogrid').getInstance();
        grid.setOption({
            bindContainerResize: true
        });
        grid.setData({
            columns: [{
                id: 'label', name: 'Tree', type: 'tree', width: 140
            }, {
                id: 'value', name: 'Value', width: 100
            }],
            rows: [{
                id: 'row-1', label, value
            }]
        });
        await new Promise((resolve) => {
            grid.onNextUpdated(resolve);
            grid.render();
        });
    });

    afterEach(async () => {
        grid.trigger('onMouseOut');
        await nextTick();
    });

    after(() => {
        app?.unmount();
        container?.remove();
    });

    it('ignores header hover payloads without a cell node', () => {
        const target = grid.getHeaderItemNode('value').querySelector('.tg-column-name');
        const data = grid.getEventData({
            target
        });
        assert.ok(data.headerNode);
        assert.notProperty(data, 'cellNode');
        assert.doesNotThrow(() => grid.trigger('onMouseOver', data));
    });

    it('still shows tooltips for truncated body cells', async () => {
        const cell = grid.getCellNode('row-1', 'value');
        assert.isAbove(cell.scrollWidth, cell.clientWidth);
        grid.trigger('onMouseOver', grid.getEventData({
            target: cell
        }));
        await nextTick();
        await delay(50);
        const tooltip = document.querySelector('.vui-tooltip');
        assert.ok(tooltip);
        assert.include(tooltip.textContent, value.trim());
        assert.notEqual(getComputedStyle(tooltip).display, 'none');
    });

    it('still shows tooltips for truncated tree labels', async () => {
        const cell = grid.getCellNode('row-1', 'label');
        const tree = cell.querySelector('.tg-tree-name');
        assert.isAtMost(cell.scrollWidth, cell.clientWidth);
        assert.isAbove(tree.scrollWidth, tree.clientWidth);
        grid.trigger('onMouseOver', grid.getEventData({
            target: tree
        }));
        await nextTick();
        await delay(50);
        const tooltip = document.querySelector('.vui-tooltip');
        assert.ok(tooltip);
        assert.include(tooltip.textContent, label.trim());
        assert.notEqual(getComputedStyle(tooltip).display, 'none');
    });
});
