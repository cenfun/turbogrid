<template>
  <div class="main">
    <div class="controller">
      <div class="controller-header">
        <div class="controller-title">
          Grid frozen row/column example:
        </div>
        <select
          v-model="dataStr"
          class="st-data"
          @change="render"
        >
          <option>sample-data</option>
          <option>random-3x10</option>
          <option>random-3x30</option>
          <option>random-100x20k</option>
          <option>frozen_right</option>
        </select>
      </div>
      <div>
        <label>
          frozenColumn
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
          <input
            v-model="frozenRight"
            type="checkbox"
            class="cb_frozenRight"
            @change="render"
          >
          frozenRight
        </label>

        <label>
          frozenRow
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
            v-model="frozenRowHoverable"
            type="checkbox"
            class="cb_frozenRowHoverable"
            @change="render"
          >
          frozenRowHoverable
        </label>
      </div>
      <div>
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
            v-model="rowNumberVisible"
            type="checkbox"
            class="cb_rowNumberVisible"
            @change="render"
          >
          rowNumberVisible
        </label>

        <label>
          <input
            v-model="rowDragVisible"
            type="checkbox"
            class="cb_rowDragVisible"
            @change="render"
          >
          rowDragVisible
        </label>

        <label>
          <input
            v-model="autoHeight"
            type="checkbox"
            class="cb_autoHeight"
            @change="render"
          >
          autoHeight
        </label>
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


const frozenRightData = {
    options: {
        frozenRight: true
    },
    columns: [{
        id: 'action',
        name: 'Action',
        width: 120,
        formatter: function(value, rowItem, columnItem) {
            if (rowItem.tg_frozen) {
                return '';
            }
            return `
                <a href="#">Add</a>
                <a href="#">Delete</a>
                <a href="#">Edit</a>
            `;
        }
    }, {
        id: 'name',
        width: 180,
        name: 'Name'
    }, {
        name: 'DataPoint'
    }, {
        name: 'DataPoint'
    }, {
        name: 'Group',
        subs: [{
            name: 'DataPoint'
        }, {
            name: 'DataPoint'
        }]
    }, {
        name: 'Group',
        subs: [{
            name: 'DataPoint'
        }, {
            name: 'DataPoint'
        }]
    }, {
        name: 'Group',
        subs: [{
            name: 'DataPoint'
        }, {
            name: 'DataPoint'
        }]
    }, {
        name: 'Group',
        subs: [{
            name: 'DataPoint'
        }, {
            name: 'DataPoint'
        }]
    }, {
        name: 'Group',
        subs: [{
            name: 'DataPoint'
        }, {
            name: 'DataPoint'
        }]
    }],

    rowsLength: 200
};

const gridContainer = ref(null);
const grid = ref(null);
const dataStr = ref('sample-data');
const selectVisible = ref(false);
const rowNumberVisible = ref(false);
const rowDragVisible = ref(false);
const frozenRight = ref(false);
const frozenBottom = ref(false);
const frozenRowHoverable = ref(false);
const frozenColumn = ref(0);
const frozenRow = ref(1);
const autoHeight = ref(false);

const renderData = (data) => {
    const options = {
        bindWindowResize: true,
        theme: route.query.theme,
        selectVisible: selectVisible.value,
        rowNumberVisible: rowNumberVisible.value,
        rowDragVisible: rowDragVisible.value,
        frozenRight: frozenRight.value,
        frozenBottom: frozenBottom.value,
        frozenRowHoverable: frozenRowHoverable.value,
        frozenColumn: frozenColumn.value,
        frozenRow: frozenRow.value,
        autoHeight: autoHeight.value
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

    if (dataStr.value === 'frozen_right') {
        renderData(frozenRightData);
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

    initCommonEvents(grid.value);

    render();
});

onBeforeUnmount(() => {
    if (grid.value) {
        grid.value.destroy();
    }
});
</script>
