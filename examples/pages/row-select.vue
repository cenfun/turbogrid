<template>
  <div class="main">
    <div class="controller">
      <div class="controller-header">
        <div class="controller-title">
          Grid row select API:
        </div>
        <select
          v-model="dataStr"
          class="st-data"
          @change="render"
        >
          <option>random-10x20</option>
          <option>random-10x1k</option>
          <option>random-20x20k</option>
          <option>sample-data</option>
        </select>
      </div>
      <div>
        <label>
          <input
            v-model="selectMultiple"
            type="checkbox"
            class="cb_selectMultiple"
            @change="render"
          >
          selectMultiple
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
            v-model="selectAllVisible"
            type="checkbox"
            class="cb_selectAllVisible"
            @change="render"
          >
          selectAllVisible
        </label>

        <label>
          selectAllOnInit
          <select
            v-model="selectAllOnInit"
            class="st_selectAllOnInit"
            @change="render"
          >
            <option>null</option>
            <option>true</option>
            <option>false</option>
          </select>
        </label>
      </div>
      <div>
        <input
          v-model="keywords"
          type="text"
          placeholder="keywords"
          class="ip-keywords"
          @keyup="updateGrid"
        >
        rowFilter
      </div>
      <div>
        <button>selectAll()</button>
        <button>selectAll(false)</button>
      </div>
      <div>
        <button>setRowSelected(7)</button>
        <button>setRowSelected(7, false)</button>
        <button>setRowSelected(8)</button>
        <button>setRowSelected(8, false)</button>
        <button>setRowSelected(9,{"shiftKey":true})</button>

        <button>setRowSelected([5,6])</button>
        <button>setRowSelected([5,6],false)</button>
        <button>setRowSelected(9,{"shiftKey":true})</button>
      </div>
      <div>
        <button>getSelectedRow()</button>
        <button>getSelectedRows()</button>
      </div>
      <div>
        <div>onSelectChanged: <span class="onSelectChanged">{{ selectCount }}</span></div>
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
const dataStr = ref('random-10x20');
const selectMultiple = ref(true);
const selectVisible = ref(true);
const selectAllVisible = ref(true);
const selectAllOnInit = ref('null');
const selectCount = ref(0);

const renderData = (data) => {
    selectCount.value = '';

    const selectAllOnInitMap = {
        'null': null,
        'true': true,
        'false': false
    };

    const options = {
        bindWindowResize: true,
        theme: route.query.theme,
        selectVisible: selectVisible.value,
        selectMultiple: selectMultiple.value,
        selectAllVisible: selectAllVisible.value,
        selectAllOnInit: selectAllOnInitMap[selectAllOnInit.value],
        frozenColumn: 0,
        frozenRow: 1,
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
    if (grid.value) {
        grid.value.update();
    }
};

onMounted(() => {
    init();
    const g = new Grid(gridContainer.value);
    grid.value = g;

    g.bind('onFirstUpdated', function() {
        console.log('duration:', `${this.renderDuration}ms`);
    });

    g.bind('onCellUpdated onHeaderUpdated', function(e, d) {
        const node = d.node;
        const classList = node.classList;
        node.addEventListener('animationend', function() {
            classList.remove('tg-blink');
        });
        classList.add('tg-blink');
    });

    g.bind('onClick', function(e, d) {
        this.setRowSelected(d.rowItem, d.e);
    });

    g.bind('onSelectChanged', function(e, d) {
        console.log('onSelectChanged', d);
        selectCount.value = d.length;
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
