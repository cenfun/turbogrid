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
import { Grid } from '../src/index.js';
import { getGridRows } from './global.js';

const navGridEl = ref(null);
const route = useRoute();
const router = useRouter();

let grid;
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
        const id = rowItem.id;

        if (!id) {
            grid.toggleRow(rowItem);
            return;
        }

        router.push({
            path: id,
            query: route.query
        });
    });

    grid.setOption({

        theme: route.query.theme || 'default',

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

    grid.render();
};

watch([
    () => route.query.theme,
    () => route.path
], () => {
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
    }

    .tg-row-top::after {
        position: absolute;
        top: 0;
        left: 5px;
        content: "";
        width: 16px;
        height: 30px;
        background-image: url("./assets/images/double-right.svg");
        background-repeat: no-repeat;
        background-position: center center;
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
}
</style>
