<template>
    <div class="main flex-auto flex-column">
        <div class="controller">
            <div>
                <div class="controller-title">Grid Cache Length Test</div>
                <select class="st-data">
                    <option>random-20x100</option>
                    <option>sample-data</option>
                </select>
            </div>
            <div>
                <label>
                    rowCacheLength
                    <input type="number" min="0" step="1" value="0" class="ip-number it_rowCacheLength" />
                </label>
                <label>
                    columnCacheLength
                    <input type="number" min="0" step="1" value="0" class="ip-number it_columnCacheLength" />
                </label>
            </div>
            <div>
                <label>
                    frozenColumn
                    <input type="number" min="-1" max="5" step="1" value="0" class="ip-number ip_frozenColumn" />
                </label>
                <label>
                    frozenRow
                    <input type="number" min="-1" max="5" step="1" value="1" class="ip-number ip_frozenRow" />
                </label>
                <label>
                    <input type="checkbox" class="cb_frozenBottom" />
                    frozenBottom
                </label>
            </div>
            <div>
                <button>hideColumn(1)</button>
                <button>hideColumn(2)</button>
                <button>hideColumn(3)</button>
                <button>hideColumn(4)</button>
                <button>showColumn([1, 2, 3, 4])</button>
                <button>hideColumn([1, 2, 3, 4])</button>
            </div>
            <div>
                <div>onUpdated: (viewport)</div>
                <div class="column-list"></div>
                <div class="row-list"></div>
            </div>
        </div>
        <div ref="gridContainer" class="grid-container flex-auto"></div>
    </div>
</template>

<script setup>
import {
    ref, onMounted, onBeforeUnmount
} from 'vue';
import { Grid } from '../../src/index.js';
import { sampleData } from '../data/sample-data.js';
import { randomData } from '../data/random-data.js';
import { initCommonEvents } from '../global.js';

const gridContainer = ref(null);
const grid = ref(null);

const onResize = () => {
    grid.value?.resize();
};

onMounted(() => {
    grid.value = new Grid(gridContainer.value);

    grid.value.bind('onUpdated', function(e, viewport) {
        document.querySelector('.column-list').innerHTML = `columns: ${viewport.columns}`;
        document.querySelector('.row-list').innerHTML = `rows: ${viewport.rows}`;
    }).bind('onFirstUpdated', function() {
        console.log('duration:', `${this.renderDuration}ms`);
    });

    const renderData = (data) => {
        const rowCacheLength = parseInt(document.querySelector('.it_rowCacheLength').value);
        const columnCacheLength = parseInt(document.querySelector('.it_columnCacheLength').value);

        const options = {
            theme: document.querySelector('.st-theme').value,
            selectVisible: true,
            frozenBottom: document.querySelector('.cb_frozenBottom').checked,
            frozenColumn: parseInt(document.querySelector('.ip_frozenColumn').value),
            frozenRow: parseInt(document.querySelector('.ip_frozenRow').value),
            rowCacheLength: rowCacheLength,
            columnCacheLength: columnCacheLength
        };

        grid.value.setFormatter({
            header: function(v, rowItem, columnItem, cellNode) {
                return `${v} (${columnItem.tg_index})`;
            }
        });

        grid.value.setOption(options);
        grid.value.setData(data);
        grid.value.render();
    };

    const render = () => {
        const dataStr = document.querySelector('.st-data').value;
        if (dataStr.startsWith('random')) {
            renderData(randomData(dataStr));
            return;
        }
        renderData(sampleData);
    };

    ['.st-data', '.st-theme', '.it_rowCacheLength', '.it_columnCacheLength', '.ip_frozenColumn', '.ip_frozenRow', '.cb_frozenBottom'].forEach(function(item) {
        document.querySelector(item).addEventListener('change', function() {
            render();
        });
    });

    initCommonEvents(grid.value);

    window.addEventListener('resize', onResize);
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', onResize);
    if (grid.value) {
        grid.value.destroy();
    }
});
</script>

<style scoped>
.column-list,
.row-list {
    color: #666;
}
</style>
