<template>
  <div class="main">
    <div class="controller">
      <div class="controller-header">
        <div class="controller-title">
          Grid Row Number:
        </div>
        <select
          v-model="dataStr"
          class="st-data"
          @change="render"
        >
          <option>sample-data</option>
          <option>random-3x10</option>
          <option>random-100x2k</option>
        </select>
      </div>
      <div>
        <label>
          <input
            v-model="rowNumberVisible"
            type="checkbox"
            class="cb_rowNumberVisible"
            @change="render"
          >
          rowNumberVisible
        </label>


        <label>
          <input
            v-model="selectVisible"
            type="checkbox"
            class="cb_selectVisible"
            @change="render"
          >
          selectVisible
        </label>

        <label>
          <input
            v-model="selectAllVisible"
            type="checkbox"
            class="cb_selectAllVisible"
            @change="render"
          >
          selectAllVisible
        </label>

        <label>
          <input
            v-model="rowDragVisible"
            type="checkbox"
            class="cb_rowDragVisible"
            @change="render"
          >
          rowDragVisible
        </label>

        <label>
          <input
            v-model="collapseAllVisible"
            type="checkbox"
            class="cb_collapseAllVisible"
            @change="render"
          >
          collapseAllVisible
        </label>
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
import { sampleData, randomData } from '../assets/sample-data.js';
import { init, initCommonEvents } from '../global.js';
const route = useRoute();


const gridContainer = ref(null);
const grid = ref(null);
const dataStr = ref('sample-data');
const rowNumberVisible = ref(true);
const selectVisible = ref(false);
const selectAllVisible = ref(false);
const rowDragVisible = ref(false);
const collapseAllVisible = ref(false);

const renderData = (data) => {
    const options = {
        bindWindowResize: true,
        theme: route.query.theme,
        rowNumberVisible: rowNumberVisible.value,
        collapseAllVisible: collapseAllVisible.value,
        selectVisible: selectVisible.value,
        selectAllVisible: selectAllVisible.value,
        rowDragVisible: rowDragVisible.value,
        frozenColumn: 0,
        frozenRow: 1
    };

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
    const g = new Grid(gridContainer.value);
    grid.value = g;

    g.bind('onFirstUpdated', function() {
        console.log('duration:', `${this.renderDuration}ms`);
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
