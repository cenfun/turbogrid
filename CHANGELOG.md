# Changelog

+ 3.2.21
    - fixed #2

+ 3.2.0
    - (breaking) removed API setRowHeight
    - (feature) added new option `cellResizeObserver` for row height auto adjustment
    - fixed minor UI issues for better user experience
    - fixed highlight keywords for async renders
    - fixed highlight keywords for svg/textarea

+ 3.1.1
    - added `defaultPrevented` for event data
    - added `hoverable` for row
    - fixed text select issue when dragging
    - fixed `onLayout` event to detect scrollbar size

+ 3.1.0
    - fixed index cache after sort
    - fixed scrollbar min size
    - added ES module bundle
    - added new APIs showMask/hideMask
    - added highlight keywords API

+ 3.0.13
    - fixed touch orientation issue

+ 3.0.12
    - fixed formatter issue for header group

+ 3.0.11
    - fixed css issue for Edge

+ 3.0.10
    - fixed drag/drop after sorted

+ 3.0.9
    - added touch events

+ 3.0.8
    - fixed column resize issue

+ 3.0.1
    - removed column collapse
    - renamed VisibleRange to Viewport
    - updated addRow and deleteRow API
    - removed onRenderBeforeUpdate and onRenderStart
    - renamed onRenderUpdate to onUpdated
    - renamed onRenderComplete to onFirstUpdated
    - renamed onceRendered to onNextUpdated
    - renamed bodyer to body
    - changed invalidate to flush
    - removed highlight/focus API
    - changed selectedAll to selectAllOnInit
    - changed showCollapseAllIcon to collapseAllVisible
    - changed collapseAll to collapseAllOnInit
    - changed showRowNumber to rowNumberVisible
    - changed showHeader to headerVisible
    - removed editor
    - added classMap and styleMap
    - added setDataSnapshot API
    - renamed getExportData to exportData
    - removed isNull replaced with null formatter
    - removed rowType 'blank' replaced with formatter 'blank'
    - supported row formatter (high priority)
    - updated new formatter arguments (value, rowItem, columnItem, cellNode)
    - replaced all filters with formatters, added getDefaultFormatter API
    - removed all rowIndex/columnIndex in formatter arguments 
    - rename all rowData/columnData to rowItem/columnItem 
    - rename all status to state
    - changed all cjs to esm
    - moved columnsInfo and rowsInfo to grid instance from option
    - removed random column id if undefined
    - removed columnFormatterDefaults and columnDefaultFormatter replaced with columnTypes
    - changed columnDefaults to columnProps
    - moved 2 computed methods out of option
    - changed dataType to type
    - supported vue3
    - merged models and views
    - es class native extends
