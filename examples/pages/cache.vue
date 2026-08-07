<template>
  <div class="main">
    <div class="controller">
      <div class="controller-header">
        <div class="controller-title">
          Grid Cache Length Test
        </div>
        <select
          v-model="dataStr"
          class="st-data"
          @change="render"
        >
          <option>random-20x100</option>
          <option>sample-data</option>
        </select>
      </div>
      <div>
        <label>
          rowCacheLength
          <input
            v-model.number="rowCacheLength"
            type="number"
            min="0"
            step="1"
            class="ip-number it_rowCacheLength"
            @change="render"
          >
        </label>
        <label>
          columnCacheLength
          <input
            v-model.number="columnCacheLength"
            type="number"
            min="0"
            step="1"
            class="ip-number it_columnCacheLength"
            @change="render"
          >
        </label>
      </div>
      <div>
        <label>
          frozenColumn
          <input
            v-model.number="frozenColumn"
            type="number"
            min="-1"
            max="5"
            step="1"
            class="ip-number ip_frozenColumn"
            @change="render"
          >
        </label>
        <label>
          frozenRow
          <input
            v-model.number="frozenRow"
            type="number"
            min="-1"
            max="5"
            step="1"
            class="ip-number ip_frozenRow"
            @change="render"
          >
        </label>
        <label>
          <input
            v-model="frozenBottom"
            type="checkbox"
            class="cb_frozenBottom"
            @change="render"
          >
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
        <div class="column-list">
          {{ columnList }}
        </div>
        <div class="row-list">
          {{ rowList }}
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
    ref, onMounted, onBeforeUnmount
} from 'vue';
import { useRoute } from 'vue-router';
import { Grid } from '../../src/index.js';
import { sampleData, randomData } from '../assets/sample-data.js';
import { init, initCommonEvents } from '../global.js';
const route = useRoute();

const gridContainer = ref(null);
const grid = ref(null);
const dataStr = ref('random-20x100');
const rowCacheLength = ref(0);
const columnCacheLength = ref(0);
const frozenColumn = ref(0);
const frozenRow = ref(1);
const frozenBottom = ref(false);
const columnList = ref('');
const rowList = ref('');

const renderData = (data) => {
    const options = {
        bindWindowResize: true,
        theme: route.query.theme,
        selectVisible: true,
        frozenBottom: frozenBottom.value,
        frozenColumn: frozenColumn.value,
        frozenRow: frozenRow.value,
        rowCacheLength: rowCacheLength.value,
        columnCacheLength: columnCacheLength.value
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
    if (dataStr.value.startsWith('random')) {
        renderData(randomData(dataStr.value));
        return;
    }
    renderData(sampleData());
};

onMounted(() => {
    init();
    grid.value = new Grid(gridContainer.value);

    grid.value.bind('onUpdated', function(e, viewport) {
        columnList.value = `columns: ${viewport.columns}`;
        rowList.value = `rows: ${viewport.rows}`;
    }).bind('onFirstUpdated', function() {
        console.log('duration:', `${this.renderDuration}ms`);
    });

    initCommonEvents(grid.value);

    render();
});

onBeforeUnmount(() => {
    if (grid.value) {
        grid.value.destroy();
    }
});
</script>

<style lang="scss">
.column-list,
.row-list {
    color: #666;
}
</style>
