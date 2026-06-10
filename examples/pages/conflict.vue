<template>
    <div class="main flex-auto flex-column">
        <div class="controller">
            <div>
                <div class="controller-title">version conflict test:</div>
            </div>
        </div>
        <div ref="gridContainer" class="grid-container flex-auto"></div>
    </div>
</template>

<script setup>
import {
    ref, onMounted, onBeforeUnmount
} from 'vue';
import { Grid } from '../../src/index.js';
import { sampleData } from '../assets/sample-data.js';
import { initCommonEvents } from '../global.js';

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

    const render = () => {
        const options = {
            theme: document.querySelector('.st-theme').value,
            selectVisible: true,
            frozenColumn: 0,
            frozenRow: 1
        };
        grid.value.setOption(options);
        grid.value.setData(sampleData);
        grid.value.render();
    };

    ['.st-theme'].forEach(function(item) {
        document.querySelector(item).addEventListener('change', function() {
            render();
        });
    });

    const loadAgain = function() {
        Array.from(document.querySelectorAll('script')).forEach(function(elem) {
            const src = elem.getAttribute('src');
            if (src && src.indexOf('turbogrid.js') !== -1) {
                const script = document.createElement('script');
                script.src = `${src}?rd=${Math.random()}`;
                script.onload = function() {
                    console.log(`loaded: ${src}`);
                };
                document.body.appendChild(script);
            }
        });
    };

    initCommonEvents(grid.value);

    window.addEventListener('resize', onResize);

    loadAgain();
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
