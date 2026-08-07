<template>
  <div class="main">
    <div class="controller">
      <div class="controller-header">
        <div class="controller-title">
          Grid row select limit:
        </div>
        <select
          v-model="dataStr"
          class="st-data"
          @change="render"
        >
          <option>random-20x100</option>
          <option>random-20x3k</option>
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
          Select Limit
          <input
            v-model.number="limit"
            type="number"
            min="1"
            class="ip_limit"
            @change="render"
          >
        </label>
        <span
          class="limitMessage"
          style="color: red;"
        >{{ limitMessage }}</span>
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
const dataStr = ref('random-20x100');
const selectMultiple = ref(true);
const limit = ref(10);
const selectCount = ref(0);
const limitMessage = ref('');

const renderData = (data) => {
    const options = {
        bindWindowResize: true,
        theme: route.query.theme,
        selectMultiple: selectMultiple.value,
        selectVisible: true,
        frozenColumn: 0
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
        console.log(d);
        selectCount.value = d.length;

        const selectedRows = this.getSelectedRows();
        const len = selectedRows.length;
        const l = limit.value;
        if (len <= l) {
            limitMessage.value = '';
            return;
        }

        limitMessage.value = `selected rows: ${len} ( > limit: ${l})`;

        d.reverse();
        d.length = len - l;

        this.setRowSelected(d, false);
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
