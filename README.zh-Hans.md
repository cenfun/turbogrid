![TurboGrid](public/assets/images/logo.svg)

# TurboGrid

🌐 [English](README.md) | 简体中文

[![](https://img.shields.io/npm/v/turbogrid)](https://www.npmjs.com/package/turbogrid)
[![](https://badgen.net/npm/dw/turbogrid)](https://www.npmjs.com/package/turbogrid)
![](https://img.shields.io/librariesio/github/cenfun/turbogrid)
![](https://img.shields.io/github/license/cenfun/turbogrid)

TurboGrid 是一个零依赖、高性能的 JavaScript 数据表格库，专注于大数据量渲染、丰富交互和深度可定制能力。

## 特性

- **高性能** — 虚拟渲染可流畅处理百万级行列数据；支持行列缓存和懒加载模式
- **零依赖** — 纯 JavaScript 实现，无任何外部运行时依赖
- **树形数据** — 支持多级嵌套的层级行，展开/折叠，子行懒加载（`setRowSubs`）
- **冻结窗格** — 行列可冻结在任意边缘（上/下/左/右），支持配置冻结数量上限
- **行操作** — 单选/多选、拖拽排序、移动、增删、行号显示
- **排序与过滤** — 内置类型感知排序（string/number/date/boolean），自定义比较器，行过滤并支持关键字高亮
- **丰富的单元格渲染** — formatter 体系支持自定义单元格内容：badge、进度条、图标、复选框、框架组件等
- **数据导出** — 可配置列/行包含规则和私有字段剥离的数据导出
- **全面的 API** — 100+ 方法、50+ 项配置、36 种事件类型，覆盖完整生命周期
- **触摸与移动端** — 内置触摸滚动、手势支持和移动端友好的滚动条模式
- **主题** — 内置主题（default、lightblue、dark），支持通过 `className`、`classMap`、`styleMap` 深度定制样式
- **框架无关** — 支持原生 JS、Vue、React、Angular、Svelte 或任何能提供 DOM 容器的框架

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

TurboGrid 提供 100+ 公开方法、50+ 项配置和 36 种事件类型。完整且持续更新的 API 参考：

[https://cenfun.github.io/turbogrid/api-zh.html](https://cenfun.github.io/turbogrid/api-zh.html)

API 涵盖：

- **方法** — 数据管理、行列增删查改、滚动导航、渲染、选择、树操作、导出
- **配置项** — 显示、选择、排序、冻结窗格、滚动条、性能调优、主题
- **事件** — 生命周期（`onUpdated`、`onDestroy`）、交互（`onClick`、`onSort`、`onKeyDown`）、滚动、选择、拖拽
- **数据结构** — 列项、行项及内部属性（`tg_*` 命名空间）

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
- [custom-element](https://cenfun.github.io/turbogrid/custom-element.html)
- React：支持基于容器的集成方式（参见下方 [Vue / React 集成](#vue--react-集成)）

## 移动端 / 触摸支持

TurboGrid 内置移动端支持，无需额外适配层。

- 触摸交互事件：`onTouchStart`、`onTouchMove`、`onTouchEnd`
- 通过 `scrollbarType: 'auto'` 支持触摸友好的滚动条模式
- 在移动设备上平滑滚动并支持大数据量渲染
- 触屏下同样支持冻结行列
- 触摸事件可与 `onClick`、`onMouseWheel` 及冻结窗格选项组合使用，兼容混合设备

查看在线示例了解配置方式：[touch](https://cenfun.github.io/turbogrid/touch.html)

## Vue / React 集成

TurboGrid 与框架无关 — 传入容器创建实例，更新 data/options，调用 `render()` 即可。在任何框架中使用方式一致。

### Vue

仓库已提供 Vue 示例：[vue-integration](https://cenfun.github.io/turbogrid/vue-integration.html)、[vue-component](https://cenfun.github.io/turbogrid/vue-component.html)、[vue-editor](https://cenfun.github.io/turbogrid/vue-editor.html)。

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

### React

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

### 其他框架

TurboGrid 基于纯 JavaScript 实现 — 任何能访问 DOM 且具备挂载/卸载生命周期的框架均可使用：Angular、Svelte、SolidJS、Lit、Alpine.js 等。统一使用 `setData` → `setOption` → `render` → `destroy` 模式。

## 自定义能力

TurboGrid 支持各层级的深度定制：

- **单元格渲染** — `setFormatter` 全局或按列自定义单元格内容（HTML、组件、badge、图标）；内置 string、number、date、boolean、tree、checkbox 等 formatter
- **列类型** — 通过 `columnTypes` 配置可复用列类型，支持按列覆盖宽度、对齐、可排序、可导出等属性
- **行行为** — 自定义 `rowProps`，`rowFilter` 过滤，`rowFilteredSort` 排名，支持跨层级拖拽/移动的树操作
- **事件** — 36 种可挂接事件，覆盖点击、排序、拖拽、滚动、键盘、选择和生命周期
- **主题** — 支持在 grid、行、单元格级别使用 `theme`、`className`、`classMap`、`styleMap`；可配置滚动条、冻结窗格和 hover 行为

## 项目链接

- 文档：[https://cenfun.github.io/turbogrid/](https://cenfun.github.io/turbogrid/)
- API: [https://cenfun.github.io/turbogrid/api-zh.html](https://cenfun.github.io/turbogrid/api-zh.html)
- NPM: [https://www.npmjs.com/package/turbogrid](https://www.npmjs.com/package/turbogrid)

## 相关项目

- [console-grid](https://github.com/cenfun/console-grid)
- [markdown-grid](https://github.com/cenfun/markdown-grid)