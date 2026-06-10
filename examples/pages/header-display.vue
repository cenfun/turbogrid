<template>
    <div class="main flex-auto flex-column">
        <div class="controller">
            <div>
                <div class="controller-title">Grid header display</div>
                <select class="st-data">
                    <option>sample-data</option>
                    <option>random-3x10</option>
                    <option>random-100x20k</option>
                </select>
            </div>
            <div>
                <label>
                    <input type="checkbox" class="cb_headerVisible" />
                    headerVisible
                </label>
            </div>
        </div>
        <div ref="gridContainer" class="grid-container flex-auto"></div>
    </div>
</template>

<script setup>
import {
    ref, onMounted, onBeforeUnmount
} from 'vue';
import { Grid } from '../../src/index.js';
import { sampleData } from '../data/sample-data.js';
import { randomData } from '../data/random-data.js';
import { initCommonEvents } from '../utils/helpers.js';

const gridContainer = ref(null);
const grid = ref(null);

const onResize = () => {
    grid.value?.resize();
};

onMounted(() => {
    grid.value = new Grid(gridContainer.value);

    grid.value.bind('onFirstUpdated', function() {
        console.log('duration:', `${this.renderDuration}ms`);
    });

    const renderData = (data) => {
        const options = {
            theme: document.querySelector('.st-theme').value,
            headerVisible: document.querySelector('.cb_headerVisible').checked,
            frozenColumn: 0,
            frozenRow: -1
        };
        grid.value.setOption(options);
        grid.value.setData(data);
        grid.value.render();
    };

    const render = () => {
        const dataStr = document.querySelector('.st-data').value;
        if (dataStr.startsWith('random')) {
            renderData(randomData(dataStr));
            return;
        }
        renderData(sampleData);
    };

    ['.st-data', '.st-theme', '.cb_headerVisible'].forEach(function(item) {
        document.querySelector(item).addEventListener('change', function() {
            render();
        });
    });

    initCommonEvents(grid.value);

    window.addEventListener('resize', onResize);

    render();
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', onResize);
    if (grid.value) {
        grid.value.destroy();
    }
});
</script>

<style scoped>
.grid-container .tg-header-item {
    border: 1px solid #080;
}
</style>
