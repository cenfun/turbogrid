<template>
  <div class="main">
    <div class="controller">
      <div class="controller-header">
        <div class="controller-title">
          Grid row move:
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
            v-model="rowMoveCrossLevel"
            type="checkbox"
            class="cb_rowMoveCrossLevel"
            @change="render"
          >
          rowMoveCrossLevel
        </label>


        <label>
          <input
            v-model="selectMultiple"
            type="checkbox"
            class="cb_selectMultiple"
            @change="render"
          >
          selectMultiple
        </label>

        <input
          v-model="keywords"
          type="text"
          placeholder="keywords"
          class="ip-keywords"
          @keyup="updateGrid"
        >
      </div>
      <div>
        <button>moveRows(["level_0"], -1)</button>
        <button>moveRows(["level_0"], 1)</button>
        <button>moveRows(["level_0"], -10)</button>
        <button>moveRows(["level_0"], 10)</button>

        <button>moveRows("level_3_3", -2)</button>
        <button>moveRows("level_3_3", 2)</button>
        <button>moveRows("level_3_3", -3)</button>
        <button>moveRows("level_3_3", 3)</button>
      </div>
      <div>
        <button>moveRowsToTop(["level_0"])</button>
        <button>moveRowsUp(["level_0"])</button>
        <button>moveRowsDown(["level_0"])</button>
        <button>moveRowsToBottom(["level_0"])</button>
      </div>
      <div>
        <button class="tg-icon moveToTop">
          <VuiIcon
            icon="double-up"
            size="12px"
          />
          moveSelectedRowsToTop()
        </button>
        <button class="tg-icon moveUp">
          <VuiIcon
            icon="up"
            size="12px"
          />
          moveSelectedRowsUp()
        </button>
        <button class="tg-icon moveDown">
          <VuiIcon
            icon="down"
            size="12px"
          />
          moveSelectedRowsDown()
        </button>
        <button class="tg-icon moveToBottom">
          <VuiIcon
            icon="double-down"
            size="12px"
          />
          moveSelectedRowsToBottom()
        </button>
      </div>
      <div>
        <div>onRowMoved: <span class="onRowMoved">{{ rowMovedCount }}</span></div>
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
import { VuiIcon } from 'vine-ui';
const route = useRoute();


const gridContainer = ref(null);
const grid = ref(null);
const keywords = ref('');
const dataStr = ref('sample-data');
const rowMoveCrossLevel = ref(true);
const selectMultiple = ref(true);
const rowMovedCount = ref(0);

const renderData = (data) => {
    const options = {
        theme: route.query.theme,
        rowMoveCrossLevel: rowMoveCrossLevel.value,
        selectMultiple: selectMultiple.value,
        bindWindowResize: true,
        selectVisible: true,
        frozenColumn: 0,
        rowFilter: (rowItem) => {
            if (!keywords.value) {
                return true;
            }
            if (rowItem.tg_frozen) {
                return true;
            }
            let name = rowItem.name || rowItem.c0;
            if (name) {
                name = name.toLowerCase();
                if (name.indexOf(keywords.value) !== -1) {
                    return true;
                }
            }
            return false;
        }
    };
    grid.value.setFormatter({
        string: function(value, rowItem, columnItem, cellNode) {
            if (columnItem.id === 'name') {
                if (!rowItem.tg_random) {
                    rowItem.tg_random = Math.random().toString().substr(2, 3);
                }
                return `${value} (${rowItem.tg_random})`;
            }
            return value;
        }
    });
    grid.value.setOption(options);
    grid.value.setData(data);
    grid.value.render();
    console.log('grid render');
};

const render = () => {
    if (dataStr.value.startsWith('random')) {
        renderData(randomData(dataStr.value));
        return;
    }
    renderData(sampleData());
};

const updateGrid = () => {
    if (grid.value) {
        grid.value.update();
    }
};

onMounted(() => {
    init();
    const g = new Grid(gridContainer.value);
    grid.value = g;

    g.bind('onFirstUpdated', function(e, d) {
        console.log('duration:', `${this.renderDuration}ms`);
        console.log(`event: ${e.type}`, d);
    });

    g.bind('onRowMoved', function(e, d) {
        console.log(`event: ${e.type}`, d);
        rowMovedCount.value = d.length;
    });

    g.bind('onUpdated', function(e, d) {
        console.log(`event: ${e.type}`, d);
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

<style lang="scss">
.tg-icon {
    display: flex;
    flex-direction: row;
    align-items: center;

    .vui-icon {
        margin-right: 5px;
    }
}
</style>
