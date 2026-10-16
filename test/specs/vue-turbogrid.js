import {
    createApp, h, nextTick, ref, shallowReactive
} from 'vue';
import { createMemoryHistory, createRouter } from 'vue-router';
import TurboGrid from '../../examples/components/turbogrid.vue';
import { createContainer } from '../data/helper.js';

// Flush Vue/Grid microtasks and finish native input events before assertions.
const settle = async () => {
    await nextTick();
    await delay();
    await nextTick();
    await delay(1);
};

const createRows = () => Array.from({
    length: 150
}, (_, index) => ({
    id: `r-${index}`,
    title: `Order ${index} <img src=x onerror="this.dataset.executed=true"> ${'long text '.repeat(15)}`,
    amount: index,
    detail: 'Detail'
}));

describe('TurboGrid Vue component', function() {
    let container;
    let app;
    let component;
    let state;
    let readyCount;
    let readyGrid;
    let tooltipEvents;

    const getGrid = () => component.value?.getGrid();
    const unmount = () => {
        app?.unmount();
        app = null;
    };

    const mount = () => {
        app = createApp({
            setup() {
                return () => (state.visible ? h(TurboGrid, {
                    ... state,
                    ref: component,
                    onReady: (grid) => {
                        readyCount++;
                        readyGrid = grid;
                    },
                    onTooltip: (data) => tooltipEvents.push(data)
                }) : h('p', 'Unmounted'));
            }
        });
        app.mount(container);
    };

    beforeEach(() => {
        container = createContainer('640px', '280px');
        component = ref(null);
        readyCount = 0;
        readyGrid = null;
        tooltipEvents = [];
        state = shallowReactive({
            columns: [{
                id: 'title', name: 'Title', width: 220
            }, {
                id: 'amount', name: 'Amount', type: 'number', width: 180
            }, {
                id: 'detail', name: 'Detail', width: 400
            }],
            rows: createRows(),
            options: {
                selectVisible: true
            },
            formatters: {},
            events: {},
            renderSettings: true,
            updateToken: 0,
            autoTooltip: true,
            visible: true
        });
        mount();
    });

    afterEach(async () => {
        unmount();
        await settle();
        container.remove();
    });

    it('waits for array props before initialization and emits ready once', async () => {
        assert.equal(TurboGrid.name, 'TurboGrid');
        unmount();
        state.columns = null;
        state.rows = null;
        mount();
        await settle();
        assert.isNull(getGrid());
        assert.equal(readyCount, 0);

        state.columns = [{
            id: 'title', name: 'Title'
        }];
        state.rows = [{
            id: 'first', title: 'First'
        }];
        await settle();
        assert.strictEqual(readyGrid, getGrid());
        assert.equal(readyCount, 1);
        assert.equal(getGrid().getRowsLength(), 1);
        assert.include(container.textContent, 'First');
    });

    it('renders external text safely without mutating parent rows or columns', async () => {
        await settle();
        const grid = getGrid();
        assert.equal(grid.getRowsLength(), 150);
        assert.equal(container.querySelectorAll('img').length, 0);
        assert.include(grid.getCellNode('r-0', 'title').textContent, '<img src=x');
        assert.notProperty(state.rows[0], 'tg_index');
        assert.notProperty(state.columns[0], 'tg_index');
    });

    it('only forwards tooltip context and dismissal without changing tooltip DOM', async () => {
        await settle();
        const grid = getGrid();
        const cell = grid.getCellNode('r-0', 'title');
        cell.dispatchEvent(new MouseEvent('mouseover', {
            bubbles: true
        }));
        assert.strictEqual(tooltipEvents.at(-1).cellNode, cell);
        assert.equal(tooltipEvents.at(-1).rowItem.id, 'r-0');
        assert.isFalse(cell.hasAttribute('title'));
        cell.title = 'Application tooltip';
        cell.dispatchEvent(new MouseEvent('mouseout', {
            bubbles: true
        }));
        assert.isNull(tooltipEvents.at(-1));
        assert.equal(cell.title, 'Application tooltip');

        state.autoTooltip = false;
        await settle();
        assert.isNull(tooltipEvents.at(-1));
        assert.strictEqual(grid.getCellNode('r-0', 'title'), cell);
        const count = tooltipEvents.length;
        cell.dispatchEvent(new MouseEvent('mouseover', {
            bubbles: true
        }));
        assert.equal(tooltipEvents.length, count);
        state.autoTooltip = true;
        await settle();
        cell.dispatchEvent(new MouseEvent('mouseover', {
            bubbles: true
        }));
        assert.strictEqual(tooltipEvents.at(-1).cellNode, cell);
        assert.equal(cell.title, 'Application tooltip');
        grid.trigger('onScroll');
        assert.isNull(tooltipEvents.at(-1));
        unmount();
        assert.isNull(tooltipEvents.at(-1));
    });

    it('replaces and removes event handlers without accumulating listeners', async () => {
        let oldCalls = 0;
        let newCalls = 0;
        state.events = {
            onClick: () => oldCalls++
        };
        await settle();
        const grid = getGrid();
        grid.setRowSelected('r-0');
        await settle();
        const rows = grid.getRows();
        grid.trigger('onClick', {});
        state.events = {
            onClick: () => newCalls++
        };
        await settle();
        grid.trigger('onClick', {});
        assert.deepEqual([oldCalls, newCalls], [1, 1]);
        assert.strictEqual(grid.getRows(), rows);
        assert.deepEqual(grid.getSelectedRows().map((row) => row.id), ['r-0']);

        state.events = {};
        await settle();
        grid.trigger('onClick', {});
        assert.deepEqual([oldCalls, newCalls], [1, 1]);
        assert.strictEqual(grid.getRows(), rows);
        assert.deepEqual(grid.getSelectedRows().map((row) => row.id), ['r-0']);
    });

    it('preserves the instance and scroll positions on row prop replacement', async () => {
        await settle();
        const grid = getGrid();
        grid.setScroll(100, 1000);
        await settle();
        state.rows = [... state.rows, {
            id: 'last', title: 'Last row', amount: 999
        }];
        await settle();
        assert.strictEqual(getGrid(), grid);
        assert.equal(readyCount, 1);
        assert.equal(grid.getRowsLength(), 151);
        assert.equal(grid.getScrollLeft(), 100);
        assert.equal(grid.getScrollTop(), 1000);
    });

    it('uses updateToken to refresh external filter state without replacing the instance', async () => {
        let onlyEven = false;
        state.options = {
            rowFilter: (row) => !onlyEven || row.amount % 2 === 0
        };
        await settle();
        const grid = getGrid();
        onlyEven = true;
        state.updateToken++;
        await settle();
        assert.strictEqual(getGrid(), grid);
        assert.equal(grid.getRowsLength(), 75);

        onlyEven = false;
        state.updateToken++;
        await settle();
        assert.equal(grid.getRowsLength(), 150);
    });

    it('replaces formatters and enforces full initialization with explicit render settings', async () => {
        await settle();
        getGrid().setScroll(100, 1000);
        await settle();
        state.renderSettings = {
            type: 'rows',
            scrollTop: 0,
            scrollLeft: 0
        };
        state.formatters = {
            number: (value) => document.createTextNode(`Value ${value}`)
        };
        await settle();
        assert.equal(getGrid().getScrollTop(), 0);
        assert.equal(getGrid().getCellNode('r-0', 'amount').textContent, 'Value 0');

        state.formatters = {};
        await settle();
        assert.equal(getGrid().getCellNode('r-0', 'amount').textContent, '0');
    });

    it('copies tree items recursively and renders an empty state', async () => {
        state.columns = [{
            id: 'title', name: 'Tree', type: 'tree'
        }];
        state.rows = [{
            id: 'parent',
            title: 'Parent',
            subs: [{
                id: 'child', title: 'Child'
            }]
        }];
        await settle();
        assert.equal(getGrid().getRowsLength(), 2);
        assert.notProperty(state.rows[0], 'tg_index');
        assert.notProperty(state.rows[0].subs[0], 'tg_index');

        state.rows = [];
        await settle();
        assert.equal(getGrid().getRowsLength(), 0);
        assert.include(container.textContent, 'No matching records');
    });

    it('destroys on conditional unmount and creates a fresh instance on remount', async () => {
        await settle();
        const original = getGrid();
        state.visible = false;
        await settle();
        assert.isTrue(original.destroyed);
        assert.isNull(container.querySelector('.tg-grid-block'));

        state.visible = true;
        await settle();
        assert.notStrictEqual(getGrid(), original);
        assert.equal(readyCount, 2);
    });

    it('does not initialize queued work after immediate unmount', async () => {
        unmount();
        await settle();
        assert.equal(readyCount, 0);
        assert.isNull(container.querySelector('.tg-grid-block'));
        assert.isNull(container.querySelector('.tg-cell'));
    });

    it('ignores a pending prop update when an initialized component is unmounted', async () => {
        await settle();
        const grid = getGrid();
        state.rows = [{
            id: 'late', title: 'Late update'
        }];
        await nextTick();
        unmount();
        await settle();
        assert.isTrue(grid.destroyed);
        assert.isNull(container.querySelector('.tg-cell'));
    });

});

describe('TurboGrid Vue example page', function() {
    let container;
    let app;

    const click = async (label) => {
        const button = Array.from(container.querySelectorAll('button')).find((node) => node.textContent.trim() === label);
        assert.ok(button, `Missing demo button: ${label}`);
        button.click();
        await settle();
    };

    beforeEach(async () => {
        container = createContainer('1000px', '600px');
        // Load demo-only dependencies after the core test suites have run.
        const { default: Demo } = await import('../../examples/pages/vue-turbogrid.vue');
        const router = createRouter({
            history: createMemoryHistory(),
            routes: [{
                path: '/vue-turbogrid', component: Demo
            }]
        });
        await router.push('/vue-turbogrid');
        app = createApp(Demo);
        app.use(router);
        app.mount(container);
        // Supply the demo shell layout without introducing global demo CSS.
        container.querySelector('.main').style.cssText = 'height:100%; display:flex; flex-direction:column;';
        container.querySelector('.grid-container').style.cssText = 'flex:1; min-height:0;';
        await settle();
    });

    afterEach(async () => {
        app?.unmount();
        app = null;
        await settle();
        container.remove();
    });

    it('runs the example page with row updates, selection, and remounting', async () => {
        assert.include(container.querySelector('.controller').textContent, 'Ready: true');
        await click('Add row via props');
        assert.include(container.querySelector('.controller').textContent, 'Rows: 201');
        await click('Update cell via getGrid');
        const amounts = Array.from(container.querySelectorAll('.tg-grid-block .tg-cell'))
            .filter((node) => node.textContent === '$20.00');
        assert.equal(amounts.length, 2);
        container.querySelector('.tg-grid-block .tg-cell-select .tg-select-icon').click();
        await settle();
        const selection = Array.from(container.querySelectorAll('.controller span'))
            .find((node) => node.textContent.startsWith('Selected:'));
        assert.equal(selection.textContent, 'Selected: order-1');
        await click('Unmount grid');
        assert.isNull(container.querySelector('.tg-grid-block'));
        await click('Mount grid');
        assert.include(container.querySelector('.controller').textContent, 'Ready: true');
    });

    it('keeps selection on handler changes and synchronizes the label after a rebuild', async () => {
        const grid = container.querySelector('.tg-turbogrid').getInstance();
        grid.setRowSelected('order-1');
        await settle();
        const label = () => Array.from(container.querySelectorAll('.controller span'))
            .find((node) => node.textContent.startsWith('Selected:')).textContent;
        await click('Replace click handler');
        assert.deepEqual(grid.getSelectedRows().map((row) => row.id), ['order-1']);
        assert.equal(label(), 'Selected: order-1');
        await click('Remove click handler');
        assert.deepEqual(grid.getSelectedRows().map((row) => row.id), ['order-1']);
        assert.equal(label(), 'Selected: order-1');

        const checkbox = Array.from(container.querySelectorAll('label'))
            .find((node) => node.textContent.includes('Auto column width')).querySelector('input');
        checkbox.checked = false;
        checkbox.dispatchEvent(new Event('change', {
            bubbles: true
        }));
        await settle();
        assert.equal(grid.getSelectedRows().length, 0);
        assert.equal(label(), 'Selected: None');
    });

    it('handles tooltips in the parent and preserves application-owned tree titles', async () => {
        const grid = container.querySelector('.tg-turbogrid').getInstance();
        const plainCell = grid.getCellNode('order-1', 'title');
        plainCell.dispatchEvent(new MouseEvent('mouseover', {
            bubbles: true
        }));
        assert.equal(plainCell.title, plainCell.textContent);
        plainCell.dispatchEvent(new MouseEvent('mouseout', {
            bubbles: true
        }));
        assert.isFalse(plainCell.hasAttribute('title'));

        grid.setData({
            columns: [{
                id: 'label', name: 'Tree', type: 'tree', width: 130
            }],
            rows: [{
                id: 'tree-row', label: 'Long tree label '.repeat(25)
            }]
        });
        grid.render();
        await settle();
        const cell = grid.getCellNode('tree-row', 'label');
        const tree = cell.querySelector('.tg-tree-name');
        tree.title = 'Application tooltip';
        // The event target is the cell padding, not the titled tree child.
        cell.dispatchEvent(new MouseEvent('mouseover', {
            bubbles: true
        }));
        cell.dispatchEvent(new MouseEvent('mouseout', {
            bubbles: true
        }));
        assert.equal(tree.title, 'Application tooltip');
    });
});
