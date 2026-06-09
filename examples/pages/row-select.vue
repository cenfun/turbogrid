<template>
    <div class="main flex-auto flex-column">
        <div class="controller">
            <div>
                <div class="controller-title">Grid row select API:</div>
                <select class="st-data">
                    <option>random-10x20</option>
                    <option>random-10x1k</option>
                    <option>random-20x20k</option>
                    <option>sample-data</option>
                </select>
            </div>
            <div>


                <label>
                    <input type="checkbox" checked class="cb_selectMultiple" />
                    selectMultiple
                </label>

                <label >
                    <input type="checkbox" checked class="cb_selectVisible" />
                    selectVisible
                </label>

                <label>
                    <input type="checkbox" checked class="cb_selectAllVisible" />
                    selectAllVisible
                </label>

                <label>
                    selectAllOnInit
                    <select class="st_selectAllOnInit">
                        <option>null</option>
                        <option>true</option>
                        <option>false</option>
                    </select>
                </label>

            </div>
            <div>
                <input type="text" value="" placeholder="keywords" class="ip-keywords" />
                rowFilter
            </div>
            <div>
                <button>selectAll()</button>
                <button>selectAll(false)</button>
            </div>
            <div>
                <button>setRowSelected(7)</button>
                <button>setRowSelected(7, false)</button>
                <button>setRowSelected(8)</button>
                <button>setRowSelected(8, false)</button>
                <button>setRowSelected(9,{"shiftKey":true})</button>

                <button>setRowSelected([5,6])</button>
                <button>setRowSelected([5,6],false)</button>
                <button>setRowSelected(9,{"shiftKey":true})</button>
            </div>
            <div>
                <button>getSelectedRow()</button>
                <button>getSelectedRows()</button>
            </div>
            <div>
                <div>onSelectChanged: <span class="onSelectChanged"></span></div>
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

    g.bind('onCellUpdated onHeaderUpdated', function(e, d) {
        const node = d.node;
        const classList = node.classList;
        node.addEventListener('animationend', function() {
            classList.remove('tg-blink');
        });
        classList.add('tg-blink');
    });

    g.bind('onClick', function(e, d) {
        this.setRowSelected(d.rowItem, d.e);
    });

    g.bind('onSelectChanged', function(e, d) {
        console.log('onSelectChanged', d);
        document.querySelector('.onSelectChanged').innerHTML = d.length;
    });

    const renderData = (data) => {
        document.querySelector('.onSelectChanged').innerHTML = '';

        let selectAllOnInit = document.querySelector('.st_selectAllOnInit').value;
        const selectAllOnInitMap = {
            'null': null,
            'true': true,
            'false': false
        };
        selectAllOnInit = selectAllOnInitMap[selectAllOnInit];

        const options = {
            theme: document.querySelector('.st-theme').value,
            selectVisible: document.querySelector('.cb_selectVisible').checked,
            selectMultiple: document.querySelector('.cb_selectMultiple').checked,
            selectAllVisible: document.querySelector('.cb_selectAllVisible').checked,
            selectAllOnInit: selectAllOnInit,
            frozenColumn: 0,
            frozenRow: 1,
            rowFilter: (rowItem) => {
                if (!keywords.value) {
                    return true;
                }
                if (rowItem.tg_frozen) {
                    return true;
                }
                let name = rowItem.name || rowItem.c0;
                if (name) {
                    name = name.toLowerCase();
                    if (name.indexOf(keywords.value) !== -1) {
                        return true;
                    }
                }
                return false;
            }
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

    document.querySelector('.ip-keywords').addEventListener('keyup', () => {
        const k = document.querySelector('.ip-keywords').value;
        if (k === keywords.value) {
            return;
        }
        keywords.value = k;
        g.update();
    });

    ['.st-data', '.st-theme', '.cb_selectVisible', '.cb_selectMultiple', '.cb_selectAllVisible', '.st_selectAllOnInit'].forEach(function(item) {
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
