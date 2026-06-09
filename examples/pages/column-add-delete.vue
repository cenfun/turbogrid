<template>
    <div class="main flex-auto flex-column">
        <div class="controller">
            <div>
                <div class="controller-title">Grid column add and delete:</div>
                <select class="st-data">
                    <option>sample-data</option>
                    <option>random-3x10</option>
                    <option>random-100x2k</option>
                    <option>random-1kx200</option>
                    <option>random-2kx100</option>
                </select>
            </div>
            <div>
                <button>addColumn("New Column")</button>
                <button>addColumn({"name":"Column id1","id":"id1"})</button>
                <button>addColumn(["C1", "C2"])</button>

                <button>addColumn(["id1","id2"],"c2")</button>
                <button>addColumn("End Sub","end_group")</button>

                <button>addColumn("In c1","c1")</button>
                <button>addColumn(["In c1 1","In c1 2"],"c1")</button>
            </div>
            <div>
                <button>deleteColumn("id1")</button>
                <button>deleteColumn(0)</button>
                <button>deleteColumn(1)</button>
                <button>deleteColumn(2)</button>
                <button>deleteColumn(-1)</button>
                <button>deleteColumn(-2)</button>
                <button>deleteColumn([3,5,"id1"])</button>
            </div>
            <div>
                <button>showColumn(3)</button>
                <button>hideColumn(3)</button>

                <button>exportData()</button>
            </div>
            <div>
                <div class="flex-auto flex-column flex-column-5">
                    <div>Event logs <button class="bt-clear">Clear Logs</button></div>
                    <div class="log-container">
                        <div class="log-content"></div>
                    </div>
                </div>
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
import { initCommonEvents, appendLog } from '../utils/helpers.js';

const gridContainer = ref(null);
const grid = ref(null);

const onResize = () => {
    grid.value?.resize();
};

onMounted(() => {
    grid.value = new Grid(gridContainer.value);

    grid.value.bind('onFirstUpdated', function(e, d) {
        console.log('duration:', `${this.renderDuration}ms`);
        appendLog(`event: ${e.type}`, d);
    }).bind('onColumnAdded', function(e, d) {
        appendLog(`event: ${e.type}`, d);
    }).bind('onColumnRemoved', function(e, d) {
        appendLog(`event: ${e.type}`, d);
    }).bind('onSelectChanged', function(e, d) {
        appendLog(`event: ${e.type}`, d);
    });

    const renderData = (data) => {
        const options = {
            theme: document.querySelector('.st-theme').value,
            selectVisible: true,
            frozenColumn: 0
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

    document.querySelector('.bt-clear').addEventListener('click', function() {
        document.querySelector('.log-content').innerHTML = '';
    });

    ['.st-data', '.st-theme'].forEach(function(item) {
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
