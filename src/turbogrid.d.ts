// Type definitions for TurboGrid
// https://github.com/cenfun/turbogrid

export type StyleMap = string | string[] | Record<string, boolean | string | number>;
export type ClassMap = string | string[] | Record<string, boolean>;

// =============================================================================
// Column

export interface ColumnItem {
    id?: string;
    name?: string;
    type?: string;

    formatter?: string | ((value: any, rowItem: RowItem, columnItem: ColumnItem, cellNode: HTMLElement, observerNode?: HTMLElement) => any);
    headerFormatter?: string | ((value: any, rowItem: RowItem, columnItem: ColumnItem, cellNode: HTMLElement) => any);

    comparer?: string | ((a: any, b: any, options: any) => number);

    align?: 'left' | 'center' | 'right';

    width?: number;
    minWidth?: number;
    maxWidth?: number;
    height?: number;

    sortable?: boolean;
    sortAsc?: boolean;
    resizable?: boolean;
    exportable?: boolean;

    invisible?: boolean;
    private?: boolean;

    classMap?: ClassMap;
    styleMap?: StyleMap;
    headerClassMap?: ClassMap;
    headerStyleMap?: StyleMap;

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
    type?: string;

    selected?: boolean;
    selectable?: boolean;
    collapsed?: boolean;
    exportable?: boolean;

    formatter?: string | ((value: any, rowItem: RowItem, columnItem: ColumnItem, cellNode: HTMLElement, observerNode?: HTMLElement) => any);

    sortFixed?: boolean | 'top';

    height?: number;

    classMap?: ClassMap;
    styleMap?: StyleMap;

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
    rowsLength?: number;
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

    className?: string;
    theme?: string;

    headerVisible?: boolean;

    // row
    rowHeight?: number;
    rowFilter?: ((rowItem: RowItem, index: number, parent?: RowItem) => boolean) | null;
    rowFilteredSort?: string | RowItem | (() => string | RowItem | null) | null;
    rowNotFound?: string | HTMLElement | ((this: Grid, info: any) => string | HTMLElement);
    rowMoveCrossLevel?: boolean;
    rowCacheLength?: number;
    rowProps?: Record<string, any>;

    // column
    columnTypes?: ColumnTypes;
    columnCacheLength?: number;
    columnProps?: Record<string, any>;

    // collapse
    collapseAllOnInit?: boolean | null;
    collapseAllVisible?: boolean;

    // select
    selectAllOnInit?: boolean | null;
    selectVisible?: boolean;
    selectAllVisible?: boolean;
    selectMultiple?: boolean;
    selectColumn?: ColumnItem;

    // row drag
    rowDragCrossLevel?: boolean | ((rowItem: RowItem) => boolean);
    rowDragVisible?: boolean;
    rowDragColumn?: ColumnItem;

    // row number
    rowNumberWidth?: number;
    rowNumberFilter?: ((rowItem: RowItem, index: number) => boolean) | null;
    rowNumberVisible?: boolean;
    rowNumberColumn?: ColumnItem;

    // blank
    blankColumn?: ColumnItem;

    // sort
    sortField?: string;
    sortAsc?: boolean;
    sortBlankValueBottom?: boolean;
    sortComparers?: SortComparers;
    sortOnInit?: boolean;
    sortIndicator?: 'h' | 'v';

    // highlight
    highlightKeywords?: HighlightKeywords;

    // frozen
    frozenRow?: number;
    frozenRowMax?: number;
    frozenRowHoverable?: boolean;
    frozenBottom?: boolean;
    frozenColumn?: number;
    frozenColumnMax?: number;
    frozenRight?: boolean;

    // scrollbar
    scrollbarSize?: number;
    scrollbarSizeH?: number | null;
    scrollbarSizeV?: number | null;
    scrollbarRound?: boolean;
    scrollbarFade?: boolean;
    scrollbarFadeTimeout?: number;
    scrollbarType?: 'auto' | 'touch' | 'classic';

    // scroll pane
    scrollPaneMinWidth?: number;
    scrollPaneGradient?: boolean;

    // other
    autoHeight?: boolean;
    textSelectable?: boolean;
    bindWindowResize?: boolean;
    bindContainerResize?: boolean;
    cellResizeObserver?: ((rowItem: RowItem, columnItem: ColumnItem) => boolean) | null;

    // formatters can be passed via options
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
    bind(types: string | string[], handler: EventHandler, options?: { once?: boolean }): this;
    once(types: string | string[], handler: EventHandler): this;
    unbind(types?: string | string[], handler?: EventHandler, options?: any): this;
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

    constructor(container: string | HTMLElement | GridOptions);

    // Event bindng with typed events
    bind(types: GridEventType | GridEventType[] | string | string[], handler: EventHandler, options?: { once?: boolean }): this;
    once(types: GridEventType | GridEventType[] | string | string[], handler: EventHandler): this;
    unbind(types?: GridEventType | GridEventType[] | string | string[], handler?: EventHandler, options?: any): this;

    // Options
    setOption(key: string, value: any): this;
    setOption(options: GridOptions): this;
    getOption(): GridOptions;
    getOption(key: string): any;

    // Data
    setData(data: GridData): this;
    setDataSnapshot(data: any): this;
    getData(): GridData;
    getItemSnapshot(item: RowItem | ColumnItem, keysSettings?: Record<string, boolean>): Record<string, any>;

    // Formatter
    setFormatter(key: string, value: (...args: any[]) => any): this;
    setFormatter(formatters: Record<string, (...args: any[]) => any>): this;
    getFormatter(name: string): ((...args: any[]) => any) | undefined;
    getDefaultFormatter(type?: string): (...args: any[]) => any;

    // Events
    getAllEvents(): string[];

    // Render
    render(): this;
    rerender(): this;
    resize(width?: number | string | Record<string, any>, height?: number | string): this;

    // Update
    update(): this;
    updateRow(rowIndex: number | string | RowItem, rowData?: Partial<RowItem>): this;
    updateCell(rowIndex: number | string | RowItem, columnIndex: number | string | ColumnItem, value?: any): this;
    onNextUpdated(callback: (this: Grid) => void): this;

    // Flush
    flushBody(): void;
    flushSort(): void;
    flushRow(viewRowIndex: number): void;
    flushRowFrom(viewRowIndex: number): void;
    flushColumn(viewColumnIndex: number): void;
    flushColumnFrom(viewColumnIndex: number): void;
    flushCell(viewRowIndex: number, viewColumnIndex: number): void;

    // Column API
    getColumns(): ColumnItem[];
    getViewColumns(all?: boolean): ColumnItem[];
    getViewColumnItem(viewColumnIndex: number): ColumnItem | undefined;
    getColumnItem(context: number | string | ColumnItem): ColumnItem | undefined;
    getColumnItemById(id: string): ColumnItem | undefined;
    getColumnItemBy(key: string, value: any): ColumnItem | undefined;
    getColumnsLength(total?: boolean): number;
    setColumns(columns: ColumnItem[]): void;

    addColumn(columnInfo: ColumnItem | ColumnItem[], parent?: number | string | ColumnItem | null, position?: number | null, scrollTo?: boolean): boolean;
    deleteColumn(columnInfo: number | string | ColumnItem | Array<number | string | ColumnItem>): boolean;

    setColumnWidth(columnIndex: number | string | ColumnItem, width: number): this;
    showColumn(columnInfo: number | string | ColumnItem | Array<number | string | ColumnItem>): boolean;
    hideColumn(columnInfo: number | string | ColumnItem | Array<number | string | ColumnItem>): boolean;

    // Row API
    getRows(): RowItem[];
    getViewRows(): RowItem[];
    getViewRowItem(viewRowIndex: number): RowItem | undefined;
    getRowItem(context: number | string | RowItem): RowItem | undefined;
    getRowItemById(id: string): RowItem | undefined;
    getRowItemBy(key: string, value: any): RowItem | undefined;
    getRowsLength(total?: boolean): number;
    setRows(rows: RowItem[]): void;

    addRow(rowInfo: RowItem | RowItem[], parent?: number | string | RowItem | null, position?: number | null, scrollTo?: boolean): boolean;
    deleteRow(rowInfo: number | string | RowItem | Array<number | string | RowItem>): boolean;

    showRow(rowInfo: number | string | RowItem | Array<number | string | RowItem>): boolean;
    hideRow(rowInfo: number | string | RowItem | Array<number | string | RowItem>): boolean;

    setRowSubs(rowIndex: number | string | RowItem, subs: RowItem[] | null): this;

    // Row collapse
    expandRow(rowIndex: number | string | RowItem): this;
    collapseRow(rowIndex: number | string | RowItem): this;
    toggleRow(rowIndex: number | string | RowItem): this;
    expandAllRows(): this;
    collapseAllRows(): this;
    toggleAllRows(): this;
    expandRowLevel(level: number): this;

    // Row hover/state
    setRowHover(rowIndex: number | string | RowItem, hover: boolean): void;
    setRowState(rowIndex: number | string | RowItem, state: string, value?: boolean): void;

    // Row select
    selectAll(selected?: boolean): this;
    setRowSelected(rowInfo: number | string | RowItem | Array<number | string | RowItem>, settings?: boolean | Event): this;
    getSelectedRow(): RowItem | null;
    getSelectedRows(): RowItem[];
    isRowSelectable(rowItem: RowItem): boolean;
    isRowLeaf(rowItem: RowItem): boolean;

    // Row move
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
    setSortColumn(columnItem: number | string | ColumnItem): void;
    removeSortColumn(): this;

    // Scroll
    scrollToRow(row: number | string | RowItem): this;
    scrollToColumn(column: number | string | ColumnItem): this;
    scrollToCell(row: number | string | RowItem, column: number | string | ColumnItem): this;
    scrollToFirstRow(): this;
    scrollToLastRow(): this;
    scrollToFirstColumn(): this;
    scrollToLastColumn(end?: boolean): this;
    scrollRowIntoView(row: number | string | RowItem): this;
    scrollColumnIntoView(column: number | string | ColumnItem): this;
    scrollCellIntoView(row: number | string | RowItem, column: number | string | ColumnItem): this;
    setScroll(x: number, y: number): this;
    setScrollLeft(x: number): this;
    setScrollTop(y: number): this;
    getScrollLeft(): number;
    getScrollTop(): number;
    getMaxScrollLeft(): number;
    getMaxScrollTop(): number;

    // Scroll size
    getScrollbarWidth(): number;
    getScrollbarHeight(): number;
    getScrollViewWidth(): number;
    getScrollViewHeight(): number;
    getScrollPaneWidth(): number;
    getScrollPaneHeight(): number;

    // Row size
    getRowsHeight(): number;
    getRowHeight(rowIndex?: number | string | RowItem): number;

    // Viewport
    getViewport(): { rows: number[]; columns: number[] };

    // Loading
    setLoading(content?: HTMLElement | Record<string, any> | ((holder: HTMLElement) => HTMLElement) | null): this;
    showLoading(): this;
    hideLoading(): this;

    // Mask
    showMask(styleMap?: StyleMap): this;
    hideMask(): this;

    // Export
    exportData(keysSettings?: Record<string, boolean>): { columns: ColumnItem[]; rows: RowItem[] };

    // Iterate
    forEachRow(callback: (rowItem: RowItem, index: number, parent?: RowItem) => void | false): this;
    forEachColumn(callback: (columnItem: ColumnItem, index: number, parent?: ColumnItem) => void | false): this;

    // Cell
    getCellValue(rowItem: RowItem, columnItem: ColumnItem): any;

    // Highlight
    highlightKeywordsFilter(rowItem: RowItem, columns: string[], keywords: string): boolean;

    // Node
    find(selector: string, container?: HTMLElement): Query;
    getRowNodes(rowIndex: number | string | RowItem): Query | undefined;
    getCellNode(rowIndex: number | string | RowItem, columnIndex: number | string | ColumnItem): HTMLElement | undefined;
    getHeaderItemNode(columnInfo: number | string | ColumnItem): HTMLElement | undefined;
    getColumnHeaderNode(columnIndex: number | string | ColumnItem): HTMLElement | undefined;

    // Destroy
    reset(): this;
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
