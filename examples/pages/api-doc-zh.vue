<template>
  <div class="api-page main">
    <div class="api-header">
      <div class="api-nav">
        <a href="#/api-doc-zh?position=methods">方法</a>
        <a href="#/api-doc-zh?position=data">数据</a>
        <a href="#/api-doc-zh?position=options">配置项</a>
        <a href="#/api-doc-zh?position=events">事件</a>
        <a href="#/api-doc-zh?position=lifecycle">生命周期</a>
      </div>
    </div>
    <div class="api-container">
      <details
        open
        class="turbogrid"
      >
        <summary>
          <a name="turbogrid">快速开始</a>
        </summary>

        <section>
          <a name="install">安装</a>
          <pre><code class="language-js">
                npm i turbogrid
            </code></pre>
        </section>

        <section>
          <a name="usage">使用方式</a>
          <pre><code class="language-js">
                // esm
                import TG from "turbogrid";
                import { Grid, Util } from "turbogrid";
                // cjs
                const TG = require("turbogrid");
                const { Grid, Util } = require("turbogrid");
            </code></pre>
        </section>

        <section>
          <a name="browser">浏览器中使用</a>
          <pre><code class="language-js">
                &lt;script src="path-to/dist/turbogrid.js"&gt;&lt;/script&gt;
                &lt;script&gt;
                    // umd
                    const TG = window.turbogrid;
                    const { Grid, Util } = window.turbogrid;
                &lt;/script&gt;
            </code></pre>
        </section>

        <section>
          <a name="Grid">Grid(container)</a>
          <div>为指定容器创建一个新的 Grid 实例。</div>
          <div>container 参数可以是 CSS 选择器、DOM 元素，或包含 container 属性的配置对象。</div>
          <pre><code class="language-js">
                            // 选择器
                            const grid = new Grid(".container");
                            // 或 DOM 元素
                            const container = document.querySelector(".container");
                            const grid = new Grid(container);
                            // 或包含 container 的配置对象
                            const grid = Grid({
                                container,
                                ... 其他选项
                            });
                        </code></pre>
        </section>
      </details>

      <details
        open
        class="methods"
      >
        <summary>
          <a name="methods">方法</a>
          <span class="total" />
        </summary>

        <section>
          <a name="setData">setData(data)</a>
          <div>设置表格数据。详细结构请参见 <a href="#/api-doc-zh?position=data">数据结构</a>。</div>
          <div>data 对象会读取 columns、rows、rowsLength 和 options。rowsLength 适用于已知总行数但数据尚未全部加载完成的场景。</div>
          <pre><code class="language-js">
                            grid.setData({
                                columns: [],
                                rows: []
                            });
                        </code></pre>
        </section>

        <section>
          <a name="getData">getData()</a>
          <div>返回当前表格数据对象。</div>
          <pre><code class="language-js">
                            const data = grid.getData();
                        </code></pre>
        </section>

        <section>
          <a name="setDataSnapshot">setDataSnapshot(data)</a>
          <div>从普通快照数据加载内容，会移除私有 tg_* 字段，并重新构建 rows 和 columns 的规范化树结构状态。</div>
          <pre><code class="language-js">
                            grid.setDataSnapshot(data);
                        </code></pre>
        </section>

        <section>
          <a name="getItemSnapshot">getItemSnapshot(item[, keysSettings])</a>
          <div>返回行或列条目的净化快照数据。</div>
          <div>未传 keysSettings 时会移除私有字段；传入 keysSettings 时，值为 true 的键会被显式保留，值为 false 的键会被排除。</div>
          <pre><code class="language-js">
                            const rowSnapshot = grid.getItemSnapshot(rowItem);
                            const rowSnapshot2 = grid.getItemSnapshot(rowItem, {
                                id: true,
                                name: true
                            });
                        </code></pre>
        </section>

        <section>
          <a name="setOption">setOption(options)</a>
          <div>设置一个或多个表格选项。可用配置请参见 <a href="#/api-doc-zh?position=options">配置项</a>。</div>
          <div>同时支持 setOption(optionKey, optionValue) 和 setOption(optionsObject) 两种调用形式。</div>
          <pre><code class="language-js">
                            // 设置多个选项
                            grid.setOption({
                                optionKey1: optionValue1,
                                optionKey2: optionValue2
                            });
                            // 设置单个选项
                            grid.setOption(optionKey, optionValue);
                        </code></pre>
        </section>

        <section>
          <a name="getOption">getOption([name])</a>
          <div>传入 name 时返回对应选项值；未传入时返回完整配置对象。</div>
          <div>查询未知配置键时返回 undefined。</div>
          <pre><code class="language-js">
                            // 获取全部选项
                            const options = grid.getOption();
                            // 获取单个选项
                            const optionValue = grid.getOption(optionKey);
                        </code></pre>
        </section>

        <section>
          <a name="setFormatter">setFormatter(formatters)</a>
          <div>注册或覆盖 Grid 格式化器。</div>
          <div>
            同时支持 setFormatter(type, handler) 和 setFormatter(formatterMap)。已注册的处理函数执行时，this 指向当前 grid 实例。
          </div>
          <pre><code class="language-js">
                            // 设置多个格式化器
                            grid.setFormatter({
                                string: function(value, rowItem, columnItem, cellNode) {
                                    return value;
                                }
                            });

                            // 设置单个格式化器
                            grid.setFormatter("string", formatterHandler);
                        </code></pre>
          <div>内置单元格格式化器：string、number、date、icon、blank、checkbox、tree、null</div>
          <div>内置表头格式化器：header</div>
          <div>格式化器签名：</div>
          <pre><code class="language-js">
                            function(value, rowItem, columnItem, cellNode) {
                                // value 经过 null 格式化器处理后传入
                                // 获取原始值：
                                const originalValue = rowItem[columnItem.id];
                                const rowIndex = rowItem.tg_index;
                                const columnIndex = columnItem.tg_index;
                                // 使用默认格式化器返回结果：
                                const defaultFormatter = this.getDefaultFormatter("[formatter-name]");
                                return defaultFormatter(value + " new text", rowItem, columnItem, cellNode)
                            }
                        </code></pre>
          <div>
            示例 <a
              href="#/formatter"
              target="_blank"
            >Formatter</a>
          </div>
        </section>

        <section>
          <a name="getFormatter">getFormatter(type)</a>
          <div>返回指定类型已注册的格式化函数，并绑定到当前 grid 实例。</div>
          <pre><code class="language-js">
                            const stringFormatter = grid.getFormatter("string");
                        </code></pre>
        </section>

        <section>
          <a name="getDefaultFormatter">getDefaultFormatter([type])</a>
          <div>返回指定类型的内置格式化函数。</div>
          <div>当指定类型不存在时，会回退到内置的 string 格式化器。</div>
          <pre><code class="language-js">
                            const treeFormatter = grid.getDefaultFormatter("tree");
                        </code></pre>
        </section>

        <section>
          <a name="bind">bind(eventType, handler[, options])</a>
          <div>为表格绑定事件处理函数。支持的事件类型请参见 <a href="#/api-doc-zh?position=events">事件</a>。</div>
          <div>eventType 可以是单个事件名、由空格分隔的多个事件名，或事件名到处理函数的对象映射。也支持 `onUpdated.demo` 这类带命名空间的事件名。</div>
          <div>可通过 options 传入诸如 { once: true } 之类的监听配置。</div>
          <pre><code class="language-js">
                            grid.bind("onUpdated", function(e, d){
                                //console.log(d);
                            });
                        </code></pre>
          <div>
            示例 <a
              href="#/events"
              target="_blank"
            >Events</a>
          </div>
        </section>

        <section>
          <a name="once">once(eventType, handler)</a>
          <div>绑定一个只执行一次的处理函数，首次触发后会自动移除。</div>
          <div>支持与 bind 相同的 eventType 传参形式。</div>
          <pre><code class="language-js">
                            grid.once("onUpdated", function(e, eventData){
                                //console.log(eventData);
                            });
                        </code></pre>
        </section>

        <section>
          <a name="unbind">unbind([eventType][, handler][, options])</a>
          <div>移除之前绑定到表格上的事件处理函数。</div>
          <div>不传参数时会移除全部处理函数；传入事件名或命名空间时移除匹配项；同时传入 eventType 和 handler 时移除指定绑定。</div>
          <pre><code class="language-js">
                            grid.unbind();
                            grid.unbind("onUpdated");
                            grid.unbind("onUpdated", handler);
                        </code></pre>
        </section>

        <section>
          <a name="trigger">trigger(eventType, eventData)</a>
          <div>触发一个事件，并使用传入的事件数据调用所有已绑定处理函数。</div>
          <div>处理函数的第一个参数是事件对象，第二个参数是 eventData。</div>
          <pre><code class="language-js">
                            this.trigger(eventType, eventData);
                        </code></pre>
        </section>

        <section>
          <a name="getAllEvents">getAllEvents()</a>
          <div>返回全部支持的 <a href="#/api-doc-zh?position=events">事件类型</a>。</div>
          <pre><code class="language-js">
                            const allEventTypes = grid.getAllEvents();
                        </code></pre>
          <div>
            示例 <a
              href="#/events"
              target="_blank"
            >Events</a>
          </div>
        </section>

        <section>
          <a name="render">render()</a>
          <div>基于当前数据、配置和格式化器调度一次渲染。</div>
          <div>同一个事件循环中的重复调用会被合并，因此适合在批量更新后调用。</div>
          <pre><code class="language-js">
                            grid.render();
                        </code></pre>
        </section>

        <section>
          <a name="rerender">rerender()</a>
          <div>强制完整重建表格结构并重新渲染。</div>
          <pre><code class="language-js">
                            grid.rerender();
                        </code></pre>
        </section>

        <section>
          <a name="resize">resize([w, [h]])</a>
          <div>重新计算布局，并可选择应用新的尺寸。</div>
          <div>支持 resize()、resize(width, height) 和 resize(styleMap) 三种形式，其中 styleMap 会直接应用到 grid holder。</div>
          <pre><code class="language-js">
                            grid.resize();
                            grid.resize(600, 400);
                        </code></pre>
          <div>
            示例 <a
              href="#/resize"
              target="_blank"
            >Resize</a>
          </div>
        </section>

        <section>
          <a name="destroy">destroy()</a>
          <div>销毁 Grid 实例，并移除生成的 DOM、观察器和事件绑定。</div>
          <pre><code class="language-js">
                            grid.destroy();
                        </code></pre>
        </section>

        <section>
          <a name="getColumnItem">getColumnItem(columnIndex)</a>
          <a name="getColumnItemById">getColumnItemById(id)</a>
          <a name="getColumnItemBy">getColumnItemBy(key, value)</a>
          <a name="getRowItem">getRowItem(rowIndex)</a>
          <a name="getRowItemById">getRowItemById(id)</a>
          <a name="getRowItemBy">getRowItemBy(key, value)</a>
          <div>rowIndex 和 columnIndex 参数支持以下几种传入形式：</div>
          <ol>
            <li>如果参数是 Number，Grid 会按索引查找对应的行或列。这是推荐且性能最高的方式。也支持负索引，例如 -1 表示最后一项。</li>
            <li>如果参数是 String，Grid 会遍历所有项，查找匹配的行或列 id。</li>
            <li>如果参数是 Object，Grid 会检查以下属性：</li>
            <ul>
              <li>如果对象包含 tg_index 属性，Grid 会优先按索引查找行或列。</li>
              <li>如果对象包含 String 类型的 id 属性，Grid 会遍历所有项，查找匹配的 id。</li>
            </ul>
          </ol>
          <pre><code class="language-js">
                            const columnItem = grid.getColumnItem(columnIndex);
                            const columnItemById = grid.getColumnItemById("id_123");
                            const rowItem = grid.getRowItem(rowIndex);
                            const rowItemById = grid.getRowItemById("id_123");
                            const rowItem = grid.getRowItem(123);
                            const rowItem = grid.getRowItem("id_123");
                            const rowItem = grid.getRowItemBy("id", "id_123");
                            const rowItem = grid.getRowItemBy("key", "value");
                        </code></pre>
        </section>

        <section>
          <a name="showLoading">showLoading()</a>
          <a name="hideLoading">hideLoading()</a>
          <a name="setLoading">setLoading(loading)</a>
          <div>显示、隐藏或自定义内置加载遮罩。</div>
          <div>loading 可以是普通内容、DOM 节点、接收 loading 容器的工厂函数，或默认 loading 的配置对象，例如 { size, color, fast }。</div>
          <pre><code class="language-js">
                            grid.showLoading();
                            grid.hideLoading();
                            grid.setLoading("加载中...");
                            grid.setLoading(function(container) {
                                return document.createElement("div");
                            });
                        </code></pre>
          <div>
            示例 <a
              href="#/loading"
              target="_blank"
            >Show/Hide Loading</a>
          </div>
        </section>

        <section>
          <a name="showMask">showMask([styleMap])</a>
          <a name="hideMask">hideMask()</a>
          <div>显示或隐藏用于阻止交互的遮罩层。</div>
          <div>可传入 styleMap 覆盖遮罩层样式，例如 opacity 或 backgroundColor。</div>
          <pre><code class="language-js">
                            grid.showMask();
                            grid.showMask({
                                opacity: 0.3
                            });

                            grid.hideMask();
                        </code></pre>
          <div>
            示例 <a
              href="#/loading"
              target="_blank"
            >Show/Hide Loading</a>
          </div>
        </section>

        <section>
          <a name="expandAllRows">expandAllRows()</a>
          <a name="collapseAllRows">collapseAllRows()</a>
          <a name="toggleAllRows">toggleAllRows()</a>
          <div>展开、折叠或切换所有树形行。</div>
          <pre><code class="language-js">
                            grid.expandAllRows();
                            grid.collapseAllRows();
                            grid.toggleAllRows();
                        </code></pre>
          <div>
            示例 <a
              href="#/row-collapse"
              target="_blank"
            >Row Collapse/Expand</a>
          </div>
        </section>

        <section>
          <a name="expandRow">expandRow(rowIndex)</a>
          <a name="collapseRow">collapseRow(rowIndex)</a>
          <a name="toggleRow">toggleRow(rowIndex)</a>
          <div>展开、折叠或切换指定行。</div>
          <div>如果目标行是一个尚未加载 subs 的分组行，expandRow 可能会触发 onRowSubsRequest，用于按需加载子行。</div>
          <pre><code class="language-js">
                            grid.expandRow(rowIndex);
                            grid.collapseRow(rowIndex);
                            grid.toggleRow(rowIndex);
                        </code></pre>
          <div>
            示例 <a
              href="#/row-collapse"
              target="_blank"
            >Row Collapse/Expand</a>
          </div>
        </section>

        <section>
          <a name="expandRowLevel">expandRowLevel(level)</a>
          <div>展开到指定树层级的行。</div>
          <pre><code class="language-js">
                            grid.expandRowLevel(level);
                        </code></pre>
          <div>
            示例 <a
              href="#/row-collapse"
              target="_blank"
            >Row Collapse/Expand</a>
          </div>
        </section>

        <section>
          <a name="exportData">exportData([keysSettings])</a>
          <div>返回适合导出的 columns 和 rows 数据，会移除私有字段，并可通过 keysSettings 过滤字段。</div>
          <div>在 keysSettings 中，值为 true 表示强制保留该字段，值为 false 表示排除该字段。</div>
          <pre><code class="language-js">
                            const exportedData = grid.exportData();
                            const exportedData = grid.exportData({
                                the_key_need: true,
                                key_key_no_need: false
                            });
                        </code></pre>
          <div>
            示例 <a
              href="#/export"
              target="_blank"
            >Export</a>
          </div>
        </section>

        <section>
          <a name="setRowSubs">setRowSubs(rowIndex, subs)</a>
          <div>替换指定父行的子行数据。</div>
          <div>传入 subs 数组后会立即更新该行的树结构，并将父行标记为已展开。</div>
          <pre><code class="language-js">
                            const subs = [{name:"row1"},{name:"row2"}];
                            grid.setRowSubs(rowIndex, subs);
                        </code></pre>
          <div>
            示例 <a
              href="#/load-subs"
              target="_blank"
            >Dynamic Load Subs</a>
          </div>
        </section>

        <section>
          <a name="setColumns">setColumns(columnList)</a>
          <div>替换当前顶层列数据，并触发一次完整 rerender。</div>
          <pre><code class="language-js">
                            const columns = [{id:"name", name:"名称"}];
                            grid.setColumns(columns);
                        </code></pre>
        </section>

        <section>
          <a name="setRows">setRows(rowList)</a>
          <div>使用新的行列表替换当前顶层 rows。</div>
          <div>当只有行树发生变化时使用 setRows；如果列或 options 也需要一起替换，应使用 setData。</div>
          <pre><code class="language-js">
                            const rows = [{name:"row1"},{name:"row2"}];
                            grid.setRows(rows);
                        </code></pre>
          <div>
            示例 <a
              href="#/set-rows"
              target="_blank"
            >Dynamic Set Rows</a>
          </div>
        </section>

        <section>
          <a name="getRows">getRows()</a>
          <a name="getColumns">getColumns()</a>
          <a name="getViewRows">getViewRows()</a>
          <a name="getViewColumns">getViewColumns([all])</a>
          <a name="getViewRowItem">getViewRowItem(viewRowIndex)</a>
          <a name="getViewColumnItem">getViewColumnItem(viewColumnIndex)</a>
          <div>getRows 和 getColumns 返回源数据中的顶层列表。</div>
          <div>view index 指经过筛选、折叠、排序以及列显隐处理后的当前可见顺序索引。</div>
          <div>getViewColumns(true) 还会把当前可见的分组列一并包含在返回结果中。</div>
          <pre><code class="language-js">
                            const rows = grid.getRows();
                            const columns = grid.getColumns();
                            const viewRows = grid.getViewRows();
                            const viewColumns = grid.getViewColumns();
                            const viewRowItem = grid.getViewRowItem(0);
                            const viewColumnItem = grid.getViewColumnItem(0);
                        </code></pre>
        </section>

        <section>
          <a name="addRow">addRow(rowInfo[, parent, position, scrollTo = true])</a>
          <a name="deleteRow">deleteRow(rowIndex)</a>
          <div>新增一行，或删除一行/多行。</div>
          <div>parent 可以是行对象、行索引或行 id；position 用于指定插入到父节点子列表中的位置；scrollTo 默认为 true，会自动滚动到新增行。</div>
          <pre><code class="language-js">
                            grid.addRow({
                                id: "id1",
                                name: "行项目"
                            });
                            grid.addRow(["行 1", "行 2"]);
                            grid.addRow(["行 1", "行 2"], parentIndex);
                            grid.addRow("插入到前面的一行","level_0", 0);
                            grid.deleteRow(2);
                            grid.deleteRow([1, 2]);
                        </code></pre>
          <div>
            示例 <a
              href="#/row-add-delete"
              target="_blank"
            >Row Add/Delete</a>
          </div>
        </section>

        <section>
          <a name="moveRowsToTop">moveRowsToTop(rowList)</a>
          <a name="moveRowsUp">moveRowsUp(rowList)</a>
          <a name="moveRowsDown">moveRowsDown(rowList)</a>
          <a name="moveRowsToBottom">moveRowsToBottom(rowList)</a>
          <a name="moveSelectedRowsToTop">moveSelectedRowsToTop()</a>
          <a name="moveSelectedRowsUp">moveSelectedRowsUp()</a>
          <a name="moveSelectedRowsDown">moveSelectedRowsDown()</a>
          <a name="moveSelectedRowsToBottom">moveSelectedRowsToBottom()</a>
          <a name="moveRows">moveRows(rowList, offset)</a>
          <div>offset：小于 0 时向上移动，大于 0 时向下移动。</div>
          <div>rowList 可以是单行或行列表。offset 为 0，或 rowList 已包含全部可见行时，本次移动会被忽略。</div>
          <pre><code class="language-js">
                            grid.moveRowsToTop(["row_id1", "row_id2"]);
                            grid.moveRowsUp(["row_id1", "row_id2"]);
                            grid.moveRowsDown(["row_id1", "row_id2"]);
                            grid.moveRowsToBottom(["row_id1", "row_id2"]);

                            grid.moveSelectedRowsToTop();
                            grid.moveSelectedRowsUp();
                            grid.moveSelectedRowsDown();
                            grid.moveSelectedRowsToBottom();

                            grid.moveRows(["row_id"], -1);
                            grid.moveRows(["row_id"], -2);
                            grid.moveRows("row_id", 1);
                        </code></pre>
          <div>
            示例 <a
              href="#/row-move"
              target="_blank"
            >Row Move</a>
          </div>
        </section>

        <section>
          <a name="selectAll">selectAll([selected = true])</a>
          <div>选中全部可选行，或清空全部选中状态。</div>
          <div>在单选模式下，selectAll(true) 不会生效。</div>
          <pre><code class="language-js">
                            grid.selectAll();
                            grid.selectAll(false);
                        </code></pre>
          <div>
            示例 <a
              href="#/row-select"
              target="_blank"
            >Row Select</a>
          </div>
        </section>

        <section>
          <a name="setRowSelected">setRowSelected(rowInfo[, settings])</a>
          <div>更新一行或多行的选中状态。</div>
          <div>在多选模式下，只传 false 可清空全部选中；第二个参数传 false 可取消指定行的选中；传入带 Shift 的事件对象时，会以上一次选中行为起点执行范围选择。</div>
          <pre><code class="language-js">
                            grid.setRowSelected(rowIndex);
                            grid.setRowSelected(rowIndex, false);
                            grid.setRowSelected(false);
                        </code></pre>
          <div>
            示例 <a
              href="#/row-select"
              target="_blank"
            >Row Select</a>
          </div>
        </section>

        <section>
          <a name="getSelectedRow">getSelectedRow()</a>
          <a name="getSelectedRows">getSelectedRows()</a>
          <div>getSelectedRow 返回第一条已选中的行，未选中时返回 null。</div>
          <div>getSelectedRows 始终返回数组，并按选中顺序排序。</div>
          <pre><code class="language-js">
                            const selectedRow = grid.getSelectedRow();
                            const selectedRows = grid.getSelectedRows();
                        </code></pre>
          <div>
            示例 <a
              href="#/row-select"
              target="_blank"
            >Row Select</a>
          </div>
        </section>

        <section>
          <a name="setRowHover">setRowHover(rowIndex, hover)</a>
          <div>设置指定行是否处于悬停状态。</div>
          <pre><code class="language-js">
                            grid.setRowHover(rowIndex, true);
                            grid.setRowHover(rowIndex, false);
                        </code></pre>
          <div>
            示例 <a
              href="#/frozen-middle"
              target="_blank"
            >Frozen Middle</a>
          </div>
        </section>

        <section>
          <a name="setRowState">setRowState(rowIndex, state, value = true)</a>
          <div>设置自定义行状态，并在已渲染的行节点上切换 CSS 类 tg-[state]。</div>
          <pre><code class="language-js">
                            grid.setRowState(rowIndex, "selected", true);
                            grid.setRowState(rowIndex, "warning", true);
                            grid.setRowState(rowIndex, "warning", false);
                        </code></pre>
        </section>

        <section>
          <a name="setSortColumn">setSortColumn(sortColumn)</a>
          <a name="removeSortColumn">removeSortColumn()</a>
          <div>setSortColumn 支持与 getColumnItem 相同的传参形式。</div>
          <div>对同一列重复调用 setSortColumn 会切换 sortAsc；removeSortColumn 用于清除当前排序状态。</div>
          <pre><code class="language-js">
                            grid.setSortColumn(sortColumn);
                            grid.removeSortColumn();
                        </code></pre>
          <div>
            示例 <a
              href="#/sort"
              target="_blank"
            >Row Sort</a>
          </div>
        </section>

        <section>
          <a name="setColumnWidth">setColumnWidth(columnIndex, width)</a>
          <div>在运行时更新列宽。</div>
          <div>width 会被取整并限制为不小于 0，同时同步更新该列的 width、minWidth 和 maxWidth。</div>
          <pre><code class="language-js">
                            grid.setColumnWidth(columnIndex, width);
                        </code></pre>
          <div>
            示例 <a
              href="#/column-display"
              target="_blank"
            >Column Width Resize</a>
          </div>
        </section>

        <section>
          <a name="showColumn">showColumn(columnIndex)</a>
          <a name="hideColumn">hideColumn(columnIndex)</a>
          <div>显示或隐藏一个或多个列。</div>
          <div>支持与 getColumnItem 相同的传参形式，也支持传入列表。</div>
          <pre><code class="language-js">
                            grid.showColumn(columnIndex);
                            grid.hideColumn(columnIndex);
                            grid.showColumn([1, 3]);
                            grid.hideColumn([1, 3]);
                        </code></pre>
          <div>
            示例 <a
              href="#/column-display"
              target="_blank"
            >Show/Hide Column</a>
          </div>
        </section>

        <section>
          <a name="addColumn">addColumn(columnInfo[, parent, position, scrollTo = true])</a>
          <a name="deleteColumn">deleteColumn(columnIndex)</a>
          <div>新增列，或删除一列/多列。</div>
          <div>parent 可以是列对象、列索引或列 id；position 用于指定插入到父节点子列表中的位置；scrollTo 默认为 true，会自动滚动到新增列。</div>
          <pre><code class="language-js">
                            grid.addColumn({
                                id: "id1",
                                name: "列项目"
                            });
                            grid.addColumn(["列 1", "列 2"]);
                            grid.addColumn(["列 1", "列 2"], parentIndex);
                            grid.addColumn("插入到前面的列","level_0",0);
                            grid.deleteColumn(2);
                            grid.deleteColumn([1, 2]);
                        </code></pre>
          <div>
            示例 <a
              href="#/column-add-delete"
              target="_blank"
            >Column Add/Delete</a>
          </div>
        </section>

        <section>
          <a name="scrollToRow">scrollToRow(rowIndex)</a>
          <a name="scrollToFirstRow">scrollToFirstRow()</a>
          <a name="scrollToLastRow">scrollToLastRow()</a>
          <a name="scrollToColumn">scrollToColumn(columnIndex)</a>
          <a name="scrollToFirstColumn">scrollToFirstColumn()</a>
          <a name="scrollToLastColumn">scrollToLastColumn(end)</a>
          <a name="scrollToCell">scrollToCell(rowIndex, columnIndex)</a>
          <div>直接滚动到指定的行、列或单元格。</div>
          <div>scrollToLastColumn(end) 默认会跳过末尾用于占位的 blank 列；当 end 为 true 时会滚动到真正的最末尾。</div>
          <pre><code class="language-js">
                            grid.scrollToRow(rowIndex);
                            grid.scrollToColumn(columnIndex);
                            grid.scrollToCell(rowIndex, columnIndex);
                        </code></pre>
          <div>
            示例 <a
              href="#/scroll"
              target="_blank"
            >Scroll</a>
          </div>
        </section>

        <section>
          <a name="scrollRowIntoView">scrollRowIntoView(rowIndex)</a>
          <a name="scrollColumnIntoView">scrollColumnIntoView(columnIndex)</a>
          <a name="scrollCellIntoView">scrollCellIntoView(rowIndex, columnIndex)</a>
          <div>滚动最小必要距离，使目标行、列或单元格进入可视区域。</div>
          <pre><code class="language-js">
                            grid.scrollRowIntoView(rowIndex);
                            grid.scrollColumnIntoView(columnIndex);
                            grid.scrollCellIntoView(rowIndex, columnIndex);
                        </code></pre>
          <div>
            示例 <a
              href="#/scroll"
              target="_blank"
            >Scroll</a>
          </div>
        </section>

        <section>
          <a name="setScrollTop">setScrollTop(top)</a>
          <a name="setScrollLeft">setScrollLeft(left)</a>
          <a name="getScrollTop">getScrollTop()</a>
          <a name="getScrollLeft">getScrollLeft()</a>
          <div>设置或获取当前滚动位置。</div>
          <pre><code class="language-js">
                            grid.setScrollTop(200);
                            grid.setScrollLeft(200);
                            const st = grid.getScrollTop();
                            const sl = grid.getScrollLeft();
                        </code></pre>
          <div>
            示例 <a
              href="#/scroll"
              target="_blank"
            >Scroll</a>
          </div>
        </section>

        <section>
          <a name="updateRow">updateRow(rowIndex[, rowData])</a>
          <a name="updateCell">updateCell(rowIndex, columnIndex[, cellValue])</a>
          <a name="update">update()</a>
          <a name="flushBody">flushBody()</a>
          <a name="flushSort">flushSort()</a>
          <a name="flushRow">flushRow(viewRowIndex)</a>
          <a name="flushRowFrom">flushRowFrom(viewRowIndex)</a>
          <a name="flushColumn">flushColumn(viewColumnIndex)</a>
          <a name="flushColumnFrom">flushColumnFrom(viewColumnIndex)</a>
          <a name="flushCell">flushCell(viewRowIndex, viewColumnIndex)</a>
          <div>updateRow 支持将部分 rowData 合并到现有行数据中。</div>
          <div>updateCell 会按常规的行列定位规则解析 rowIndex 和 columnIndex。省略 rowData 或 cellValue 时，会基于现有数据重新渲染对应内容。</div>
          <div>flushBody 会清空所有行渲染缓存。flushSort 会清理排序后使用的行缓存。</div>
          <div>
            flushRow、flushRowFrom、flushColumn、flushColumnFrom 和 flushCell 使用的都是 view
            索引（tg_view_index），而不是源数据索引。
          </div>
          <pre><code class="language-js">
                            grid.update();
                            grid.flushBody();
                            grid.flushSort();
                            grid.flushRow(viewRowIndex);
                            grid.flushRowFrom(viewRowIndex);
                            grid.flushColumn(viewColumnIndex);
                            grid.flushColumnFrom(viewColumnIndex);
                            grid.flushCell(viewRowIndex, viewColumnIndex);
                            grid.updateRow(rowIndex);
                            grid.updateRow(rowIndex, rowData);
                            grid.updateCell(rowIndex, columnIndex);
                            grid.updateCell(rowIndex, columnIndex, cellValue);
                        </code></pre>
          <div>
            示例 <a
              href="#/flush"
              target="_blank"
            >Flush</a>
          </div>
        </section>

        <section>
          <a name="getScrollbarWidth">getScrollbarWidth()</a>
          <div>
            没有垂直滚动条时返回 0；当 <a href="#/api-doc-zh?position=onScrollStateChanged">hasVScroll</a> 为 true 时，返回 <a
              href="#/api-doc-zh?position=options.scrollbarSize"
            >scrollbarSize</a>。
          </div>
          <a name="getScrollbarHeight">getScrollbarHeight()</a>
          <div>
            没有水平滚动条时返回 0；当 <a href="#/api-doc-zh?position=onScrollStateChanged">hasHScroll</a> 为 true 时，返回 <a
              href="#/api-doc-zh?position=options.scrollbarSize"
            >scrollbarSize</a>。
          </div>
          <pre><code class="language-js">
                            const sbw = grid.getScrollbarWidth();
                            const sbh = grid.getScrollbarHeight();
                        </code></pre>
        </section>

        <section>
          <a name="getScrollViewWidth">getScrollViewWidth()</a>
          <a name="getScrollViewHeight">getScrollViewHeight()</a>
          <div>滚动视口尺寸 = 滚动面板尺寸 - 滚动条尺寸。</div>
          <pre><code class="language-js">
                            const svw = grid.getScrollViewWidth();
                            const svh = grid.getScrollViewHeight();
                        </code></pre>
        </section>


        <section>
          <a name="getScrollPaneWidth">getScrollPaneWidth()</a>
          <a name="getScrollPaneHeight">getScrollPaneHeight()</a>
          <div>滚动面板尺寸 = 滚动视口尺寸 + 滚动条尺寸。</div>
          <pre><code class="language-js">
                            const spw = grid.getScrollPaneWidth();
                            const sph = grid.getScrollPaneHeight();
                        </code></pre>
        </section>

        <section>
          <a name="getColumnsLength">getColumnsLength(total)</a>
          <div>默认返回当前可见列数量；传入 true 时包含隐藏列。</div>
          <pre><code class="language-js">
                            const len = grid.getColumnsLength();
                            const totalLen = grid.getColumnsLength(true);
                        </code></pre>
        </section>

        <section>
          <a name="getRowsLength">getRowsLength(total)</a>
          <div>默认返回当前可见行数量；传入 true 时包含被折叠或过滤掉的行。</div>
          <pre><code class="language-js">
                            const len = grid.getRowsLength();
                            const totalLen = grid.getRowsLength(true);
                        </code></pre>
        </section>

        <section>
          <a name="getRowsHeight">getRowsHeight()</a>
          <div>返回所有行渲染后的总高度。</div>
          <pre><code class="language-js">
                            const totalHeight = grid.getRowsHeight();
                        </code></pre>
        </section>
        <section>
          <a name="getRowHeight">getRowHeight(rowIndex)</a>
          <div>返回指定行的计算高度。</div>
          <pre><code class="language-js">
                            const rowHeight = grid.getRowHeight(rowIndex);
                        </code></pre>
        </section>

        <section>
          <a name="getViewport">getViewport()</a>
          <div>返回当前可见行和列的索引范围。</div>
          <pre><code class="language-js">
                            const viewport = grid.getViewport();
                            // { rows, columns }
                        </code></pre>
        </section>

        <section>
          <a name="find">find(selector[, container])</a>
          <div>使用 CSS 选择器查找表格根节点内部的元素。</div>
          <div>传入 container 时，可将查询范围限制在 grid 内部的某个特定节点下。</div>
          <pre><code class="language-js">
                            const nodes = grid.find(".selector-name");
                        </code></pre>
        </section>
        <section>
          <a name="getRowNodes">getRowNodes(rowIndex)</a>
          <div>返回指定行当前已渲染的 DOM 节点集合。</div>
          <div>返回值是 Query 集合，适合处理同一行同时出现在多个 pane 中的情况。</div>
          <pre><code class="language-js">
                            const rowNodes = grid.getRowNodes(rowIndex);
                        </code></pre>
        </section>
        <section>
          <a name="getCellNode">getCellNode(rowIndex, columnIndex)</a>
          <a name="getCellValue">getCellValue(rowItem, columnItem)</a>
          <div>返回已渲染的单元格节点，或解析单元格原始值。</div>
          <div>getCellValue 返回的是 rowItem[columnItem.id]，即格式化前的原始值。</div>
          <pre><code class="language-js">
                            const cellNode = grid.getCellNode(rowIndex, columnIndex);
                            const cellValue = grid.getCellValue(rowItem, columnItem);
                        </code></pre>
        </section>
        <section>
          <a name="getHeaderItemNode">getHeaderItemNode(columnIndex)</a>
          <div>返回指定列对应的表头项节点。</div>
          <div>支持与 getColumnItem 相同的传参形式。</div>
          <pre><code class="language-js">
                            const headerItemNode = grid.getHeaderItemNode(columnIndex);
                        </code></pre>
        </section>
        <section>
          <a name="getColumnHeaderNode">getColumnHeaderNode(columnIndex)</a>
          <div>返回指定列对应的表头容器节点。</div>
          <div>支持与 getColumnItem 相同的传参形式。</div>
          <pre><code class="language-js">
                            const columnHeaderNode = grid.getColumnHeaderNode(columnIndex);
                        </code></pre>
        </section>


        <section>
          <a name="forEachColumn">forEachColumn(callback)</a>
          <a name="forEachRow">forEachRow(callback)</a>
          <div>遍历每一列或每一行，并调用传入的回调函数。</div>
          <div>回调函数会收到 (item, index, parent) 三个参数，对应当前节点、索引和父节点。</div>
          <pre><code class="language-js">
                            grid.forEachColumn(function(column, index, parent) {
                                //
                            });
                            grid.forEachRow(function(row, index, parent) {
                                //
                            });
                        </code></pre>
        </section>

        <section>
          <a name="isRowSelectable">isRowSelectable(rowItem)</a>
          <div>返回该行在当前规则下是否可被选中。</div>
          <pre><code class="language-js">
                            const rowItem = grid.getRowItem(rowIndex);
                            if (grid.isRowSelectable(rowItem)) {
                                console.log("可选中");
                            }
                        </code></pre>
        </section>
        <section>
          <a name="isRowLeaf">isRowLeaf(rowItem)</a>
          <div>返回该行是否为叶子节点。</div>
        </section>

        <section>
          <a name="highlightKeywordsFilter">highlightKeywordsFilter(rowItem, columns, patterns)</a>
          <div>用于 rowFilter 和 highlightKeywords 的关键字匹配与高亮辅助方法。</div>
          <div>
            columns 应为列 id 列表。字符串模式会先按空白字符拆分后再逐个匹配，也支持传入模式数组或对象。
            默认要求所有模式都匹配（<code>matchMode = "and"</code>）。
          </div>
          <div>
            匹配方式、文本提取、缓存及高亮标记可通过 <a
              href="#/api-doc-zh?position=options.highlightKeywords"
            >highlightKeywords 配置项</a>自定义。
          </div>
          <pre><code class="language-js">
                            grid.setOption({
                                rowFilter: function(rowItem) {
                                    return this.highlightKeywordsFilter(rowItem, ["name", "type"], "foo bar");
                                }
                            });
                        </code></pre>
          <div>
            示例 <a
              href="#/row-highlight-filter"
              target="_blank"
            >Row Highlight Filter</a>
          </div>
        </section>

        <section>
          <a name="onNextUpdated">onNextUpdated(handler)</a>
          <div>为下一次 onUpdated 事件注册一个一次性处理函数。</div>
          <div>等价于对 onUpdated 绑定一个只执行一次的监听器。</div>
          <pre><code class="language-js">
                            grid.onNextUpdated(function(e, eventData){
                                //console.log(eventData);
                            });
                        </code></pre>
        </section>
      </details>

      <details
        open
        class="data"
      >
        <summary>
          <a name="data">数据</a>
          <span class="total" />
        </summary>

        <section>
          columns 和 rows 使用相同的数据结构（JSON / 树形结构）：
          <div>
            <pre><code class="language-js">
                                    [{
                                        name: "项目 1",
                                        subs: [{
                                            name : "项目 2",
                                            subs: [{
                                                name : "项目 3",
                                                subs: [{
                                                    ...
                                                }]
                                            }, ...]
                                        }, ...]
                                    }, ...]
                            </code></pre>
          </div>
          <pre><code class="language-js">
                            const data = {
                                columns : [...],
                                rows : [...]
                            };
                            grid.setData(data);
                        </code></pre>
        </section>

        <section>
          <a name="data.columns">columns</a>
          <div>可用列字段请参见 <a href="#/api-doc-zh?position=options.columnProps">columnProps</a>。</div>
          <pre><code class="language-js">
                            const columns = [{
                                id:"c1",
                                type : "string",
                                name:"列名 1"
                            }, {
                                id : "c2",
                                type : "number",
                                name : "列名 2"
                            }, {
                                id: "c3",
                                name: "列名 3",
                                subs: [{
                                    id: "c3_s1",
                                    name: "列名 3-1"
                                }, {
                                    id: "c3_s2",
                                    name: "列名 3-2"
                                }]
                            }];
                        </code></pre>
        </section>

        <section>
          <a name="data.rows">rows</a>
          <div>可用行字段请参见 <a href="#/api-doc-zh?position=options.rowProps">rowProps</a>。</div>
          <pre><code class="language-js">
                            const rows = [{
                                id : "r1",
                                name : "行名 1",
                                c1 : "字符串值 1",
                                c2 : 1,
                                c3_s1 : "值 3 - 1",
                                c3_s2 : "值 1 - 2"
                            }, {
                                id : "r2",
                                type : "group",
                                name : "行名 2",
                                c1 : "字符串值 2",
                                c2 : "值 2",
                                c3_s1 : "值 3 - 1",
                                c3_s2 : "值 1 - 2",
                                subs : [{
                                    id : "r3",
                                    type : "holding",
                                    name : "行名 3",
                                    c1 : "字符串值 3",
                                    c2 : 3,
                                    c3_s1 : "值 3 - 1",
                                    c3_s2 : "值 1 - 2"
                                }]
                            }];
                        </code></pre>
        </section>

        <section>
          <a name="data.options">options</a>
          <div>应用 data 中携带的 options。这些值的优先级高于 setOption。</div>
          <pre><code class="language-js">
                            const data = {
                                options : {
                                    sortField : "name"
                                },
                                columns : columns,
                                rows : rows
                            };
                            grid.setData(data);
                        </code></pre>
        </section>

        <section>
          <a name="data.rowsLength">rowsLength</a>
          <div>在不直接提供 rows、但已知总行数时支持按需懒加载。</div>
          <pre><code class="language-js">
                                const data = {
                                    columns: columns,
                                    rowsLength: 50000
                                };
                                grid.setData(data);
                        </code></pre>
          <div>
            示例 <a
              href="#/load-rows"
              target="_blank"
            >Dynamic Load Rows</a>
          </div>
        </section>
      </details>

      <details
        open
        class="options"
      >
        <summary>
          <a name="options">配置项</a>
          <span class="total" />
        </summary>

        <section>
          <a name="options.className">className = "tg-turbogrid"</a>
          <div>自定义作为 Grid 命名空间的根 CSS 类名。</div>
          <pre><code class="language-js">
                        grid.setOption({
                            className: "my-grid-class-name"
                        });
                        </code></pre>
        </section>

        <section>
          <a name="options.theme">theme = "[theme-name]"</a>
          <div>设置主题名称。可选值：default、lightblue、dark。</div>
          <div>
            示例 <a
              href="#/theme"
              target="_blank"
            >Theme</a>
          </div>
        </section>

        <section>
          <a name="options.rowHeight">rowHeight = 32</a>
          <div>设置默认行高，单位为像素。</div>
          <div>
            示例 <a
              href="#/multiple-instance"
              target="_blank"
            >Row Height</a>
          </div>
        </section>

        <section>
          <a name="options.rowCacheLength">rowCacheLength = 0</a>
          <a name="options.columnCacheLength">columnCacheLength = 0</a>
          <div>控制在可视区域外额外渲染多少行和列作为缓存。</div>
          <div>
            示例 <a
              href="#/cache"
              target="_blank"
            >Row/Column Cache</a>
          </div>
        </section>


        <section>
          <a name="options.autoHeight">autoHeight = false</a>
          <div>自动调整表格高度，使其适配当前可见内容。</div>
          <div>
            示例 <a
              href="#/auto-height"
              target="_blank"
            >Auto Height</a>
          </div>
          <a name="options.autoColumnWidth">autoColumnWidth = false</a>
          <div>
            将容器剩余水平空间按比例分配到没有显式指定 <code>width</code> 的列上。配合
            <code>bindContainerResize</code> 自动响应容器尺寸变化。
          </div>
          <div><code>width</code>：固定宽度值，不参与 <code>autoColumnWidth</code> 和 <code>widthWeight</code> 分配。</div>
          <div><code>initWidth</code>：初始/基础宽度，可以是数字或返回数字的回调函数，仍参与 <code>autoColumnWidth</code>，并支持 <code>widthWeight</code> 分配。</div>
          <div>
            示例 <a
              href="#/auto-column-width"
              target="_blank"
            >Auto Column Width</a>
          </div>
        </section>


        <section>
          <a name="options.headerVisible">headerVisible = true</a>
          <div>显示或隐藏表头区域。</div>
          <div>
            示例 <a
              href="#/no-header"
              target="_blank"
            >Show/Hide Header</a>
          </div>
        </section>


        <section>
          <a name="options.collapseAllVisible">collapseAllVisible = true</a>
          <a name="options.collapseAllOnInit">collapseAllOnInit = null</a>
          <div>控制是否显示全部折叠操作，以及是否在初始化时执行。</div>
          <div>
            示例 <a
              href="#/row-collapse"
              target="_blank"
            >Row Collapse/Expand</a>
          </div>
        </section>


        <section>
          <a name="options.selectVisible">selectVisible = false</a>

          <a name="options.selectAllVisible">selectAllVisible = true</a>

          <a name="options.selectAllOnInit">selectAllOnInit = null</a>
          <div>控制是否显示选择相关 UI，以及是否在初始化时全选行。</div>
          <div>对于 selectAllOnInit：true 表示全选，false 表示取消全选，null 表示保持当前状态不变。</div>

          <a name="options.selectMultiple">selectMultiple = true</a>
          <div>
            示例 <a
              href="#/row-select"
              target="_blank"
            >Row Select</a>
          </div>
        </section>


        <section>
          <a name="options.rowNumberVisible">rowNumberVisible = false</a>
          <div>显示或隐藏内置行号列。</div>
          <div>
            示例 <a
              href="#/row-number"
              target="_blank"
            >Row Number</a>
          </div>
        </section>

        <section>
          <a name="options.rowNotFound">rowNotFound = ''</a>
          <div>设置空状态内容。支持空字符串、字符串、DOM 元素或函数。</div>
          <div>
            示例 <a
              href="#/row-not-found"
              target="_blank"
            >Row Not Found</a>
          </div>
        </section>


        <section>
          <a name="options.rowDragCrossLevel">rowDragCrossLevel = true</a>
          <div>控制拖拽行是否允许跨层级移动。支持布尔值，或返回允许落点列表的函数。</div>
          <div>
            示例 <a
              href="#/row-drag"
              target="_blank"
            >Row Drag</a>
          </div>
        </section>


        <section>
          <a name="options.rowMoveCrossLevel">rowMoveCrossLevel = true</a>
          <div>控制行移动相关 API 是否允许跨层级移动。</div>
          <div>
            示例 <a
              href="#/row-move"
              target="_blank"
            >Row Move</a>
          </div>
        </section>


        <section>
          <a name="options.sortField">sortField = ""</a>
          <div>指定排序比较时使用的字段。</div>

          <a name="options.sortAsc">sortAsc = true</a>
          <div>true 为升序，false 为降序。</div>

          <a name="options.sortBlankValueBottom">sortBlankValueBottom = true</a>
          <div>控制空值在排序时的位置。</div>
          <div>true 表示空值行始终排在表格底部。</div>
          <div>false 表示降序时空值排到底部，升序时空值排到顶部。</div>

          <a name="options.sortOnInit">sortOnInit = false</a>
          <div>为 true 时，Grid 会在初始化时按 sortField 排序。</div>

          <a name="options.sortIndicator">sortIndicator = "h"</a>
          <div>设置排序指示器样式："h" 或 "v"。</div>

          <a name="options.sortComparers">sortComparers = {defaultSortComparers}</a>
          <div>提供自定义排序比较函数。</div>
          <div>
            示例 <a
              href="#/sort"
              target="_blank"
            >Row Sort</a>
          </div>
        </section>


        <section>
          <a name="options.rowFilter">rowFilter</a>
          <div>
            在渲染前过滤行。函数返回 true 显示行，返回 false 隐藏行。可使用
            <a href="#/api-doc-zh?position=highlightKeywordsFilter">highlightKeywordsFilter()</a>
            匹配并高亮关键字。
          </div>

          <a name="options.highlightKeywords">highlightKeywords = {...}</a>
          <div>
            配置 <a href="#/api-doc-zh?position=highlightKeywordsFilter">highlightKeywordsFilter()</a>
            使用的匹配方式、文本提取、缓存及高亮标记。
          </div>

          <a name="options.highlightKeywords.matchMode">highlightKeywords.matchMode = "and"</a>
          <div>
            控制正向和反向模式的组合方式。"and" 要求全部条件都满足；"or" 接受任一满足的模式条件；
            "negatedFirst" 优先处理已匹配的反向模式；"positiveFirst" 优先处理已匹配的正向模式。
          </div>

          <a name="options.highlightKeywords.caseSensitive">highlightKeywords.caseSensitive = false</a>
          <div>控制字符串模式默认是否区分大小写。</div>

          <a name="options.highlightKeywords.negatedPrefix">highlightKeywords.negatedPrefix = "-"</a>
          <div>将字符串模式标记为反向匹配的前缀，例如 "-legacy"。</div>

          <a name="options.highlightKeywords.textGenerator">highlightKeywords.textGenerator = null</a>
          <div>
            可选函数 <code>(rowItem, columnId) =&gt; text</code>，用于提供待匹配文本。默认读取
            <code>rowItem[columnId]</code>。
          </div>

          <a name="options.highlightKeywords.scoreKey">highlightKeywords.scoreKey = "tg_match_score"</a>
          <div>
            用于记录匹配分数的行数据属性。设置为空字符串可禁用评分。每次调用都会先将分数重置为 0，
            并且仅当整行最终匹配通过时才计算分数。
          </div>
          <div>只有正向（非反向）模式参与计分，具体规则如下：</div>
          <ul>
            <li>每个搜索列中的每次匹配加 1 分。</li>
            <li>匹配文本与模式的大小写完全一致时，额外加 1 分。</li>
            <li>
              在每一列中，连续的两个已匹配正向模式如果保持输入顺序，即后一个模式的某次匹配位置
              位于前一个模式某次匹配结束位置之后，则额外加 1 分。
            </li>
            <li>反向模式只影响该行是否匹配，不参与计分。</li>
          </ul>
          <div>
            因此，同一模式重复出现或在多个列中出现都会累加分数。例如，模式 "Foo" 匹配 "Foo Foo"
            时得 4 分；模式 "Foo Bar" 匹配 "Foo Bar" 时得 5 分，其中包含 2 分匹配次数、2 分大小写
            完全一致和 1 分顺序奖励。除此之外，匹配位置和文本长度不会影响分数。
          </div>
          <pre><code class="language-js">
                            grid.setOption({
                                highlightKeywords: {
                                    scoreKey: "tg_match_score"
                                },
                                rowFilter: function(rowItem) {
                                    return this.highlightKeywordsFilter(rowItem, ["name", "title"], keywords);
                                },
                                rowFilteredSort: {
                                    sortField: "tg_match_score",
                                    sortAsc: false,
                                    comparer: "number"
                                }
                            });
                        </code></pre>

          <a name="options.highlightKeywords.highlightPre">highlightKeywords.highlightPre = "&lt;mark&gt;"</a>
          <div>插入到每处高亮匹配文本之前的 HTML。</div>

          <a name="options.highlightKeywords.highlightPost">highlightKeywords.highlightPost = "&lt;/mark&gt;"</a>
          <div>插入到每处高亮匹配文本之后的 HTML。</div>

          <div>
            示例 <a
              href="#/row-highlight-filter"
              target="_blank"
            >Row Highlight Filter</a>
          </div>

          <a name="options.rowFilteredSort">rowFilteredSort = null</a>
          <div>在 rowFilter 执行后对行进行排序，适用于搜索结果排名等场景。</div>
          <div>仅当 rowFilter 是函数且当前没有活动的 sortColumn 时生效；点击列头、sortOnInit 或 setSortColumn() 产生的列排序优先级更高。需要恢复过滤排序时，可先调用 removeSortColumn() 再调用 update()。</div>
          <div>支持以下配置形式：</div>
          <ul>
            <li>字符串：作为 sortField，并使用全局 sortAsc。</li>
            <li>对象或列对象：通过 sortField 或 id 指定字段，可设置 sortAsc、comparer 和 type。</li>
            <li>函数：以当前 Grid 为 this，返回字符串、对象、列对象或 null。</li>
          </ul>
          <div>排序会递归调整原始 rows 及各级 subs 的顺序，而不只是排列当前可见的 viewRows；frozen 和 sortFixed 行仍遵循普通排序规则。</div>
          <pre><code class="language-js">
                            grid.setOption({
                                rowFilter: function(rowItem) {
                                    return rowItem.name.includes(keyword);
                                },
                                rowFilteredSort: {
                                    sortField: "score",
                                    sortAsc: false
                                }
                            });
                        </code></pre>
          <div>
            示例 <a
              href="#/row-filter"
              target="_blank"
            >Row Filter</a>
          </div>
        </section>

        <section>
          <a name="options.columnTypes">columnTypes = {...}</a>
          <div>定义预设列类型，以及 id 到类型的映射关系。</div>
        </section>


        <section>
          <a name="options.rowProps">rowProps = {...}</a>
          <div>
            定义 <a href="#/api-doc-zh?position=data.rows">rows</a> 中行项目的默认属性。直接设置在行项目上的属性优先级更高。
          </div>

          <a name="options.rowProps.selected">rowProps.selected = false</a>
          <div>控制该行是否处于选中状态。</div>

          <a name="options.rowProps.collapsed">rowProps.collapsed = false</a>
          <div>控制分组行的子行是否折叠。</div>

          <a name="options.rowProps.selectable">rowProps.selectable = true</a>
          <div>控制该行是否允许被选中。</div>

          <a name="options.rowProps.exportable">rowProps.exportable = true</a>
          <div>控制 <code>exportData()</code> 是否包含该行。</div>

          <a name="options.rowProps.sortFixed">rowProps.sortFixed = false</a>
          <div>排序时保持该行位置固定。设置为 "top" 可将其固定在已排序行的上方。</div>

          <a name="options.rowProps.classMap">rowProps.classMap = null</a>
          <div>行的自定义类名，支持字符串、数组或对象。</div>

          <a name="options.rowProps.styleMap">rowProps.styleMap = null</a>
          <div>行的自定义内联样式，支持字符串、数组或对象。</div>

          <a name="options.rowProps.columnClassMap">rowProps.[columnId]ClassMap = null</a>
          <div>指定单元格的自定义类名，使用对应列 id 作为属性名前缀。</div>

          <a name="options.rowProps.columnStyleMap">rowProps.[columnId]StyleMap = null</a>
          <div>指定单元格的自定义内联样式，使用对应列 id 作为属性名前缀。</div>

          <a name="options.rowProps.type">rowProps.type = ""</a>
          <div>附加到行 CSS 类名的行类型，例如 "group"。</div>

          <a name="options.rowProps.formatter">rowProps.formatter = null</a>
          <div>该行的默认单元格格式化器，支持已注册的格式化器名称或函数。</div>

          <a name="options.rowProps.height">rowProps.height = null</a>
          <div>自定义行高，单位为像素。默认使用 <code>rowHeight</code> 配置。</div>

          <a name="options.rowProps.subs">rowProps.subs = null</a>
          <div>用于构建行树的嵌套子行项目。</div>
        </section>

        <section>
          <a name="options.columnProps">columnProps = {...}</a>
          <div>
            定义 <a href="#/api-doc-zh?position=data.columns">columns</a> 中列项目的默认属性。直接设置在列项目上的属性优先级更高。
          </div>

          <a name="options.columnProps.name">columnProps.name = ""</a>
          <div>显示在列表头中的文本。</div>

          <a name="options.columnProps.id">columnProps.id = ""</a>
          <div>用于从行项目中读取单元格值的列标识符。</div>

          <a name="options.columnProps.type">columnProps.type = ""</a>
          <div>用于解析类型预设和格式化器的列类型，例如 "string"、"number" 或 "date"。</div>

          <a name="options.columnProps.formatter">columnProps.formatter = null</a>
          <div>单元格格式化器，支持已注册的格式化器名称或函数，优先级高于 type。</div>

          <a name="options.columnProps.headerFormatter">columnProps.headerFormatter = null</a>
          <div>表头单元格格式化器，支持已注册的格式化器名称或函数。</div>

          <a name="options.columnProps.comparer">columnProps.comparer = null</a>
          <div>列排序时使用的自定义比较函数。</div>

          <a name="options.columnProps.align">columnProps.align = "left"</a>
          <div>单元格文本对齐方式，支持 "left"、"center" 和 "right"。</div>

          <a name="options.columnProps.classMap">columnProps.classMap = null</a>
          <div>列单元格的自定义类名，支持字符串、数组或对象。</div>

          <a name="options.columnProps.styleMap">columnProps.styleMap = null</a>
          <div>列单元格的自定义内联样式，支持字符串、数组或对象。</div>

          <a name="options.columnProps.headerClassMap">columnProps.headerClassMap = null</a>
          <div>列表头的自定义类名，支持字符串、数组或对象。</div>

          <a name="options.columnProps.headerStyleMap">columnProps.headerStyleMap = null</a>
          <div>列表头的自定义内联样式，支持字符串、数组或对象。</div>

          <a name="options.columnProps.sortable">columnProps.sortable = true</a>
          <div>控制该列是否允许排序。</div>

          <a name="options.columnProps.resizable">columnProps.resizable = true</a>
          <div>控制该列是否允许调整宽度。</div>

          <a name="options.columnProps.exportable">columnProps.exportable = true</a>
          <div>控制 <code>exportData()</code> 是否包含该列。</div>

          <a name="options.columnProps.private">columnProps.private = false</a>
          <div>标记从导出数据中排除的内部列。</div>

          <a name="options.columnProps.minWidth">columnProps.minWidth = 81</a>
          <div>最小列宽，单位为像素。</div>

          <a name="options.columnProps.maxWidth">columnProps.maxWidth = 300</a>
          <div>最大列宽，单位为像素。</div>

          <a name="options.columnProps.width">columnProps.width = null</a>
          <div>固定列宽，单位为像素。该列不参与 autoColumnWidth 和 widthWeight 分配。</div>

          <a name="options.columnProps.initWidth">columnProps.initWidth = null</a>
          <div>初始列宽或列宽回调函数。该列仍参与 autoColumnWidth 分配。</div>

          <a name="options.columnProps.widthWeight">columnProps.widthWeight = 1</a>
          <div>autoColumnWidth 分配可用宽度时使用的比例权重。</div>

          <a name="options.columnProps.height">columnProps.height = null</a>
          <div>自定义列表头单元格高度，单位为像素。</div>

          <a name="options.columnProps.subs">columnProps.subs = null</a>
          <div>用于构建分组表头的嵌套子列项目。</div>
        </section>

        <section>
          <a name="options.frozenColumn">frozenColumn = -1</a>
          <a name="options.frozenRow">frozenRow = -1</a>
          <a name="options.frozenBottom">frozenBottom = false</a>
          <a name="options.frozenRight">frozenRight = false</a>
          <a name="options.frozenColumnMax">frozenColumnMax = 10</a>
          <a name="options.frozenRowMax">frozenRowMax = 10</a>
          <a name="options.frozenRowHoverable">frozenRowHoverable = false</a>
          <div>配置冻结行和冻结列。frozenRowHoverable 用于开启冻结行的悬停样式和悬停事件。</div>
          <div>
            示例 <a
              href="#/frozen"
              target="_blank"
            >Frozen</a>
          </div>
        </section>

        <section>
          <a name="options.scrollbarSize">scrollbarSize = 12</a>
          <a name="options.scrollbarSizeH">scrollbarSizeH = null</a>
          <a name="options.scrollbarSizeV">scrollbarSizeV = null</a>
          <div>设置滚动条基础厚度。</div>

          <a name="options.scrollbarRound">scrollbarRound = false</a>
          <div>启用圆角滚动条样式。</div>

          <a name="options.scrollbarFade">scrollbarFade = false</a>
          <div>启用滚动条淡入淡出效果。</div>

          <a name="options.scrollbarFadeTimeout">scrollbarFadeTimeout = 1000</a>
          <div>设置淡出滚动条隐藏前的延迟时间。</div>

          <a name="options.scrollbarType">scrollbarType = "auto"</a>
          <div>设置滚动条预设：auto 或 mobile，其中 mobile 会启用淡出效果并将尺寸设为 6。</div>

          <a name="options.scrollPaneMinWidth">scrollPaneMinWidth = 30</a>
          <div>设置滚动面板的最小宽度。</div>
          <a name="options.scrollPaneGradient">scrollPaneGradient = false</a>
          <div>在滚动面板边缘启用渐变遮罩。</div>
          <div>
            示例 <a
              href="#/scrollbar"
              target="_blank"
            >Scrollbar</a>
          </div>
        </section>

        <section>
          <a name="options.rowDragVisible">rowDragVisible = false</a>
          <a name="options.rowDragColumn">rowDragColumn = {...}</a>
          <div>启用内置行拖拽手柄，并配置拖拽列。</div>
        </section>

        <section>
          <a name="options.rowNumberWidth">rowNumberWidth = 36</a>
          <a name="options.rowNumberFilter">rowNumberFilter = null</a>
          <div>控制哪些行参与行号编号。回调参数为 (rowItem, index, parent)，返回 true 显示行号，返回 false 则该行不显示且不占用行号；根行的 parent 为 undefined。</div>
          <pre><code class="language-js">
                            rowNumberFilter: function(rowItem, index, parent) {
                                return Boolean(parent) &amp;&amp; !rowItem.tg_group;
                            }
                        </code></pre>
          <a name="options.rowNumberColumn">rowNumberColumn = {...}</a>
          <div>配置内置行号列。</div>
        </section>

        <section>
          <a name="options.selectColumn">selectColumn = {...}</a>
          <a name="options.blankColumn">blankColumn = {...}</a>
          <div>配置用于选择和布局填充的内置私有列。</div>
        </section>

        <section>
          <a name="options.textSelectable">textSelectable = false</a>
          <div>允许在表格单元格内选中文本。</div>
        </section>

        <section>
          <a name="options.bindWindowResize">bindWindowResize = false</a>
          <div>绑定 window resize，并自动调用 resize。</div>
          <a name="options.bindContainerResize">bindContainerResize = false</a>
          <div>使用 ResizeObserver 监听容器尺寸变化，并自动调用 resize。</div>
          <div>
            示例 <a
              href="#/resize"
              target="_blank"
            >Resize</a>
          </div>
        </section>

        <section>
          <a name="options.cellResizeObserver">cellResizeObserver = null</a>
          <div>过滤需要监听尺寸变化的单元格。依赖 ResizeObserver。</div>
          <div>
            示例 <a
              href="#/row-height"
              target="_blank"
            >Row Height</a>
          </div>
        </section>
      </details>

      <details
        open
        class="events"
      >
        <summary>
          <a name="events">事件</a>
          <span class="total" />
        </summary>

        <section>
          <table class="api-table api-table-zebra">
            <thead>
              <tr>
                <th>事件类型</th>
                <th>事件数据</th>
                <th>示例</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <section>
                    <a name="onUpdated">onUpdated</a>
                    <a name="onFirstUpdated">onFirstUpdated</a>
                  </section>
                </td>
                <td>
                  <pre><code class="language-js">
                                        对象：viewport
                                    </code></pre>
                </td>
                <td>
                  <div>
                    示例 <a
                      href="#/events"
                      target="_blank"
                    >Events</a>
                  </div>
                </td>
              </tr>

              <tr>
                <td>
                  <section>
                    <a name="onHeaderUpdated">onHeaderUpdated</a>
                  </section>
                </td>
                <td>
                  <pre><code class="language-js">
                                        对象：{
                                            node: headerNode
                                        }
                                    </code></pre>
                </td>
                <td>
                  <div>
                    示例 <a
                      href="#/events"
                      target="_blank"
                    >Events</a>
                  </div>
                </td>
              </tr>

              <tr>
                <td>
                  <section>
                    <a name="onSort">onSort</a>
                  </section>
                </td>
                <td>
                  <pre><code class="language-js">
                                    对象：{
                                        e,
                                        columnItem,
                                        node: headerItemNode
                                    }
                                    </code></pre>
                </td>
                <td>
                  <div>
                    示例 <a
                      href="#/sort"
                      target="_blank"
                    >Sort</a>
                  </div>
                </td>
              </tr>


              <tr>
                <td>
                  <section>
                    <a name="onColumnAdded">onColumnAdded</a>
                    <a name="onColumnRemoved">onColumnRemoved</a>
                  </section>
                </td>
                <td>
                  <pre><code class="language-js">
                                        数组：[columnItem ...]
                                    </code></pre>
                </td>
                <td>
                  <div>
                    示例 <a
                      href="#/column-add-delete"
                      target="_blank"
                    >Column Add/Delete</a>
                  </div>
                </td>
              </tr>

              <tr>
                <td>
                  <section>
                    <a name="onColumnWidthChanged">onColumnWidthChanged</a>
                  </section>
                </td>
                <td>
                  <pre><code class="language-js">
                                        对象：columnItem
                                    </code></pre>
                </td>
                <td>
                  <div>
                    示例 <a
                      href="#/events"
                      target="_blank"
                    >Events</a>
                  </div>
                </td>
              </tr>

              <tr>
                <td>
                  <section>
                    <a name="onRowAdded">onRowAdded</a>
                    <a name="onRowRemoved">onRowRemoved</a>
                  </section>
                </td>
                <td>
                  <pre><code class="language-js">
                                        数组：[rowItem ...]
                                    </code></pre>
                </td>
                <td>
                  <div>
                    示例 <a
                      href="#/row-add-delete"
                      target="_blank"
                    >Row Add/Delete</a>
                  </div>
                </td>
              </tr>

              <tr>
                <td>
                  <section>
                    <a name="onRowExpanded">onRowExpanded</a>
                    <a name="onRowCollapsed">onRowCollapsed</a>
                  </section>
                </td>
                <td>
                  <pre><code class="language-js">
                                        对象：rowItem
                                    </code></pre>
                </td>
                <td>
                  <div>
                    示例 <a
                      href="#/events"
                      target="_blank"
                    >Events</a>
                  </div>
                </td>
              </tr>

              <tr>
                <td>
                  <section>
                    <a name="onRowSubsRequest">onRowSubsRequest</a>
                  </section>
                </td>
                <td>
                  <pre><code class="language-js">
                                        对象：rowItem
                                    </code></pre>
                </td>
                <td>
                  <div>
                    示例 <a
                      href="#/load-subs"
                      target="_blank"
                    >Dynamic Load Subs</a>
                  </div>
                </td>
              </tr>


              <tr>
                <td>
                  <section>
                    <a name="onRowDragged">onRowDragged</a>
                  </section>
                </td>
                <td>
                  <pre><code class="language-js">
                                        对象：{
                                            e,
                                            rowItem
                                        }
                                    </code></pre>
                </td>
                <td>
                  <div>
                    示例 <a
                      href="#/row-drag"
                      target="_blank"
                    >Row Drag</a>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <section>
                    <a name="onRowDropped">onRowDropped</a>
                  </section>
                </td>
                <td>
                  <pre><code class="language-js">
                                        对象：{
                                            rowItem,
                                            dragFrom,
                                            dragIndex,
                                            dropInto,
                                            dropIndex
                                        }
                                    </code></pre>
                </td>
                <td>
                  <div>
                    示例 <a
                      href="#/row-drag"
                      target="_blank"
                    >Row Drag</a>
                  </div>
                </td>
              </tr>

              <tr>
                <td>
                  <section>
                    <a name="onRowMoved">onRowMoved</a>
                  </section>
                </td>
                <td>
                  <pre><code class="language-js">
                                        数组：[rowItem ...]
                                    </code></pre>
                </td>
                <td>
                  <div>
                    示例 <a
                      href="#/row-move"
                      target="_blank"
                    >Row Move</a>
                  </div>
                </td>
              </tr>

              <tr>
                <td>
                  <section>
                    <a name="onRowMouseEnter">onRowMouseEnter</a>
                    <a name="onRowMouseLeave">onRowMouseLeave</a>
                  </section>
                </td>
                <td>
                  <pre><code class="language-js">
                                        对象：{
                                            e,
                                            rowItem
                                        }
                                    </code></pre>
                </td>
                <td>
                  <div>
                    示例 <a
                      href="#/events"
                      target="_blank"
                    >Events</a>
                  </div>
                </td>
              </tr>

              <tr>
                <td>
                  <section>
                    <a name="onSelectChanged">onSelectChanged</a>
                  </section>
                </td>
                <td>
                  <pre><code class="language-js">
                                        数组：[rowItem ...]
                                    </code></pre>
                </td>
                <td>
                  <div>
                    示例 <a
                      href="#/row-select"
                      target="_blank"
                    >Row Select</a>
                  </div>
                </td>
              </tr>


              <tr>
                <td>
                  <section>
                    <a name="onCellUpdated">onCellUpdated</a>
                  </section>
                </td>
                <td>
                  <pre><code class="language-js">
                                        对象：{
                                            value,
                                            rowItem,
                                            columnItem,
                                            node: cellNode
                                        }
                                    </code></pre>
                </td>
                <td>
                  <div>
                    示例 <a
                      href="#/events"
                      target="_blank"
                    >Events</a>
                  </div>
                </td>
              </tr>

              <tr>
                <td>
                  <section>
                    <a name="onCellMouseEnter">onCellMouseEnter</a>
                    <a name="onCellMouseLeave">onCellMouseLeave</a>
                  </section>
                </td>
                <td>
                  <pre><code class="language-js">
                                        对象：{
                                            e,
                                            rowItem,
                                            columnItem,
                                            rowNode,
                                            cellNode
                                        }
                                    </code></pre>
                </td>
                <td>
                  <div>
                    示例 <a
                      href="#/events"
                      target="_blank"
                    >Events</a>
                  </div>
                </td>
              </tr>

              <tr>
                <td>
                  <section>
                    <a name="onClick">onClick</a>
                    <a name="onDblClick">onDblClick</a>
                    <a name="onContextMenu">onContextMenu</a>
                    <a name="onMouseOver">onMouseOver</a>
                    <a name="onMouseOut">onMouseOut</a>
                  </section>
                </td>
                <td>
                  <pre><code class="language-js">
                                        // 表头区域
                                        对象：{
                                            e,
                                            columnItem,
                                            headerNode
                                        }
                                        // 主体区域
                                        对象：{
                                            e,
                                            rowItem,
                                            columnItem,
                                            rowNode,
                                            cellNode
                                        }
                                    </code></pre>
                </td>
                <td>
                  <div>
                    示例 <a
                      href="#/events"
                      target="_blank"
                    >Events</a>
                  </div>
                </td>
              </tr>

              <tr>
                <td>
                  <section>
                    <a name="onTouchStart">onTouchStart</a>
                    <a name="onTouchMove">onTouchMove</a>
                    <a name="onTouchEnd">onTouchEnd</a>
                  </section>
                </td>
                <td>
                  <pre><code class="language-js">
                                        // 表头区域
                                        对象：{
                                            e,
                                            columnItem?,
                                            headerNode?
                                        }
                                        // 主体区域
                                        对象：{
                                            e,
                                            rowItem?,
                                            columnItem?,
                                            rowNode?,
                                            cellNode?
                                        }
                                    </code></pre>
                </td>
                <td>
                  <div>
                    示例 <a
                      href="#/touch"
                      target="_blank"
                    >Touch</a>
                  </div>
                </td>
              </tr>

              <tr>
                <td>
                  <section>
                    <a name="onScroll">onScroll</a>
                  </section>
                </td>
                <td>
                  <pre><code class="language-js">
                                        对象：{
                                            scrollLeft,
                                            scrollTop
                                        }
                                    </code></pre>
                </td>
                <td>
                  <div>
                    示例 <a
                      href="#/scroll"
                      target="_blank"
                    >Scroll</a>
                  </div>
                </td>
              </tr>

              <tr>
                <td>
                  <section>
                    <a name="onScrollStateChanged">onScrollStateChanged</a>
                  </section>
                </td>
                <td>
                  <pre><code class="language-js">
                                    对象：{
                                        hasHScroll,
                                        hasVScroll
                                    }
                                    </code></pre>
                </td>
                <td>
                  <div>
                    示例 <a
                      href="#/events"
                      target="_blank"
                    >Events</a>
                  </div>
                </td>
              </tr>

              <tr>
                <td>
                  <section>
                    <a name="onMouseWheel">onMouseWheel</a>
                  </section>
                </td>
                <td>
                  <pre><code class="language-js">
                                    对象：{
                                        e,
                                        deltaX,
                                        deltaY
                                    }
                                    </code></pre>
                </td>
                <td>
                  <div>
                    示例 <a
                      href="#/scroll"
                      target="_blank"
                    >Scroll</a>
                  </div>
                </td>
              </tr>

              <tr>
                <td>
                  <section>
                    <a name="onResize">onResize</a>
                  </section>
                </td>
                <td>
                  <pre><code class="language-js">
                                        对象：{
                                            previous: 对象,
                                            width: 数字,
                                            height: 数字
                                        }
                                    </code></pre>
                </td>
                <td>
                  <div>
                    示例 <a
                      href="#/resize"
                      target="_blank"
                    >Resize</a>
                  </div>
                </td>
              </tr>

              <tr>
                <td>
                  <section>
                    <a name="onLayout">onLayout</a>
                  </section>
                </td>
                <td>
                  <pre><code class="language-js">
                                        对象：{
                                            previous: 对象,
                                            headerWidth: 数字,
                                            headerHeight: 数字,
                                            bodyWidth: 数字,
                                            bodyHeight: 数字,
                                            scrollbarWidth: 数字,
                                            scrollbarHeight: 数字
                                        }
                                    </code></pre>
                </td>
                <td>
                  <div>
                    示例 <a
                      href="#/resize"
                      target="_blank"
                    >Resize</a>
                  </div>
                </td>
              </tr>

              <tr>
                <td>
                  <section>
                    <a name="onKeyDown">onKeyDown</a>
                  </section>
                </td>
                <td>
                  <pre><code class="language-js">
                                        对象：{
                                            e
                                        }
                                    </code></pre>
                </td>
                <td>
                  <div>
                    示例 <a
                      href="#/events"
                      target="_blank"
                    >Events</a>
                  </div>
                </td>
              </tr>


              <tr>
                <td>
                  <section>
                    <a name="onDestroy">onDestroy</a>
                  </section>
                </td>
                <td>无</td>
                <td>
                  <div>
                    示例 <a
                      href="#/flush"
                      target="_blank"
                    >Flush</a>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      </details>

      <details
        open
        class="lifecycle"
      >
        <summary>
          <a name="lifecycle">生命周期</a>
        </summary>

        <section>
          <table class="api-table">
            <thead>
              <tr>
                <th>阶段</th>
                <th colspan="2">
                  子阶段
                </th>
                <th>负载</th>
                <th>可用能力</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>创建</td>
                <td colspan="2">
                  <div>在容器内创建样式和 DOM 结构。</div>
                  <div>应用初始数据。</div>
                  <div>应用初始配置。</div>
                  <div>注册初始格式化器。</div>
                  <div>绑定初始事件处理函数。</div>
                </td>
                <td>低</td>
                <td>加载相关 API</td>
                <td>
                  <pre><code class="language-js">
                                        const grid = new Grid(container);
                                        grid.setData(data);
                                        grid.setOption(options);
                                        grid.setFormatter(formatters);
                                        grid.bind("[事件类型]", handler);
                                    </code></pre>
                </td>
              </tr>
              <tr>
                <td rowspan="4">
                  渲染
                </td>
                <td colspan="2">
                  初始化配置
                </td>
                <td>低</td>
                <td rowspan="5">
                  全部 API
                </td>
                <td rowspan="4">
                  <pre><code class="language-js">
                                        grid.render();
                                        grid.rerender();
                                    </code></pre>
                </td>
              </tr>
              <tr>
                <td colspan="2">
                  渲染表头
                </td>
                <td>中</td>
              </tr>
              <tr>
                <td rowspan="2">
                  渲染主体
                </td>
                <td>渲染行</td>
                <td>中</td>
              </tr>
              <tr>
                <td>渲染单元格</td>
                <td>高</td>
              </tr>

              <tr>
                <td>更新</td>
                <td colspan="2">
                  <div>更新表格主体。</div>
                  <div>更新一行或多行。</div>
                  <div>更新一个或多个单元格。</div>
                </td>
                <td />
                <td>
                  <pre><code class="language-js">
                                        grid.update();
                                        grid.updateRow(rowIndex, rowData);
                                        grid.updateCell(rowIndex, columnIndex, cellValue);
                                    </code></pre>
                </td>
              </tr>

              <tr>
                <td>销毁</td>
                <td colspan="2">
                  移除全部内容
                </td>
                <td>低</td>
                <td>无</td>
                <td>
                  <pre><code class="language-js">
                                        grid.destroy();
                                    </code></pre>
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      </details>

      <details
        open
        class="tg"
      >
        <summary>
          <a name="tg">tg</a>
        </summary>

        <section>
          <div>“tg” 是 Grid 的前缀和内部命名空间。</div>
          <div>常见 CSS 类名：</div>
          <pre><code class="language-css">
                            .tg-pane {}
                            .tg-body{}
                            .tg-row{}
                            .tg-cell{}
                        </code></pre>
          <div>常见私有属性：</div>
          <pre><code class="language-js">
                            //rowItem.tg_index
                            //rowItem.tg_level
                            //rowItem.tg_group
                        </code></pre>
          <div>
            调用 <a href="#/api-doc-zh?position=exportData">exportData()</a> 或 <a href="#/api-doc-zh?position=getItemSnapshot">getItemSnapshot()</a>
            时，这些私有属性会被移除。
          </div>
        </section>

        <section>
          <div><b>行项目私有属性 (rowItem.tg_*)</b></div>
          <table class="api-table api-table-zebra">
            <thead>
              <tr>
                <th>属性</th>
                <th>类型</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>tg_index</td>
                <td>Number</td>
                <td>行在完整数据树中的全局索引（包含不可见行）。</td>
              </tr>
              <tr>
                <td>tg_view_index</td>
                <td>Number</td>
                <td>行在可见列表中的索引。仅对可见行设置。</td>
              </tr>
              <tr>
                <td>tg_sub_index</td>
                <td>Number</td>
                <td>在父节点 subs 数组中的索引（包含不可见行）。</td>
              </tr>
              <tr>
                <td>tg_list_index</td>
                <td>Number</td>
                <td>在同一父节点的可见子列表中的索引。</td>
              </tr>
              <tr>
                <td>tg_parent</td>
                <td>Object | undefined</td>
                <td>指向父行的引用。根级行为 undefined。</td>
              </tr>
              <tr>
                <td>tg_level</td>
                <td>Number</td>
                <td>在树形层级中的嵌套深度。根级行为 0。</td>
              </tr>
              <tr>
                <td>tg_group</td>
                <td>Boolean</td>
                <td>如果行拥有 subs 数组（即分组/父节点），则为 true。</td>
              </tr>
              <tr>
                <td>tg_subs_length</td>
                <td>Number</td>
                <td>行的 subs 数组中直接子节点的数量。</td>
              </tr>
              <tr>
                <td>tg_frozen</td>
                <td>Boolean</td>
                <td>如果行处于冻结区域，则为 true。</td>
              </tr>
              <tr>
                <td>tg_invisible</td>
                <td>Boolean</td>
                <td>如果行通过 hideRow() 或 invisible 属性被隐藏，则为 true。</td>
              </tr>
              <tr>
                <td>tg_filtered</td>
                <td>Boolean</td>
                <td>如果行被 <a href="#/api-doc-zh?position=options.rowFilter">rowFilter</a> 函数过滤隐藏，则为 true。</td>
              </tr>
              <tr>
                <td>tg_row_number</td>
                <td>String | Number</td>
                <td>显示用行号（不适用时为空字符串）。</td>
              </tr>
              <tr>
                <td>tg_selected_index</td>
                <td>Number</td>
                <td>行被选中的顺序索引。</td>
              </tr>
              <tr>
                <td>tg_top</td>
                <td>Number</td>
                <td>行渲染时的顶部偏移位置（像素）。</td>
              </tr>
              <tr>
                <td>tg_height</td>
                <td>Number</td>
                <td>行的实际渲染高度（像素）。</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <div><b>列项目私有属性 (columnItem.tg_*)</b></div>
          <table class="api-table api-table-zebra">
            <thead>
              <tr>
                <th>属性</th>
                <th>类型</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>tg_index</td>
                <td>Number</td>
                <td>列在完整列树中的全局索引。</td>
              </tr>
              <tr>
                <td>tg_view_index</td>
                <td>Number</td>
                <td>列在可见列表中的索引。仅对可见列设置。</td>
              </tr>
              <tr>
                <td>tg_sub_index</td>
                <td>Number</td>
                <td>在父分组的 subs 数组中的索引。</td>
              </tr>
              <tr>
                <td>tg_list_index</td>
                <td>Number</td>
                <td>在同一父分组的可见子列表中的索引。</td>
              </tr>
              <tr>
                <td>tg_parent</td>
                <td>Object | undefined</td>
                <td>指向父列分组的引用。顶级列为 undefined。</td>
              </tr>
              <tr>
                <td>tg_group</td>
                <td>Boolean</td>
                <td>如果列拥有 subs 数组（即表头分组），则为 true。</td>
              </tr>
              <tr>
                <td>tg_subs_length</td>
                <td>Number</td>
                <td>分组中直接子列的数量。</td>
              </tr>
              <tr>
                <td>tg_frozen</td>
                <td>Boolean</td>
                <td>如果列处于冻结区域，则为 true。</td>
              </tr>
              <tr>
                <td>tg_invisible</td>
                <td>Boolean</td>
                <td>如果列通过 <a href="#/api-doc-zh?position=hideColumn">hideColumn()</a> 或 invisible 属性被隐藏，则为 true。</td>
              </tr>
              <tr>
                <td>tg_width</td>
                <td>Number</td>
                <td>列的实际渲染宽度（像素）。</td>
              </tr>
              <tr>
                <td>tg_left</td>
                <td>Number</td>
                <td>列的左侧偏移位置（像素）。</td>
              </tr>
              <tr>
                <td>tg_height</td>
                <td>Number</td>
                <td>列表头单元格的高度（像素）。</td>
              </tr>
              <tr>
                <td>tg_layer</td>
                <td>Number</td>
                <td>表头布局的反向层级索引（0 = 最底层）。用于分组表头。</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <div>使用示例：</div>
          <pre><code class="language-js">
                            grid.setFormatter({
                                string: function(value, rowItem, columnItem, cellNode) {
                                    // 访问行项目私有属性
                                    const rowIndex = rowItem.tg_index;
                                    const level = rowItem.tg_level;
                                    const isFrozen = rowItem.tg_frozen;
                                    const isGroup = rowItem.tg_group;

                                    // 访问列项目私有属性
                                    const columnIndex = columnItem.tg_index;
                                    const columnWidth = columnItem.tg_width;

                                    return value;
                                }
                            });

                            grid.setOption({
                                rowFilter: function(rowItem) {
                                    // 冻结行始终可见
                                    if (rowItem.tg_frozen) {
                                        return true;
                                    }
                                    return rowItem.name.includes(keywords);
                                }
                            });
                        </code></pre>
        </section>
      </details>
    </div>
  </div>
</template>

<script setup>
import '../assets/api-styles.scss';
import { onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { initApiPage, updateApiPage } from '../global.js';

const route = useRoute();

watch(() => route.query.position, () => {
    updateApiPage(route);
});

onMounted(() => {
    initApiPage(route);
});
</script>
