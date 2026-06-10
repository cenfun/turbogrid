<template>
    <div class="main flex-auto flex-column">
        <div class="controller">
            <div>
                <div class="controller-title">Grid collapse and expand API:</div>
                <select class="st-data">
                    <option>sample-data</option>
                    <option>collapsed_specified_group</option>
                    <option>random-3x10</option>
                    <option>random-100x2k</option>
                </select>
            </div>
            <div>
                <label>
                    collapseAllOnInit
                    <select class="st_collapseAllOnInit">
                        <option>null</option>
                        <option>true</option>
                        <option>false</option>
                    </select>
                </label>

                <label>
                    <input type="checkbox" checked class="cb_collapseAllVisible" />
                    collapseAllVisible
                </label>

                <label>
                    <input type="checkbox" checked class="cb_rowNumberVisible" />
                    rowNumberVisible
                </label>

            </div>
            <div>
                <button>expandAllRows()</button>
                <button>collapseAllRows()</button>
                <button>toggleAllRows()</button>
            </div>
            <div>
                <button>expandRow("level_0")</button>
                <button>collapseRow("level_0")</button>
                <button>toggleRow("level_0")</button>
            </div>
            <div>
                <button>expandRowLevel(0)</button>
                <button>expandRowLevel(1)</button>
                <button>expandRowLevel(2)</button>
                <button>expandRowLevel(3)</button>
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
import { initCommonEvents } from '../utils/helpers.js';

const gridContainer = ref(null);
const grid = ref(null);

const onResize = () => {
    grid.value.resize();
};

onMounted(() => {
    grid.value = new Grid(gridContainer.value);

    grid.value.bind('onFirstUpdated', function() {
        console.log('duration:', `${this.renderDuration}ms`);
    });

    grid.value.bind('onRowExpanded onRowCollapsed', function(e, d) {
        console.log(e.type, d);
    });

    const renderData = (data) => {
        let collapseAllOnInit = document.querySelector('.st_collapseAllOnInit').value;
        const collapseAllMap = {
            'null': null,
            'true': true,
            'false': false
        };
        collapseAllOnInit = collapseAllMap[collapseAllOnInit];

        const options = {
            theme: document.querySelector('.st-theme').value,
            collapseAllOnInit: collapseAllOnInit,
            collapseAllVisible: document.querySelector('.cb_collapseAllVisible').checked,
            rowNumberVisible: document.querySelector('.cb_rowNumberVisible').checked,
            frozenColumn: 0,
            frozenRow: 1
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

        if (dataStr === 'collapsed_specified_group') {
            const collapsedData = {
                columns: [{
                    id: 'name',
                    name: 'Name'
                }, {
                    id: 'id',
                    name: 'Id'
                }],
                rows: [{
                    id: 'group1',
                    name: 'Group 1',
                    subs: [{
                        id: 'id1',
                        name: 'row 1'
                    }, {
                        id: 'id2',
                        name: 'row 2'
                    }]
                }, {
                    id: 'group2',
                    name: 'Group 2 (collapsed = true)',
                    collapsed: true,
                    subs: [{
                        id: 'id6',
                        name: 'row 3'
                    }, {
                        id: 'id7',
                        name: 'row 4'
                    }]
                }]
            };
            renderData(collapsedData);
            return;
        }

        renderData(sampleData);
    };

    ['.st-data', '.st-theme', '.st_collapseAllOnInit', '.cb_collapseAllVisible', '.cb_rowNumberVisible'].forEach(function(item) {
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
</style>
