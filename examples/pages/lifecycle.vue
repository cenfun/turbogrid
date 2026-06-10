<template>
    <div class="main flex-auto flex-column">
        <div class="controller">
            <div>
                <div class="controller-title">Grid update/render API</div>
                <select class="st-data">
                    <option>random-20x100</option>
                    <option>random-20x5k</option>
                    <option>sample-data</option>
                </select>
            </div>
            <div>
                <label for="cb_selectMultiple">
                    <input type="checkbox" checked id="cb_selectMultiple" class="cb_selectMultiple" />
                    selectMultiple
                </label>
            </div>
            <div>
                <button>render()</button>
                <button class="data-render">setData + render</button>
                <button class="option-render">setOption + render</button>
                <button class="formatter-render">setFormatter + render</button>
            </div>
            <div>
                <button>update()</button>

                <button>updateRow(3)</button>
                <button>updateRow(3, {"name":"New Name", "index":"100", "c0": "New Value"})</button>

                <button>updateCell(3,1)</button>
                <button>updateCell(3,1,"New Cell Name")</button>
                <button>updateCell(3,2,1000)</button>
                <button>updateCell(3,3,"New Cell Value")</button>
            </div>

            <div>
                <button>flushRow(5)</button>
                <button>flushRow([7,8])</button>
                <button>flushRowFrom(10)</button>
                <button>flushCell(6,1)</button>
                <button>flushCell([6,9],[3,4])</button>

                <button>flushColumn(2)</button>
                <button>flushColumn([3,4])</button>
                <button>flushColumnFrom(6)</button>
                <button>flushBody()</button>
            </div>

            <div>
                <button>rerender()</button>
                <button>destroy()</button>
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
import { sampleData } from '../assets/sample-data.js';
import { randomData } from '../assets/random-data.js';
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

    g.bind('onCellUpdated onHeaderUpdated', function(e, d) {
        const node = d.node;
        const classList = node.classList;
        node.addEventListener('animationend', function() {
            classList.remove('tg-blink');
        });
        classList.add('tg-blink');
    });

    const renderData = function(data) {
        const options = {
            theme: document.querySelector('.st-theme') ? document.querySelector('.st-theme').value : 'default',
            selectMultiple: document.querySelector('.cb_selectMultiple').checked,
            selectVisible: true,
            frozenColumn: 0,
            frozenRow: 1
        };
        g.setOption(options);

        g.setData(data);
        g.render();
    };

    function render() {
        const dataStr = document.querySelector('.st-data').value;

        if (dataStr.startsWith('random')) {
            renderData(randomData(dataStr));
            return;
        }

        renderData(sampleData);
    }

    document.querySelector('.data-render').addEventListener('click', function() {
        if (!g) {
            return;
        }
        const data = randomData('20x100');
        g.setData(data);
        g.render();
    });

    document.querySelector('.option-render').addEventListener('click', function() {
        if (!g) {
            return;
        }
        g.setOption({
            theme: document.querySelector('.st-theme') ? document.querySelector('.st-theme').value : 'default',
            selectVisible: true,
            rowHeight: 26
        });
        g.render();
    });

    document.querySelector('.formatter-render').addEventListener('click', function() {
        if (!g) {
            return;
        }
        g.setFormatter({
            string: function(value, rowItem, columnItem) {
                if (columnItem.id === 'index') {
                    return `${value} (formatted)`;
                }
                return value;
            },
            number: function(value, rowItem, columnItem) {
                if (columnItem.id === 'index') {
                    return `${value} (formatted)`;
                }
                return value;
            }
        });
        g.render();
    });

    ['.st-data', '.st-theme', '.cb_selectMultiple'].forEach(function(item) {
        const el = document.querySelector(item);
        if (el) {
            el.addEventListener('change', function() {
                render();
            });
        }
    });

    initCommonEvents(g);

    window.addEventListener('resize', onResize);

    render();
});

onBeforeUnmount(() => {
    if (grid.value) {
        grid.value.destroy();
        grid.value = null;
    }
    window.removeEventListener('resize', onResize);
});
</script>

<style scoped>
</style>
