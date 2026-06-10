<template>
    <div class="main flex-auto flex-column">
        <div class="controller">
            <div>
                <div class="controller-title">Grid multiple instance:</div>
                <select class="st-data">
                    <option>sample-data</option>
                    <option>random-3x10</option>
                    <option>random-10x100</option>
                </select>
            </div>
            <div>
                <div>
                    <button class="bt-position">position overlap</button>
                    <label>left z-index:</label>
                    <select class="st_index">
                        <option>0</option>
                        <option>100</option>
                    </select>
                </div>
            </div>
        </div>
        <div class="container flex-auto">
            <div class="container-left">
                <div ref="gridContainer1" class="grid-container grid-container-1"></div>
            </div>
            <div class="container-right">
                <div ref="gridContainer2" class="grid-container grid-container-2"></div>
            </div>
        </div>
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

const gridContainer1 = ref(null);
const gridContainer2 = ref(null);
const grid = ref(null);
const grid2 = ref(null);

const onResize = () => {
    if (grid.value) {
        grid.value.resize();
    }
    if (grid2.value) {
        grid2.value.resize();
    }
};

onMounted(() => {
    const g = new Grid(gridContainer1.value);
    grid.value = g;

    const g2 = new Grid(gridContainer2.value);
    grid2.value = g2;

    const renderData = (data) => {
        g.setOption({
            theme: document.querySelector('.st-theme').value,
            selectVisible: true,
            frozenColumn: 0,
            frozenRow: -1
        });
        g.setDataSnapshot(data);
        g.render();

        g2.setOption({
            theme: document.querySelector('.st-theme').value,
            height: 50,
            selectVisible: true,
            frozenColumn: 0,
            frozenRow: -1
        });
        g2.setDataSnapshot(data);
        g2.render();
    };

    const render = () => {
        const dataStr = document.querySelector('.st-data').value;
        if (dataStr.startsWith('random')) {
            renderData(randomData(dataStr));
            return;
        }
        renderData(sampleData);
    };

    document.querySelector('.bt-position').addEventListener('click', function() {
        const st_index = document.querySelector('.st_index').value;
        document.querySelector('.container-left').style.zIndex = st_index;
        const divR = document.querySelector('.container-right');
        if (divR.classList.contains('overlap')) {
            divR.classList.remove('overlap');
        } else {
            divR.classList.add('overlap');
        }
    });

    ['.st-data', '.st-theme'].forEach(function(item) {
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
    if (grid2.value) {
        grid2.value.destroy();
    }
});
</script>

<style scoped>
.container {
    position: relative;
    overflow: visible;
}

.container-left {
    position: absolute;
    width: 50%;
    height: 100%;
    z-index: 0;
    background: #fff;
}

.container-right {
    position: absolute;
    width: 50%;
    height: 100%;
    left: 50%;
    background: #eee;
}

.container .grid-container {
    height: calc(100% - 10px);
}

.overlap {
    position: absolute;
    left: 30%;
    top: -50px;
}
</style>
