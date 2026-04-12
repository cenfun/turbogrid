// Type definitions for TurboGrid
// https://github.com/cenfun/turbogrid

export type StyleMap = string | string[] | Record<string, boolean | string | number>;
export type ClassMap = string | string[] | Record<string, boolean>;

// =============================================================================
// Column

export interface ColumnItem {
    /** Column identifier, used to map row values to columns */
    id?: string;
    /** Display name shown in the header */
    name?: string;
    /** Column type for formatting, e.g. "string", "number", "date" */
    type?: string;

    /** Cell formatter: a registered formatter name or a custom function */
    formatter?: string | ((value: any, rowItem: RowItem, columnItem: ColumnItem, cellNode: HTMLElement, observerNode?: HTMLElement) => any);
    /** Header cell formatter: a registered formatter name or a custom function */
    headerFormatter?: string | ((value: any, rowItem: RowItem, columnItem: ColumnItem, cellNode: HTMLElement) => any);

    /** Custom comparer function for sorting */
    comparer?: string | ((a: any, b: any, options: any) => number);

    /** Text alignment: left (default), center, or right */
    align?: 'left' | 'center' | 'right';

    width?: number;
    minWidth?: number;
    maxWidth?: number;
    height?: number;

    /** Whether the column is sortable (default: true) */
    sortable?: boolean;
    sortAsc?: boolean;
    /** Whether the column is resizable (default: true) */
    resizable?: boolean;
    /** Whether the column is included in exportData() (default: true) */
    exportable?: boolean;

    /** Whether the column is hidden */
    invisible?: boolean;
    /** Whether the column is private and excluded from exports */
    private?: boolean;

    classMap?: ClassMap;
    styleMap?: StyleMap;
    headerClassMap?: ClassMap;
    headerStyleMap?: StyleMap;

    /** Nested sub-columns for grouped headers */
    subs?: ColumnItem[];

    /** @internal */ tg_index?: number;
    /** @internal */ tg_view_index?: number;
    /** @internal */ tg_sub_index?: number;
    /** @internal */ tg_list_index?: number;
    /** @internal */ tg_width?: number;
    /** @internal */ tg_left?: number;
    /** @internal */ tg_frozen?: boolean;
    /** @internal */ tg_group?: boolean;
    /** @internal */ tg_parent?: ColumnItem;
    /** @internal */ tg_subs_length?: number;
    /** @internal */ tg_invisible?: boolean;
    /** @internal */ tg_height?: number;
    /** @internal */ tg_layer?: number;

    [key: string]: any;
}

// =============================================================================
// Row

export interface RowItem {
    id?: string;
    name?: string;
    /** Row type for CSS class name, e.g. "group" */
    type?: string;

    /** Whether the row is selected */
    selected?: boolean;
    /** Whether the row can be selected (default: true) */
    selectable?: boolean;
    /** Whether the row is collapsed */
    collapsed?: boolean;
    /** Whether the row is included in exportData() (default: true) */
    exportable?: boolean;

    /** Row-level cell formatter: a registered formatter name or a custom function */
    formatter?: string | ((value: any, rowItem: RowItem, columnItem: ColumnItem, cellNode: HTMLElement, observerNode?: HTMLElement) => any);

    /** Keeps the row at a fixed position during sort. "top" pins it to the top */
    sortFixed?: boolean | 'top';

    /** Custom row height in pixels */
    height?: number;

    classMap?: ClassMap;
    styleMap?: StyleMap;

    /** Nested child rows for tree structure */
    subs?: RowItem[];

    /** @internal */ tg_index?: number;
    /** @internal */ tg_view_index?: number;
    /** @internal */ tg_sub_index?: number;
    /** @internal */ tg_list_index?: number;
    /** @internal */ tg_level?: number;
    /** @internal */ tg_group?: boolean;
    /** @internal */ tg_frozen?: boolean;
    /** @internal */ tg_parent?: RowItem;
    /** @internal */ tg_subs_length?: number;
    /** @internal */ tg_height?: number;
    /** @internal */ tg_top?: number;
    /** @internal */ tg_row_number?: number | string;
    /** @internal */ tg_invisible?: boolean;
    /** @internal */ tg_filtered?: boolean;
    /** @internal */ tg_selected_index?: number;

    [key: string]: any;
}

// =============================================================================
// Data

export interface GridData {
    columns?: ColumnItem[];
    rows?: RowItem[];
    /** Total row count for lazy loading when rows are not all provided upfront */
    rowsLength?: number;
    /** Options applied from the data payload, takes precedence over setOption() */
    options?: GridOptions;
}

// =============================================================================
// Sort Comparers

export interface SortComparers {
    string?: (a: any, b: any, options: any) => number;
    number?: (a: any, b: any, options: any) => number;
    [name: string]: ((a: any, b: any, options: any) => number) | undefined;
}

// =============================================================================
// Column Types

export interface ColumnTypeDefinition {
    type?: string;
    formatter?: string;
    align?: string;
    width?: number;
    minWidth?: number;
    maxWidth?: number;
    [key: string]: any;
}

export interface ColumnTypes {
    [typeOrId: string]: ColumnTypeDefinition | string;
}

// =============================================================================
// Highlight Keywords

export interface HighlightKeywords {
    textKey?: string;
    textGenerator?: ((rowItem: RowItem, id: string) => string) | null;
    highlightKey?: string;
    highlightPre?: string;
    highlightPost?: string;
}

// =============================================================================
// Options

export interface GridOptions {
    container?: string | HTMLElement;

    /** Root CSS class name used as the grid namespace (default: "tg-turbogrid") */
    className?: string;
    /** Theme name: "default", "lightblue", "dark" */
    theme?: string;

    /** Shows or hides the header area (default: true) */
    headerVisible?: boolean;

    // row
    /** Default row height in pixels (default: 32) */
    rowHeight?: number;
    /** Filters rows before rendering. Return true to show the row */
    rowFilter?: ((rowItem: RowItem, index: number, parent?: RowItem) => boolean) | null;
    /** Optionally sorts filtered matches */
    rowFilteredSort?: string | RowItem | (() => string | RowItem | null) | null;
    /** Empty-state content when no rows match. Accepts string, element, or factory function */
    rowNotFound?: string | HTMLElement | ((this: Grid, info: any) => string | HTMLElement);
    /** Whether move APIs can move rows across hierarchy levels (default: true) */
    rowMoveCrossLevel?: boolean;
    /** Extra rows rendered outside the viewport as cache (default: 0) */
    rowCacheLength?: number;
    /** Default properties applied to all rows */
    rowProps?: Record<string, any>;

    // column
    /** Preset column types and id-to-type mappings */
    columnTypes?: ColumnTypes;
    /** Extra columns rendered outside the viewport as cache (default: 0) */
    columnCacheLength?: number;
    /** Default properties applied to all columns */
    columnProps?: Record<string, any>;

    // collapse
    /** Whether all rows are collapsed on init. true = collapse all, false = expand all, null = unchanged */
    collapseAllOnInit?: boolean | null;
    /** Whether the collapse-all toggle is visible in the header (default: true) */
    collapseAllVisible?: boolean;

    // select
    /** Whether all rows are selected on init. true = select all, false = clear all, null = unchanged */
    selectAllOnInit?: boolean | null;
    /** Whether selection checkbox column is visible (default: false) */
    selectVisible?: boolean;
    /** Whether the select-all checkbox is visible in the header (default: true) */
    selectAllVisible?: boolean;
    /** Whether multiple rows can be selected (default: true) */
    selectMultiple?: boolean;
    /** Configuration for the built-in select checkbox column */
    selectColumn?: ColumnItem;

    // row drag
    /** Whether dragged rows can move across levels. Accepts boolean or filter function (default: true) */
    rowDragCrossLevel?: boolean | ((rowItem: RowItem) => boolean);
    /** Whether the built-in row drag handle column is visible (default: false) */
    rowDragVisible?: boolean;
    /** Configuration for the built-in row drag column */
    rowDragColumn?: ColumnItem;

    // row number
    /** Width of the row number column in pixels (default: 36) */
    rowNumberWidth?: number;
    /** Filter which rows show a row number */
    rowNumberFilter?: ((rowItem: RowItem, index: number) => boolean) | null;
    /** Whether the row number column is visible (default: false) */
    rowNumberVisible?: boolean;
    /** Configuration for the built-in row number column */
    rowNumberColumn?: ColumnItem;

    // blank
    /** Configuration for the built-in blank filler column */
    blankColumn?: ColumnItem;

    // sort
    /** Field used for sorting comparisons */
    sortField?: string;
    /** true = ascending, false = descending (default: true) */
    sortAsc?: boolean;
    /** Whether blank values are kept at the bottom during sorting (default: true) */
    sortBlankValueBottom?: boolean;
    /** Custom comparer functions for sorting */
    sortComparers?: SortComparers;
    /** Whether the grid sorts by sortField during initialization (default: false) */
    sortOnInit?: boolean;
    /** Sort indicator style: "h" (horizontal) or "v" (vertical) */
    sortIndicator?: 'h' | 'v';

    // highlight
    /** Configuration for keyword highlighting and text extraction */
    highlightKeywords?: HighlightKeywords;

    // frozen
    /** Number of frozen rows from top (default: -1, disabled) */
    frozenRow?: number;
    /** Maximum number of frozen rows allowed (default: 10) */
    frozenRowMax?: number;
    /** Whether frozen rows respond to hover styles and events (default: false) */
    frozenRowHoverable?: boolean;
    /** Whether frozen rows are pinned to the bottom instead of top (default: false) */
    frozenBottom?: boolean;
    /** Number of frozen columns from left (default: -1, disabled) */
    frozenColumn?: number;
    /** Maximum number of frozen columns allowed (default: 10) */
    frozenColumnMax?: number;
    /** Whether frozen columns are pinned to the right instead of left (default: false) */
    frozenRight?: boolean;

    // scrollbar
    /** Base scrollbar thickness in pixels (default: 12) */
    scrollbarSize?: number;
    /** Horizontal scrollbar size override, null uses scrollbarSize */
    scrollbarSizeH?: number | null;
    /** Vertical scrollbar size override, null uses scrollbarSize */
    scrollbarSizeV?: number | null;
    /** Whether scrollbar corners are rounded (default: false) */
    scrollbarRound?: boolean;
    /** Whether scrollbars fade in/out (default: false) */
    scrollbarFade?: boolean;
    /** Delay in ms before faded scrollbars are hidden (default: 1000) */
    scrollbarFadeTimeout?: number;
    /** Scrollbar preset: "auto" or "mobile" (fade + size 6) */
    scrollbarType?: 'auto' | 'touch' | 'classic';

    // scroll pane
    /** Minimum width of the scroll pane in pixels (default: 30) */
    scrollPaneMinWidth?: number;
    /** Whether gradient masks are shown on scroll pane edges (default: false) */
    scrollPaneGradient?: boolean;

    // other
    /** Automatically adjust grid height to fit visible content (default: false) */
    autoHeight?: boolean;
    /** Whether text selection is allowed inside grid cells (default: false) */
    textSelectable?: boolean;
    /** Bind window resize to automatically call resize() (default: false) */
    bindWindowResize?: boolean;
    /** Use ResizeObserver to watch container size and call resize() (default: false) */
    bindContainerResize?: boolean;
    /** Filter which cells are observed for size changes via ResizeObserver */
    cellResizeObserver?: ((rowItem: RowItem, columnItem: ColumnItem) => boolean) | null;

    /** Formatters can be passed via options */
    formatters?: Record<string, (value: any, rowItem: RowItem, columnItem: ColumnItem, cellNode: HTMLElement, observerNode?: HTMLElement) => any>;

    [key: string]: any;
}

// =============================================================================
// Event Types

export type GridEventType =
    | 'onUpdated'
    | 'onFirstUpdated'
    | 'onHeaderUpdated'
    | 'onSort'
    | 'onColumnAdded'
    | 'onColumnRemoved'
    | 'onColumnWidthChanged'
    | 'onRowAdded'
    | 'onRowRemoved'
    | 'onRowExpanded'
    | 'onRowCollapsed'
    | 'onRowSubsRequest'
    | 'onRowDragged'
    | 'onRowDropped'
    | 'onRowMoved'
    | 'onRowMouseEnter'
    | 'onRowMouseLeave'
    | 'onSelectChanged'
    | 'onCellUpdated'
    | 'onCellMouseEnter'
    | 'onCellMouseLeave'
    | 'onClick'
    | 'onDblClick'
    | 'onContextMenu'
    | 'onMouseOver'
    | 'onMouseOut'
    | 'onTouchStart'
    | 'onTouchMove'
    | 'onTouchEnd'
    | 'onScroll'
    | 'onScrollStateChanged'
    | 'onMouseWheel'
    | 'onResize'
    | 'onLayout'
    | 'onKeyDown'
    | 'onDestroy';

// =============================================================================
// Event Data

export interface EventData {
    e?: Event;
    rowItem?: RowItem;
    columnItem?: ColumnItem;
    cellNode?: HTMLElement;
    rowNode?: HTMLElement;
    row?: number;
    column?: number;
    [key: string]: any;
}

export type EventHandler = (e: EventData, data?: any) => void;

// =============================================================================
// EventBase

export declare class EventBase {
    maxListeners: number;
    setMaxListeners(n: number): void;
    getMaxListeners(): number;
    /** Binds an event handler. Supports namespaced events like "onUpdated.demo" */
    bind(types: string | string[], handler: EventHandler, options?: { once?: boolean }): this;
    /** Binds a handler that runs once and is removed after the first trigger */
    once(types: string | string[], handler: EventHandler): this;
    /** Removes previously bound event handlers */
    unbind(types?: string | string[], handler?: EventHandler, options?: any): this;
    /** Triggers an event and calls all bound handlers */
    trigger(type: string, data?: any): this;
}

// =============================================================================
// Grid

export declare class Grid extends EventBase {

    static $: QueryFunction;
    static getInstance(id: string): Grid | undefined;
    static getAllThemes(): string[];
    static getAllEvents(): string[];
    static VERSION: string;
    static TIMESTAMP: string;

    $: QueryFunction;
    VERSION: string;
    TIMESTAMP: string;

    /**
     * Creates a new grid instance.
     * @param container - CSS selector, DOM element, or options object with a container property
     */
    constructor(container: string | HTMLElement | GridOptions);

    // Event binding with typed events
    /** Binds an event handler. Supports namespaced events like "onUpdated.demo" */
    bind(types: GridEventType | GridEventType[] | string | string[], handler: EventHandler, options?: { once?: boolean }): this;
    /** Binds a handler that runs once and is removed after the first trigger */
    once(types: GridEventType | GridEventType[] | string | string[], handler: EventHandler): this;
    /** Removes previously bound event handlers */
    unbind(types?: GridEventType | GridEventType[] | string | string[], handler?: EventHandler, options?: any): this;

    // Options
    /** Sets a single grid option */
    setOption(key: string, value: any): this;
    /** Sets multiple grid options */
    setOption(options: GridOptions): this;
    /** Returns the full options object */
    getOption(): GridOptions;
    /** Returns the value of a single option */
    getOption(key: string): any;

    // Data
    /** Sets the grid data including columns, rows, rowsLength, and options */
    setData(data: GridData): this;
    /** Loads data from a plain snapshot by stripping tg_* fields and rebuilding tree state */
    setDataSnapshot(data: any): this;
    /** Returns the current grid data object */
    getData(): GridData;
    /** Returns a sanitized snapshot of a row or column item with tg_* fields removed */
    getItemSnapshot(item: RowItem | ColumnItem, keysSettings?: Record<string, boolean>): Record<string, any>;

    // Formatter
    /** Registers a single formatter by type name */
    setFormatter(key: string, value: (...args: any[]) => any): this;
    /** Registers multiple formatters at once */
    setFormatter(formatters: Record<string, (...args: any[]) => any>): this;
    /** Returns the formatter function registered for the specified type */
    getFormatter(name: string): ((...args: any[]) => any) | undefined;
    /** Returns the built-in formatter function for the specified type, falls back to string formatter */
    getDefaultFormatter(type?: string): (...args: any[]) => any;

    // Events
    /** Returns all supported event types */
    getAllEvents(): string[];

    // Render
    /** Schedules a render pass. Repeated calls in the same tick are merged */
    render(): this;
    /** Forces a full rebuild of the grid structure and renders it again */
    rerender(): this;
    /** Recalculates the layout and optionally applies a new size */
    resize(width?: number | string | Record<string, any>, height?: number | string): this;

    // Update
    /** Updates the grid body */
    update(): this;
    /** Merges partial rowData into the existing row and rerenders */
    updateRow(rowIndex: number | string | RowItem, rowData?: Partial<RowItem>): this;
    /** Updates a single cell value and rerenders */
    updateCell(rowIndex: number | string | RowItem, columnIndex: number | string | ColumnItem, value?: any): this;
    /** Registers a one-time handler for the next onUpdated event */
    onNextUpdated(callback: (this: Grid) => void): this;

    // Flush
    /** Clears all cached row renders */
    flushBody(): void;
    /** Clears the row cache used after sorting */
    flushSort(): void;
    /** Clears cached render for a specific row (by view index) */
    flushRow(viewRowIndex: number): void;
    /** Clears cached renders for all rows from the specified view index onward */
    flushRowFrom(viewRowIndex: number): void;
    /** Clears cached render for a specific column (by view index) */
    flushColumn(viewColumnIndex: number): void;
    /** Clears cached renders for all columns from the specified view index onward */
    flushColumnFrom(viewColumnIndex: number): void;
    /** Clears cached render for a specific cell */
    flushCell(viewRowIndex: number, viewColumnIndex: number): void;

    // Column API
    /** Returns the source top-level columns */
    getColumns(): ColumnItem[];
    /** Returns visible columns. Pass true to also include visible group columns */
    getViewColumns(all?: boolean): ColumnItem[];
    /** Returns a column by its visible view index */
    getViewColumnItem(viewColumnIndex: number): ColumnItem | undefined;
    /** Returns a column by index, id string, or column object reference */
    getColumnItem(context: number | string | ColumnItem): ColumnItem | undefined;
    /** Returns a column by its id */
    getColumnItemById(id: string): ColumnItem | undefined;
    /** Returns the first column matching the key-value pair */
    getColumnItemBy(key: string, value: any): ColumnItem | undefined;
    /** Returns visible column count. Pass true to include hidden columns */
    getColumnsLength(total?: boolean): number;
    /** Replaces the current top-level columns and triggers a full rerender */
    setColumns(columns: ColumnItem[]): void;

    /** Adds one or more columns */
    addColumn(columnInfo: ColumnItem | ColumnItem[], parent?: number | string | ColumnItem | null, position?: number | null, scrollTo?: boolean): boolean;
    /** Deletes one or more columns */
    deleteColumn(columnInfo: number | string | ColumnItem | Array<number | string | ColumnItem>): boolean;

    /** Updates a column's width at runtime */
    setColumnWidth(columnIndex: number | string | ColumnItem, width: number): this;
    /** Shows one or more hidden columns */
    showColumn(columnInfo: number | string | ColumnItem | Array<number | string | ColumnItem>): boolean;
    /** Hides one or more columns */
    hideColumn(columnInfo: number | string | ColumnItem | Array<number | string | ColumnItem>): boolean;

    // Row API
    /** Returns the source top-level rows */
    getRows(): RowItem[];
    /** Returns the visible (view) rows after filtering, collapsing, and sorting */
    getViewRows(): RowItem[];
    /** Returns a row by its visible view index */
    getViewRowItem(viewRowIndex: number): RowItem | undefined;
    /** Returns a row by index, id string, or row object reference. Negative indexes supported (-1 = last) */
    getRowItem(context: number | string | RowItem): RowItem | undefined;
    /** Returns a row by its id */
    getRowItemById(id: string): RowItem | undefined;
    /** Returns the first row matching the key-value pair */
    getRowItemBy(key: string, value: any): RowItem | undefined;
    /** Returns visible row count. Pass true to include collapsed/filtered rows */
    getRowsLength(total?: boolean): number;
    /** Replaces the current top-level rows */
    setRows(rows: RowItem[]): void;

    /** Adds one or more rows */
    addRow(rowInfo: RowItem | RowItem[], parent?: number | string | RowItem | null, position?: number | null, scrollTo?: boolean): boolean;
    /** Deletes one or more rows */
    deleteRow(rowInfo: number | string | RowItem | Array<number | string | RowItem>): boolean;

    /** Shows one or more hidden rows */
    showRow(rowInfo: number | string | RowItem | Array<number | string | RowItem>): boolean;
    /** Hides one or more rows */
    hideRow(rowInfo: number | string | RowItem | Array<number | string | RowItem>): boolean;

    /** Replaces the child rows for the specified parent row */
    setRowSubs(rowIndex: number | string | RowItem, subs: RowItem[] | null): this;

    // Row collapse
    /** Expands a specific row. May trigger onRowSubsRequest for lazy loading */
    expandRow(rowIndex: number | string | RowItem): this;
    collapseRow(rowIndex: number | string | RowItem): this;
    toggleRow(rowIndex: number | string | RowItem): this;
    expandAllRows(): this;
    collapseAllRows(): this;
    toggleAllRows(): this;
    /** Expands rows up to the specified tree level */
    expandRowLevel(level: number): this;

    // Row hover/state
    /** Sets whether the specified row is hovered */
    setRowHover(rowIndex: number | string | RowItem, hover: boolean): void;
    /** Sets a custom row state and toggles the CSS class tg-[state] on row nodes */
    setRowState(rowIndex: number | string | RowItem, state: string, value?: boolean): void;

    // Row select
    /** Selects or clears all selectable rows */
    selectAll(selected?: boolean): this;
    /** Updates the selected state of one or more rows */
    setRowSelected(rowInfo: number | string | RowItem | Array<number | string | RowItem>, settings?: boolean | Event): this;
    /** Returns the first selected row or null */
    getSelectedRow(): RowItem | null;
    /** Returns all selected rows sorted by selection order */
    getSelectedRows(): RowItem[];
    /** Returns whether the row can be selected under the current rules */
    isRowSelectable(rowItem: RowItem): boolean;
    /** Returns whether the row is a leaf node (has no subs) */
    isRowLeaf(rowItem: RowItem): boolean;

    // Row move
    /** Moves rows by offset. Negative = up, positive = down */
    moveRows(rowList: number | string | RowItem | Array<number | string | RowItem>, offset: number): boolean;
    moveRowsUp(rowList: number | string | RowItem | Array<number | string | RowItem>): boolean;
    moveRowsDown(rowList: number | string | RowItem | Array<number | string | RowItem>): boolean;
    moveRowsToTop(rowList: number | string | RowItem | Array<number | string | RowItem>): boolean;
    moveRowsToBottom(rowList: number | string | RowItem | Array<number | string | RowItem>): boolean;
    moveSelectedRowsUp(): boolean;
    moveSelectedRowsDown(): boolean;
    moveSelectedRowsToTop(): boolean;
    moveSelectedRowsToBottom(): boolean;

    // Sort
    /** Sets the sort column. Calling repeatedly with the same column toggles sortAsc */
    setSortColumn(columnItem: number | string | ColumnItem): void;
    /** Clears the current sort state */
    removeSortColumn(): this;

    // Scroll
    /** Scrolls directly to the specified row */
    scrollToRow(row: number | string | RowItem): this;
    /** Scrolls directly to the specified column */
    scrollToColumn(column: number | string | ColumnItem): this;
    /** Scrolls directly to the specified cell */
    scrollToCell(row: number | string | RowItem, column: number | string | ColumnItem): this;
    scrollToFirstRow(): this;
    scrollToLastRow(): this;
    scrollToFirstColumn(): this;
    /** Scrolls to the last column. Pass true to skip the trailing blank filler column */
    scrollToLastColumn(end?: boolean): this;
    /** Scrolls just enough to bring the target row into view */
    scrollRowIntoView(row: number | string | RowItem): this;
    /** Scrolls just enough to bring the target column into view */
    scrollColumnIntoView(column: number | string | ColumnItem): this;
    /** Scrolls just enough to bring the target cell into view */
    scrollCellIntoView(row: number | string | RowItem, column: number | string | ColumnItem): this;
    setScroll(x: number, y: number): this;
    setScrollLeft(x: number): this;
    setScrollTop(y: number): this;
    getScrollLeft(): number;
    getScrollTop(): number;
    getMaxScrollLeft(): number;
    getMaxScrollTop(): number;

    // Scroll size
    /** Returns scrollbar width (0 when no vertical scrollbar is present) */
    getScrollbarWidth(): number;
    /** Returns scrollbar height (0 when no horizontal scrollbar is present) */
    getScrollbarHeight(): number;
    /** Returns scroll view width (scroll pane width minus scrollbar width) */
    getScrollViewWidth(): number;
    /** Returns scroll view height (scroll pane height minus scrollbar height) */
    getScrollViewHeight(): number;
    /** Returns scroll pane width (scroll view width plus scrollbar width) */
    getScrollPaneWidth(): number;
    /** Returns scroll pane height (scroll view height plus scrollbar height) */
    getScrollPaneHeight(): number;

    // Row size
    /** Returns the total rendered height of all rows */
    getRowsHeight(): number;
    /** Returns the computed height of the specified row */
    getRowHeight(rowIndex?: number | string | RowItem): number;

    // Viewport
    /** Returns the current visible row and column index ranges */
    getViewport(): { rows: number[]; columns: number[] };

    // Loading
    /** Customizes the loading overlay. Accepts content, DOM node, factory function, or options object */
    setLoading(content?: HTMLElement | Record<string, any> | ((holder: HTMLElement) => HTMLElement) | null): this;
    /** Shows the built-in loading overlay */
    showLoading(): this;
    /** Hides the loading overlay */
    hideLoading(): this;

    // Mask
    /** Shows the interaction-blocking mask overlay. Pass styleMap to override styles */
    showMask(styleMap?: StyleMap): this;
    /** Hides the mask overlay */
    hideMask(): this;

    // Export
    /** Returns export-ready columns and rows with tg_* fields removed */
    exportData(keysSettings?: Record<string, boolean>): { columns: ColumnItem[]; rows: RowItem[] };

    // Iterate
    /** Iterates over each row in the tree. Return false in callback to stop */
    forEachRow(callback: (rowItem: RowItem, index: number, parent?: RowItem) => void | false): this;
    /** Iterates over each column in the tree. Return false in callback to stop */
    forEachColumn(callback: (columnItem: ColumnItem, index: number, parent?: ColumnItem) => void | false): this;

    // Cell
    /** Returns the raw cell value (rowItem[columnItem.id]) before any formatter is applied */
    getCellValue(rowItem: RowItem, columnItem: ColumnItem): any;

    // Highlight
    /** Helper for rowFilter to match and mark keywords across specified columns */
    highlightKeywordsFilter(rowItem: RowItem, columns: string[], keywords: string): boolean;

    // Node
    /** Finds nodes inside the grid root with a CSS selector */
    find(selector: string, container?: HTMLElement): Query;
    /** Returns the rendered DOM nodes for the specified row */
    getRowNodes(rowIndex: number | string | RowItem): Query | undefined;
    /** Returns the rendered cell DOM node */
    getCellNode(rowIndex: number | string | RowItem, columnIndex: number | string | ColumnItem): HTMLElement | undefined;
    /** Returns the header item node for the specified column */
    getHeaderItemNode(columnInfo: number | string | ColumnItem): HTMLElement | undefined;
    /** Returns the header container node for the specified column */
    getColumnHeaderNode(columnIndex: number | string | ColumnItem): HTMLElement | undefined;

    // Destroy
    reset(): this;
    /** Destroys the grid instance and removes DOM, observers, and event bindings */
    destroy(): void;

    toString(): string;
}

// =============================================================================
// Query

export interface Query {
    length: number;
    get(index: number): HTMLElement | undefined;
    each(callback: (node: HTMLElement, index: number) => void | false): this;
    add(item: HTMLElement | Query): this;
    empty(): this;
    remove(): this;
    find(selector: string): Query;
    prepend(selector: string | HTMLElement | Query): this;
    append(selector: string | HTMLElement | Query): this;
    appendTo(selector: string | HTMLElement | Query): this;
    html(): string;
    html(str: string): this;
    width(): number;
    width(value: number | string): this;
    height(): number;
    height(value: number | string): this;
    css(key: string): string | undefined;
    css(key: string, value: string | number): this;
    css(styles: Record<string, string | number>): this;
    attr(key: string): string | undefined;
    attr(key: string, value: string): this;
    attr(attrs: Record<string, string>): this;
    removeAttr(key: string): this;
    addClass(className: string): this;
    removeClass(className?: string): this;
    hasClass(className: string): boolean;
    show(): this;
    hide(): this;
    click(): this;
    offset(): { left: number; top: number };
    clone(): Query;
    children(): Query;
    parent(): Query;
    is(selector: string): boolean;
}

export type QueryFunction = (selector: string | HTMLElement | Query) => Query;

// =============================================================================
// CONST

export declare const CONST: {
    ID: string;
    NS: string;
    VERSION: string;
    TIMESTAMP: string;
    UP: string;
    DOWN: string;
    LEFT: string;
    RIGHT: string;
    TREE_INDENT: number;
};

// =============================================================================
// Icon

export interface Icon {
    icons: Record<string, string>;
    getIcon(name: string): string;
}

export declare const Icon: Icon;

// =============================================================================
// Motion

export declare class Motion extends EventBase {
    static EVENT: {
        MOTION_START: string;
        MOTION_MOVE: string;
        MOTION_END: string;
        MOTION_STOP: string;
    };

    constructor(options?: {
        easing?: string | ((k: number) => number) | null;
        duration?: number;
        from?: number | Record<string, number>;
        till?: number | Record<string, number>;
    });

    start(options?: {
        easing?: string | ((k: number) => number) | null;
        duration?: number;
        from?: number | Record<string, number>;
        till?: number | Record<string, number>;
    }): this;
    stop(): this;
    destroy(): void;
}

// =============================================================================
// ScrollPane

export declare class ScrollPane extends EventBase {
    static EVENT: {
        CHANGE: string;
        START: string;
        END: string;
    };

    constructor(container: HTMLElement | string, name: string);

    show(): this;
    hide(): this;
    width(): number;
    height(): number;
    render(options?: Record<string, any>): this;

    getScrollLeft(): number;
    getScrollTop(): number;
    getMaxScrollLeft(): number;
    getMaxScrollTop(): number;

    setPosition(scrollLeft: number, scrollTop: number): this;
    setOffsetH(offset: number): boolean;
    setOffsetV(offset: number): boolean;

    setGroupH(list: ScrollPane | ScrollPane[]): void;
    setGroupV(list: ScrollPane | ScrollPane[]): void;

    hasScrollbar(): boolean;
    destroy(): this;
}

// =============================================================================
// Util

export interface Util {
    isObject(obj: any): boolean;
    merge(...args: any[]): any;
    hasOwn(obj: any, key: string): boolean;
    uid(len?: number, prefix?: string): string;

    isNum(num: any): boolean;
    toNum(num: any, toInt?: boolean): number;
    convertNum(str: any): number | any;
    clamp(num: number, min: number, max: number): number;
    per(num: any): number;

    replace(str: string, obj: Record<string, any>): string;

    isArray(data: any): boolean;
    toList(data: any): any[];
    isList(data: any): boolean;
    inList(item: any, list: any[]): boolean;
    isDate(date: any): boolean;
    isPromise(obj: any): boolean;

    getValue(data: any, path: string, defaultValue?: any): any;
    forEachTree(tree: any[], callback: (item: any, index: number, parent?: any) => void | false): void;

    isTouchDevice(): boolean;
    contains(container: HTMLElement, target: HTMLElement): boolean;
    isNarrowCharacter(character: string): boolean;
    getCharLen(text: string): number;

    classMap(obj: ClassMap): string;
    styleMap(obj: StyleMap): string;

    getInstance(id: string): Grid | undefined;

    preventDefault(e: Event): void;

    debounce<T extends (...args: any[]) => any>(callback: T, delay?: number): T & { cancel: () => void };
    throttle<T extends (...args: any[]) => any>(callback: T, delay?: number): T & { cancel: () => void };
    microtask<T extends (...args: any[]) => any>(callback: T): T & { cancel: () => void };
    nextTick(callback: () => void): void;
}

export declare const Util: Util;

// =============================================================================
// Exports

export declare const VERSION: string;
export declare const TIMESTAMP: string;
export declare const $: QueryFunction;

// =============================================================================
// Default export

declare const TurboGrid: {
    VERSION: string;
    TIMESTAMP: string;
    Grid: typeof Grid;
    $: QueryFunction;
    CONST: typeof CONST;
    EventBase: typeof EventBase;
    Icon: typeof Icon;
    Motion: typeof Motion;
    ScrollPane: typeof ScrollPane;
    Util: typeof Util;
};

export default TurboGrid;
