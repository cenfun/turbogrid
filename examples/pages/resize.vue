<template>
  <div class="main">
    <div class="controller">
      <div class="controller-header">
        <div class="controller-title">
          Grid resize example:
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
          width:
          <input
            v-model="width"
            class="it_width"
            @change="updateContainerSize"
          >
          <select
            v-model="width"
            class="st_width"
            @change="updateContainerSize"
          >
            <option>100%</option>
            <option>500px</option>
            <option>800px</option>
          </select>
        </label>

        <label>
          height:
          <input
            v-model="height"
            class="it_height"
            @change="updateContainerSize"
          >
          <select
            v-model="height"
            class="st_height"
            @change="updateContainerSize"
          >
            <option>100%</option>
            <option>300px</option>
            <option>600px</option>
            <option>0</option>
          </select>
        </label>

        <button>resize()</button>
      </div>
      <div>
        <button>resize(600, 400)</button>
        <button>resize(800)</button>
        <button>resize({"width":1024, "height":768})</button>
        <button>resize("100%", "100%")</button>
        <button>resize(0, 0)</button>
      </div>
      <div>
        <label for="cb_bindWindowResize">
          <input
            id="cb_bindWindowResize"
            v-model="bindWindowResize"
            type="checkbox"
            class="cb_bindWindowResize"
            @change="render"
          >
          bindWindowResize
        </label>
        <label for="cb_bindContainerResize">
          <input
            id="cb_bindContainerResize"
            v-model="bindContainerResize"
            type="checkbox"
            class="cb_bindContainerResize"
            @change="render"
          >
          bindContainerResize
        </label>

        <label>
          <input
            v-model="containerHidden"
            type="checkbox"
            class="cb_containerHidden"
            @click="toggleContainerHidden"
          >
          container hidden
        </label>
      </div>
    </div>
    <div class="grid-container">
      <div
        ref="gridContainer"
        class="grid-container-resize"
      />
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


const gridContainer = ref(null);
const grid = ref(null);
const dataStr = ref('sample-data');
const width = ref('100%');
const height = ref('100%');
const bindWindowResize = ref(true);
const bindContainerResize = ref(true);
const containerHidden = ref(false);

const updateContainerSize = () => {
    const elem = gridContainer.value;
    elem.style.width = width.value;
    elem.style.height = height.value;
};

const renderData = (data) => {
    grid.value.setOption({
        theme: route.query.theme,
        bindWindowResize: bindWindowResize.value,
        bindContainerResize: bindContainerResize.value
    });
    grid.value.setData(data);
    grid.value.render();
};

const render = () => {
    if (!grid.value) {
        return;
    }
    if (dataStr.value.startsWith('random')) {
        renderData(randomData(dataStr.value));
        return;
    }
    renderData(sampleData());
};

const toggleContainerHidden = () => {
    gridContainer.value.style.display = containerHidden.value ? 'none' : 'block';
};

onMounted(() => {
    init();
    grid.value = new Grid(gridContainer.value);

    grid.value.bind('onFirstUpdated', function() {
        console.log('duration:', `${this.renderDuration}ms`);
    });

    grid.value.bind('onResize', function(e, d) {
        console.log(e.type, d);
    });

    grid.value.bind('onLayout', function(e, d) {
        console.log(e.type, d);
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
.grid-container-resize {
    position: relative;
    width: 100%;
    height: 100%;
    border: 1px solid #999;
    overflow: hidden;
}
</style>
