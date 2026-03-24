# TurboGrid

🌐 [English](README.md) | 简体中文

[![](https://img.shields.io/npm/v/turbogrid)](https://www.npmjs.com/package/turbogrid)
[![](https://badgen.net/npm/dw/turbogrid)](https://www.npmjs.com/package/turbogrid)
![](https://img.shields.io/librariesio/github/cenfun/turbogrid)
![](https://img.shields.io/github/license/cenfun/turbogrid)

TurboGrid 是一个高性能的 JavaScript 数据表格库，专注于大数据量渲染、丰富交互和高度可定制能力。

它支持虚拟渲染、冻结窗格、行列操作、排序/过滤、拖拽、事件与生命周期钩子、导出，以及深度样式与行为定制。

## 为什么选择 TurboGrid

- 面向大数据集的高性能：支持虚拟视口、行列缓存和懒加载模式。
- 内置丰富交互：支持排序、过滤、选择、拖拽、展开/折叠、尺寸调整、滚动联动。
- 高度可定制：支持 formatter 体系、column types、row/column props、自定义排序比较器、主题和类名钩子。
- 完整的事件和生命周期模型：覆盖渲染/更新、鼠标/触摸/键盘、滚动、销毁等阶段。
- 对框架友好：既可原生 JavaScript 使用，也提供 Vue 集成示例。

## 安装

```bash
npm i turbogrid
```

### ESM / CJS

```js
// ESM
import TG from 'turbogrid';
import { Grid, Util } from 'turbogrid';

// CommonJS
const TG = require('turbogrid');
const { Grid, Util } = require('turbogrid');
```

### 浏览器引入

```html
<script src="dist/turbogrid.js"></script>
<script>
	console.log(window.turbogrid);
</script>
```

## 快速开始

### 1）准备容器

```html
<div id="grid" style="height: 280px;"></div>
```

### 2）创建 Grid 实例

```js
import { Grid } from 'turbogrid';

const container = document.querySelector('#grid');
const grid = new Grid(container);

grid.setOption({
	sortField: 'name'
});

grid.setData({
	columns: [
		{ id: 'name', name: 'Name' },
		{ id: 'value', name: 'Value' }
	],
	rows: [
		{ id: 1, name: 'Row 1', value: 100 },
		{ id: 2, name: 'Row 2', value: 200 },
		{ id: 3, name: 'Row 3', value: 300 }
	]
});

grid.render();
```

## API 概览

完整且持续更新的 API 列表请查看：

[https://cenfun.github.io/turbogrid/api.html](https://cenfun.github.io/turbogrid/api.html)

API 页面包含以下内容：

- Methods
- Data 结构
- Options
- Events
- Lifecycle 与命名空间工具

## Demo 导航

在线文档首页：[https://cenfun.github.io/turbogrid/](https://cenfun.github.io/turbogrid/)

### 基础与性能

- [async](https://cenfun.github.io/turbogrid/async.html)
- [auto-height](https://cenfun.github.io/turbogrid/auto-height.html)
- [cache](https://cenfun.github.io/turbogrid/cache.html)
- [loading](https://cenfun.github.io/turbogrid/loading.html)
- [lifecycle](https://cenfun.github.io/turbogrid/lifecycle.html)
- [multiple-instance](https://cenfun.github.io/turbogrid/multiple-instance.html)
- [online-render](https://cenfun.github.io/turbogrid/online-render.html)
- [performance-test](https://cenfun.github.io/turbogrid/performance-test.html)
- [resize](https://cenfun.github.io/turbogrid/resize.html)
- [scroll](https://cenfun.github.io/turbogrid/scroll.html)
- [scrollbar](https://cenfun.github.io/turbogrid/scrollbar.html)
- [touch](https://cenfun.github.io/turbogrid/touch.html)

### 行与数据操作

- [load-rows](https://cenfun.github.io/turbogrid/load-rows.html)
- [load-subs](https://cenfun.github.io/turbogrid/load-subs.html)
- [set-rows](https://cenfun.github.io/turbogrid/set-rows.html)
- [row-add-delete](https://cenfun.github.io/turbogrid/row-add-delete.html)
- [row-collapse](https://cenfun.github.io/turbogrid/row-collapse.html)
- [row-drag](https://cenfun.github.io/turbogrid/row-drag.html)
- [row-filter](https://cenfun.github.io/turbogrid/row-filter.html)
- [row-height](https://cenfun.github.io/turbogrid/row-height.html)
- [row-hover](https://cenfun.github.io/turbogrid/row-hover.html)
- [row-move](https://cenfun.github.io/turbogrid/row-move.html)
- [row-not-found](https://cenfun.github.io/turbogrid/row-not-found.html)
- [row-number](https://cenfun.github.io/turbogrid/row-number.html)
- [row-select](https://cenfun.github.io/turbogrid/row-select.html)
- [row-select-group](https://cenfun.github.io/turbogrid/row-select-group.html)
- [row-select-limit](https://cenfun.github.io/turbogrid/row-select-limit.html)
- [pagination](https://cenfun.github.io/turbogrid/pagination.html)
- [infinite-scroll](https://cenfun.github.io/turbogrid/infinite-scroll.html)

### 列、表头与冻结

- [column-add-delete](https://cenfun.github.io/turbogrid/column-add-delete.html)
- [column-display](https://cenfun.github.io/turbogrid/column-display.html)
- [column-set](https://cenfun.github.io/turbogrid/column-set.html)
- [header-display](https://cenfun.github.io/turbogrid/header-display.html)
- [header-group](https://cenfun.github.io/turbogrid/header-group.html)
- [frozen](https://cenfun.github.io/turbogrid/frozen.html)
- [frozen-middle](https://cenfun.github.io/turbogrid/frozen-middle.html)

### 渲染、样式与 UI 扩展

- [formatter](https://cenfun.github.io/turbogrid/formatter.html)
- [load-cells](https://cenfun.github.io/turbogrid/load-cells.html)
- [negative-number](https://cenfun.github.io/turbogrid/negative-number.html)
- [skeleton-screen](https://cenfun.github.io/turbogrid/skeleton-screen.html)
- [style](https://cenfun.github.io/turbogrid/style.html)
- [tooltip](https://cenfun.github.io/turbogrid/tooltip.html)
- [popover](https://cenfun.github.io/turbogrid/popover.html)
- [context-menu](https://cenfun.github.io/turbogrid/context-menu.html)
- [custom-element](https://cenfun.github.io/turbogrid/custom-element.html)

### 排序、导出与高级场景

- [sort](https://cenfun.github.io/turbogrid/sort.html)
- [export](https://cenfun.github.io/turbogrid/export.html)
- [events](https://cenfun.github.io/turbogrid/events.html)
- [comfyui](https://cenfun.github.io/turbogrid/comfyui.html)
- [poc](https://cenfun.github.io/turbogrid/poc.html)
- [snake-game](https://cenfun.github.io/turbogrid/snake-game.html)
- [conflict](https://cenfun.github.io/turbogrid/conflict.html)
- [other](https://cenfun.github.io/turbogrid/other.html)

### 框架集成

- [vue-integration](https://cenfun.github.io/turbogrid/vue-integration.html)
- [vue-component](https://cenfun.github.io/turbogrid/vue-component.html)
- [vue-editor](https://cenfun.github.io/turbogrid/vue-editor.html)
- React：支持基于容器的集成方式，可参考下方 React 说明

## 移动端 / 触摸支持

TurboGrid 内置移动端支持，无需额外适配层即可运行在触摸设备上。

### 支持的移动端能力

- 触摸交互事件：`onTouchStart`、`onTouchMove`、`onTouchEnd`
- 通过 `scrollbarType` 支持更友好的触摸滚动条模式
- 在移动设备上平滑滚动并支持大数据量渲染
- 触屏下同样支持冻结行和冻结列
- 可结合 `autoHeight` 和 `resize()` 做移动端尺寸适配

### 推荐的触摸配置

```js
const grid = new Grid(container);

grid.setOption({
	frozenColumn: 0,
	frozenRow: 0,
	scrollbarType: 'auto',
	scrollbarSize: 10,
	autoHeight: false
});

grid.bind('onTouchStart', function(e, d) {
	console.log('touch start', d.rowItem, d.columnItem);
});

grid.bind('onTouchMove', function(e, d) {
	console.log('touch move', d.rowItem, d.columnItem);
});

grid.bind('onTouchEnd', function(e, d) {
	console.log('touch end', d.rowItem, d.columnItem);
});
```

### 移动端使用说明

- `scrollbarType: 'auto'` 会在触摸设备上自动切换到对应行为。
- 如果你需要更强的移动端交互风格，可以显式指定更偏触摸场景的 `scrollbarType`。
- 触摸事件可以和 `onClick`、`onMouseWheel` 以及冻结窗格选项结合使用，兼容混合设备场景。
- 如果页面在 grid 的上下方还有长内容，可参考 touch demo 来判断是否需要在 `onTouchStart` 中调用 `preventDefault()`。

Touch demo: [touch](https://cenfun.github.io/turbogrid/touch.html)

## Vue / React 集成

TurboGrid 很适合在框架应用中集成，因为它的核心使用模型非常简单：传入容器创建实例，更新 data/options，然后在需要时调用 render 或 resize。

### Vue 集成

当前仓库已经提供了多种 Vue 集成示例，展示了以下模式：

- Vue integration：将 grid 事件和选中状态与 Vue 响应式数据同步
- Vue component：通过自定义 formatter 在单元格内挂载 Vue 组件
- Vue editor：基于 Vue 组件构建可编辑单元格和编辑逻辑

### Vue 典型用法

```js
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { Grid } from 'turbogrid';

const containerRef = ref();
let grid;

onMounted(() => {
	grid = new Grid(containerRef.value);
	grid.setOption({
		bindWindowResize: true
	});
	grid.setData({
		columns: [
			{ id: 'name', name: 'Name' },
			{ id: 'value', name: 'Value' }
		],
		rows: [
			{ name: 'Row 1', value: 1 },
			{ name: 'Row 2', value: 2 }
		]
	});
	grid.render();
});

onBeforeUnmount(() => {
	if (grid) {
		grid.destroy();
		grid = null;
	}
});
```

### React 集成

当前仓库没有单独提供 React demo 页面，但 TurboGrid 本身是基于容器的、与框架无关的，因此可以很自然地接入 React。

### React 典型用法

```jsx
import { useEffect, useRef } from 'react';
import { Grid } from 'turbogrid';

export function GridView() {
	const containerRef = useRef(null);
	const gridRef = useRef(null);

	useEffect(() => {
		const grid = new Grid(containerRef.current);
		gridRef.current = grid;

		grid.setOption({
			bindWindowResize: true
		});

		grid.setData({
			columns: [
				{ id: 'name', name: 'Name' },
				{ id: 'value', name: 'Value' }
			],
			rows: [
				{ name: 'Row 1', value: 1 },
				{ name: 'Row 2', value: 2 }
			]
		});

		grid.render();

		return () => {
			grid.destroy();
			gridRef.current = null;
		};
	}, []);

	return <div ref={containerRef} style={{ height: 280 }} />;
}
```

### 框架集成优势

- 任意框架下都可以复用同样的 `setData`、`setOption`、`render`、`resize`、`destroy` 流程
- 可以把 TurboGrid 事件与框架状态管理结合起来
- 可以通过 formatter 渲染机制在单元格中挂载自定义框架组件
- 可以围绕 grid 实例构建自定义编辑器、工具栏和侧边面板

### 原生 JavaScript 与其他框架集成

TurboGrid 基于原生 JavaScript 实现，因此并不局限于 Vue 或 React。只要第三方框架能够提供 DOM 容器，并且具备组件挂载/卸载生命周期，通常都可以采用同样的方式进行集成。

- Angular
- Lit
- Svelte
- SolidJS
- Alpine.js

## 自定义能力

TurboGrid 的设计目标之一就是深度可定制。你可以在视觉样式、行为逻辑、数据处理和交互流程等多个层面扩展它。

### 1）Formatter 与单元格渲染

- 可以通过 `setFormatter` 全局设置或按列设置 formatter。
- 可以使用内置 formatter，也可以直接定义自定义 formatter 函数。
- 可以构建 badge、进度条、链接、操作按钮等丰富单元格 UI。

### 2）列类型与属性体系

- 可以通过 `columnTypes` 配置可复用列类型，并通过 `type` 快速映射。
- 可以结合 `columnProps` 和单列属性进行覆盖。
- 可以精细控制每列的宽度、对齐、可排序、可导出等行为。

### 3）行行为与数据规则

- 可以通过 `rowProps` 定制行对象能力。
- 可以使用 `rowFilter` 实现自定义过滤逻辑，结合 `rowFilteredSort` 实现模糊搜索式排序。
- 可以通过 `setRowSubs`、展开/折叠、跨层级移动/拖拽选项管理树形数据。

### 4）事件驱动扩展

- 可以挂接丰富事件，如 `onClick`、`onSort`、`onRowDropped`、`onScroll`、`onKeyDown`、`onDestroy` 等。
- 适合围绕选择、编辑、右键菜单、服务端同步等场景构建自定义工作流。

### 5）主题与交互细节

- 可以通过 `theme`、`className` 和样式钩子定制整体视觉效果。
- 可以细调滚动条、滚动窗格、冻结行为、行 hover/选择行为。
- 可以通过 `bindWindowResize`、`bindContainerResize` 和 `cellResizeObserver` 控制自动尺寸更新策略。

## 项目链接

- Documentation: [https://cenfun.github.io/turbogrid/](https://cenfun.github.io/turbogrid/)
- API: [https://cenfun.github.io/turbogrid/api.html](https://cenfun.github.io/turbogrid/api.html)
- NPM: [https://www.npmjs.com/package/turbogrid](https://www.npmjs.com/package/turbogrid)

## Related Grid

- [console-grid](https://github.com/cenfun/console-grid)
- [markdown-grid](https://github.com/cenfun/markdown-grid)