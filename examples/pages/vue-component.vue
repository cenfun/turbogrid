<template>
    <div class="main flex-auto flex-column">
        <div class="controller">
            <div>
                <div class="controller-title">Vue Component</div>
                <select class="st-data" @change="onDataChange">
                    <option>random-5x10</option>
                    <option>random-100x2k</option>
                    <option>sample-data</option>
                </select>
            </div>
            <div>

            </div>
        </div>
        <div ref="gridContainer" class="grid-container flex-auto"></div>
    </div>
</template>

<script setup>
import { Grid } from 'turbogrid';
import { sampleData } from '../data/sample-data.js';
import { randomData } from '../data/random-data.js';
import { initCommonEvents } from '../utils/helpers.js';
import {
    createApp, defineComponent, shallowReactive, ref, onMounted, onBeforeUnmount, watch, nextTick
} from 'vue';

// ====================================================================
const HoverIcon = defineComponent({
    props: ['value'],
    template: `
        <div class="hover-icon flex-row flex-row-5" :title="value">
            <div class="icon icon-info"></div>
            <div style="color:red;">{{value}}</div>
        </div>
    `
});

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
    renderData(sampleData);
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
        theme: document.querySelector('.st-theme').value,
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
    const container = gridContainer.value;

    const g = new Grid(container);
    grid.value = g;

    g.bind('onFirstUpdated', function(e, d) {
        console.log('render-complete', d);
    });

    g.setFormatter({
        'vue-sync': function(v, r, c) {
            const div = document.createElement('div');
            createApp(HoverIcon, {
                value: v
            }).mount(div);
            return div;
        },
        'vue-async': function(v, r, c) {
            const id = `${this.id}-c-${c.tg_index}-r-${r.tg_index}`;
            nextTick(function() {
                createApp(HoverIcon, {
                    value: v
                }).mount(`.${id}`);
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
        renderData(sampleData);
    }
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', onResize);
    if (grid.value) {
        grid.value.destroy();
    }
});
</script>

<style scoped>

</style>
