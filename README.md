# TurboGrid

🌐 English | [简体中文](README.zh-Hans.md)

[![](https://img.shields.io/npm/v/turbogrid)](https://www.npmjs.com/package/turbogrid)
[![](https://badgen.net/npm/dw/turbogrid)](https://www.npmjs.com/package/turbogrid)
![](https://img.shields.io/librariesio/github/cenfun/turbogrid)
![](https://img.shields.io/github/license/cenfun/turbogrid)

TurboGrid is a high-performance JavaScript data grid library focused on large-data rendering, rich interactions, and strong customizability.

It supports virtual rendering, frozen panes, row/column operations, sorting/filtering, drag and drop, events and lifecycle hooks, export, and deep style/behavior customization.

## Why TurboGrid

- High performance for large datasets: virtual viewport, row/column cache, lazy loading patterns.
- Rich built-in interactions: sort, filter, select, drag, collapse/expand, resize, scroll sync.
- High customizability: formatter system, column types, row/column props, custom sort comparers, theme/class hooks.
- Strong event and lifecycle model: full event map from render/update to mouse/touch/keyboard/scroll/destroy.
- Framework-friendly: native JS usage plus Vue integration demos.

## Install

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

### Browser

```html
<script src="dist/turbogrid.js"></script>
<script>
	console.log(window.turbogrid);
</script>
```

## Quick Start

### 1) Prepare container

```html
<div id="grid" style="height: 280px;"></div>
```

### 2) Create grid instance

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

## API Overview

For the complete and always up-to-date API list, please see:

[https://cenfun.github.io/turbogrid/api.html](https://cenfun.github.io/turbogrid/api.html)

The API page includes full details for:

- Methods
- Data structure
- Options
- Events
- Lifecycle and namespace utilities

## Demo Map

Online docs home: [https://cenfun.github.io/turbogrid/](https://cenfun.github.io/turbogrid/)

### Basics and Performance

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

### Rows and Data Operations

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

### Columns, Header, Frozen

- [column-add-delete](https://cenfun.github.io/turbogrid/column-add-delete.html)
- [column-display](https://cenfun.github.io/turbogrid/column-display.html)
- [column-set](https://cenfun.github.io/turbogrid/column-set.html)
- [header-display](https://cenfun.github.io/turbogrid/header-display.html)
- [header-group](https://cenfun.github.io/turbogrid/header-group.html)
- [frozen](https://cenfun.github.io/turbogrid/frozen.html)
- [frozen-middle](https://cenfun.github.io/turbogrid/frozen-middle.html)

### Render, Style, UI Extension

- [formatter](https://cenfun.github.io/turbogrid/formatter.html)
- [load-cells](https://cenfun.github.io/turbogrid/load-cells.html)
- [negative-number](https://cenfun.github.io/turbogrid/negative-number.html)
- [skeleton-screen](https://cenfun.github.io/turbogrid/skeleton-screen.html)
- [style](https://cenfun.github.io/turbogrid/style.html)
- [tooltip](https://cenfun.github.io/turbogrid/tooltip.html)
- [popover](https://cenfun.github.io/turbogrid/popover.html)
- [context-menu](https://cenfun.github.io/turbogrid/context-menu.html)

### Sort, Export and Advanced Cases

- [sort](https://cenfun.github.io/turbogrid/sort.html)
- [export](https://cenfun.github.io/turbogrid/export.html)
- [events](https://cenfun.github.io/turbogrid/events.html)
- [comfyui](https://cenfun.github.io/turbogrid/comfyui.html)
- [poc](https://cenfun.github.io/turbogrid/poc.html)
- [snake-game](https://cenfun.github.io/turbogrid/snake-game.html)
- [conflict](https://cenfun.github.io/turbogrid/conflict.html)
- [other](https://cenfun.github.io/turbogrid/other.html)

### Framework Integration

- [vue-integration](https://cenfun.github.io/turbogrid/vue-integration.html)
- [vue-component](https://cenfun.github.io/turbogrid/vue-component.html)
- [vue-editor](https://cenfun.github.io/turbogrid/vue-editor.html)
- [custom-element](https://cenfun.github.io/turbogrid/custom-element.html)
- React: container-based integration pattern is supported (see the React section below)

## Mobile / Touch Support

TurboGrid has built-in mobile support and can be used on touch devices without extra adapters.

### Supported Mobile Capabilities

- Touch interaction events: `onTouchStart`, `onTouchMove`, `onTouchEnd`
- Touch-friendly scrollbar mode via `scrollbarType`
- Smooth scrolling and large-data rendering on mobile devices
- Frozen row and frozen column support on touch screens
- Mobile-friendly resize handling with `autoHeight` and `resize()`

### Recommended Touch Configuration

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

### Notes for Mobile Usage

- `scrollbarType: 'auto'` will automatically switch behavior for touch devices.
- If you need a stronger mobile style, you can explicitly set `scrollbarType` to touch-oriented behavior.
- Touch events can be combined with `onClick`, `onMouseWheel`, and frozen pane options for hybrid device scenarios.
- For pages with long content above and below the grid, review the touch demo to decide whether you need `preventDefault()` handling in `onTouchStart`.

Touch demo: [touch](https://cenfun.github.io/turbogrid/touch.html)

## Vue / React Integration

TurboGrid works well with framework-based applications because the core usage model is simple: create a grid instance with a container, update data/options, then render or resize when needed.

### Vue Integration

This repository already includes Vue-based demos that show several integration patterns:

- Vue integration: sync grid events and selection state with Vue reactive data
- Vue component: mount Vue components inside grid cells through custom formatters
- Vue editor: build editable cells with Vue components and custom editor logic

### Typical Vue Usage

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

### React Integration

The repository does not currently provide a dedicated React demo page, but TurboGrid integrates cleanly with React because it is container-based and framework-agnostic.

### Typical React Usage

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

### Framework Integration Advantages

- Use the same `setData`, `setOption`, `render`, `resize`, and `destroy` flow in any framework
- Combine TurboGrid events with framework state management
- Mount custom framework components in cells through formatter-based rendering
- Build custom editors, toolbars, and side panels around the grid instance

### Native JavaScript and Other Frameworks

TurboGrid is implemented in native JavaScript, so it is not limited to Vue or React. As long as a framework can provide a DOM container and a lifecycle hook for mount/unmount, TurboGrid can usually be integrated in the same way.

- Angular
- Lit
- Svelte
- SolidJS
- Alpine.js

## Customization Power

TurboGrid is designed for deep customization. You can extend visual style, behavior, data logic, and interaction flows at multiple levels.

### 1) Formatter and Cell Rendering

- Set formatter globally or per-column with `setFormatter`.
- Use built-in formatters or custom formatter functions.
- Build rich UI cells like badges, progress bars, links, operations.

### 2) Column Types and Props

- Configure reusable `columnTypes` and map by `type`.
- Override with `columnProps` and per-column props.
- Control width/alignment/sortability/exportability per column.

### 3) Row Behavior and Data Rules

- Customize row shape with `rowProps`.
- Implement custom filtering via `rowFilter` and fuzzy-like ordering via `rowFilteredSort`.
- Manage tree data with `setRowSubs`, collapse/expand controls, and cross-level row move/drag options.

### 4) Event-driven Extension

- Hook rich events (`onClick`, `onSort`, `onRowDropped`, `onScroll`, `onKeyDown`, `onDestroy`, etc.).
- Build custom workflows around selection, editing, context menu, and server sync.

### 5) Theming and Interaction Details

- Set `theme`, `className`, and style hooks for custom look and feel.
- Tune scrollbar, scroll pane, frozen behavior, row hover/select behavior.
- Control resize policy with `bindWindowResize`, `bindContainerResize`, and `cellResizeObserver`.

## Project Links

- Documentation: [https://cenfun.github.io/turbogrid/](https://cenfun.github.io/turbogrid/)
- API: [https://cenfun.github.io/turbogrid/api.html](https://cenfun.github.io/turbogrid/api.html)
- NPM: [https://www.npmjs.com/package/turbogrid](https://www.npmjs.com/package/turbogrid)

## Related Grid

- [console-grid](https://github.com/cenfun/console-grid)
- [markdown-grid](https://github.com/cenfun/markdown-grid)