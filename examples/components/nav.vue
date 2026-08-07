<template>
  <div
    ref="navGridEl"
    class="nav-grid-container"
  />
</template>
<script setup>
import {
    onMounted, onUnmounted, ref,
    watch
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Grid, TAG } from '../../src/index.js';
import { getExampleList } from '../global.js';

import DocIcon from '../assets/images/double-right.svg?raw';

console.log('TAG', TAG);

const navGridEl = ref(null);
const route = useRoute();
const router = useRouter();

let grid;

const selectRow = () => {
    if (!grid) {
        return;
    }
    // Select the row matching the current route path
    const currentPath = route.path.replace(/^\//, '');
    if (currentPath) {
        const rowItem = grid.getRowItemById(currentPath);
        if (rowItem && rowItem.selectable !== false) {
            grid.setRowSelected(rowItem);
            grid.scrollRowIntoView(rowItem);
        }
    }
};


const update = () => {
    const container = navGridEl.value;
    if (!container) {
        return;
    }

    grid = new Grid(container);

    grid.bind('onCellUpdated', function(e, d) {
        if (this.renderSettings.type) {
            return;
        }
        const cellNode = d.node;
        cellNode.classList.add('tg-cell-effect');
    });

    grid.bind('onClick', (e, d) => {
        const rowItem = d.rowItem;
        let id = rowItem.id;

        if (!id) {
            grid.toggleRow(rowItem);
            return;
        }

        if (d.e.target.closest('.tg-row-api-doc-zh')) {
            id = 'api-doc-zh';
        }

        router.push({
            path: id,
            query: route.query
        });
    });

    grid.bind('onFirstUpdated', () => {
        selectRow();
    });

    grid.setOption({

        theme: route.query.theme,

        headerVisible: false,
        selectMultiple: false,
        scrollbarSize: 6,
        scrollbarFade: true,
        scrollbarRound: true,
        scrollPaneGradient: true,
        bindWindowResize: true,
        bindContainerResize: true,
        frozenRow: 0,
        frozenRowHoverable: true,

        rowNumberFilter: (rowItem, i) => {
            if (rowItem.tg_group || rowItem.tg_frozen || rowItem.nameClassMap) {
                return false;
            }
            return true;
        }
    });

    grid.setFormatter({
        tree: function(value, rowItem, columnItem, cellNode) {
            const defaultFormatter = this.getDefaultFormatter('tree');
            const rn = `<div class="tg-tree-row-number">${rowItem.tg_row_number}</div>`;

            if (rowItem.id === 'api-doc') {
                value = `<span class="tg-row-icon">${DocIcon}</span>${value}<span class="tg-row-api-doc-zh">中文文档</span>`;
            }

            return rn + defaultFormatter(value, rowItem, columnItem, cellNode);
        }
    });

    grid.setData({
        columns: [{
            id: 'name',
            name: 'Name'
        }],
        rows: getExampleList()
    });

    grid.render();

};

watch(() => route.path, () => {
    selectRow();
});

watch(() => route.query.theme, () => {
    update();
});

onMounted(() => {
    update();
});

onUnmounted(() => {
    if (grid) {
        grid.destroy();
        grid = null;
    }
});
</script>
<style lang="scss">
@keyframes tg-cell-effect-animate {
    from {
        transform: scale(0.5) translateX(-90%);
    }

    to {
        transform: translateX(0);
    }
}

.nav-grid-container {
    width: 100%;
    height: 100%;

    .tg-row-api-doc-zh {
        margin-left: 10px;
        font-size: 14px;

        &:hover {
            color: #1890ff;
            text-decoration: underline;
        }
    }

    .tg-cell-effect {
        animation-name: tg-cell-effect-animate;
        animation-duration: 0.3s;
        animation-timing-function: cubic-bezier(0.26, 0.86, 0.44, 0.985);
    }

    .tg-tree-row-number {
        position: absolute;
        width: 20px;
        text-align: center;
    }

    .tg-row-top {
        position: relative;
        font-weight: bold;

        .tg-row-icon {
            position: absolute;
            top: 50%;
            left: 0;
            display: block;
            width: 20px;
            height: 20px;
            transform: translateY(-50%);
            overflow: hidden;
        }
    }

    .tg-gradient-top::before {
        position: absolute;
        top: 0;
        left: 0;
        content: "";
        z-index: 10;
        display: block;
        width: 100%;
        height: 30px;
        background-image: linear-gradient(to bottom, #fff, rgb(255 255 255 / 0%));
        pointer-events: none;
    }

    .tg-gradient-bottom::after {
        position: absolute;
        left: 0;
        bottom: 0;
        content: "";
        z-index: 10;
        display: block;
        width: 100%;
        height: 30px;
        background-image: linear-gradient(to bottom, rgb(255 255 255 / 0%), #fff);
        pointer-events: none;
    }

    .tg-dark {
        .tg-gradient-top::before {
            background-image: linear-gradient(to bottom, #1e1e1e, rgb(30 30 30 / 0%));
        }

        .tg-gradient-bottom::after {
            background-image: linear-gradient(to bottom, rgb(30 30 30 / 0%), #1e1e1e);
        }
    }
}
</style>
