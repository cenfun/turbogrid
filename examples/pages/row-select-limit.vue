<template>
    <div class="main flex-auto flex-column">
        <div class="controller">
            <div>
                <div class="controller-title">Grid row select limit:</div>
                <select class="st-data">
                    <option>random-20x100</option>
                    <option>random-20x3k</option>
                </select>
            </div>
            <div>
                <label>
                    <input type="checkbox" checked class="cb_selectMultiple" />
                    selectMultiple
                </label>
                <label>
                    Select Limit
                    <input type="number" min="1" value="10" class="ip_limit" />
                </label>
                <span class="limitMessage" style="color: red;"></span>
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
import { Grid } from '../../src/index.js';
import { sampleData } from '../data/sample-data.js';
import { randomData } from '../data/random-data.js';
import { initCommonEvents } from '../utils/helpers.js';

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

    g.bind('onClick', function(e, d) {
        this.setRowSelected(d.rowItem, d.e);
    });

    g.bind('onSelectChanged', function(e, d) {
        console.log(d);
        document.querySelector('.onSelectChanged').innerHTML = d.length;

        const selectedRows = this.getSelectedRows();
        const len = selectedRows.length;
        const limit = document.querySelector('.ip_limit').value | 0;
        if (len <= limit) {
            return;
        }

        document.querySelector('.limitMessage').innerHTML = `selected rows: ${len} ( > limit: ${limit})`;

        d.reverse();
        d.length = len - limit;

        this.setRowSelected(d, false);
    });

    const renderData = (data) => {
        const options = {
            theme: document.querySelector('.st-theme').value,
            selectMultiple: document.querySelector('.cb_selectMultiple').checked,
            selectVisible: true,
            frozenColumn: 0
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

    ['.st-data', '.st-theme', '.cb_selectMultiple'].forEach(function(item) {
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
