<template>
  <div class="main">
    <div class="controller">
      <div class="controller-header">
        <div class="controller-title">
          Grid Performance Test:
        </div>
      </div>
      <div>
        <label>
          columns
          <select
            v-model="columns"
            class="st-columns"
            @change="render"
          >
            <option>10</option>
            <option>20</option>
            <option>30</option>
            <option>50</option>
          </select>
          <input
            v-model="columns"
            class="ip-columns pt-columns"
          >
        </label>
        <label>
          rows
          <select
            v-model="rows"
            class="st-rows"
            @change="render"
          >
            <option>100</option>
            <option>1k</option>
            <option>5k</option>
            <option selected>10k</option>
            <option>100k</option>
            <option>1m</option>
            <option>2m</option>
            <option>3m</option>
            <option>5m</option>
          </select>
          <input
            v-model="rows"
            class="ip-rows pt-rows"
          >
        </label>
        <label>
          <input
            v-model="hasSubs"
            type="checkbox"
            class="cb-subs"
            @change="render"
          >
          subs
        </label>
        <button
          class="bt-start"
          @click="render"
        >
          Start Test
        </button>
        <div
          class="log-random"
          v-html="logRandom"
        />
      </div>
      <div>
        <div>
          <b>Test Results:</b> <span
            class="time-result time-total-1"
            v-html="timeResults[0]"
          />
        </div>
        <div>
          Previous1: <span
            class="time-result time-total-2"
            v-html="timeResults[1]"
          />
        </div>
        <div>
          Previous2: <span
            class="time-result time-total-3"
            v-html="timeResults[2]"
          />
        </div>
        <div>
          <b>Average:</b> <span
            class="time-result time-total-a"
            v-html="timeAvg"
          />
        </div>
      </div>
      <div>
        <label>
          frozenColumn:
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
          frozenRow:
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
            v-model="sortOnInit"
            type="checkbox"
            class="cb_sortOnInit"
            @change="render"
          >
          sortOnInit
        </label>

        <button
          class="bt-delete"
          @click="deleteSelectedRows"
        >
          Delete Selected Rows
        </button>
      </div>
      <div>
        <div><b>Benchmark</b> (Intel i7-8700T 2.4GHz, 16.0GB, Win10 x64)</div>
      </div>
      <div class="benchmark">
        <div>
          <b>Chrome</b>
          <div>v83</div>
        </div>
        <div class="red">
          <div
            class="benchmark-cr"
            @click="setBenchmark('10 x 3m')"
          >
            10 x 3m
          </div>
          <div>1,611ms</div>
        </div>
        <div class="orange">
          <div
            class="benchmark-cr"
            @click="setBenchmark('10 x 2m')"
          >
            10 x 2m
          </div>
          <div>1,086ms</div>
        </div>
        <div class="green">
          <div
            class="benchmark-cr"
            @click="setBenchmark('10 x 100k')"
          >
            10 x 100k
          </div>
          <div>90ms</div>
        </div>
        <div class="benchmark-spacing" />
        <div>
          <b>FireFox</b>
          <div>v77</div>
        </div>
        <div class="red">
          <div
            class="benchmark-cr"
            @click="setBenchmark('10 x 5m')"
          >
            10 x 5m
          </div>
          <div>1,335ms</div>
        </div>
        <div class="orange">
          <div
            class="benchmark-cr"
            @click="setBenchmark('10 x 4m')"
          >
            10 x 4m
          </div>
          <div>957ms</div>
        </div>
        <div class="green">
          <div
            class="benchmark-cr"
            @click="setBenchmark('10 x 300k')"
          >
            10 x 300k
          </div>
          <div>105ms</div>
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
const reportList = ref([]);
const previousData = ref(null);
const columns = ref('10');
const rows = ref('10k');
const hasSubs = ref(false);
const frozenColumn = ref(-1);
const frozenRow = ref(-1);
const frozenBottom = ref(false);
const rowNumberVisible = ref(false);
const selectVisible = ref(false);
const sortOnInit = ref(false);
const logRandom = ref('');
const timeResults = ref([]);
const timeAvg = ref('');

const getColor = function(v) {
    v = parseInt(`${v}`);
    if (v <= 120) {
        return `<span class="green">${v}ms</span>`;
    }
    if (v <= 1200) {
        return `<span class="orange">${v}ms</span>`;
    }
    return `<span class="red">${v}ms</span>`;
};

const updateReport = function() {
    if (reportList.value.length > 3) {
        reportList.value.length = 3;
    }

    let total = 0;
    reportList.value.forEach(function(item) {
        total += item;
    });

    timeResults.value = reportList.value.map(getColor);
    const avg = reportList.value.length ? total / reportList.value.length : 0;
    timeAvg.value = getColor(avg);
};

const getRandomData = function() {
    const time_random = new Date();
    const data = randomData(`${columns.value}x${rows.value}-${hasSubs.value ? 'subs' : 'no-subs'}`);
    const duration = getColor(new Date() - time_random);

    logRandom.value = `generated data (${columns.value}x${rows.value} cached) cost: <b>${duration}</b>`;

    if (data !== previousData.value) {
        reportList.value = [];
    }
    previousData.value = data;

    return data;
};

const renderGrid = function() {
    if (grid.value) {
        grid.value.destroy();
    }

    const newGrid = new Grid(gridContainer.value);
    grid.value = newGrid;

    newGrid.bind('onFirstUpdated', function() {
        reportList.value.unshift(this.renderDuration);
        updateReport();
    });

    newGrid.bind('onSelectChanged', function(e, d) {
        console.log('onSelectChanged', d.length);
    });

    const options = {
        theme: route.query.theme || 'default',
        rowNumberVisible: rowNumberVisible.value,
        frozenColumn: frozenColumn.value,
        frozenRow: frozenRow.value,
        frozenBottom: frozenBottom.value,
        selectVisible: selectVisible.value,
        bindWindowResize: true
    };
    if (sortOnInit.value) {
        options.sortOnInit = true;
        options.sortField = 'index';
        options.sortAsc = false;
    }
    newGrid.setOption(options);

    const data = getRandomData();
    newGrid.setData(data);

    newGrid.render();
};

const render = function() {
    if (!grid.value) {
        return;
    }
    grid.value.showLoading();

    setTimeout(function() {
        renderGrid();
    });
};

const deleteSelectedRows = function() {
    if (!grid.value) {
        return;
    }

    const now = new Date().getTime();
    const selectedRows = grid.value.getSelectedRows();
    if (!selectedRows.length) {
        console.log('Nothing selected');
        return;
    }

    grid.value.deleteRow(selectedRows);
    console.log(`${selectedRows.length} row(s) be removed.`);
    console.log(`delete cost:${new Date().getTime() - now}ms`);
};

const setBenchmark = function(value) {
    const arr = value.split(' x ');
    columns.value = arr[0];
    rows.value = arr[1];
};

onMounted(() => {
    init();
    grid.value = new Grid(gridContainer.value);

    initCommonEvents(grid.value);

    render();
});

onBeforeUnmount(() => {
    if (grid.value) {
        grid.value.destroy();
        grid.value = null;
    }
});
</script>

<style lang="scss">
.pt-columns {
    width: 50px;
}

.pt-rows {
    width: 100px;
}

.red {
    color: red;
}

.orange {
    color: orange;
}

.green {
    color: green;
}

.benchmark {
    .red,
    .orange,
    .green {
        padding: 0 5px;
        border-left: 1px solid #ccc;
    }
}

.benchmark-spacing {
    width: 20px;
}

.benchmark-cr {
    cursor: pointer;
}
</style>
