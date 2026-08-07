<template>
  <div class="main">
    <div class="controller">
      <div class="controller-header">
        <div class="controller-title">
          Grid header display
        </div>
        <select
          v-model="dataStr"
          class="st-data"
          @change="render"
        >
          <option>sample-data</option>
          <option>random-3x10</option>
          <option>random-100x20k</option>
        </select>
      </div>
      <div>
        <label>
          <input
            v-model="headerVisible"
            type="checkbox"
            class="cb_headerVisible"
            @change="render"
          >
          headerVisible
        </label>
      </div>
    </div>
    <div
      ref="gridContainer"
      class="grid-container grid-container-header-display"
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
const dataStr = ref('sample-data');
const headerVisible = ref(false);

const renderData = (data) => {
    const options = {
        bindWindowResize: true,
        theme: route.query.theme,
        headerVisible: headerVisible.value,
        frozenColumn: 0,
        frozenRow: -1
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
    grid.value = new Grid(gridContainer.value);

    grid.value.bind('onFirstUpdated', function() {
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
.grid-container-header-display {
    .tg-header-item {
        border: 1px solid #080;
    }
}
</style>
