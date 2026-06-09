<template>
    <div class="main flex-auto flex-column">
        <div class="controller">
            <div>
                <div class="controller-title">Grid row filter</div>
                <select class="st-data">
                    <option>sample-data</option>
                    <option>random-3x10</option>
                    <option>random-100x2k</option>
                    <option>random-10x10k</option>
                    <option>random-10x100k</option>
                </select>
            </div>
            <div>
                <label>rowFilter:
                    <input type="text" value="" placeholder="keywords" class="ip-keywords" onfocus="this.select()" />
                </label>

                <label>rowFilteredSort:
                    <select class="st-rowFilteredSort">
                        <option></option>
                        <option>name</option>
                        <option>{"sortField": "name", "sortAsc": false}</option>
                    </select>
                </label>

            </div>
            <div>
                <label>
                    <input type="checkbox" class="cb-removeSortColumn" />
                    removeSortColumn on rowFilter
                </label>
            </div>
            <div>
                <button>hideRow("total")</button>
                <button>showRow("total")</button>

                <button>hideRow("top")</button>
                <button>showRow("top")</button>

                <button>hideRow(0)</button>
                <button>showRow(0)</button>

                <button>hideRow(1)</button>
                <button>showRow(1)</button>
            </div>
            <div>
                <button>getRowItem("total")</button>
                <button>getRowItem("level_1_2")</button>
                <button>getRowItem("level_3_2")</button>
                <button>getRowsLength()</button>
                <button>getRowsLength(true)</button>
            </div>
        </div>
        <div ref="gridContainer" class="grid-container flex-auto"></div>
    </div>
</template>

<script setup>
import {
    onMounted, onBeforeUnmount, ref
} from 'vue';
import { Grid } from 'turbogrid';
import { sampleData } from '../data/sample-data.js';
import { randomData } from '../data/random-data.js';
import { initCommonEvents } from '../utils/helpers.js';

const gridContainer = ref(null);
const grid = ref(null);
const keywords = ref('');

const onResize = () => {
    grid.value.resize();
};

onMounted(() => {
    grid.value = new Grid(gridContainer.value);

    grid.value.bind('onFirstUpdated', function() {
        console.log('duration:', `${this.renderDuration}ms`);
    });

    const renderData = (data) => {
        let rowFilteredSort = document.querySelector('.st-rowFilteredSort').value;
        if (rowFilteredSort.startsWith('{')) {
            rowFilteredSort = JSON.parse(rowFilteredSort);
        }

        const options = {
            theme: document.querySelector('.st-theme').value,
            frozenColumn: 0,
            frozenRow: 1,
            selectVisible: true,
            rowNotFound: '<div>Not Found</div>',
            rowFilter: (rowItem) => {
                let hasMatched = grid.value.highlightKeywordsFilter(rowItem, ['name'], keywords.value);

                if (rowItem.tg_frozen) {
                    hasMatched = true;
                }
                if (rowItem.formatter === 'blank') {
                    hasMatched = false;
                }
                return hasMatched;
            },
            rowFilteredSort
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

    document.querySelector('.ip-keywords').addEventListener('keyup', () => {
        const k = document.querySelector('.ip-keywords').value;
        if (k === keywords.value) {
            return;
        }
        keywords.value = k;

        const removeSortColumn = document.querySelector('.cb-removeSortColumn').checked;
        if (removeSortColumn) {
            grid.value.removeSortColumn();
        }

        grid.value.update();
    });

    ['.st-rowFilteredSort', '.st-data', '.st-theme'].forEach(function(item) {
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
