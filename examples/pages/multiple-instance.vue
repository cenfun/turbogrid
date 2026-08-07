<template>
  <div class="main">
    <div class="controller">
      <div class="controller-header">
        <div class="controller-title">
          Grid multiple instance:
        </div>
        <select
          v-model="dataStr"
          class="st-data"
          @change="render"
        >
          <option>sample-data</option>
          <option>random-3x10</option>
          <option>random-10x100</option>
        </select>
      </div>
      <div>
        <div>
          <button
            class="bt-position"
            @click="togglePosition"
          >
            position overlap
          </button>
          <label>left z-index:</label>
          <select
            v-model="indexValue"
            class="st_index"
          >
            <option>0</option>
            <option>100</option>
          </select>
        </div>
      </div>
    </div>
    <div class="grid-container grid-container-multiple">
      <div
        ref="containerLeft"
        class="container-left"
      >
        <div
          ref="gridContainer1"
          class="grid-container-1"
        />
      </div>
      <div
        ref="containerRight"
        class="container-right"
      >
        <div
          ref="gridContainer2"
          class="grid-container-2"
        />
      </div>
    </div>
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


const gridContainer1 = ref(null);
const gridContainer2 = ref(null);
const grid = ref(null);
const grid2 = ref(null);
const dataStr = ref('sample-data');
const indexValue = ref('0');
const containerLeft = ref(null);
const containerRight = ref(null);

const renderData = (data) => {
    grid.value.setOption({
        bindWindowResize: true,
        theme: route.query.theme,
        selectVisible: true,
        frozenColumn: 0,
        frozenRow: -1
    });
    grid.value.setDataSnapshot(data);
    grid.value.render();

    grid2.value.setOption({
        bindWindowResize: true,
        theme: route.query.theme,
        height: 50,
        selectVisible: true,
        frozenColumn: 0,
        frozenRow: -1
    });
    grid2.value.setDataSnapshot(data);
    grid2.value.render();
};

const render = () => {
    if (dataStr.value.startsWith('random')) {
        renderData(randomData(dataStr.value));
        return;
    }
    renderData(sampleData());
};

const togglePosition = () => {
    containerLeft.value.style.zIndex = indexValue.value;
    if (containerRight.value.classList.contains('overlap')) {
        containerRight.value.classList.remove('overlap');
    } else {
        containerRight.value.classList.add('overlap');
    }
};

onMounted(() => {
    init();
    grid.value = new Grid(gridContainer1.value);
    grid2.value = new Grid(gridContainer2.value);

    initCommonEvents(grid.value);

    render();
});

onBeforeUnmount(() => {
    if (grid.value) {
        grid.value.destroy();
    }
    if (grid2.value) {
        grid2.value.destroy();
    }
});
</script>

<style lang="scss">
.grid-container-multiple {
    position: relative;
    overflow: visible;
}

.container-left {
    position: absolute;
    z-index: 0;
    width: 50%;
    height: 100%;
    background: #fff;
}

.container-right {
    position: absolute;
    left: 50%;
    width: 50%;
    height: 100%;
    background: #eee;
}

.grid-container-1,
.grid-container-2 {
    width: 100%;
    height: 100%;
}

.overlap {
    position: absolute;
    top: -50px;
    left: 30%;
}
</style>
