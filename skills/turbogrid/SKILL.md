---
name: turbogrid
description: Build or update high-performance browser data grids with TurboGrid (turbogrid). Use for grid/table pages, admin lists, large-data virtual scrolling, tree grids, grouped headers, sorting, search, row selection, frozen panes, custom cells, editors, pagination, lazy loading, and vanilla JavaScript, Vue, or React integration. Also applies to Chinese requests about TurboGrid 表格、数据表格、树形表格、虚拟滚动、排序筛选、冻结行列.
---

# Build Pages with TurboGrid

## Language and portability

- These instructions are in English for reuse across agents. **Follow the user's requested language for responses and generated UI copy**; the skill's language does not require English output or an English prompt.
- Understand equivalent requests in any language. Do not require users to translate their task or use exact English trigger words.
- Localize labels, empty states, dates, numbers, and currency to the host application's requirements. English strings and locales in examples are placeholders, not product requirements.
- Use standard browser/framework APIs and the host project's existing tools. No agent-specific commands or integrations are required.
- Distribute the entire `skills/turbogrid/` directory, including `references/`, not only `SKILL.md`. Resolve bundled links relative to this skill directory, not the host working directory. Repository source paths apply only when the TurboGrid checkout is available; offline agents can use the self-contained examples without fetching repository files.

## Loading from an npm installation

Installing `turbogrid` includes this skill but does **not** automatically register it with every agent. The host must explicitly load `skills/turbogrid/SKILL.md` from the installed package, or copy this entire skill directory into an agent-supported skills location. No postinstall script changes agent settings.

If the package is installed, locate it from the **host application root**, not from a globally copied skill directory:

```bash
node -p "require.resolve('turbogrid/skills/turbogrid/SKILL.md')"
node -p "require.resolve('turbogrid/package.json')"
```

Read the first resolved file, then follow its bundled `references/` links relative to that file. Read the resolved package manifest for the installed version and the `types` path; the latter resolves relative to the manifest's directory. This also works with package-manager layouts where a literal `node_modules/turbogrid` path is not reliable. These are file-resolution commands, not JavaScript imports of Markdown.

**Package-only/offline mode:** `dist/`, this skill, and all four references are included. Use the self-contained vanilla JS, Vue, React, and remote-data examples below/in references. Repository `src/`, `examples/`, and test files are not included; links to their online sources are optional, not prerequisites. Do not run the library repository's dev/test scripts inside an installed dependency or assume a repository demo component is a package export.

## Goal and workflow

TurboGrid is implemented in **vanilla JavaScript with no runtime dependencies**. It is framework-independent: Vue and React are optional host frameworks, not dependencies of TurboGrid. No framework-specific adapter package is required.

Reuse the host framework, build tools, request layer, and UI components; do not introduce another grid library or install a framework solely for Grid.

1. Inspect the host `package.json`, existing pages, package manager, and installed TurboGrid version. Reuse the existing dependency when available; otherwise install with the host's package manager and preserve its lockfile. Identify container layout, data fields, stable row IDs, and local versus remote sorting/search requirements.
2. Start with the working minimal example below, then add only needed features. Do not load every reference at once.
3. For feature patterns and TypeScript definitions, read [references/recipes.md](references/recipes.md). For request races, server pagination/sorting, loading/error states, and cancellation, read [references/remote-data.md](references/remote-data.md).
4. For Vue/React, reactive updates, SSR, and cleanup, read [references/frameworks.md](references/frameworks.md).
5. For advanced behavior or uncertain APIs, read [references/source-map.md](references/source-map.md), then inspect only the relevant documentation, example, or implementation.
6. Validate dimensions, interactions, asynchronous updates, and unmounting before delivering the changed files and usage notes.

Verified against repository version **3.4.1**, API documentation, type declarations, and implementation. If the installed version differs, use that version's behavior. Do not borrow property names from AG Grid, SlickGrid, or other libraries.

## Essential contracts

- Install: `npm i turbogrid`. Application import: `import { Grid } from 'turbogrid'`. The default export is a namespace object, not the Grid constructor.
- Published builds inject library styles through JavaScript. **Do not invent `turbogrid/dist/*.css` imports.** Script-tag usage loads `dist/turbogrid.js` and accesses `window.turbogrid.Grid`.
- Call `new Grid(container)` after DOM mounting. The container needs measurable width and height; start with `height: 420px; min-width: 0` for a bounded list.
- Lifecycle: `new Grid` → `setOption` / `setFormatter` → `setData({ columns, rows })` → `render()` → `destroy()` on unmount.
- `setData`, `setOption`, and `setFormatter` prepare the next render; call `render()` afterward. Mutation APIs such as `setRows`, `setColumns`, `updateRow`, and `updateCell` schedule rendering themselves.
- `render()` returns the instance, not a Promise, and runs asynchronously in a microtask. Calls in the same tick are coalesced; do not depend on intermediate render states. Register `onNextUpdated` or `once('onUpdated', ...)` **before** triggering an update when initialized data or DOM is needed.
- Event signature: **`function(event, data)`**. Click context, viewport, and changed rows are in the second argument. Regular event handlers receive the grid as `this`; arrow functions must use a closure. Custom sort comparers have a different context: see the sorting recipe.
- In multi-select mode, `setRowSelected(row)` and `setRowSelected(row, true)` **toggle** the row. Check `row.selected` before ensuring selection; use `setRowSelected(row, false)` to clear it or `selectAll(false)` to clear all. Do not treat the second argument as a general boolean setter.
- **String cell content is assigned to `innerHTML` without automatic escaping.** Escape untrusted values or return DOM/Text nodes populated through `textContent`. Escape user values interpolated into custom HTML too.
- Grid adds `tg_*` metadata to row/column objects and may sort data in place. Do not send runtime objects directly as request bodies or JSON-serialize the entire `getData()` result; select business fields or use snapshots.

## Working minimal example

Use inside an existing browser ESM/Vite-style project. HTML:

```html
<div id="orders-grid" style="height: 420px; width: 100%; min-width: 0;"></div>
```

JavaScript:

```js
import { Grid } from 'turbogrid';

const container = document.querySelector('#orders-grid');
if (!container) throw new Error('Missing #orders-grid container');
const grid = new Grid(container);

// Render external text safely; DOM nodes are not interpreted as HTML.
const text = (value) => document.createTextNode(String(value ?? ''));
grid.setFormatter({
    string: text,
    number: text,
    header: text
});

grid.setOption({
    theme: 'default',
    bindContainerResize: true,
    autoColumnWidth: true,
    rowHeight: 32,
    rowNumberVisible: true,
    selectVisible: true,
    selectMultiple: true,
    rowNotFound: 'No data'
});

grid.bind('onClick.page', function(event, data) {
    if (!data?.rowItem || !data?.columnItem) return;
    console.log('clicked', data.rowItem.id, data.columnItem.id);
});

grid.bind('onSelectChanged.page', function() {
    // The event payload contains changed rows, not the full selection.
    console.log('selected IDs', this.getSelectedRows().map((row) => row.id));
});

grid.setData({
    columns: [
        { id: 'title', name: 'Order', type: 'string', initWidth: 220,
            widthWeight: 2, maxWidth: 900 },
        { id: 'amount', name: 'Amount', type: 'number', initWidth: 120 },
        { id: 'status', name: 'Status', type: 'string', width: 110 }
    ],
    rows: [
        { id: 'order-1', title: 'Order A', amount: 128.5, status: 'Pending' },
        { id: 'order-2', title: 'Order B', amount: 260, status: 'Completed' }
    ]
});

grid.onNextUpdated(() => {
    console.log('visible rows', grid.getRowsLength());
});
grid.render();

// On page/component unmount: grid.destroy();
```

Use `text` for plain-text columns, not as a replacement for interactive built-ins such as `select` or `tree`. The default `null` formatter first converts missing values to `—`; register `null: (value) => value ?? ''` if empty strings are required.

## Choose an integration pattern

| Host | Typical example | Approach |
| --- | --- | --- |
| Vanilla JavaScript | Minimal example above | Create Grid after the container exists; update through Grid APIs; destroy when the page is removed |
| Vue 3 | [Vue component and parent page](references/frameworks.md#vue-3-data-driven-container-component) | Create in onMounted, watch array replacements, emit selection IDs, destroy in onBeforeUnmount |
| React | [React component and parent page](references/frameworks.md#react-separate-instance-creation-from-prop-updates) | Keep Grid in useRef, create/destroy in an effect, sync data in a separate effect |
| Other frameworks | [Vanilla JavaScript lifecycle mapping](references/frameworks.md#other-frameworks-use-the-vanilla-javascript-api) | Use the same native JS API with the host's DOM ref and mount/update/unmount hooks |

For Vue/React tasks, read the corresponding reference section: each includes a reusable Grid container **and a complete parent-page usage example** with column definitions, row updates, and selection handling. Do not translate native Grid calls into invented framework props or wrappers.

For a more configurable Vue wrapper, see the optional online repository [TurboGrid component](https://github.com/cenfun/turbogrid/blob/main/examples/components/turbogrid.vue), [parent demo](https://github.com/cenfun/turbogrid/blob/main/examples/pages/vue-turbogrid.vue), and bundled [wrapper API guide](references/frameworks.md#repository-example-configurable-turbogrid-wrapper). With a repository checkout, run the demo at `#/vue-turbogrid`. With only the npm package or no network access, use the self-contained Vue example in the bundled guide instead. The Vue wrapper is example source, **not an npm export**: copy it into the host project before importing it; do not invent `turbogrid/vue` or `import { TurboGrid } from 'turbogrid'`.

## Data and column reference

```js
const data = {
    columns: [
        { id: 'title', name: 'Title', type: 'string' },
        { id: 'amount', name: 'Amount', type: 'number', align: 'right' }
    ],
    rows: [{ id: 'r-1', title: 'Record', amount: 10 }]
};
```

- A column's `id` reads `rowItem[columnItem.id]`; `name` is its header. Do not substitute `field`, `headerName`, `dataSource`, or `columnDefs`.
- Prefer unique, stable **string** row IDs. Numeric API arguments mean source indexes, not numeric business IDs. For numeric IDs, call `getRowItemById(id)` and pass the returned row object.
- `getRowItem(number)` uses the full-tree source index; `getViewRowItem(number)` uses the visible index after filtering/collapsing. Columns also distinguish source and view indexes. Sorting/insertion/deletion can change indexes; prefer IDs or current row objects for business operations.
- `width` is fixed and excluded from `autoColumnWidth`. For flexible columns use `initWidth`, `widthWeight`, `minWidth`, and `maxWidth`. The default maximum width is 300; increase it explicitly for wide columns.
- Default `columnTypes` maps **`id: 'name'` to the tree type**, including a fixed-width preset. Use another ID or explicitly set `type: 'string'` for ordinary text. Explicitly set `type: 'tree'` for a tree column.
- Row `subs` holds child rows; column `subs` holds grouped headers. Do not substitute `children`.
- Common row properties: `selected`, `selectable`, `collapsed`, `height`, `classMap`, `styleMap`, `exportable`.
- Common column properties: `sortable`, `resizable`, `invisible`, `exportable`, `formatter`, `headerFormatter`, `comparer`.
- `data.options` overrides `setOption`. Prefer one application configuration source in `setOption` to avoid conflicting overrides.

## Choose the smallest update scope

| Change | API | Notes |
| --- | --- | --- |
| Initialize/replace complete data | `setData({ columns, rows }); render()` | Omitted columns are not preserved; use setRows for rows-only replacement |
| Replace all rows | `setRows(nextRows)` | After initial render; schedules rendering; not chainable |
| Replace all columns | `setColumns(nextColumns)` | Schedules a full rebuild; not chainable |
| Change one cell | `updateCell('r-1', 'amount', 99)` | Invalidates that cell and renders |
| Merge row fields | `updateRow('r-1', { status: 'Completed' })` | Invalidates that row and renders |
| Refresh an already mutated object | `updateRow(rowItem)` / `updateCell(rowItem, columnItem)` | Invalidate caches; render() alone is insufficient |
| Change external search/filter state | `update()` | Flushes body caches and reruns filtering/rendering |
| Change theme/structural options | `setOption(fullOptions); render()` | Maintain one configuration object, as below |
| Change container visibility/layout | `resize()` | Call after the container is visible and layout is ready |
| Explicit full rebuild | `rerender()` | Not for per-cell updates or every keystroke |

**Object configuration is not an accumulating patch API.** `setOption(object)` replaces the custom configuration source; repeated partial objects may discard previous settings. Maintain `options` and pass the complete object:

```js
const options = { bindContainerResize: true, selectVisible: true };
// For initial configuration and subsequent structural option changes:
Object.assign(options, { theme: 'dark' });
grid.setOption(options);
grid.render();
```

After initialization, `setOption(key, value)` modifies current runtime options; do not assume those changes persist through a later full rebuild. Centralize `setFormatter(object)` registrations too, rather than replacing the custom formatter source with successive partial objects.

## Performance and correctness rules

- Default to bounded containers and virtual scrolling for large data. Do not enable `autoHeight` to display every row.
- `rowCacheLength` / `columnCacheLength` default to 0. Increase modestly only after measurement; never set them to the total dataset size.
- Keep formatters synchronous and lightweight. Cache objects such as `Intl.NumberFormat`; do not fetch data or create heavyweight framework apps per cell.
- Never call `render()` / `update()` unconditionally inside `onUpdated`; this creates update loops. Remote loading needs pending/loaded/hasMore guards.
- Do not retain permanent references to virtual cell DOM. `getCellNode()` may return nothing for off-screen cells.
- The framework owns the outer container; Grid owns its contents. Do not let Vue/React also render children into that container.
- Deduplicate requests, handle failures, ignore stale responses, and cancel on unmount. The application must clean up its requests, timers, external listeners, and manually mounted components.
- Built-in sorting/filtering operates on loaded data. Define whole-dataset semantics for server pagination. Pagination controls, editors, tooltips, context menus, and file downloads are application extensions, not invented option switches.

## Delivery checklist

- [ ] Run in the real host framework; headers/rows are visible, dimensions are nonzero, and the console has no errors.
- [ ] Handle empty, loading, and failed-request states; untrusted text does not execute HTML.
- [ ] Numeric columns use `type: 'number'`; updates by ID still target the correct row after sorting.
- [ ] Clearing search restores rows and removes old highlights; selection callbacks read the complete selection where needed.
- [ ] Narrow layouts, sidebar resizing, and reopening hidden tabs work.
- [ ] Large-data scrolling does not create full-dataset DOM; local changes do not repeatedly recreate Grid.
- [ ] Route/component cleanup calls destroy; remounting does not duplicate listeners.
- [ ] Host controls are labeled; required keyboard/focus behavior is tested rather than assuming a complete spreadsheet editor or accessibility layer.

Report changed paths, implemented interactions, data-interface assumptions, and actual validation results in the user's language. Do not claim checks that were not run.
