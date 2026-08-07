<template>
  <div class="main">
    <div class="controller">
      <div class="controller-header">
        <div class="controller-title">
          Grid loading API:
        </div>
        <select class="st-data">
          <option>sample-data</option>
          <option>random-3x10</option>
          <option>random-100x2k</option>
        </select>
      </div>
      <div>
        <button>showLoading()</button>
        <button>hideLoading()</button>

        <button>showMask()</button>
        <button>hideMask()</button>
        <button>showMask({"opacity":"0.3"})</button>
      </div>
      <div>
        <label>
          <button>setLoading()</button>
          (default)
        </label>
        <button>setLoading({"size":"16px", "color":"green"})</button>
        <button>setLoading({"size":"60px", "color":"green", "fast":"fast"})</button>
      </div>
      <div>
        <button>setLoading("Loading ...")</button>
        <button class="setLoadingElement">
          setLoading with this element
        </button>
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

onMounted(() => {
    init();
    const g = new Grid(gridContainer.value);
    grid.value = g;

    g.bind('onFirstUpdated', function() {
        console.log('duration:', `${this.renderDuration}ms`);
    });

    const renderData = (data) => {
        g.setOption({
            bindWindowResize: true,
            theme: route.query.theme,
            frozenColumn: 0,
            frozenRow: 1
        });

        g.setData(data);
        g.render();
    };

    const render = () => {
        const dataStr = document.querySelector('.st-data').value;

        if (dataStr.startsWith('random')) {
            renderData(randomData(dataStr));
            return;
        }

        renderData(sampleData());
    };

    document.querySelector('.setLoadingElement').addEventListener('click', function() {
        g.setLoading(function() {
            return document.querySelector('.setLoadingElement').cloneNode(true);
        });
    });

    ['.st-data'].forEach(function(item) {
        document.querySelector(item).addEventListener('change', function() {
            render();
        });
    });

    initCommonEvents(g);

    g.showLoading();
    setTimeout(function() {
        render();
        g.hideLoading();
    }, 1000);
});

onBeforeUnmount(() => {
    if (grid.value) {
        grid.value.destroy();
    }
});
</script>
