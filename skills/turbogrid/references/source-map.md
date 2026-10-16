# API Verification, Example Map, and Troubleshooting

## Sources and precedence

The bundled instructions are portable: initializing Grid does not require demo-site source files. Paths below are relative to the **TurboGrid repository root**, not this reference file. When the skill is copied elsewhere, those files may not be available. Use installed package declarations or online sources instead; do not invent missing local files.

- Getting started: `README.md`, `README.zh-Hans.md`.
- Full English API, embedded in a Vue page: `examples/pages/api-doc.vue`.
- Full Chinese API: `examples/pages/api-doc-zh.vue`.
- Signatures and return types: source `src/turbogrid.d.ts`; installed package `dist/turbogrid.d.ts`. In package-only mode, locate `turbogrid/package.json` with the resolver commands in the main skill and read the manifest's `types` file relative to its directory; do not resolve these paths relative to the host app.
- Actual option defaults: `src/config/default-options.js`.
- Column/row defaults: `src/config/default-column-props.js`, `src/config/default-row-props.js`.
- Actual formatters: `src/config/default-formatters.js`, `src/grid/formatter.js`.
- Event names: `src/core/event-types.js`; dispatch signature: `src/core/event-util.js`; DOM event payloads: `src/grid/events.js`.
- Behavioral assertions: relevant feature files in `test/specs/`.
- Release version: `package.json`; compatibility changes: `CHANGELOG.md`.

If sources disagree, inspect implementation/tests for **the version actually used by the host**. Some current declarations/documentation differ from runtime behavior, including frozen-count descriptions, the first event argument's shape, and formatter lists. The main skill's essential contracts were checked against implementation.

Online sources:

- English API: <https://cenfun.github.io/turbogrid/#/api-doc>
- Chinese API: <https://cenfun.github.io/turbogrid/#/api-doc-zh>
- Repository: <https://github.com/cenfun/turbogrid>
- Example URL pattern: `https://cenfun.github.io/turbogrid/#/<example-name>`.

## Bundled task references

- [recipes.md](recipes.md): local features, selection semantics, custom comparers, TypeScript, and virtualized navigation.
- [remote-data.md](remote-data.md): a complete latest-request-wins page controller, server sorting, loading/error handling, and framework state ownership.
- [frameworks.md](frameworks.md): Vue/React container and parent examples, the repository's `TurboGrid` Vue wrapper, and other-framework lifecycle mapping.

These references are sufficient for ordinary implementation without a local TurboGrid checkout. Consult the source map below only for advanced or version-specific details.

## Read only the examples needed for the task

Local pages are `examples/pages/<example-name>.vue`. Most use Vue as a demo shell, but their core `g.setOption / setData / bind / render` calls are framework-independent.

| Need | Example names | Focus |
| --- | --- | --- |
| Lifecycle and asynchronous rendering | `lifecycle`, `async` | onInit / onFirstUpdated / onUpdated; listener timing |
| Resizing and flexible columns | `resize`, `auto-column-width` | bindContainerResize; width versus initWidth |
| Content-driven height and row height | `auto-height`, `row-height` | autoHeight differs from cellResizeObserver |
| Caching and large datasets | `cache`, `performance-test`, `online-render` | Cache lengths, viewport, formatter cost |
| Replacing rows, inserting/deleting rows/columns | `set-rows`, `row-add-delete`, `column-add-delete` | Extract relevant functions, not entire large data fixtures |
| Column visibility and settings | `column-display`, `column-set` | showColumn/hideColumn; application settings panel |
| Grouped/hidden headers | `header-group`, `header-display` | columns.subs / headerVisible |
| Frozen layouts | `frozen`, `frozen-middle` | Boundary indexes, right/bottom freezing, helper columns |
| Sorting | `sort` | type, comparer, sortOnInit, preventing default sort |
| Filtering and relevance search | `row-filter`, `row-highlight-filter` | rowFilter, highlightKeywordsFilter, rowFilteredSort |
| Selection, group selection, selection limits | `row-select`, `row-select-group`, `row-select-limit` | Changed rows versus full selection; selectable |
| Tree collapse and lazy children | `row-collapse`, `load-subs` | subs, onRowSubsRequest, setRowSubs |
| Dragging and manual reordering | `row-drag`, `row-move` | Cross-level rules, selected-row APIs |
| Row numbers, hover, empty state | `row-number`, `row-hover`, `row-not-found` | Options and row states |
| Custom content, nulls, negative values | `formatter`, `negative-number`, `skeleton-screen` | DOM/HTML return values, null formatter |
| Row/cell lazy loading | `load-rows`, `load-cells` | rowsLength, viewport, load-state markers |
| Pagination and infinite scroll | `pagination`, `infinite-scroll` | Application-owned pagination/requests, not a built-in plugin |
| Events, input, and scrolling | `events`, `scroll`, `scrollbar`, `touch` | Second-argument payload, scrollbarType |
| Themes, styling, multiple instances | `style`, `multiple-instance` | Scoped CSS and per-instance cleanup |
| Floating UI and context menus | `tooltip`, `popover`, `context-menu` | Application extensions, positioning, listener cleanup |
| Data export | `export` | exportData returns a data snapshot only |
| Reusable Vue Grid wrapper | `vue-turbogrid` | [online TurboGrid Vue source](https://github.com/cenfun/turbogrid/blob/main/examples/components/turbogrid.vue), [online parent demo](https://github.com/cenfun/turbogrid/blob/main/examples/pages/vue-turbogrid.vue); props/events, render settings, updateToken, exposed instance |
| Vue mounting, cell components, editors | `vue-integration`, `vue-component`, `vue-editor` | Lifecycle and explicit mount/unmount; vue-component demonstrates components inside cells, not a Grid wrapper |
| Web Component wrapper | `custom-element` | Container and connected/disconnected lifecycle |
| Unusual extensions | `poc`, `comfyui`, `snake-game`, `conflict`, `other` | Read only when the task actually requires them |

Do not copy demonstration initialization from `examples/global.js`, routing, random-data helpers, or `vine-ui` components unnecessarily. Application imports use `'turbogrid'`, not the demo's `'../../src/index.js'`.

## Implementation lookup by question

| Question | Implementation |
| --- | --- |
| Does setData preserve fields? How does setOption replace configuration? | `src/grid/grid.js`, `src/grid/init-options.js` |
| Column/row normalization and subs initialization | `src/grid/init-columns.js`, `src/grid/init-rows.js` |
| Asynchronous rendering and scopes | `src/grid/render.js`, `src/core/microtask.js` |
| Local updates and cache invalidation | `src/grid/update.js`, `src/grid/flush.js` |
| Click payloads and default-action cancellation | `src/grid/events.js` |
| Source/view indexes and ID lookup | `src/grid/rows.js`, `src/grid/columns.js` |
| In-place sorting behavior | `src/grid/sort.js`, `src/components/sorter.js` |
| Tree expansion and empty-group requests | `src/grid/row-collapse.js`, `src/grid/init-rows.js` |
| Whether formatter output is escaped | `src/grid/cells.js`, `src/grid/node.js` |
| Fields included in export | `src/grid/export.js`, `src/grid/row-display.js`, `src/grid/column-display.js` |
| Resize, autoHeight, and observers | `src/grid/init-resize.js`, `src/grid/resize.js`, `src/grid/cells.js` |
| Cleanup scope | `src/grid/destroy.js` |

## Troubleshooting

| Symptom | First checks / fix |
| --- | --- |
| Nothing is visible | Container exists, is visible, has nonzero dimensions; render was called |
| Blank/misaligned after opening a tab/dialog | resize after showing; bindContainerResize; parent min-width/min-height |
| Changed options have no effect | render after setOption; data.options overrides; successive partial configuration objects |
| Flexible column widths do not work | Fixed width, default name→tree preset, maxWidth constraints |
| Selection callback omits selected rows | onSelectChanged payload is a delta; use getSelectedRows |
| Selecting an already selected row clears it | Multi-select setRowSelected toggles even when passed true; guard row.selected before ensuring selection |
| Custom sorting produces NaN or ignores direction | Comparer arguments are rows, this is Sorter; use its value helper or built-in comparer names |
| Clearing search leaves old highlights | Do not skip highlightKeywordsFilter for empty patterns; it clears old match caches |
| Click handler has no rowItem | Read second argument data; header/empty-space clicks may have no rowItem |
| Updates target the wrong row after sorting/filtering | Source/view index confusion or numeric business IDs treated as indexes; use string IDs/current row objects |
| Mutated values still show old content | Invalidate caches with updateCell/updateRow/update, not render alone |
| getRows/getCellNode is undefined | Wait for initial render; check viewport membership; register onNextUpdated before updating |
| JSX formatter renders an object string | No automatic framework mounting; return DOM or explicitly mount |
| Date/checkbox display is unexpected | Not all documented formatter names are built in; register business formatters |
| Search ranking is ignored | Active sortColumn; use removeSortColumn + update; rowFilter is required |
| Tree repeatedly loads children | Distinguish unloaded/pending/empty; null for empty results; guard concurrency/stale responses |
| Scrolling causes repeated requests/render loops | Unconditional render/update in onUpdated or missing loaded/pending state |
| An old page response overwrites a newer search | Abort old requests and verify current request identity before applying rows; see remote-data.md |
| Request body JSON has circular references | Runtime rows include tg_parent metadata; select business fields or use snapshots |
| Excel download does not start | exportData returns an object; encode and download in application code |
| Events/requests persist after navigation | In addition to destroy, cancel requests, unmount manually mounted components, and clear application listeners/timers |

## Validation

Validate the real host page's layout and interactions, not only JavaScript syntax. Browser automation can check headers/data, selection, ID-based updates after sorting, empty states, responsive layout, and teardown. Verify text safety using a harmless test string resembling `<img src=x onerror=...>` that must render only as text.

When maintaining the TurboGrid library repository itself:

- `npm run dev`: run the demo site.
- `npm test`: build and run Playwright browser unit tests/E2E; requires a usable browser environment.
- `npm run build`: build release artifacts and modify `dist/`; do not run unnecessarily for application-page or documentation work.
- `npm run lint` includes `--fix` and modifies source/examples; it is not a read-only check.

Skill-only documentation changes do not require library implementation changes, rebuilding dist, or updating dependencies.
