# Common Feature Recipes

These snippets assume an existing `grid`. **Merge option fragments into one complete options object before initialization**; do not issue successive `setOption(partialObject)` calls. Run mutation snippets after the first `onUpdated`. Business endpoints, notifications, and persistence belong to the host application, not TurboGrid. Localize example UI copy and formatters to the user's application requirements.

## 1. Sorting, selection, row numbers, and frozen panes

```js
const options = {
    bindContainerResize: true,
    selectVisible: true,
    selectMultiple: true,  // false uses single selection/radio
    rowNumberVisible: true,
    sortField: 'amount',
    sortAsc: false,
    sortOnInit: true,     // sortField alone does not enable initial sorting
    frozenColumn: 0,      // Freeze the first business column, not zero columns
    frozenRow: -1         // No frozen rows
};
```

- `frozenColumn` / `frozenRow` are **inclusive, zero-based boundary indexes**: `-1` disables freezing, `0` freezes the first item, `1` freezes the first two.
- Left-side freezing additionally includes built-in selection/drag/row-number columns. Right-side freezing follows different logic; do not guess parameters by manually counting private columns.
- `frozenRight: true` / `frozenBottom: true` change the frozen edge. See `frozen.vue` for combinations.
- Column `type: 'number'` / `type: 'date'` determines comparison behavior. Use formatters for display; do not store currency-formatted strings as raw numbers.
- After initialization, `setSortColumn('amount')` triggers sorting; repeated calls on the same column toggle direction rather than idempotently setting ascending order.
- Sorting reorders source rows/subs. Do not use array positions as business identities.

```js
grid.bind('onSelectChanged.actions', function(event, changedRows) {
    const allSelected = this.getSelectedRows();
    // changedRows is the delta; allSelected is the complete selection.
    console.log(allSelected.map((row) => row.id));
});
// Trigger from application actions:
const row = grid.getRowItemById('order-1');
if (row && !row.selected) grid.setRowSelected(row);
grid.selectAll(false);
```

**Selection is not a general boolean setter.** With `selectMultiple: true`, both `setRowSelected(row)` and `setRowSelected(row, true)` toggle the row; `setRowSelected(row, false)` clears it. For idempotent selection, check `!row.selected` first. For multiple rows, pass only currently unselected/selectable rows to the toggle API. With `selectMultiple: false`, calling `setRowSelected(row)` selects that row; its second argument is ignored, so clear single selection through `selectAll(false)`. `selectAll(true)` is for multi-select mode only.

Set `selectable: false` on non-selectable rows. Row-click selection is not a generic `rowSelection` option: bind `onClick` and call `setRowSelected` according to product rules. Avoid double-handling clicks on buttons, links, and selection controls.

### Custom comparers receive rows, not cell values

`column.comparer` is either a registered name or `function(a, b, options)`. Here `a` and `b` are **row objects**, `options` includes `sortField`, `sortFactor`, and `sortBlankFactor`, and `this` is the internal **Sorter**, not Grid. Custom comparers are responsible for direction/blank handling; an ordinary `(a, b) => a - b` is incorrect.

Prefer built-in `type: 'number'`, `type: 'date'`, or `comparer: 'pinyin'` first. Normalize numeric API strings into real numbers when numeric ordering is intended: the number comparer distinguishes JavaScript numbers from strings.

For natural text ordering, reuse Sorter's value-comparison helper to retain direction, blank handling, and tie behavior:

```js
const naturalComparer = function(a, b, options) {
    return this.getDefaultComparer('value')(a, b, options, (av, bv) => {
        // The value helper expects reversed comparison; it applies sortFactor.
        return String(bv).localeCompare(String(av), 'en', { numeric: true });
    });
};
// Column: { id: 'title', name: 'Title', comparer: naturalComparer }
```

For remote sorting, intercept the native header event instead of sorting only the current page: see [remote-data.md](remote-data.md#server-side-sorting).

## 2. Search filtering and keyword highlighting

Keep search state in a closure or framework state, then call `update()` when it changes:

```js
let keywords = '';
const searchOptions = {
    rowNotFound: 'No matching records',
    rowFilter: function(rowItem) {
        return this.highlightKeywordsFilter(
            rowItem, ['title', 'status'], keywords
        );
    }
};
// Merge searchOptions into the initial options object.
function search(value) {
    keywords = value;
    grid.update();
}
```

A plain filter can simply `return rowItem.status === status`. `rowFilter` returns true to show a row; use a regular function if grid `this` is required. Always call `highlightKeywordsFilter` even when keywords are empty: it clears previous match caches/highlights and returns true. An early `if (!keywords) return true` can leave stale highlighting.

Highlight patterns support whitespace-separated terms, quoted phrases, `foo*bar` wildcards, `-legacy` exclusions, the `case:Grid` prefix, and regex/functions in object patterns. Debounce large-data search input. Never concatenate raw search input into HTML.

For relevance ranking, add this property to options:

```js
rowFilteredSort: {
    sortField: 'tg_match_score',
    sortAsc: false,
    comparer: 'number'
}
```

Ranking requires `rowFilter` and no active sort column. If searching should restore relevance order, call `grid.removeSortColumn(); grid.update();`. Local filtering does not search unloaded remote records.

## 3. Formatters, actions, currency, and dates

Column formatter signature: `function(value, rowItem, columnItem, cellNode, observerNode)`, with grid as `this`. Return HTML, DOM/Text nodes, or arrays of DOM nodes. React elements and Vue VNodes are not automatically mounted.

```js
// Replace locale/currency with the host application's settings.
const money = new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD'
});
const date = new Intl.DateTimeFormat('en-US');
const textNode = (value) => document.createTextNode(String(value ?? ''));
const formatters = {
    string: textNode,
    header: textNode,
    money: function(value, row) {
        return textNode(typeof row.amount === 'number'
            ? money.format(row.amount) : '—');
    },
    dateLabel: function(value, row, column) {
        const raw = row[column.id];
        const parsed = raw == null || raw === '' ? NaN : new Date(raw).getTime();
        return textNode(Number.isFinite(parsed) ? date.format(parsed) : '—');
    },
    actions: function() {
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.action = 'view';
        button.textContent = 'View';
        return button;
    }
};
// Include these in the centralized setFormatter registration object.
const columns = [
    { id: 'amount', name: 'Amount', type: 'number', formatter: 'money' },
    { id: 'createdAt', name: 'Created', type: 'date', formatter: 'dateLabel' },
    { id: 'actions', name: 'Actions', width: 100, sortable: false,
        exportable: false, formatter: 'actions' }
];

grid.bind('onClick.actions', function(event, data) {
    if (!data?.rowItem || data.columnItem?.id !== 'actions') return;
    const target = data.e?.target;
    if (!(target instanceof Element)) return;
    if (target.closest('[data-action="view"]')) {
        // Open the host application's detail dialog or route.
        console.log('view', data.rowItem.id);
    }
});
```

Event delegation is easier to clean up than per-cell global listeners. The native browser event is `data.e`, not the first argument; fields depend on event type and may be absent.

The `null` formatter runs first, then the row formatter (higher priority) or column formatter. Read `rowItem[columnItem.id]` for the raw value. The current implementation does not include dedicated localized-date or ordinary business boolean/checkbox formatters. Register them explicitly; `formatter: 'checkbox'` alone does not create an editable business checkbox. Built-in `select` handles row selection, not boolean-field editing.

## 4. Tree rows, grouped headers, and lazy children

Both static trees and grouped headers use `subs`:

```js
const data = {
    columns: [
        { id: 'label', name: 'Department / Person', type: 'tree', width: 260 },
        { name: 'Metrics', subs: [
            { id: 'count', name: 'Count', type: 'number' },
            { id: 'amount', name: 'Amount', type: 'number' }
        ] }
    ],
    rows: [{
        id: 'dept-1', label: 'Engineering', collapsed: false,
        subs: [{ id: 'person-1', label: 'Member A', count: 1, amount: 100 }]
    }]
};
```

Tree formatters assemble HTML. For user-provided labels, wrap the built-in formatter and escape the label:

```js
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[ch]);
// Register in the centralized formatter object:
const safeTree = function(value, row, column, cell) {
    return this.getDefaultFormatter('tree')(escapeHtml(value), row, column, cell);
};
// Tree column: { id: 'label', type: 'tree', formatter: 'safeTree' }
```

Use `collapseAllOnInit: true` for initial collapse. Runtime APIs include `expandRow(id)`, `collapseRow(id)`, `toggleRow(id)`, `expandAllRows()`, and `collapseAllRows()`.

Initialize a lazy parent with `subs: []`. The second argument to `onRowSubsRequest` is **the parent row itself**, not `{ rowItem }`. Below, the application supplies `fetchChildren(id, { signal })`, returning a child-row array, and `reportError(error)`:

```js
const pendingChildren = new Map();
let disposed = false;

grid.bind('onRowSubsRequest.remote', async function(event, parent) {
    if (disposed || pendingChildren.has(parent.id)) return;
    const controller = new AbortController();
    pendingChildren.set(parent.id, controller);
    try {
        const children = await fetchChildren(parent.id, { signal: controller.signal });
        if (disposed || grid.getRowItemById(parent.id) !== parent) return;
        // null removes empty-group status and prevents repeated empty requests.
        grid.setRowSubs(parent, children.length ? children : null);
    } catch (error) {
        if (error.name !== 'AbortError' && !disposed) reportError(error);
    } finally {
        pendingChildren.delete(parent.id);
    }
});

// Include in application cleanup, before grid.destroy():
function disposeTreeRequests() {
    disposed = true;
    pendingChildren.forEach((controller) => controller.abort());
    pendingChildren.clear();
}
```

Also cancel old tree requests when replacing the dataset. Child IDs must be unique across the entire tree.

## 5. Add, remove, update, hide, and drag

```js
grid.addRow({ id: 'order-3', title: 'New order', amount: 30 });
grid.updateRow('order-3', { status: 'Pending' });
grid.updateCell('order-3', 'amount', 35);
grid.deleteRow('order-3');
// Pass arrays for batch operations; avoid repeated full setData in loops.
grid.deleteRow(grid.getSelectedRows());

grid.hideColumn('status');
grid.showColumn('status');
grid.setColumnWidth('amount', 180);
```

`addRow(rowOrArray, parent = null, position = null, scrollTo = ...)` and `addColumn` support parent nodes and insertion positions. Specify whether to scroll to new items; infinite-scroll appending typically uses `grid.addRow(batch, null, null, false)`.

`rowDragVisible: true` enables drag handles; use `rowDragCrossLevel: false` to restrict hierarchy changes. Up/down buttons can use `moveSelectedRowsUp()` / `moveSelectedRowsDown()`. Define how manual ordering interacts with sorted views; persistence after dragging is application-owned.

## 6. Pagination, remote requests, viewport loading, and infinite scroll

### Application pagination, not a built-in pagination option

- Client pagination: retain the complete array in application state and call `grid.setRows(allRows.slice(start, end))`. Sort/search before slicing, otherwise only the current page is affected.
- Server pagination: maintain page/pageSize/total, request the page, then call `setRows(result.rows)`. Use total in application pagination controls, not `rowsLength: total` as a pagination count.
- Use `showLoading()` before requests and `hideLoading()` appropriately after success/failure/cancellation. Report failures through host UI. Use AbortController or request sequence numbers to prevent stale pages overwriting newer ones.
- Explicitly call `setScrollTop(0)` if page replacement should reset scroll. Persist selection, drafts, and cross-page selection by business ID in application state.

For a complete application-side request controller with cancellation, stale-response protection, loading state, and a server-sort event handler, read [remote-data.md](remote-data.md). It uses the same Grid APIs without another dependency.

### Known total, load by viewport

Initialize with `setData({ columns, rowsLength: total })`; Grid creates placeholder rows. Listen to `onUpdated(event, viewport)`, resolve `viewport.rows` through `getViewRowItem(viewIndex)`, and batch-load missing data. Update the current row object with `updateRow(row, payload)`; do not assume view indexes are source indexes.

Track loaded/pending/failed state and dataset versions, merge overlapping requests, and cancel stale work. Subsequent `onUpdated` events must recognize completed loads instead of requesting again. Positional remote loading typically disables local sorting (`columnProps: { sortable: false }`) or delegates sorting to the server and resets placeholders. See `load-rows.vue` and `load-cells.vue`.

### Unknown total, append near the bottom

Listen to `onScroll` and check `grid.getMaxScrollTop() - grid.getScrollTop() < threshold`. Trigger an initial load when content does not fill the viewport. Guard with pending and hasMore, then append with `addRow(batch, null, null, false)`. Define server ordering, deduplication, and termination on empty results. Do not copy demonstration requests without concurrency protection.

## 7. Editors, styling, and export boundaries

### Editing

`editable: true` does not automatically generate editors. Return input/select/checkbox elements from formatters or explicitly mount host UI editors. Validate on commit and call `updateCell(row, column, newValue)`; the application owns persistence.

A basic native input formatter, registered as `quantityEditor` on a `type: 'number'` column:

```js
function quantityEditor(value, row, column) {
    const input = document.createElement('input');
    input.type = 'number';
    input.value = row[column.id] ?? '';
    input.disabled = row.selectable === false; // Example business rule; replace as needed.
    input.addEventListener('change', () => {
        const number = Number(input.value);
        if (input.value !== '' && Number.isFinite(number)) {
            grid.updateCell(row, column, number);
        }
    });
    return input;
}
```

Refreshing an editor can replace its node and lose focus. Do not rebuild on every keystroke. Complex editors need explicit commit/cancel, validation, save-failure rollback, and draft ownership during virtual scrolling.

### Styling

Prefer retaining the default root class `tg-turbogrid` and scope overrides with an outer page class. Themes: `default`, `lightblue`, `dark`. Columns support `classMap` / `styleMap` / `headerClassMap` / `headerStyleMap`; rows support `classMap` / `styleMap`. Per-row cell styles use fields such as `amountClassMap` / `amountStyleMap`, prefixed with the column ID. These accept strings/arrays/maps, not a generic `cellStyle(params)` callback.

After dynamic row-style changes, call `updateRow(row)`. Apply structural style/theme changes through the centralized options object and render. Vue scoped styles may need `:deep(...)` or page-scoped global CSS to reach generated nodes.

### Export

`grid.exportData()` **returns `{ columns, rows }`; it does not generate Excel/CSV files or download controls**. `getItemSnapshot(row)` removes that item's `tg_*` fields and `subs`; `exportData()` recursively snapshots the exportable tree.

`exportable: false` excludes corresponding rows/columns; hidden items may also be excluded. Neither `private: true` nor `exportable: false` is a sensitive-data security filter. Excluding a column does not necessarily remove the corresponding business field from each row object. Prefer explicit field allowlists for uploads/public exports:

```js
const payload = grid.getSelectedRows().map((row) => ({
    id: row.id, title: row.title, amount: row.amount
}));
const snapshot = grid.exportData({ internalToken: false });
```

CSV/XLSX encoding, tree flattening, formula-injection protection, file downloads, and exporting all remote records require application logic or an appropriate file library.

## 8. TypeScript definitions

The package ships its own declarations; do not install a separate `@types/turbogrid` or use another grid library's types. Type the same definitions used by the main example:

```ts
import type { ColumnItem, GridData, GridOptions, RowItem } from 'turbogrid';

interface OrderRow extends RowItem {
    id: string;
    title: string;
    amount: number;
}

const orderColumns: ColumnItem[] = [
    { id: 'title', name: 'Order', type: 'string' },
    { id: 'amount', name: 'Amount', type: 'number' }
];
const orderRows: OrderRow[] = [
    { id: 'order-1', title: 'Order A', amount: 10 }
];
const orderOptions: GridOptions = { bindContainerResize: true };
const orderData: GridData = { columns: orderColumns, rows: orderRows };
// Use with the main example's safe formatters:
// grid.setOption(orderOptions); grid.setData(orderData); grid.render();
```

Validate unknown server payloads before constructing these values. Grid's permissive custom-property types are not runtime validation. Use the installed version's declarations, and verify event payload placement against the event contracts in the main skill rather than assuming the first argument contains row data.

## 9. Navigating virtualized cells

Prefer `scrollRowIntoView(rowId)` / `scrollCellIntoView(rowId, columnId)` for the smallest scroll, or `scrollToRow` / `scrollToCell` to position explicitly. Register `onNextUpdated` before scrolling if reading the resulting cell DOM:

```js
const existingCell = grid.getCellNode('order-1', 'amount');
if (existingCell) {
    console.log(existingCell.textContent);
} else {
    grid.onNextUpdated(() => {
        const node = grid.getCellNode('order-1', 'amount');
        if (node) console.log(node.textContent);
    });
    grid.scrollCellIntoView('order-1', 'amount');
}
```

Scroll helpers do not load nonexistent remote rows or reveal filtered/collapsed ancestors automatically. Ensure the row is loaded and visible first. A no-op scroll may produce no update, so a completion callback is not guaranteed when the cell is already visible; read an existing `getCellNode` first if immediate access is sufficient. For editor focus/keyboard navigation, add explicit host behavior rather than assuming Grid has a spreadsheet editing model.
