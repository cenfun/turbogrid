<template>
    <div class="main flex-auto flex-column">
        <div class="controller">
            <div>
                <div class="controller-title">Grid loading API:</div>
                <select class="st-data">
                    <option>sample-data</option>
                    <option>random-3x10</option>
                    <option>random-100x2k</option>
                </select>
            </div>
            <div>
                <button>showLoading()</button>
                <button>hideLoading()</button>

                <button>showMask()</button>
                <button>hideMask()</button>
                <button>showMask({"opacity":"0.3"})</button>
            </div>
            <div>
                <label>
                    <button>setLoading()</button>
                    (default)
                </label>
                <button>setLoading({"size":"16px", "color":"green"})</button>
                <button>setLoading({"size":"60px", "color":"green", "fast":"fast"})</button>
            </div>
            <div>
                <button>setLoading("Loading ...")</button>
                <button class="setLoadingElement">setLoading with this element</button>
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

    const renderData = (data) => {
        g.setOption({
            theme: document.querySelector('.st-theme').value,
            frozenColumn: 0,
            frozenRow: 1
        });

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

    document.querySelector('.setLoadingElement').addEventListener('click', function() {
        g.setLoading(function() {
            return document.querySelector('.setLoadingElement').cloneNode(true);
        });
    });

    ['.st-data', '.st-theme'].forEach(function(item) {
        document.querySelector(item).addEventListener('change', function() {
            render();
        });
    });

    initCommonEvents(g);

    window.addEventListener('resize', onResize);

    g.showLoading();
    setTimeout(function() {
        render();
        g.hideLoading();
    }, 1000);
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
