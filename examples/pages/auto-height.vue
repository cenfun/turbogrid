<template>
  <div class="main main-auto-height">
    <div class="controller">
      <div class="controller-header">
        <div class="controller-title">
          Grid auto height example:
        </div>
        <select
          v-model="dataStr"
          class="st-data"
          @change="render"
        >
          <option>sample-data</option>
          <option>random-3x10</option>
          <option>random-10x100</option>
          <option>no-rows</option>
        </select>
      </div>
      <div>
        <label>
          <input
            v-model="autoHeight"
            type="checkbox"
            class="cb_autoHeight"
            @change="render"
          >
          autoHeight
        </label>
        <label>
          <input
            v-model="collapseAllOnInit"
            type="checkbox"
            class="cb_collapseAllOnInit"
            @change="render"
          >
          collapseAllOnInit
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
const autoHeight = ref(true);
const collapseAllOnInit = ref(true);

const renderData = (data) => {
    gridContainer.value.style.height = '';

    const options = {
        bindWindowResize: true,
        theme: route.query.theme,
        autoHeight: autoHeight.value,
        collapseAllOnInit: collapseAllOnInit.value,
        frozenColumn: 0,
        frozenRow: -1,
        rowNotFound: '没有找到任何结果'
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
    if (dataStr.value === 'no-rows') {
        renderData({
            columns: randomData('random-10x10').columns,
            rows: []
        });
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
.main-auto-height {
    display: block;
    overflow-y: auto;
}
</style>
