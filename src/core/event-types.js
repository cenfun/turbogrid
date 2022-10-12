//All Events
export const Types = [

    //render
    'onUpdated',
    'onFirstUpdated',

    //header
    'onHeaderUpdated',

    'onHeaderMouseOver',
    'onHeaderMouseOut',

    'onSort',

    //column
    'onColumnAdded',
    'onColumnRemoved',

    'onColumnWidthChanged',

    //row
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

    //cell
    'onCellUpdated',

    'onCellMouseEnter',
    'onCellMouseLeave',

    'onCellMouseOver',
    'onCellMouseOut',

    //scroll
    'onScroll',
    'onScrollStateChanged',

    'onMouseWheel',

    //header and body
    'onClick',
    'onDblClick',
    'onContextMenu',

    //resize
    'onResize',
    'onLayout',

    //other
    'onKeyDown',
    'onDestroy'

];

const E = {};
Types.forEach((type) => {
    E[type] = type;
});

export default E;
