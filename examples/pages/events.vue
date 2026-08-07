<template>
  <div class="main">
    <div class="controller">
      <div class="controller-header">
        <div class="controller-title">
          Grid Events Example:
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
        <div class="events-column">
          <div>
            Bind Events: <button
              title="remove"
              class="bt-event-remove"
              @click="removeEvents"
            >
              &gt;&gt;
            </button>
          </div>
          <select
            v-model="bindSelected"
            multiple="multiple"
            class="event-list event-list-bind"
            @dblclick="removeEvents"
          >
            <option
              v-for="type in bindList"
              :key="type"
              :value="type"
            >
              {{ type }}
            </option>
          </select>
        </div>
        <div class="events-column">
          <div>
            Unbind Events: <button
              title="add"
              class="bt-event-add"
              @click="addEvents"
            >
              &lt;&lt;
            </button>
          </div>
          <select
            v-model="unbindSelected"
            multiple="multiple"
            class="event-list event-list-unbind"
            @dblclick="addEvents"
          >
            <option
              v-for="type in unbindList"
              :key="type"
              :value="type"
            >
              {{ type }}
            </option>
          </select>
        </div>
        <div class="events-column">
          <div>
            Event logs <button
              class="bt-clear"
              @click="clearLogs"
            >
              Clear Logs
            </button>
          </div>
          <div class="log-container">
            <div
              ref="logContent"
              class="log-content"
            />
          </div>
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
    ref, onMounted, onBeforeUnmount
} from 'vue';
import { useRoute } from 'vue-router';
import { Grid } from '../../src/index.js';
import { sampleData, randomData } from '../assets/sample-data.js';
import {
    init, initCommonEvents, appendLog
} from '../global.js';
const route = useRoute();


const gridContainer = ref(null);
const grid = ref(null);
const dataStr = ref('sample-data');
const logContent = ref(null);
const bindList = ref([]);
const unbindList = ref([]);
const bindSelected = ref([]);
const unbindSelected = ref([]);

const currentBind = {
    onScroll: true,
    onSort: true,
    onClick: true,
    onUpdated: true,
    onFirstUpdated: true,
    onSelectChanged: true
};

const bindEvents = function() {
    grid.value.unbind('.tge');
    bindList.value.forEach(function(type) {
        grid.value.bind(`${type}.tge`, function(e, d) {
            appendLog(type, d);
        });
    });
};

const drawEventList = function() {
    const events = grid.value.getAllEvents();
    console.log(events);
    bindList.value = events.filter((type) => currentBind[type]);
    unbindList.value = events.filter((type) => !currentBind[type]);
    bindEvents();
};

const toggleBind = function(list, toBind) {
    list.value.forEach((k) => {
        currentBind[k] = toBind;
    });
    drawEventList();
};

const addEvents = () => {
    toggleBind(unbindSelected, true);
};

const removeEvents = () => {
    toggleBind(bindSelected, false);
};

const clearLogs = () => {
    logContent.value.innerHTML = '';
};

const renderData = function(data) {
    grid.value.setOption({
        bindWindowResize: true,
        theme: route.query.theme || 'default',
        selectVisible: true,
        frozenColumn: 0,
        frozenRow: 1
    });

    data.columns[0].type = 'tree';
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

onMounted(() => {
    init();
    grid.value = new Grid(gridContainer.value);

    grid.value.bind('onFirstUpdated', function() {
        console.log('duration:', `${this.renderDuration}ms`);
    });

    initCommonEvents(grid.value);

    drawEventList();

    render();
});

onBeforeUnmount(() => {
    if (grid.value) {
        grid.value.destroy();
        grid.value = null;
    }
});
</script>
