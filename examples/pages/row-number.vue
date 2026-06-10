<template>
    <div class="main flex-auto flex-column">
        <div class="controller">
            <div>
                <div class="controller-title">Grid Row Number:</div>
                <select class="st-data">
                    <option>sample-data</option>
                    <option>random-3x10</option>
                    <option>random-100x2k</option>
                </select>
            </div>
            <div>

                <label>
                    <input type="checkbox" class="cb_rowNumberVisible" checked />
                    rowNumberVisible
                </label>


                <label>
                    <input type="checkbox" class="cb_selectVisible" />
                    selectVisible
                </label>

                <label>
                    <input type="checkbox" class="cb_selectAllVisible" />
                    selectAllVisible
                </label>

                <label>
                    <input type="checkbox" class="cb_rowDragVisible" />
                    rowDragVisible
                </label>

                <label>
                    <input type="checkbox" class="cb_collapseAllVisible" />
                    collapseAllVisible
                </label>
            </div>
        </div>
        <div ref="gridContainer" class="grid-container flex-auto"></div>
    </div>
</template>

<script setup>
import {
    onMounted, onBeforeUnmount, ref
} from 'vue';
import { Grid } from '../../src/index.js';
import { sampleData } from '../data/sample-data.js';
import { randomData } from '../data/random-data.js';
import { initCommonEvents } from '../global.js';

const gridContainer = ref(null);
const grid = ref(null);

const onResize = () => {
    if (grid.value) {
        grid.value.resize();
    }
};

onMounted(() => {
    const g = new Grid(gridContainer.value);
    grid.value = g;

    g.bind('onFirstUpdated', function() {
        console.log('duration:', `${this.renderDuration}ms`);
    });

    const renderData = (data) => {
        const options = {
            theme: document.querySelector('.st-theme').value,
            rowNumberVisible: document.querySelector('.cb_rowNumberVisible').checked,
            collapseAllVisible: document.querySelector('.cb_collapseAllVisible').checked,
            selectVisible: document.querySelector('.cb_selectVisible').checked,
            selectAllVisible: document.querySelector('.cb_selectAllVisible').checked,
            rowDragVisible: document.querySelector('.cb_rowDragVisible').checked,
            frozenColumn: 0,
            frozenRow: 1
        };

        g.setOption(options);
        g.setData(data);
        g.render();
    };

    const render = () => {
        const dataStr = document.querySelector('.st-data').value;

        if (dataStr.startsWith('random')) {
            renderData(randomData(dataStr));
            return;
        }

        renderData(sampleData);
    };

    ['.st-data', '.st-theme', '.cb_rowNumberVisible', '.cb_collapseAllVisible', '.cb_selectVisible', '.cb_selectAllVisible', '.cb_rowDragVisible'].forEach(function(item) {
        document.querySelector(item).addEventListener('change', function() {
            render();
        });
    });

    initCommonEvents(g);

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
</style>
