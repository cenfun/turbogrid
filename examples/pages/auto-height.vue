<template>
    <div class="main flex-auto flex-column">
        <div class="controller">
            <div>
                <div class="controller-title">Grid auto height example:</div>
                <select class="st-data">
                    <option>sample-data</option>
                    <option>random-3x10</option>
                    <option>random-10x100</option>
                    <option>no-rows</option>
                </select>
            </div>
            <div>
                <label>
                    <input type="checkbox" checked class="cb_autoHeight" />
                    autoHeight
                </label>
                <label>
                    <input type="checkbox" checked class="cb_collapseAllOnInit" />
                    collapseAllOnInit
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
import { Grid } from 'turbogrid';
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
        gridContainer.value.style.height = '';

        const options = {
            theme: document.querySelector('.st-theme').value,
            autoHeight: document.querySelector('.cb_autoHeight').checked,
            collapseAllOnInit: document.querySelector('.cb_collapseAllOnInit').checked,
            frozenColumn: 0,
            frozenRow: -1,
            rowNotFound: '没有找到任何结果'
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
        if (dataStr === 'no-rows') {
            renderData({
                columns: randomData('random-10x10').columns,
                rows: []
            });
            return;
        }
        renderData(sampleData);
    };

    ['.st-data', '.st-theme', '.cb_autoHeight', '.cb_collapseAllOnInit'].forEach(function(item) {
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
.main {
    display: block;
    overflow-y: auto;
}
</style>
