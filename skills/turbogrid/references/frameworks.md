# Framework Integration and Lifecycle

## Shared rules

TurboGrid is a vanilla JavaScript library with **zero runtime dependencies**. Framework integration only needs a real DOM container and lifecycle hooks. Install `turbogrid` in the existing application; no Vue/React-specific TurboGrid adapter is needed. The framework imports below use the host application's existing dependencies.

- Reuse the host framework. Do not introduce Vue, React, or demonstration-only `vine-ui` just to use Grid.
- Grid is an imperative browser component. Create it once after mounting the container, update the existing instance when data changes, and destroy it on unmount.
- Avoid Vue deep reactive proxies around Grid instances. Use a plain variable, `shallowRef`, or `markRaw`. Use `useRef` in React.
- The copies below are for **flat business data**. Recursively copy `subs` for tree data/grouped columns. Do not JSON-clone column definitions: that loses functions such as formatters. Do not feed runtime objects containing `tg_*` back into external state.
- Headers in examples are application-controlled text. Register safe formatters for external header/cell text, as shown in the main skill. Localize example UI labels to the host application.
- `bindContainerResize: true` observes container size changes. After opening hidden tabs/dialogs, call `resize()` after `nextTick` / layout completion. Flex/Grid layouts may require `min-height: 0; min-width: 0`; percentage heights need explicitly sized ancestors.

## Repository example: configurable TurboGrid wrapper

For a configurable wrapper rather than the self-contained minimal component below, optionally consult these online repository examples. They are **not bundled in the npm package**; no network or checkout is needed for the minimal Vue/React examples later in this file.

- Component source: [examples/components/turbogrid.vue](https://github.com/cenfun/turbogrid/blob/main/examples/components/turbogrid.vue).
- Complete parent demo: [examples/pages/vue-turbogrid.vue](https://github.com/cenfun/turbogrid/blob/main/examples/pages/vue-turbogrid.vue).
- Local route, with a repository checkout only: `#/vue-turbogrid` after `npm run dev`.
- Regression tests, with a repository checkout only: `test/specs/vue-turbogrid.js`, automatically included in `npm test` through the existing browser Mocha/Chai runner and Playwright coverage collection. Use `npm test -- --debug vue-turbogrid` for focused interactive debugging.
- Published demo (after deployment): <https://cenfun.github.io/turbogrid/#/vue-turbogrid>.

The wrapper is explicitly named `TurboGrid` through `defineOptions` (Vue 3.3+) and stored in `turbogrid.vue`. For an older supported host Vue version, use a normal `<script>` component-name export instead of assuming that macro exists. The wrapper is repository example source, not a `turbogrid/vue` package export. Import it as `TurboGrid` and use `<TurboGrid :columns="columns" :rows="rows" />` in Vue templates. The library's native constructor remains the separate named import `{ Grid }` from `'turbogrid'`; do not confuse the Vue component with the package's default namespace export.

The wrapper follows a production-style component pattern without project-specific directives, tooltip services, or batching dependencies. It imports Vue plus the repository Grid source only. **When copying it into an application, change its Grid import to `import { Grid } from 'turbogrid'`.** Its native `queueMicrotask` batches prop updates, and an unmount guard prevents queued work from recreating a destroyed Grid.

### Wrapper contract

| Input/output | Behavior |
| --- | --- |
| `columns`, `rows` | Arrays; rendering waits until both are arrays. Replace references to trigger a full data/config render. Tree items are recursively copied and `tg_*` fields omitted, preventing Grid normalization/sorting from mutating parent tree structure. Other nested business objects are not deep-cloned |
| `options` | Complete Grid options object, overriding wrapper defaults: container/window resize binding, empty state, text selection, and automatic column width |
| `formatters` | Complete custom formatter map; overrides safe default string/number/header text formatters. Custom HTML and tree formatters still require explicit escaping of untrusted values |
| `events` | Event-name → handler map, using normal `(event, data)` callbacks and Grid `this`. Replacements and removed keys only synchronize listeners, without rebuilding data or clearing selection/sort/width state; Grid's internal bindings remain intact |
| `renderSettings` | `true` preserves current scroll offsets during prop-driven rebuilds; an object supplies explicit scroll/render settings; `false`/`null` uses normal rendering. The wrapper always enforces `type: 'all'` because it supplies fresh cloned data/configuration |
| `updateToken` | String/number invalidation token. Changing it calls `grid.update()` for external formatter/filter state; it does **not** recopy mutated prop data |
| `autoColumnWidth` | Defaults to true; `options.autoColumnWidth` can override it |
| `autoTooltip` | Defaults to true; enables forwarding hover context through `@tooltip`. Changing it does not rebuild Grid. The wrapper never measures truncation, modifies title attributes, or renders tooltip UI |
| `@tooltip` | Receives the Grid hover payload (`cellNode`, `rowItem`, `columnItem`, `e`, etc.) on mouse-over. Receives null to dismiss on mouse-out, scroll, data/config rebuild, updateToken refresh, disabling forwarding, and unmount. The parent owns content, positioning, visibility, DOM, and cleanup |
| `@ready` | Emits the Grid instance after the initial render, once per component mount |
| `ref.getGrid()` | Returns the current Grid or null; wait for ready before calling initialized APIs. Keep any retained instance outside deep reactive state |

Give the wrapper an explicitly sized parent: it fills `width: 100%; height: 100%`. Do not add `deep: true` watchers for large datasets. `rows: []` clears the grid; null/non-array inputs mean not ready and leave an already rendered grid unchanged.

The parent demo shows immutable row replacement, custom money formatting, selection IDs, event-handler replacement/removal, external filter invalidation, scroll preservation, and unmount/remount. It handles `@tooltip` in the parent to provide native titles for truncated text while preserving application-owned titles, including titles on tree-name descendants. A different host can use its own tooltip/popover service with the same event; no tooltip implementation belongs in the reusable component.

For direct edits the demo synchronizes the business value and calls `getGrid().updateCell(...)`; when data props are replaced, the parent dataset becomes authoritative again. It synchronizes displayed selection IDs on `onSelectChanged` and when `onUpdated` observes a new source row array, since a full rebuild can clear selection without emitting a selection-change event. The row-array check avoids scanning all rows on ordinary virtual-scroll updates.

Use this convenience wrapper for declarative data/configuration changes. Replacing columns, rows, options, formatters, renderSettings, or autoColumnWidth rebuilds Grid data/configuration, so selection/sort/manual widths are not implicitly persisted. Event-map replacement and autoTooltip changes do not rebuild data. For high-frequency edits use exposed Grid APIs, and explicitly coordinate any state that must survive prop-driven rebuilds. The minimal wrapper below optimizes row-only prop replacement with `setRows` instead.

## Vue 3: data-driven container component

This can serve as a standalone `TurboGridView.vue`. The parent updates columns/rows by **replacing array references**. Avoid deep watches over large datasets.

```vue
<template>
  <div ref="container" class="orders-grid" />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { Grid } from 'turbogrid';

const props = defineProps({
    columns: { type: Array, required: true },
    rows: { type: Array, required: true }
});
const emit = defineEmits(['selection-change']);
const container = ref(null);
let grid;
let previousColumns;
const text = (value) => document.createTextNode(String(value ?? ''));

function applyData() {
    if (!grid) return;
    const rows = props.rows.map((row) => ({ ...row }));
    if (!grid.getOption() || previousColumns !== props.columns) {
        grid.setData({
            columns: props.columns.map((column) => ({ ...column })),
            rows
        });
        grid.render();
        previousColumns = props.columns;
    } else {
        grid.setRows(rows);
    }
}

onMounted(() => {
    grid = new Grid(container.value);
    grid.setFormatter({ string: text, number: text, header: text });
    grid.setOption({
        bindContainerResize: true,
        autoColumnWidth: true,
        selectVisible: true,
        rowNotFound: 'No data'
    });
    grid.bind('onSelectChanged.component', () => {
        emit('selection-change', grid.getSelectedRows().map((row) => row.id));
    });
    applyData();
});

watch([() => props.columns, () => props.rows], applyData);

onBeforeUnmount(() => {
    // First cancel application requests/timers and unmount manually mounted components.
    grid?.destroy();
    grid = undefined;
});
</script>

<style scoped>
.orders-grid {
    width: 100%;
    height: 420px;
    min-width: 0;
}
</style>
```

For local edits, call `grid.updateCell(id, field, value)` inside the component and emit business values for the parent to persist. Define one source of truth rather than having parent/child state overwrite each other. `setRows` does not guarantee application state such as cross-page selection; explicitly restore such state by ID.

### Vue parent page: columns, row updates, and selection

Save the container component above as `TurboGridView.vue`. Use it from an ordinary page, for example `OrdersPage.vue`:

```vue
<template>
  <section>
    <h1>Orders</h1>
    <button type="button" @click="addOrder">Add order</button>
    <button type="button" @click="updateFirstOrder">Update first amount</button>
    <p>Selected: {{ selectedIds.join(', ') || 'None' }}</p>
    <TurboGridView
      :columns="columns"
      :rows="rows"
      @selection-change="selectedIds = $event"
    />
  </section>
</template>

<script setup>
import { ref, shallowRef } from 'vue';
import TurboGridView from './TurboGridView.vue';

// Keep definitions stable; replace this array only when the schema changes.
const columns = [
    { id: 'title', name: 'Order', type: 'string', initWidth: 220, maxWidth: 900 },
    { id: 'amount', name: 'Amount', type: 'number', initWidth: 120 },
    { id: 'status', name: 'Status', type: 'string', width: 120 }
];
const rows = shallowRef([
    { id: 'order-1', title: 'Order A', amount: 128.5, status: 'Pending' },
    { id: 'order-2', title: 'Order B', amount: 260, status: 'Completed' }
]);
const selectedIds = ref([]);
let nextId = 3;

function addOrder() {
    const id = nextId++;
    rows.value = [...rows.value, {
        id: `order-${id}`, title: `Order ${id}`, amount: 0, status: 'Pending'
    }];
    selectedIds.value = []; // Explicit policy: reset selection on dataset replacement.
}

function updateFirstOrder() {
    rows.value = rows.value.map((row, index) => index === 0
        ? { ...row, amount: row.amount + 10 }
        : row);
    selectedIds.value = [];
}
</script>
```

A successful request can use the same path: assign a new array to `rows.value` and the container calls `setRows` after initialization. Use the host request layer and handle cancellation/errors; do not replace the Grid instance for each response. For high-frequency single-cell updates, use `updateCell` inside the container and coordinate business state with the parent instead of replacing all rows.

## React: separate instance creation from prop updates

This component supports ordinary browser React and Strict Mode's mount→cleanup→remount cycle. Stabilize columns with `useMemo` when appropriate. Mutating rows without changing their array reference does not trigger these effects.

```jsx
import { useEffect, useRef } from 'react';
import { Grid } from 'turbogrid';

export function TurboGridView({ columns, rows, onSelectionChange }) {
    const containerRef = useRef(null);
    const gridRef = useRef(null);
    const columnsRef = useRef(null);
    const selectionHandlerRef = useRef(onSelectionChange);

    useEffect(() => {
        selectionHandlerRef.current = onSelectionChange;
    }, [onSelectionChange]);

    useEffect(() => {
        const grid = new Grid(containerRef.current);
        gridRef.current = grid;
        const text = (value) => document.createTextNode(String(value ?? ''));
        grid.setFormatter({ string: text, number: text, header: text });
        grid.setOption({
            bindContainerResize: true,
            autoColumnWidth: true,
            selectVisible: true,
            rowNotFound: 'No data'
        });
        grid.bind('onSelectChanged.component', () => {
            selectionHandlerRef.current?.(
                grid.getSelectedRows().map((row) => row.id)
            );
        });
        return () => {
            grid.destroy();
            gridRef.current = null;
            columnsRef.current = null;
        };
    }, []);

    useEffect(() => {
        const grid = gridRef.current;
        if (!grid) return;
        const nextRows = rows.map((row) => ({ ...row }));
        if (!grid.getOption() || columnsRef.current !== columns) {
            grid.setData({
                columns: columns.map((column) => ({ ...column })),
                rows: nextRows
            });
            grid.render();
            columnsRef.current = columns;
        } else {
            grid.setRows(nextRows);
        }
    }, [columns, rows]);

    return <div ref={containerRef}
        style={{ width: '100%', height: 420, minWidth: 0 }} />;
}
```

Do not call `new Grid()` in the React render function or put instance creation in an effect that rebuilds it on every data change. Return business IDs from selection callbacks instead of writing internal mutable rows directly into React state.

### React parent page: stable columns, immutable rows, and selection

Save the container component above as `TurboGridView.jsx`. A typical `OrdersPage.jsx` uses it as follows:

```jsx
import { useMemo, useState } from 'react';
import { TurboGridView } from './TurboGridView.jsx';

export function OrdersPage() {
    const columns = useMemo(() => [
        { id: 'title', name: 'Order', type: 'string', initWidth: 220, maxWidth: 900 },
        { id: 'amount', name: 'Amount', type: 'number', initWidth: 120 },
        { id: 'status', name: 'Status', type: 'string', width: 120 }
    ], []);
    const [rows, setRows] = useState(() => [
        { id: 'order-1', title: 'Order A', amount: 128.5, status: 'Pending' },
        { id: 'order-2', title: 'Order B', amount: 260, status: 'Completed' }
    ]);
    const [selectedIds, setSelectedIds] = useState([]);

    function addOrder() {
        // Generate identity outside the state updater, which must stay pure.
        const id = crypto.randomUUID();
        setRows((current) => [...current, {
            id, title: 'New order', amount: 0, status: 'Pending'
        }]);
        setSelectedIds([]); // Explicit policy: reset selection on dataset replacement.
    }

    function updateFirstOrder() {
        setRows((current) => current.map((row, index) => index === 0
            ? { ...row, amount: row.amount + 10 }
            : row));
        setSelectedIds([]);
    }

    return (
        <section>
            <h1>Orders</h1>
            <button type="button" onClick={addOrder}>Add order</button>
            <button type="button" onClick={updateFirstOrder}>Update first amount</button>
            <p>Selected: {selectedIds.join(', ') || 'None'}</p>
            <TurboGridView columns={columns} rows={rows}
                onSelectionChange={setSelectedIds} />
        </section>
    );
}
```

Use `setRows(result.rows)` after an application request to update props; this is React's state setter, not a direct call to the Grid method. The container translates prop changes to Grid APIs. Stable columns prevent unrelated parent renders, such as selection changes, from causing schema rebuilds. The example's `crypto.randomUUID()` requires a modern browser in a secure context; use the host's ID generator if needed.

## Other frameworks: use the vanilla JavaScript API

For Angular, Svelte, Solid, Lit, Web Components, or any other host, start from the main skill's native JavaScript example. No additional framework-specific TurboGrid package or binding layer is required. Adapt only lifecycle and state ownership:

| Integration step | Native Grid operation | Host responsibility |
| --- | --- | --- |
| Mount | `new Grid(container)` | Supply a mounted DOM element with measurable size |
| Initialize | `setOption(options); setData({ columns, rows }); render()` | Register formatters/events before rendering |
| Replace rows | `setRows(nextRows)` | Wait for initial rendering; pass business data, not framework proxy state |
| Update one value | `updateCell(rowId, columnId, value)` | Coordinate application state and persistence |
| Receive events | `bind('onClick', (event, data) => ...)` | Send business values/IDs into host state |
| Reveal/resize | `resize()` | Call after visibility/layout changes |
| Unmount | `destroy()` | Also cancel application requests and clean up external resources |

For example, Angular can create in `ngAfterViewInit` and destroy in `ngOnDestroy`; Svelte can create in `onMount` and destroy in its returned cleanup function; custom elements can use `connectedCallback` / `disconnectedCallback` with guards against duplicate initialization. These lifecycle hooks belong to the host, not TurboGrid. Framework effects must update the existing instance rather than recreate it on every state change.

## SSR / Next.js / Nuxt

Grid creation and DOM access must occur only in the browser. In SSR projects, inspect whether the installed build touches DOM during module import. If uncertain, use a client-only component/boundary or dynamically `import('turbogrid')` inside the mounting lifecycle. Use `'use client'` for Next.js client components; it does not make every imported module safe for server evaluation.

Dynamic imports are asynchronous: set a disposed flag on unmount and check it before constructing Grid after the import resolves. Do not instantiate Grid in server loaders or fake a global `window` to bypass browser requirements.

## Framework components inside cells

Prefer DOM formatters plus Grid event delegation. Manually mount Vue apps/React roots only when complex component state is necessary:

1. Return a host DOM node from the formatter and explicitly mount the framework component; do not directly return VNode/JSX.
2. Track instances by business row ID + column ID, not permanent references to mutable view indexes.
3. Virtual scrolling/cache invalidation removes cell nodes; DOM removal is not framework unmounting. Define a reclamation strategy, such as unmounting roots whose hosts are detached, and clean up all remaining instances on full rebuild/final unmount.
4. Do not assume an `onCellDestroy` event exists; check that version's `getAllEvents()` or implementation.
5. Also clean up global listeners, floating nodes, and asynchronous callbacks owned by tooltips, popovers, context menus, and editors.

Repository Vue demos illustrate manual mounting, but their `vine-ui`, router, and random-data helpers are not TurboGrid dependencies and should not be copied verbatim into an independent host project.
