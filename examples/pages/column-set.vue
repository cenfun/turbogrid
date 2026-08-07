<template>
  <div class="main">
    <div class="controller">
      <div class="controller-header">
        <div class="controller-title">
          Grid Column Set Example:
        </div>
        <select
          v-model="dataStr"
          class="st-data"
          @change="render"
        >
          <option>sample-data</option>
          <option>random-10x10</option>
          <option>random-10x2k</option>
        </select>
      </div>
      <div>
        <button
          class="bt-set"
          @click="showPopover"
        >
          <VuiIcon
            icon="setting"
            size="20px"
          />
          Column Set
        </button>
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
    ref, onMounted, onBeforeUnmount, reactive
} from 'vue';
import { useRoute } from 'vue-router';
import { Grid } from '../../src/index.js';
import { sampleData, randomData } from '../assets/sample-data.js';
import { init, initCommonEvents } from '../global.js';
import { mount, VuiIcon } from 'vine-ui';
import ColumnSetPopover from '../components/column-set-popover.vue';
const route = useRoute();

const gridContainer = ref(null);
const grid = ref(null);
const popoverApp = ref(null);
const dataStr = ref('sample-data');

const renderData = (data) => {
    const options = {
        bindWindowResize: true,
        theme: route.query.theme,
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
    const d = sampleData();
    renderData(d);
};

const state = reactive({
    visible: false,
    target: null,
    list: null
});

const showPopover = (e) => {
    if (state.visible) {
        state.visible = false;
        return;
    }
    state.visible = true;
    state.target = e.currentTarget;
    state.list = grid.value.exportData().columns;
};

onMounted(() => {
    init();
    grid.value = new Grid(gridContainer.value);

    grid.value.bind('onFirstUpdated', function() {
        console.log('duration:', `${this.renderDuration}ms`);
    });

    popoverApp.value = mount(ColumnSetPopover, {
        props: {
            state,
            theme: route.query.theme,
            onVisibleChange: function(visible) {
                state.visible = visible;
            },
            onChange: function(list) {
                const data = grid.value.getData();
                data.columns = list;
                grid.value.setData(data);
                grid.value.render();
            }
        }
    });

    initCommonEvents(grid.value);

    render();
});

onBeforeUnmount(() => {
    if (popoverApp.value) {
        popoverApp.value.unmount();
    }
    if (grid.value) {
        grid.value.destroy();
    }
});
</script>

<style lang="scss">
.bt-set,
.column-set-content button {
    display: flex;
    flex-direction: row;
    align-items: center;
    cursor: pointer;
}

.bt-set {
    .vui-icon {
        margin-right: 5px;
    }
}

.column-set-content {
    button .vui-icon {
        margin-right: 5px;
    }

    button,
    input {
        margin-right: 5px;
    }
}

button svg {
    display: block;
    width: 20px;
    height: 20px;
    margin-right: 3px;
}

.column-set-grid {
    height: 350px;
}

.column-set-action {
    display: flex;
    flex-direction: row;
    margin-top: 10px;
}
</style>
