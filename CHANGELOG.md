# Planning

- column drag/drop
- unit test: shadow dom, getDataSnapshot

---
# Changelog

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
