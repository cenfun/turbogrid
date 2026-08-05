<template>
  <div class="main">
    <div class="controller">
      <div class="controller-header">
        <div class="controller-title">
          Vue Component
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
    shallowReactive, ref, onMounted, onBeforeUnmount, watch, nextTick
} from 'vue';
import { useRoute } from 'vue-router';
import { mount, VuiIcon } from 'vine-ui';
const route = useRoute();


// ====================================================================

const gridData = shallowReactive({
    data: null,
    options: null
});

const gridContainer = ref(null);
const grid = ref(null);

let onResize;

const onDataChange = () => {
    const dataStr = document.querySelector('.st-data').value;
    if (dataStr.startsWith('random')) {
        renderData(randomData(dataStr));
        return;
    }
    renderData(sampleData());
};

const renderData = (data) => {
    const column1 = data.columns[1];
    column1.name = 'Sync';
    column1.formatter = 'vue-sync';

    const column2 = data.columns[2];
    column2.name = 'Async';
    column2.formatter = 'vue-async';

    gridData.data = data;
    gridData.options = {
        theme: route.query.theme,
        frozenColumn: 0,
        frozenRow: 1
    };
};

const renderGrid = () => {
    if (!grid.value) {
        return;
    }
    grid.value.setData(gridData.data);
    grid.value.setOption(gridData.options);
    grid.value.render();
};

onMounted(() => {
    init();
    const container = gridContainer.value;

    const g = new Grid(container);
    grid.value = g;

    g.bind('onFirstUpdated', function(e, d) {
        console.log('render-complete', d);
    });

    g.setFormatter({
        'vue-sync': function(v, r, c) {
            const div = document.createElement('div');
            div.title = v;
            div.style.display = 'flex';
            div.style.height = '100%';
            div.style.alignItems = 'center';
            mount(VuiIcon, {
                el: div,
                props: {
                    icon: 'info'
                }
            });
            return div;
        },
        'vue-async': function(v, r, c) {
            const id = `${this.id}-c-${c.tg_index}-r-${r.tg_index}`;
            nextTick(function() {
                const target = container.querySelector(`.${id}`);
                if (target) {
                    target.title = v;
                    target.style.display = 'flex';
                    target.style.height = '100%';
                    target.style.alignItems = 'center';
                    mount(VuiIcon, {
                        el: target,
                        props: {
                            icon: 'info'
                        }
                    });
                }
            });
            return `<div class="${id}"></div>`;
        }
    });

    initCommonEvents(g);

    onResize = () => {
        g.resize();
    };
    window.addEventListener('resize', onResize);

    // Re-render when gridData changes
    watch(gridData, () => {
        renderGrid();
    });

    // Initial render
    const dataStr = document.querySelector('.st-data').value;
    if (dataStr.startsWith('random')) {
        renderData(randomData(dataStr));
    } else {
        renderData(sampleData());
    }
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', onResize);
    if (grid.value) {
        grid.value.destroy();
    }
});
</script>
