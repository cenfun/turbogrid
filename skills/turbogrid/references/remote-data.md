# Remote Data, Pagination, and Server Sorting

Use this reference when a page loads API data, pages through remote records, or delegates sorting/search to the server. It complements the core examples; it does not introduce a TurboGrid data-source API or another dependency.

## Choose the data model first

| Requirement | Model |
| --- | --- |
| All rows are already loaded | Local Grid filtering/sorting; bounded virtual scrolling |
| A page endpoint returns `{ rows, total }` | Application pagination; load a page and call `setRows` |
| Known total with arbitrary-position loading | `rowsLength` placeholders plus viewport loading; see the loading recipe |
| Unknown total with a cursor | Append batches with `addRow(batch, null, null, false)` and pending/hasMore guards |
| Expand a tree node to fetch children | `onRowSubsRequest` / `setRowSubs`; see the tree recipe |

A pagination `total` is not `rowsLength`: the latter constructs placeholder rows, not a page count. Local sorting/filtering affects only loaded records and must not be presented as whole-dataset remote sorting/search.

## A latest-request-wins page controller

The following helper uses an **already initialized, application-owned Grid**. Before the first request, render the column schema with `rows: []` and wait for `onNextUpdated` / the Vue wrapper's `ready` event. Keep pagination, loading, errors, and retry controls in host UI.

Application contract:

- `fetchPage(query, { signal })` returns a Promise of `{ rows: Array, total: nonNegativeInteger }` for a flat page.
- The request layer maps page/search/sort fields to the actual endpoint. Each row already has a validated, stable string ID and normalized numeric/date values.
- `onState(state)` updates host controls. `onError(error)` reports failures; callbacks should not throw.
- This helper retains the previous page on failure. Show the error clearly; use `appliedQuery` to identify which query produced the displayed rows.

```js
function createRemotePager(grid, { fetchPage, onState = () => {}, onError = console.error }) {
    let query = { page: 1, pageSize: 50, search: '', sortField: '', sortAsc: true };
    let appliedQuery = null;
    let total = 0;
    let error = null;
    let activeRequest = null;
    let disposed = false;

    const getState = () => ({
        query: { ...query },
        appliedQuery: appliedQuery ? { ...appliedQuery } : null,
        total,
        loading: activeRequest !== null,
        error
    });

    async function load(patch = {}) {
        if (disposed) return;
        query = { ...query, ...patch };
        activeRequest?.abort();
        const controller = new AbortController();
        activeRequest = controller;
        const requestedQuery = { ...query };
        error = null;
        grid.showLoading();
        onState(getState());

        try {
            const result = await fetchPage(requestedQuery, { signal: controller.signal });
            // Abort is best-effort: also reject stale responses by identity.
            if (disposed || activeRequest !== controller) return;
            if (!Array.isArray(result?.rows) || !Number.isInteger(result.total) || result.total < 0) {
                throw new Error('Expected a page result containing rows and a non-negative integer total');
            }
            // Copy flat business records because Grid adds metadata and can sort in place.
            grid.setRows(result.rows.map((row) => ({ ...row })));
            grid.setScrollTop(0);
            total = result.total;
            appliedQuery = requestedQuery;
        } catch (requestError) {
            if (disposed || activeRequest !== controller) return;
            if (requestError.name !== 'AbortError') {
                error = requestError;
                onError(requestError);
            }
        } finally {
            // An older request must not hide the newest request's loading state.
            if (!disposed && activeRequest === controller) {
                activeRequest = null;
                grid.hideLoading();
                onState(getState());
            }
        }
    }

    function dispose() {
        if (disposed) return;
        disposed = true;
        activeRequest?.abort();
        activeRequest = null;
        // Call dispose before grid.destroy(), while the overlay still exists.
        grid.hideLoading();
    }

    return { load, getState, dispose };
}
```

For example, wire the helper to an application endpoint. `/api/orders` and its response schema below are **application assumptions**, not TurboGrid endpoints:

```js
const pager = createRemotePager(grid, {
    fetchPage: async (query, { signal }) => {
        const params = new URLSearchParams({
            page: String(query.page),
            pageSize: String(query.pageSize),
            search: query.search,
            sortField: query.sortField,
            sortOrder: query.sortAsc ? 'asc' : 'desc'
        });
        const response = await fetch(`/api/orders?${params}`, { signal });
        if (!response.ok) throw new Error(`Orders request failed: ${response.status}`);
        return response.json();
    },
    onState: (state) => {
        // Update the host's page controls, total count, loading/error state.
        console.log(state);
    },
    onError: (error) => {
        // Replace with the host's toast/inline error UI, never raw error HTML.
        console.error(error);
    }
});

// Call after initial Grid rendering, not immediately after render().
void pager.load();
// Pagination/search actions:
// void pager.load({ page: 2 });
// void pager.load({ page: 1, pageSize: 100 });
// void pager.load({ page: 1, search: newSearch });
// Retry: void pager.load();
```

Validate/clamp page and pageSize in UI before calling load. Debounce remote search, reset page to 1 on search/page-size changes, and cancel debounce timers on unmount. Empty successful pages use `rows: []` and naturally show `rowNotFound`; errors are not empty results. Do not clear existing rows merely to display a loading overlay unless that is an explicit product decision.

## Server-side sorting

For header-driven remote sorting, allow sortable headers but cancel Grid's local sort in `onSort`. The native browser event is the second argument's `data.e`; cancelling only the custom first argument is insufficient.

Configure initial Grid options with `sortOnInit: false`, no local `rowFilter`/`rowFilteredSort`, and no preexisting active local sort. Keep action/non-sortable columns `sortable: false`. Do not set every column `sortable: false` if header `onSort` is needed: the library skips that event for non-sortable columns.

```js
// Map visible column IDs to allowed server fields; never trust arbitrary field names.
const remoteSortFields = new Map([
    ['title', 'title'],
    ['amount', 'amount']
]);

function onRemoteSort(event, data) {
    data?.e?.preventDefault();
    const sortField = remoteSortFields.get(data?.columnItem?.id);
    if (!sortField) return;
    const current = pager.getState().query;
    void pager.load({
        page: 1,
        sortField,
        sortAsc: current.sortField === sortField ? !current.sortAsc : true
    });
}

grid.bind('onSort.remote', onRemoteSort);

// On page/component unmount, in this order:
// grid.unbind('onSort.remote', onRemoteSort);
// pager.dispose();
// grid.destroy();
```

Calling `setSortColumn` after a response would sort only that loaded page; do not use it to draw a remote sort indicator. Represent remote sort state through application controls or a custom header formatter. Restore selection/edit drafts across pages by business ID in application state, not old runtime row references.

## Framework ownership

- **Vanilla JS / other frameworks:** use the helper with the mounted Grid and tie dispose to the host's teardown hook.
- **Vue `TurboGrid` wrapper:** either drive `rows` from application requests or use `getGrid()` after `ready`. Do not let imperative request results and stale `rows` props compete. If using the helper imperatively, synchronize parent business data before later prop-driven rebuilds. The wrapper copies its input records, so mutating the parent's row object plus changing `updateToken` does not copy that mutation into Grid.
- **React:** prefer request results in parent state, then pass new rows to the bundled container example. Keep AbortController/request identity in refs or in an effect cleanup. The helper is an alternative for explicitly imperative ownership, not something to layer on top of a second independent prop-driven updater.
- When the whole dataset/query scope changes, cancel old page/tree/viewport requests. Their row IDs or indexes may no longer refer to the same records.
