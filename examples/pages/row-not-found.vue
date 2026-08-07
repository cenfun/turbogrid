<template>
  <div class="main">
    <div class="controller">
      <div class="controller-header">
        <div class="controller-title">
          Grid no rows demo
        </div>
        <select
          v-model="dataStr"
          class="st-data"
          @change="render"
        >
          <option>random-3x10</option>
          <option>random-100x2k</option>
          <option>random-10x10k</option>
          <option>random-10x100k</option>
        </select>
      </div>
      <div>
        rowNotFound:
        <input
          v-model="rowNotFound"
          type="text"
          class="ip_rowNotFound"
          size="45"
          @change="render"
        >
      </div>
      <div>
        <label>frozenColumn
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
        <label>frozenRow
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
        <input
          id="cb_frozenBottom"
          v-model="frozenBottom"
          type="checkbox"
          class="cb_frozenBottom"
          @change="render"
        >
        <label for="cb_frozenBottom">frozenBottom</label>
      </div>
      <div>
        <button>addRow("New Row")</button>
      </div>
      <div>
        <input
          v-model="keywords"
          type="text"
          placeholder="keywords"
          class="ip-keywords"
          @keyup="updateGrid"
        >
        <button
          class="bt-del"
          @click="deleteSelectedRows"
        >
          delete selected rows
        </button>
        <span
          ref="messageLog"
          class="message_log"
        />
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
const dataStr = ref('random-3x10');
const rowNotFound = ref('No Results');
const frozenColumn = ref(1);
const frozenRow = ref(-1);
const frozenBottom = ref(false);
const keywords = ref('');
const messageLog = ref(null);

const renderData = function(data) {
    const options = {
        bindWindowResize: true,
        rowNotFound: rowNotFound.value,
        frozenBottom: frozenBottom.value,
        frozenColumn: frozenColumn.value,
        frozenRow: frozenRow.value,
        theme: route.query.theme,
        textSelectable: true,
        selectVisible: true,
        rowFilter: function(rowItem) {
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

    grid.value.setOption(options);
    grid.value.setData(data);
    grid.value.render();
};

function render() {
    if (dataStr.value.startsWith('random')) {
        renderData(randomData(dataStr.value));
        return;
    }
    renderData(sampleData());
}

const updateGrid = () => {
    if (grid.value) {
        grid.value.update();
    }
};

const deleteSelectedRows = () => {
    const selectedRows = grid.value.getSelectedRows();
    if (!selectedRows.length) {
        messageLog.value.innerHTML = 'Nothing selected';
        return;
    }

    grid.value.deleteRow(selectedRows);

    messageLog.value.innerHTML = `${selectedRows.length} row(s) be removed`;
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
