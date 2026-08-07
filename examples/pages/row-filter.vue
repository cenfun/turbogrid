<template>
  <div class="main">
    <div class="controller">
      <div class="controller-header">
        <div class="controller-title">
          Grid row filter
        </div>
        <select
          v-model="dataStr"
          class="st-data"
          @change="render"
        >
          <option>sample-data</option>
          <option>random-3x10</option>
          <option>random-100x2k</option>
          <option>random-10x10k</option>
          <option>random-10x100k</option>
        </select>
      </div>
      <div>
        <label>rowFilter:
          <input
            v-model="keywords"
            type="text"
            placeholder="keywords"
            class="ip-keywords"
            @focus="$event.target.select()"
            @keyup="updateGrid"
          >
        </label>

        <label>rowFilteredSort:
          <select
            v-model="rowFilteredSort"
            class="st-rowFilteredSort"
            @change="render"
          >
            <option />
            <option>name</option>
            <option>{"sortField": "name", "sortAsc": false}</option>
          </select>
        </label>
      </div>
      <div>
        <label>
          <input
            v-model="removeSortColumn"
            type="checkbox"
            class="cb-removeSortColumn"
          >
          removeSortColumn on rowFilter
        </label>
      </div>
      <div>
        <button>hideRow("total")</button>
        <button>showRow("total")</button>

        <button>hideRow("top")</button>
        <button>showRow("top")</button>

        <button>hideRow(0)</button>
        <button>showRow(0)</button>

        <button>hideRow(1)</button>
        <button>showRow(1)</button>
      </div>
      <div>
        <button>getRowItem("total")</button>
        <button>getRowItem("level_1_2")</button>
        <button>getRowItem("level_3_2")</button>
        <button>getRowsLength()</button>
        <button>getRowsLength(true)</button>
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
const keywords = ref('');
const dataStr = ref('sample-data');
const rowFilteredSort = ref('');
const removeSortColumn = ref(false);

const renderData = (data) => {
    let sortValue = rowFilteredSort.value;
    if (sortValue.startsWith('{')) {
        sortValue = JSON.parse(sortValue);
    }

    const options = {
        bindWindowResize: true,
        theme: route.query.theme,
        frozenColumn: 0,
        frozenRow: 1,
        selectVisible: true,
        rowNotFound: '<div>Not Found</div>',
        rowFilter: (rowItem) => {
            const keyword = keywords.value.trim().toLowerCase();
            let hasMatched = !keyword || `${rowItem.name || ''}`.toLowerCase().includes(keyword);

            if (rowItem.tg_frozen) {
                hasMatched = true;
            }
            if (rowItem.formatter === 'blank') {
                hasMatched = false;
            }
            return hasMatched;
        },
        rowFilteredSort: sortValue
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

const updateGrid = () => {
    if (!grid.value) {
        return;
    }
    if (removeSortColumn.value) {
        grid.value.removeSortColumn();
    }
    grid.value.update();
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
