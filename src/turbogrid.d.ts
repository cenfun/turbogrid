// Type definitions for TurboGrid
// https://github.com/cenfun/turbogrid

/** CSS declarations, declaration lists, or property-value mappings accepted by styleMap helpers. */
export type StyleMap = string | string[] | Record<string, boolean | string | number>;
/** CSS class names, class-name lists, or conditional class mappings. */
export type ClassMap = string | string[] | Record<string, boolean>;
/** Row field name or callback used to resolve the field to sort. */
export type SortField = string | ((this: Grid, sortOptions: any) => string | null | undefined);

// =============================================================================
// Column

/** Column definition and runtime metadata. Custom properties are preserved. */
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

    /** Fixed width value. Columns with width are excluded from autoColumnWidth and are not affected by widthWeight distribution. */
    width?: number;
    /** Initial/base width. Can be a number or a callback returning a number; participates in autoColumnWidth and can be distributed by widthWeight. */
    initWidth?: number | ((this: Grid, columnItem: ColumnItem) => number | null | undefined);
    /** Weight for autoColumnWidth distribution. Defaults to 1 if not set. 0.5 gets half, 2 gets double the proportional share */
    widthWeight?: number;
    /** Minimum column width in pixels (default: 81) */
    minWidth?: number;
    /** Maximum column width in pixels (default: 300) */
    maxWidth?: number;
    /** Explicit header/cell height in pixels */
    height?: number;

    /** Whether the column is sortable (default: true) */
    sortable?: boolean;
    /** Field used for sorting when this column is the sort column */
    sortField?: SortField;
    /** Initial direction for this column: true for ascending, false for descending */
    sortAsc?: boolean;
    /** Whether the column is resizable (default: true) */
    resizable?: boolean;
    /** Whether the column is included in exportData() (default: true) */
    exportable?: boolean;

    /** Whether the column is hidden */
    invisible?: boolean;
    /** Whether the column is private and excluded from exports */
    private?: boolean;

    /** CSS classes applied to body cells in this column */
    classMap?: ClassMap;
    /** Inline styles applied to body cells in this column */
    styleMap?: StyleMap;
    /** CSS classes applied to this column's header cell */
    headerClassMap?: ClassMap;
    /** Inline styles applied to this column's header cell */
    headerStyleMap?: StyleMap;

    /** Nested sub-columns for grouped headers */
    subs?: ColumnItem[];

    /** @internal Global depth-first source index */ tg_index?: number;
    /** @internal Index in the current visible column list */ tg_view_index?: number;
    /** @internal Source index within the parent's subs array */ tg_sub_index?: number;
    /** @internal Visible index within the current sibling list */ tg_list_index?: number;
    /** @internal Computed column width in pixels */ tg_width?: number;
    /** @internal Computed horizontal offset in pixels */ tg_left?: number;
    /** @internal Whether the column belongs to the frozen pane */ tg_frozen?: boolean;
    /** @internal Whether the column has a subs array */ tg_group?: boolean;
    /** @internal Parent column for nested headers */ tg_parent?: ColumnItem;
    /** @internal Number of direct child columns */ tg_subs_length?: number;
    /** @internal Normalized invisible state */ tg_invisible?: boolean;
    /** @internal Computed header height in pixels */ tg_height?: number;
    /** @internal Header hierarchy layer */ tg_layer?: number;

    [key: string]: any;
}

// =============================================================================
// Row

/** Row data, tree structure, presentation settings, and runtime metadata. */
export interface RowItem {
    /** Optional row identifier used by id-based row APIs */
    id?: string;
    /** Optional display name or user-defined row value */
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

    /** CSS classes applied to the rendered row */
    classMap?: ClassMap;
    /** Inline styles applied to the rendered row */
    styleMap?: StyleMap;

    /** Nested child rows for tree structure */
    subs?: RowItem[];

    /** @internal Global depth-first source index */ tg_index?: number;
    /** @internal Index in the current visible row list */ tg_view_index?: number;
    /** @internal Source index within the parent's subs array */ tg_sub_index?: number;
    /** @internal Visible index within the current sibling list */ tg_list_index?: number;
    /** @internal Zero-based tree depth */ tg_level?: number;
    /** @internal Whether the row has a subs array */ tg_group?: boolean;
    /** @internal Whether the row belongs to the frozen pane */ tg_frozen?: boolean;
    /** @internal Parent row for nested data */ tg_parent?: RowItem;
    /** @internal Number of direct child rows */ tg_subs_length?: number;
    /** @internal Computed row height in pixels */ tg_height?: number;
    /** @internal Computed vertical offset in pixels */ tg_top?: number;
    /** @internal Generated row-number display value */ tg_row_number?: number | string;
    /** @internal Normalized invisible state */ tg_invisible?: boolean;
    /** @internal Keyword match score written by highlightKeywordsFilter */ tg_match_score?: number;
    /** @internal Whether rowFilter excluded the row */ tg_filtered?: boolean;
    /** @internal Selection-order index */ tg_selected_index?: number;

    [key: string]: any;
}

// =============================================================================
// Data

/** Data payload consumed by Grid.setData(). */
export interface GridData {
    /** Top-level column definitions; nested columns are supplied through subs */
    columns?: ColumnItem[];
    /** Top-level row records; nested rows are supplied through subs */
    rows?: RowItem[];
    /** Total row count for lazy loading when rows are not all provided upfront */
    rowsLength?: number;
    /** Options applied from the data payload, takes precedence over setOption() */
    options?: GridOptions;
}

// =============================================================================
// Sort Comparers

/** Registry of named sort comparer functions. */
export interface SortComparers {
    /** Comparer used for string columns */
    string?: (a: any, b: any, options: any) => number;
    /** Comparer used for numeric columns */
    number?: (a: any, b: any, options: any) => number;
    /** Additional comparers addressable by name or column type */
    [name: string]: ((a: any, b: any, options: any) => number) | undefined;
}

/** Sorting configuration applied after rowFilter when no interactive sort column is active. */
export interface RowFilteredSortOptions {
    /** Row field used for sorting. A callback can resolve the field dynamically. */
    sortField?: SortField;
    /** Column id used as the sort field when sortField is omitted. */
    id?: string;
    /** true for ascending and false for descending. */
    sortAsc?: boolean;
    /** Registered comparer name or a custom comparer. */
    comparer?: string | ((a: any, b: any, options: any) => number);
    /** Column type used to select a registered comparer when comparer is omitted. */
    type?: string;
}

/** Concrete post-filter sorting configuration. A string is treated as a sort field. */
export type RowFilteredSortValue = string | RowFilteredSortOptions | ColumnItem;
/** Static or dynamically resolved sorting applied after rowFilter; null disables it. */
export type RowFilteredSort = RowFilteredSortValue | ((this: Grid) => RowFilteredSortValue | null | undefined) | null;

// =============================================================================
// Column Types

/** Reusable defaults merged into columns of a matching type. */
export interface ColumnTypeDefinition {
    /** Base type to inherit from */
    type?: string;
    /** Registered formatter name */
    formatter?: string;
    /** Default cell alignment */
    align?: string;
    /** Default fixed width in pixels */
    width?: number;
    /** Default minimum width in pixels */
    minWidth?: number;
    /** Default maximum width in pixels */
    maxWidth?: number;
    /** Additional ColumnItem defaults */
    [key: string]: any;
}

/** Maps a column type or column id to defaults or to another registered type name. */
export interface ColumnTypes {
    [typeOrId: string]: ColumnTypeDefinition | string;
}

// =============================================================================
// Highlight Keywords

/** Global matching, scoring, text extraction, and markup options for keyword highlighting. */
export interface HighlightKeywords {
    /** Pattern combination and conflict-resolution mode. Defaults to "and" */
    matchMode?: 'and' | 'or' | 'negatedFirst' | 'positiveFirst';
    /** Whether matching is case-sensitive. Defaults to false */
    caseSensitive?: boolean;
    /** Prefix that marks negated string patterns. Defaults to "-" */
    negatedPrefix?: string;
    /** Custom generator used to get cell text for matching. Defaults to null */
    textGenerator?: ((rowItem: RowItem, id: string) => string) | null;
    /** Row property used to store the keyword match score. Set to an empty string to disable. Defaults to "tg_match_score" */
    scoreKey?: string;
    /** HTML inserted before highlighted text. Defaults to "<mark>" */
    highlightPre?: string;
    /** HTML inserted after highlighted text. Defaults to "</mark>" */
    highlightPost?: string;
}

/**
 * Returns the matched substring to filter and highlight, or an empty string when unmatched.
 * @param text Plain text extracted from the current cell.
 * @param rowItem Row currently being tested.
 * @param columnItem Column currently being tested.
 */
export type HighlightKeywordMatcher = (
    this: Grid,
    text: string,
    rowItem: RowItem,
    columnItem: ColumnItem
) => string;

/** Object form of one keyword pattern with per-pattern overrides. */
export interface HighlightKeywordPattern {
    /** String supports * wildcards, escaped \* literals, and the case: prefix; RegExp and function enable fully custom matching */
    pattern: string | RegExp | HighlightKeywordMatcher;
    /** Overrides the global caseSensitive option for String and RegExp patterns */
    caseSensitive?: boolean;
    /** Inverts this pattern's match result */
    negated?: boolean;
}

/** One string pattern or object-form pattern. */
export type HighlightKeyword = string | HighlightKeywordPattern;

/**
 * Keyword patterns accepted by highlightKeywordsFilter:
 * - A string containing one or more whitespace-separated patterns.
 * - Matching single quotes, double quotes, or backticks group text containing
 *   whitespace into one pattern; the quotes are removed before matching.
 * - String patterns support `*` wildcards, escaped `\*` literals, the `case:`
 *   prefix, and the configured negated prefix (default `-`).
 * - A HighlightKeywordPattern object can contain a string, RegExp, or custom
 *   matcher and override case sensitivity or negation.
 * - An array can combine string and HighlightKeywordPattern entries.
 *
 * @example "foo bar"                        // two patterns: foo and bar
 * @example '"foo bar" baz'                  // quoted phrase and baz
 * @example "`foo bar` baz"                  // backtick-quoted phrase and baz
 * @example "-'foo bar' case:Grid foo*bar"  // negation, case prefix, and wildcard
 */
export type HighlightKeywordPatterns = HighlightKeyword | HighlightKeyword[];

// =============================================================================
// Render

/** Scope of work requested for a render pass; custom strings remain accepted for compatibility. */
export type RenderType = 'all' | 'columns' | 'rows' | 'rows_cache' | 'resize' | (string & {});

/** Optional render scope, initial scroll position, and transient render state. */
export interface RenderSettings {
    /** Render scope. Defaults to the current pending render type, or "all" before the first render */
    type?: RenderType | null;
    /** Initial horizontal scroll position applied before rendering */
    scrollLeft?: number | null;
    /** Initial vertical scroll position applied before rendering */
    scrollTop?: number | null;
    /** Column item to bring into view before rendering */
    scrollColumn?: ColumnItem | null;
    /** Row item to bring into view before rendering */
    scrollRow?: RowItem | null;
    /** Cells and their matched patterns collected during the render pass */
    highlightCells?: Array<HTMLElement | {
        /** Cell element to receive highlight markup */
        cellNode: HTMLElement;
        /** Normalized patterns matched in the cell */
        patterns?: any[] | null;
    }>;

    [key: string]: any;
}

// =============================================================================
// Options

/** Grid construction and runtime behavior options. */
export interface GridOptions {
    /** Host element or CSS selector. Usually supplied to the Grid constructor. */
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
    /**
     * Sorts rows after rowFilter when no interactive sort column is active.
     * A string is treated as sortField and uses the global sortAsc value.
     */
    rowFilteredSort?: RowFilteredSort;
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
    /** Filter which rows show a row number. parent is undefined for root rows. */
    rowNumberFilter?: ((rowItem: RowItem, index: number, parent?: RowItem) => boolean) | null;
    /** Whether the row number column is visible (default: false) */
    rowNumberVisible?: boolean;
    /** Configuration for the built-in row number column */
    rowNumberColumn?: ColumnItem;

    // blank
    /** Whether remaining horizontal space is proportionally distributed to all columns (default: false) */
    autoColumnWidth?: boolean;

    /** Configuration for the built-in blank filler column */
    blankColumn?: ColumnItem;

    // sort
    /** Field used for sorting comparisons */
    sortField?: SortField;
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
    /** Scrollbar preset. "auto" detects touch; "touch"/"mobile" enable fade with size 6; "classic" keeps desktop behavior. */
    scrollbarType?: 'auto' | 'touch' | 'mobile' | 'classic';

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

/** Built-in event names emitted by Grid. Namespaced variants are accepted by bind/unbind. */
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

/** Context resolved for a grid or component event. Fields vary by event type. */
export interface EventData {
    /** Original browser event, when the event originated from the DOM */
    e?: Event;
    /** Row associated with the event */
    rowItem?: RowItem;
    /** Column associated with the event */
    columnItem?: ColumnItem;
    /** Rendered cell associated with the event */
    cellNode?: HTMLElement;
    /** Rendered row associated with the event */
    rowNode?: HTMLElement;
    /** Visible row index */
    row?: number;
    /** Visible column index */
    column?: number;
    /** Event-specific values */
    [key: string]: any;
}

/** Handler invoked with normalized event context and optional event-specific data. */
export type EventHandler = (e: EventData, data?: any) => void;

// =============================================================================
// EventBase

/** Lightweight event emitter used by Grid, Motion, and ScrollPane. */
export declare class EventBase {
    /** Listener-count warning threshold */
    maxListeners: number;
    /** Sets the listener-count warning threshold */
    setMaxListeners(n: number): void;
    /** Returns the listener-count warning threshold */
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

/** Virtualized data grid with tree rows, grouped columns, sorting, selection, and highlighting. */
export declare class Grid extends EventBase {

    /** DOM query helper used internally and exposed for integrations */
    static $: QueryFunction;
    /** Returns the grid associated with the element id, when available */
    static getInstance(id: string): Grid | undefined;
    /** Returns all registered theme names */
    static getAllThemes(): string[];
    /** Returns all built-in grid event names */
    static getAllEvents(): string[];
    /** Library version */
    static VERSION: string;
    /** Build tag */
    static TAG: string;

    /** DOM query helper bound to the library implementation */
    $: QueryFunction;
    /** Library version */
    VERSION: string;
    /** Build tag */
    TAG: string;

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
    render(renderSettings?: RenderType | RenderSettings): this;
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
    onNextUpdated(callback: EventHandler): this;

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
    /** Collapses a specific row */
    collapseRow(rowIndex: number | string | RowItem): this;
    /** Toggles a specific row between expanded and collapsed */
    toggleRow(rowIndex: number | string | RowItem): this;
    /** Expands all rows that contain children */
    expandAllRows(): this;
    /** Collapses all rows that contain children */
    collapseAllRows(): this;
    /** Expands all rows when any are collapsed; otherwise collapses all rows */
    toggleAllRows(): this;
    /** Expands rows up to the specified tree level */
    expandRowLevel(level: number): this;

    // Row hover/state
    /** Sets whether the specified row is hovered */
    setRowHover(rowIndex: number | string | RowItem, hover: boolean): this;
    /** Sets a custom row state and toggles the CSS class tg-[state] on row nodes */
    setRowState(rowIndex: number | string | RowItem, state: string, value?: boolean): this;

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
    /** Moves rows one position upward */
    moveRowsUp(rowList: number | string | RowItem | Array<number | string | RowItem>): boolean;
    /** Moves rows one position downward */
    moveRowsDown(rowList: number | string | RowItem | Array<number | string | RowItem>): boolean;
    /** Moves rows to the beginning of their list */
    moveRowsToTop(rowList: number | string | RowItem | Array<number | string | RowItem>): boolean;
    /** Moves rows to the end of their list */
    moveRowsToBottom(rowList: number | string | RowItem | Array<number | string | RowItem>): boolean;
    /** Moves selected rows one position upward */
    moveSelectedRowsUp(): boolean;
    /** Moves selected rows one position downward */
    moveSelectedRowsDown(): boolean;
    /** Moves selected rows to the beginning of their list */
    moveSelectedRowsToTop(): boolean;
    /** Moves selected rows to the end of their list */
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
    /** Scrolls to the first visible row */
    scrollToFirstRow(): this;
    /** Scrolls to the last visible row */
    scrollToLastRow(): this;
    /** Scrolls to the first visible column */
    scrollToFirstColumn(): this;
    /** Scrolls to the last column. Pass true to skip the trailing blank filler column */
    scrollToLastColumn(end?: boolean): this;
    /** Scrolls just enough to bring the target row into view */
    scrollRowIntoView(row: number | string | RowItem): this;
    /** Scrolls just enough to bring the target column into view */
    scrollColumnIntoView(column: number | string | ColumnItem): this;
    /** Scrolls just enough to bring the target cell into view */
    scrollCellIntoView(row: number | string | RowItem, column: number | string | ColumnItem): this;
    /** Sets horizontal and vertical scroll positions in pixels */
    setScroll(x: number, y: number): this;
    /** Sets horizontal scroll position in pixels */
    setScrollLeft(x: number): this;
    /** Sets vertical scroll position in pixels */
    setScrollTop(y: number): this;
    /** Returns horizontal scroll position in pixels */
    getScrollLeft(): number;
    /** Returns vertical scroll position in pixels */
    getScrollTop(): number;
    /** Returns the maximum horizontal scroll position */
    getMaxScrollLeft(): number;
    /** Returns the maximum vertical scroll position */
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
    getRowHeight(rowItem?: RowItem): number;

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
    /** Helper for rowFilter to match and mark keyword patterns across specified columns and record their match score */
    highlightKeywordsFilter(rowItem: RowItem, columns: string[], patterns: HighlightKeywordPatterns): boolean;

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
    /** Clears runtime state so the instance can be initialized again */
    reset(): this;
    /** Destroys the grid instance and removes DOM, observers, and event bindings */
    destroy(): void;

    /** Returns the grid's string tag */
    toString(): string;
}

// =============================================================================
// Query

/** Small chainable DOM collection used by TurboGrid. */
export interface Query {
    /** Number of elements in the collection */
    length: number;
    /** Returns the element at an index */
    get(index: number): HTMLElement | undefined;
    /** Iterates elements; return false to stop */
    each(callback: (node: HTMLElement, index: number) => void | false): this;
    /** Adds an element or another collection */
    add(item: HTMLElement | Query): this;
    /** Removes all child nodes from every element */
    empty(): this;
    /** Removes every element from the DOM */
    remove(): this;
    /** Finds descendants matching a CSS selector */
    find(selector: string): Query;
    /** Inserts content at the beginning of every element */
    prepend(selector: string | HTMLElement | Query): this;
    /** Inserts content at the end of every element */
    append(selector: string | HTMLElement | Query): this;
    /** Appends this collection to a target */
    appendTo(selector: string | HTMLElement | Query): this;
    /** Returns the first element's inner HTML */
    html(): string;
    /** Sets inner HTML for every element */
    html(str: string): this;
    /** Returns the first element's width */
    width(): number;
    /** Sets width for every element */
    width(value: number | string): this;
    /** Returns the first element's height */
    height(): number;
    /** Sets height for every element */
    height(value: number | string): this;
    /** Returns a computed style value from the first element */
    css(key: string): string | undefined;
    /** Sets one style property on every element */
    css(key: string, value: string | number): this;
    /** Sets multiple style properties on every element */
    css(styles: Record<string, string | number>): this;
    /** Returns an attribute from the first element */
    attr(key: string): string | undefined;
    /** Sets one attribute on every element */
    attr(key: string, value: string): this;
    /** Sets multiple attributes on every element */
    attr(attrs: Record<string, string>): this;
    /** Removes an attribute from every element */
    removeAttr(key: string): this;
    /** Adds one or more CSS classes */
    addClass(className: string): this;
    /** Removes specified CSS classes, or all classes when omitted */
    removeClass(className?: string): this;
    /** Returns whether any element has a CSS class */
    hasClass(className: string): boolean;
    /** Shows every element */
    show(): this;
    /** Hides every element */
    hide(): this;
    /** Invokes click() on the first element */
    click(): this;
    /** Returns the first element's document-relative position */
    offset(): { left: number; top: number };
    /** Deep-clones the collection's elements */
    clone(): Query;
    /** Returns direct child nodes from all elements */
    children(): Query;
    /** Returns the first element's parent */
    parent(): Query;
    /** Returns whether every element has a tag name in the comma-separated list */
    is(selector: string): boolean;
}

/** Creates a Query from a selector, element, or existing Query. */
export type QueryFunction = (selector: string | HTMLElement | Query) => Query;

// =============================================================================
// CONST

/** Public library constants. */
export declare const CONST: {
    /** Library id */
    ID: string;
    /** CSS/event namespace */
    NS: string;
    /** Library version */
    VERSION: string;
    /** Build tag */
    TAG: string;
    /** Up direction token */
    UP: string;
    /** Down direction token */
    DOWN: string;
    /** Left direction token */
    LEFT: string;
    /** Right direction token */
    RIGHT: string;
    /** Tree indentation per hierarchy level in pixels */
    TREE_INDENT: number;
};

// =============================================================================
// Icon

/** Registry of built-in SVG icon markup by name. */
export declare const icons: Record<string, string>;
/** Returns built-in SVG markup by icon name, or an empty string when not found. */
export declare function getIcon(name: string): string;

/** Legacy namespace containing the icon registry and lookup function. */
export interface Icon {
    /** Built-in SVG icon registry */
    icons: typeof icons;
    /** Built-in icon lookup function */
    getIcon: typeof getIcon;
}

/** @deprecated Prefer the named icons and getIcon exports. */
export declare const Icon: Icon;

// =============================================================================
// Motion

/** Options for numeric or object-property interpolation by Motion. */
export interface MotionOptions {
    /** Easing function or registered easing path; null uses linear easing */
    easing?: string | ((k: number) => number) | null;
    /** Animation duration in milliseconds (default: 100) */
    duration?: number;
    /** Initial number or numeric property map (default: 0) */
    from?: number | Record<string, number>;
    /** Final number or numeric property map (default: 1) */
    till?: number | Record<string, number>;
}

/** requestAnimationFrame-based numeric interpolation that emits lifecycle events. */
export declare class Motion extends EventBase {
    /** Motion lifecycle event names */
    static EVENT: {
        /** Emitted with the initial value when motion starts */
        MOTION_START: string;
        /** Emitted with each interpolated value */
        MOTION_MOVE: string;
        /** Emitted with the final value after completion */
        MOTION_END: string;
        /** Emitted when an active motion is stopped */
        MOTION_STOP: string;
    };

    /** Creates a motion with reusable default options. */
    constructor(options?: MotionOptions);

    /** Stops any current motion and starts interpolation with merged options. */
    start(options?: MotionOptions): this;
    /** Stops the active motion and emits MOTION_STOP. */
    stop(): this;
    /** Stops motion and releases event listeners. */
    destroy(): void;
}

// =============================================================================
// ScrollPane

/** Two-axis custom scrolling surface used by grid panes. */
export declare class ScrollPane extends EventBase {
    /** ScrollPane event names */
    static EVENT: {
        /** Emitted after the scroll position changes */
        CHANGE: string;
        /** Emitted when scrollbar interaction starts */
        START: string;
        /** Emitted when scrollbar interaction ends */
        END: string;
    };

    /** Creates a named scroll pane inside the supplied container. */
    constructor(container: HTMLElement | string, name: string);

    /** Shows the scroll pane */
    show(): this;
    /** Hides the scroll pane */
    hide(): this;
    /** Returns the configured pane width */
    width(): number;
    /** Returns the configured pane height */
    height(): number;
    /** Merges options and updates dimensions, scroll state, and scrollbars */
    render(options?: Record<string, any>): this;

    /** Returns horizontal scroll position */
    getScrollLeft(): number;
    /** Returns vertical scroll position */
    getScrollTop(): number;
    /** Returns maximum horizontal scroll position */
    getMaxScrollLeft(): number;
    /** Returns maximum vertical scroll position */
    getMaxScrollTop(): number;

    /** Sets both scroll positions and synchronizes grouped panes */
    setPosition(scrollLeft: number, scrollTop: number): this;
    /** Sets horizontal scrollbar offset; returns whether it changed */
    setOffsetH(offset: number): boolean;
    /** Sets vertical scrollbar offset; returns whether it changed */
    setOffsetV(offset: number): boolean;

    /** Sets panes whose horizontal positions should stay synchronized */
    setGroupH(list: ScrollPane | ScrollPane[]): void;
    /** Sets panes whose vertical positions should stay synchronized */
    setGroupV(list: ScrollPane | ScrollPane[]): void;

    /** Returns whether either axis currently has a scrollbar */
    hasScrollbar(): boolean;
    /** Destroys scrollbars, event listeners, and references */
    destroy(): this;
}

// =============================================================================
// Util

/** General-purpose helpers used by TurboGrid and available to integrations. */
export interface Util {
    /** Returns whether a value is a plain object or array */
    isObject(obj: any): boolean;
    /** Deep-merges objects or arrays; pass false as the final argument for a shallow merge */
    merge(...args: any[]): any;
    /** Safely checks whether an object owns a property */
    hasOwn(obj: any, key: string): boolean;
    /** Creates a random base-36 id with optional length and prefix (default length: 8) */
    uid(len?: number, prefix?: string): string;

    /** Returns whether a value is a finite, usable number */
    isNum(num: any): boolean;
    /** Converts a value to a number, falling back to 0; optionally rounds to an integer */
    toNum(num: any, toInt?: boolean): number;
    /** Converts a strictly numeric string to a number and leaves other values unchanged */
    convertNum(str: any): number | any;
    /** Clamps a number to the inclusive min/max range */
    clamp(num: number, min: number, max: number): number;
    /** Returns whether a value is a valid non-negative width or height */
    isSize(num: any): boolean;
    /** Converts a value to a number clamped between 0 and 1 */
    per(num: any): number;

    /** Replaces `{key}` placeholders with values from an object */
    replace(str: string, obj: Record<string, any>): string;

    /** Returns whether data is an Array */
    isArray(data: any): boolean;
    /** Normalizes arrays, array-like values, strings, scalars, and undefined to an array */
    toList(data: any): any[];
    /** Returns whether data is a non-empty array */
    isList(data: any): boolean;
    /** Returns whether a non-empty list contains an item by identity */
    inList(item: any, list: any[]): boolean;
    /** Returns whether a value is a valid Date */
    isDate(date: any): boolean;
    /** Returns whether a value is thenable */
    isPromise(obj: any): boolean;

    /** Reads a dot-separated property path and returns a fallback when absent */
    getValue(data: any, path: string, defaultValue?: any): any;
    /** Depth-first traversal of items and their subs arrays; return false to stop */
    forEachTree(tree: any[], callback: (item: any, index: number, parent?: any) => void | false): void;

    /** Detects devices whose primary pointer does not support hover */
    isTouchDevice(): boolean;
    /** Returns whether target is or is contained by container */
    contains(container: HTMLElement, target: HTMLElement): boolean;
    /** Returns whether a Unicode character occupies one display-width unit */
    isNarrowCharacter(character: string): boolean;
    /** Returns display width using 1 for narrow and 2 for wide characters */
    getCharLen(text: string): number;

    /** Normalizes supported class-map forms to a deduplicated class string */
    classMap(obj: ClassMap): string;
    /** Normalizes supported style-map forms to a CSS declaration string */
    styleMap(obj: StyleMap): string;

    /** Returns the Grid instance registered to an element id */
    getInstance(id: string): Grid | undefined;

    /** Prevents a cancelable browser event's default action */
    preventDefault(e: Event): void;

    /** Creates a trailing debounce wrapper with a cancel method (default delay: 100 ms) */
    debounce<T extends (...args: any[]) => any>(callback: T, delay?: number): T & { cancel: () => void };
    /** Creates a leading/trailing throttle wrapper with a cancel method (default delay: 100 ms) */
    throttle<T extends (...args: any[]) => any>(callback: T, delay?: number): T & { cancel: () => void };
    /** Coalesces calls into one microtask and exposes a cancel method */
    microtask<T extends (...args: any[]) => any>(callback: T): T & { cancel: () => void };
    /** Schedules a callback in the microtask queue */
    nextTick(callback: () => void): void;
}

/** Shared utility helper namespace. */
export declare const Util: Util;

// =============================================================================
// Exports

/** Library version. */
export declare const VERSION: string;
/** Build tag. */
export declare const TAG: string;
/** Shared DOM query helper. */
export declare const $: QueryFunction;

// =============================================================================
// Default export

/** Namespace-style default export containing all public runtime exports. */
declare const TurboGrid: {
    /** Library version */
    VERSION: string;
    /** Build tag */
    TAG: string;
    /** Grid constructor */
    Grid: typeof Grid;
    /** DOM query helper */
    $: QueryFunction;
    /** Public constants */
    CONST: typeof CONST;
    /** Base event emitter constructor */
    EventBase: typeof EventBase;
    /** Deprecated icon namespace */
    Icon: typeof Icon;
    /** SVG icon registry */
    icons: typeof icons;
    /** SVG icon lookup function */
    getIcon: typeof getIcon;
    /** Animation constructor */
    Motion: typeof Motion;
    /** Scroll pane constructor */
    ScrollPane: typeof ScrollPane;
    /** Utility helper namespace */
    Util: typeof Util;
};

export default TurboGrid;
