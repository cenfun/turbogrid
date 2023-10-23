// All Events
export const Types = [

    // render
    'onUpdated',
    'onFirstUpdated',

    // header
    'onHeaderUpdated',

    'onSort',

    // column
    'onColumnAdded',
    'onColumnRemoved',

    'onColumnWidthChanged',

    // row
    'onRowAdded',
    'onRowRemoved',

    'onRowExpanded',
    'onRowCollapsed',

    'onRowSubsRequest',

    'onRowDragged',
    'onRowDropped',
    'onRowMoved',

    'onRowMouseEnter',
    'onRowMouseLeave',

    'onSelectChanged',

    // cell
    'onCellUpdated',

    'onCellMouseEnter',
    'onCellMouseLeave',

    // header and body
    'onClick',
    'onDblClick',
    'onContextMenu',
    'onMouseOver',
    'onMouseOut',

    // touch
    'onTouchStart',
    'onTouchMove',
    'onTouchEnd',

    // scroll
    'onScroll',
    'onScrollStateChanged',
    'onMouseWheel',

    // resize
    'onResize',
    'onLayout',

    // other
    'onKeyDown',
    'onDestroy'

];

const E = {};
Types.forEach((type) => {
    E[type] = type;
});

export default E;
