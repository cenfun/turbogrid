<template>
  <div class="main">
    <div class="controller">
      <div class="controller-header">
        <div class="controller-title">
          Vue Integration
        </div>
        <select
          class="st-data"
          @change="onDataChange"
        >
          <option>random-5x10</option>
          <option>random-100x2k</option>
          <option>sample-data</option>
        </select>
      </div>
      <div />
    </div>
    <div
      ref="gridContainer"
      class="grid-container"
    />
  </div>
</template>

<script setup>
import { Grid } from '../../src/index.js';
import { sampleData, randomData } from '../assets/sample-data.js';
import { init, initCommonEvents } from '../global.js';
import {
    shallowReactive, ref, onMounted, onBeforeUnmount
} from 'vue';
import { useRoute } from 'vue-router';
import { mount } from 'vine-ui';
import InfoComponent from '../components/info-component.vue';
const route = useRoute();


// ====================================================================

const infoData = shallowReactive({
    selected: 0
});

// =====================================================================

const gridContainer = ref(null);
const grid = ref(null);
const infoApp = ref(null);

let infoElement;

const onDataChange = () => {
    const dataStr = document.querySelector('.st-data').value;
    if (dataStr.startsWith('random')) {
        renderData(randomData(dataStr));
        return;
    }
    renderData(sampleData());
};

const renderData = (data) => {
    if (!grid.value) {
        return;
    }
    grid.value.setOption({
        theme: route.query.theme,
        selectVisible: true,
        bindWindowResize: true
    });
    grid.value.setFormatter({
        header: function(value, rowItem, columnItem) {
            if (columnItem.id === 'name') {
                return `${value}<span class="tg-name-info"></span>`;
            }
            return value;
        }
    });
    grid.value.setData(data);
    grid.value.render();
};

onMounted(() => {
    init();
    const container = gridContainer.value;
    const g = new Grid(container);
    grid.value = g;

    const updateInfo = () => {
        infoData.selected = g.getSelectedRows().length;
        const target = container.querySelector('.tg-name-info');
        if (!target || (infoApp.value && infoElement === target)) {
            return;
        }
        if (infoApp.value) {
            infoApp.value.unmount();
        }
        infoElement = target;
        infoApp.value = mount(InfoComponent, {
            el: target,
            props: {
                info: infoData
            }
        });
    };

    g.bind('onFirstUpdated', function() {
        console.log('duration:', `${this.renderDuration}ms`);
    });

    g.bind('onUpdated', () => {
        updateInfo();
    });

    g.bind('onSelectChanged', () => {
        updateInfo();
    });

    initCommonEvents(g);

    const dataStr = document.querySelector('.st-data').value;
    if (dataStr.startsWith('random')) {
        renderData(randomData(dataStr));
    } else {
        renderData(sampleData());
    }
});

onBeforeUnmount(() => {
    if (infoApp.value) {
        infoApp.value.unmount();
        infoApp.value = null;
        infoElement = null;
    }
    if (grid.value) {
        grid.value.destroy();
    }
});
</script>

<style lang="scss">
.tg-name-info {
    margin-left: 10px;
    color: #f00;
    font-weight: bold;
}
</style>
