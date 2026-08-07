<template>
  <div class="main">
    <div class="controller">
      <div class="controller-header">
        <div class="controller-title">
          Grid pagination example
        </div>
        <select
          v-model="dataStr"
          class="st-data"
          @change="render"
        >
          <option>random-20x1k</option>
          <option>random-20x5k</option>
        </select>
      </div>
      <div>
        <label>
          page:
          <select
            v-model.number="page"
            class="st_page"
            @change="render"
          >
            <option
              v-for="n in totalPage"
              :key="n"
              :value="n"
            >
              {{ n }}
            </option>
          </select>
        </label>

        <label>
          page size:
          <select
            v-model.number="pageSize"
            class="st_pageSize"
            @change="render"
          >
            <option>50</option>
            <option>100</option>
            <option>200</option>
          </select>
        </label>

        <label>total page:
          <span class="totalPage">{{ totalPage }}</span>
        </label>

        <label>
          total size:
          <span class="totalSize">{{ totalSize }}</span>
        </label>
      </div>
      <div class="page-list">
        <div
          v-for="n in totalPage"
          :key="n"
          class="page-item"
          :class="[`page-item_${n}`, { selected: n === page }]"
          @click="selectPage(n)"
        >
          {{ n }}
        </div>
      </div>
      <div>
        <div>
          <div>We do NOT recommend using pagination which is NOT good solution to Grid usage.</div>
          <ul>
            <li>Grid rendering 100,000+ rows with high performance.</li>
            <li>It unnecessary to load all data to front-end because of high cost to back-end, but you could think about loading data dynamically.</li>
            <li>Require pagination management, UI controller and back-end API</li>
          </ul>
          <div>Pagination issues:</div>
          <ul>
            <li>Group/tree structure rows</li>
            <li>Sorting cross-page</li>
            <li>keeping selection state cross-page</li>
            <li>Selecting all rows</li>
          </ul>
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
import { randomData } from '../assets/sample-data.js';
import { init, initCommonEvents } from '../global.js';
const route = useRoute();


const gridContainer = ref(null);
const grid = ref(null);
const dataStr = ref('random-20x1k');
const page = ref(1);
const pageSize = ref(50);
const totalPage = ref(0);
const totalSize = ref(0);

let _totalData;
let _dataStr;
const getRandomData = function() {
    if (dataStr.value !== _dataStr) {
        _totalData = null;
        _dataStr = dataStr.value;
    }

    if (_totalData) {
        return _totalData;
    }

    _totalData = randomData(dataStr.value);

    return _totalData;
};

const pageHandler = function(td) {
    const totalRows = td.rows;
    totalSize.value = totalRows.length;

    const size = pageSize.value;

    totalPage.value = Math.ceil(totalSize.value / size);

    let p = page.value || 1;
    p = Math.max(1, p);
    p = Math.min(totalPage.value, p);
    page.value = p;

    const start = (p - 1) * size;
    const end = start + size;
    const pageRows = totalRows.slice(start, end);

    return {
        rows: pageRows,
        columns: td.columns
    };
};

const selectPage = (n) => {
    page.value = n;
    render();
};

function render() {
    const options = {
        bindWindowResize: true,
        theme: route.query.theme,
        frozenColumn: 0,
        frozenRow: -1
    };
    grid.value.setOption(options);

    const pageData = pageHandler(getRandomData());

    grid.value.showLoading();
    setTimeout(function() {
        grid.value.hideLoading();

        grid.value.setData(pageData);
        grid.value.render();

    }, 1000);
}

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
