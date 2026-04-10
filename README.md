# TurboGrid

🌐 English | [简体中文](README.zh-Hans.md)

[![](https://img.shields.io/npm/v/turbogrid)](https://www.npmjs.com/package/turbogrid)
[![](https://badgen.net/npm/dw/turbogrid)](https://www.npmjs.com/package/turbogrid)
![](https://img.shields.io/librariesio/github/cenfun/turbogrid)
![](https://img.shields.io/github/license/cenfun/turbogrid)

TurboGrid is a high-performance JavaScript data grid library with zero dependencies, focused on large-data rendering, rich interactions, and deep customizability.

## Features

- **High Performance** — Virtual rendering handles millions of rows and columns smoothly; row/column caching and lazy loading patterns
- **Zero Dependencies** — Pure JavaScript, no external runtime dependencies
- **Tree Data** — Hierarchical rows with expand/collapse, multi-level nesting, and lazy-loading child rows (`setRowSubs`)
- **Frozen Panes** — Freeze rows and columns at any edge (top/bottom/left/right) with configurable limits
- **Row Operations** — Selection (single/multiple), drag & drop reordering, move, add/delete, row numbering
- **Sorting & Filtering** — Built-in type-aware sorting (string/number/date/boolean), custom comparers, row filtering with keyword highlighting
- **Rich Cell Rendering** — Formatter system for custom cell content — badges, progress bars, icons, checkboxes, or framework components
- **Data Export** — Export grid data with configurable column/row inclusion and private field stripping
- **Comprehensive API** — 100+ methods, 50+ configuration options, and 36 event types covering the full lifecycle
- **Touch & Mobile** — Built-in touch scrolling, gesture support, and mobile-friendly scrollbar modes
- **Themes** — Built-in themes (default, lightblue, dark) with deep CSS customization via `className`, `classMap`, and `styleMap`
- **Framework-Agnostic** — Works with vanilla JS, Vue, React, Angular, Svelte, or any framework that provides a DOM container

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

TurboGrid provides 100+ public methods, 50+ configuration options, and 36 event types. For the complete and always up-to-date API reference:

[https://cenfun.github.io/turbogrid/api.html](https://cenfun.github.io/turbogrid/api.html)

The API covers:

- **Methods** — Data management, row/column CRUD, scrolling & navigation, rendering, selection, tree operations, export
- **Options** — Display, selection, sorting, frozen panes, scrollbar, performance tuning, theming
- **Events** — Lifecycle (`onUpdated`, `onDestroy`), interaction (`onClick`, `onSort`, `onKeyDown`), scroll, selection, drag & drop
- **Data Structures** — Column items, row items, and internal properties (`tg_*` namespace)

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
- React: container-based integration (see [Vue / React Integration](#vue--react-integration) below)

## Mobile / Touch Support

TurboGrid has built-in mobile support — no extra adapters needed.

- Touch interaction events: `onTouchStart`, `onTouchMove`, `onTouchEnd`
- Touch-friendly scrollbar mode via `scrollbarType: 'auto'`
- Smooth scrolling and large-data rendering on mobile devices
- Frozen rows/columns work on touch screens
- Combine touch events with `onClick`, `onMouseWheel`, and frozen pane options for hybrid devices

See the live demo for configuration examples: [touch](https://cenfun.github.io/turbogrid/touch.html)

## Vue / React Integration

TurboGrid is framework-agnostic — create a grid with a container, update data/options, and call `render()`. It works the same way in any framework.

### Vue

This repository includes Vue demos: [vue-integration](https://cenfun.github.io/turbogrid/vue-integration.html), [vue-component](https://cenfun.github.io/turbogrid/vue-component.html), [vue-editor](https://cenfun.github.io/turbogrid/vue-editor.html).

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

### Other Frameworks

TurboGrid is pure JavaScript — any framework with DOM access and mount/unmount lifecycle works: Angular, Svelte, SolidJS, Lit, Alpine.js, etc. Use the same `setData` → `setOption` → `render` → `destroy` pattern.

## Customization

TurboGrid is designed for deep customization at every level:

- **Cell Rendering** — `setFormatter` for global or per-column custom cell content (HTML, components, badges, icons); built-in formatters for string, number, date, boolean, tree, checkbox
- **Column Types** — Reusable `columnTypes` with per-column overrides for width, alignment, sortability, exportability
- **Row Behavior** — Custom `rowProps`, `rowFilter` for filtering, `rowFilteredSort` for ranked results, tree operations with cross-level drag/move
- **Events** — 36 hookable events for clicks, sorting, dragging, scrolling, keyboard, selection, and lifecycle
- **Theming** — `theme`, `className`, `classMap`, and `styleMap` at grid, row, and cell level; configurable scrollbar, frozen pane, and hover behavior

## Project Links

- Documentation: [https://cenfun.github.io/turbogrid/](https://cenfun.github.io/turbogrid/)
- API: [https://cenfun.github.io/turbogrid/api.html](https://cenfun.github.io/turbogrid/api.html)
- NPM: [https://www.npmjs.com/package/turbogrid](https://www.npmjs.com/package/turbogrid)

## Related Projects

- [console-grid](https://github.com/cenfun/console-grid)
- [markdown-grid](https://github.com/cenfun/markdown-grid)