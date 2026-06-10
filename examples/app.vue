<template>
    <div id="app" class="app">
        <div class="header flex-row">
            <div class="icon icon-menu header-icon-menu" @click="toggleNav"></div>
            <router-link class="header-title" to="/">TurboGrid</router-link>
            <a class="header-version" href="https://github.com/cenfun/turbogrid" target="_blank">v{{ version }}</a>
            <div class="flex-auto"></div>
            <select class="st-theme" v-model="theme" @change="onThemeChange">
                <option v-for="t in themes" :key="t" :value="t">{{ t }}</option>
            </select>
            <a class="icon icon-github" href="https://github.com/cenfun/turbogrid" target="_blank"></a>
        </div>
        <div class="body flex-auto flex-row">
            <nav class="nav flex-column" :class="{ 'nav-opened': navOpen, 'nav-closing': navClosing }">
                <div class="header flex-row">
                    <router-link class="header-title" to="/" @click.native="closeNav">TurboGrid</router-link>
                    <div class="flex-auto"></div>
                    <div class="icon icon-close header-icon-close" @click="toggleNav"></div>
                </div>
                <div class="nav-grid flex-auto" ref="navGridEl"></div>
                <div class="nav-search">
                    <input class="nav-keywords" v-model="keywords" placeholder="Search Demo"
                        @focus="$event.target.select()" />
                </div>
            </nav>
            <div class="main flex-auto flex-column" @click="closeNav">
                <router-view />
            </div>
        </div>
    </div>
</template>

<script setup>
import {
    ref, watch, onMounted, onBeforeUnmount
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Grid, VERSION } from '../src/index.js';
import {
    getHash, setHash, delHash
} from './utils/helpers.js';
import { getGridRows } from './utils/nav-data.js';

const route = useRoute();
const router = useRouter();

const version = VERSION;;
const themes = ref([]);
const theme = ref('default');
const navGrid = ref(null);
const navOpen = ref(false);
const navClosing = ref(false);
const keywords = ref('');
const navGridEl = ref(null);

watch(keywords, () => {
    if (navGrid.value) {
        navGrid.value.update();
    }
});

watch(route, () => {
    updateNavSelection();
});

onMounted(() => {
    initThemes();
    initNavGrid();
    updateNavSelection();
});

onBeforeUnmount(() => {
    if (navGrid.value) {
        navGrid.value.destroy();
    }
});

function toggleNav() {
    if (navOpen.value) {
        closeNav();
    } else {
        openNav();
    }
}

function openNav() {
    navClosing.value = false;
    navOpen.value = true;
}

function closeNav() {
    if (!navOpen.value) {
        return;
    }
    navClosing.value = true;
    navOpen.value = false;
    setTimeout(() => {
        navClosing.value = false;
    }, 300);
}

function onThemeChange() {
    if (theme.value === 'default') {
        delHash('theme');
    } else {
        setHash('theme', theme.value);
    }
    // Apply theme to all grid instances via body class
    document.body.className = theme.value === 'default' ? '' : `tg-theme-${theme.value}`;
}

function initThemes() {
    const allThemes = Grid.getAllThemes();
    themes.value = allThemes;
    const hashTheme = getHash('theme');
    if (hashTheme && allThemes.includes(hashTheme)) {
        theme.value = hashTheme;
        document.body.className = `tg-theme-${hashTheme}`;
    }
}

function initNavGrid() {
    const container = navGridEl.value;
    if (!container) {
        return;
    }

    const grid = new Grid(container);
    navGrid.value = grid;

    grid.bind('onCellUpdated', function (e, d) {
        if (this.renderSettings.type) {
            return;
        }
        const cellNode = d.node;
        cellNode.classList.add('tg-cell-effect');
    });

    let scrollTimeId;
    grid.bind('onScroll', function (e, d) {
        clearTimeout(scrollTimeId);
        scrollTimeId = setTimeout(function () {
            localStorage.setItem('tg-scroll-top', d.scrollTop);
        }, 500);
    });

    grid.bind('onClick', (e, d) => {
        const rowItem = d.rowItem;
        const id = rowItem.id;

        if (!id) {
            grid.toggleRow(rowItem);
            return;
        }

        const routePath = id === 'index' ? '/' : `/${id}`;
        if (route.path === routePath) {
            // Already on this page, reload
            window.location.reload();
            return;
        }

        router.push(routePath);
        closeNav();
    });

    grid.setOption({
        headerVisible: false,
        selectMultiple: false,
        scrollbarSize: 6,
        scrollbarFade: true,
        scrollbarRound: true,
        scrollPaneGradient: true,
        bindWindowResize: true,
        bindContainerResize: true,
        frozenRow: 1,
        frozenRowHoverable: true,
        rowFilter: (rowItem) => {
            if (!keywords.value) {
                return true;
            }
            if (rowItem.tg_frozen) {
                return true;
            }
            const name = rowItem.name;
            if (name) {
                return name.toLowerCase().indexOf(keywords.value.toLowerCase()) !== -1;
            }
            return false;
        },
        rowNumberFilter: (rowItem, i) => {
            if (rowItem.tg_group || rowItem.tg_frozen || rowItem.nameClassMap) {
                return false;
            }
            return true;
        }
    });

    grid.setFormatter({
        tree: function (value, rowItem, columnItem, cellNode) {
            const defaultFormatter = this.getDefaultFormatter('tree');
            const rn = `<div class="tg-tree-row-number">${rowItem.tg_row_number}</div>`;
            return rn + defaultFormatter(value, rowItem, columnItem, cellNode);
        }
    });

    grid.setData({
        columns: [{
            id: 'name',
            name: 'Name',
            width: 195
        }],
        rows: getGridRows()
    });

    let scrollTop = localStorage.getItem('tg-scroll-top');
    if (scrollTop) {
        scrollTop = parseInt(scrollTop);
    }

    grid.render({
        scrollTop
    });
}

function updateNavSelection() {
    if (!navGrid.value) {
        return;
    }
    const rows = getGridRows();
    const currentPath = route.path;
    const pageId = currentPath === '/' ? 'index' : currentPath.slice(1);

    rows.forEach(function (row) {
        if (!row.subs) {
            row.selected = row.id === pageId;
            return;
        }
        row.subs.forEach(function (sub) {
            sub.selected = sub.id === pageId;
        });
    });

    navGrid.value.setData({
        columns: [{
            id: 'name',
            name: 'Name',
            width: 195
        }],
        rows: rows
    });
    navGrid.value.render();
}
</script>

<style>
@import './assets/global.scss';

/* App-level styles to match the original main.css + nav styles */
.nav {
    position: relative;
    display: flex;
    width: 230px;
    min-width: 230px;
    border-right: 1px solid #ccc;
    background: #fff;
    z-index: 10;
    transition: margin-left 0.3s ease;
}

.nav .header {
    display: none;
    padding: 0 10px;
    height: 40px;
    border-bottom: 1px solid #ccc;
}

.nav .nav-grid {
    position: relative;
    flex: 1;
    overflow: hidden;
}

.nav .nav-search {
    padding: 5px;
}

.nav .nav-search input {
    width: 100%;
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 3px;
    outline: none;
}

.nav .nav-search input:focus {
    border-color: #999;
}

.header-icon-menu {
    display: none;
    cursor: pointer;
    font-size: 20px;
}

.header-icon-close {
    cursor: pointer;
    font-size: 20px;
}

/* Mobile responsive */
@media (max-width: 768px) {
    .nav {
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        width: 260px;
        min-width: 260px;
        margin-left: -260px;
        box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
        z-index: 100;
    }

    .nav.nav-opened {
        margin-left: 0;
    }

    .nav.nav-closing {
        margin-left: -260px;
    }

    .nav .header {
        display: flex;
    }

    .header-icon-menu {
        display: block;
    }
}
</style>
