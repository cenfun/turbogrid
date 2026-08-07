<template>
  <div class="main">
    <div class="controller">
      <div class="controller-header">
        <div class="controller-title">
          Grid collapse and expand API:
        </div>
        <select
          v-model="dataStr"
          class="st-data"
          @change="render"
        >
          <option>sample-data</option>
          <option>collapsed_specified_group</option>
          <option>random-3x10</option>
          <option>random-100x2k</option>
        </select>
      </div>
      <div>
        <label>
          collapseAllOnInit
          <select
            v-model="collapseAllOnInit"
            class="st_collapseAllOnInit"
            @change="render"
          >
            <option>null</option>
            <option>true</option>
            <option>false</option>
          </select>
        </label>

        <label>
          <input
            v-model="collapseAllVisible"
            type="checkbox"
            class="cb_collapseAllVisible"
            @change="render"
          >
          collapseAllVisible
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
      </div>
      <div>
        <button>expandAllRows()</button>
        <button>collapseAllRows()</button>
        <button>toggleAllRows()</button>
      </div>
      <div>
        <button>expandRow("level_0")</button>
        <button>collapseRow("level_0")</button>
        <button>toggleRow("level_0")</button>
      </div>
      <div>
        <button>expandRowLevel(0)</button>
        <button>expandRowLevel(1)</button>
        <button>expandRowLevel(2)</button>
        <button>expandRowLevel(3)</button>
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
const dataStr = ref('sample-data');
const collapseAllOnInit = ref('null');
const collapseAllVisible = ref(true);
const rowNumberVisible = ref(true);

const collapseAllMap = {
    'null': null,
    'true': true,
    'false': false
};

const renderData = (data) => {
    const options = {
        bindWindowResize: true,
        theme: route.query.theme,
        collapseAllOnInit: collapseAllMap[collapseAllOnInit.value],
        collapseAllVisible: collapseAllVisible.value,
        rowNumberVisible: rowNumberVisible.value,
        frozenColumn: 0,
        frozenRow: 1
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

    if (dataStr.value === 'collapsed_specified_group') {
        const collapsedData = {
            columns: [{
                id: 'name',
                name: 'Name'
            }, {
                id: 'id',
                name: 'Id'
            }],
            rows: [{
                id: 'group1',
                name: 'Group 1',
                subs: [{
                    id: 'id1',
                    name: 'row 1'
                }, {
                    id: 'id2',
                    name: 'row 2'
                }]
            }, {
                id: 'group2',
                name: 'Group 2 (collapsed = true)',
                collapsed: true,
                subs: [{
                    id: 'id6',
                    name: 'row 3'
                }, {
                    id: 'id7',
                    name: 'row 4'
                }]
            }]
        };
        renderData(collapsedData);
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

    grid.value.bind('onRowExpanded onRowCollapsed', function(e, d) {
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
