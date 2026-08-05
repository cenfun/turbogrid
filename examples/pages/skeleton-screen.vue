<template>
  <div class="main">
    <div class="controller">
      <div class="controller-header">
        <div class="controller-title">
          Grid skeleton screen example:
        </div>
      </div>
    </div>
    <div
      ref="gridContainer"
      class="grid-container"
    />
  </div>
</template>

<script setup>
import {
    onMounted, onBeforeUnmount, ref
} from 'vue';
import { useRoute } from 'vue-router';
import { Grid } from '../../src/index.js';
import { init, initCommonEvents } from '../global.js';
const route = useRoute();


const gridContainer = ref(null);
const grid = ref(null);
let timeout_load_rows;

onMounted(() => {
    init();
    const container = gridContainer.value;
    const g = new Grid(container);
    grid.value = g;

    g.bind('onUpdated', function(e, viewport) {
        const visibleRowList = viewport.rows;

        const notReadyRowIndexList = [];
        visibleRowList.forEach(function(index) {
            const rowItem = g.getRowItem(index);
            if (rowItem && !rowItem.dataReady) {
                notReadyRowIndexList.push(index);
            }
        });
        if (!notReadyRowIndexList.length) {
            return;
        }

        clearTimeout(timeout_load_rows);
        timeout_load_rows = setTimeout(function() {
            notReadyRowIndexList.forEach(function(rowIndex) {
                const rowItem = g.getRowItem(rowIndex);
                if (rowItem) {
                    rowItem.c1 = 'string';
                    rowItem.c2 = Math.random().toFixed(3);
                    rowItem.c3 = Math.random().toFixed(3);
                    rowItem.c4 = 'string';
                    rowItem.c5 = 'string';
                    rowItem.dataReady = true;
                }
            });
            g.flushCell(notReadyRowIndexList, [1, 2, 3, 4, 5]);
            g.render();

        }, 2000);
    });

    function render() {
        const rows = [];
        for (let i = 0; i < 300; i++) {
            rows.push({
                name: `Row name ${i}`,
                dataReady: false
            });
        }

        const data = {
            columns: [{
                id: 'name',
                name: 'Name',
                width: 160
            }, {
                id: 'c1',
                name: 'Column 1',
                originalFormatter: 'string',
                formatter: 'skeleton'
            }, {
                id: 'c2',
                name: 'Column 2',
                align: 'right',
                originalFormatter: 'number',
                formatter: 'skeleton'
            }, {
                id: 'c3',
                name: 'Column 3',
                align: 'right',
                originalFormatter: 'number',
                formatter: 'skeleton'
            }, {
                id: 'c4',
                name: 'Column 4',
                originalFormatter: 'string',
                formatter: 'skeleton'
            }, {
                id: 'c5',
                name: 'Column 5',
                originalFormatter: 'string',
                formatter: 'skeleton'
            }],
            rows: rows
        };

        g.setData(data);

        g.setOption({

            bindWindowResize: true,
            theme: route.query.theme,
            frozenColumn: 0
        });

        g.setFormatter({
            skeleton: function(value, rowItem, columnItem, cellNode) {
                if (!rowItem.dataReady) {
                    const align = columnItem.align ? `tg-skeleton-${columnItem.align}` : '';
                    return `<div class="tg-skeleton ${align}"></div>`;
                }
                const originalFormatter = this.getFormatter(columnItem.originalFormatter) || this.getFormatter('string');
                return originalFormatter.apply(this, arguments);
            }
        });
        g.render();
    }

    [].forEach(function(item) {
        document.querySelector(item).addEventListener('change', function() {
            render();
        });
    });

    initCommonEvents(g);

    render();
});

onBeforeUnmount(() => {
    if (grid.value) {
        grid.value.destroy();
    }
});
</script>

<style lang="scss">
.tg-skeleton {
    position: absolute;
    top: 20%;
    width: 80%;
    height: 60%;
    background: rgb(194 207 214);
    transform-origin: left;
    animation-name: tg-skeleton-keyframes;
    animation-duration: 0.5s;
    animation-timing-function: linear;
    animation-delay: 0.3s;
    animation-iteration-count: infinite;
    animation-direction: alternate;
}

.tg-skeleton-right {
    right: 5px;
    transform-origin: right;
}

.tg-row.tg-odd {
    .tg-skeleton {
        width: 70%;
        animation-delay: 0.5s;
    }
}

@keyframes tg-skeleton-keyframes {
    from {
        transform: scaleX(1);
    }

    to {
        transform: scaleX(0.8);
    }
}
</style>
