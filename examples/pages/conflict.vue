<template>
  <div class="main">
    <div class="controller">
      <div class="controller-header">
        <div class="controller-title">
          version conflict test:
        </div>
      </div>
    </div>
    <div
      ref="gridContainer"
      class="grid-container"
    />
  </div>
</template>

<script setup>
import {
    ref, onMounted, onBeforeUnmount
} from 'vue';
import { useRoute } from 'vue-router';
import { Grid } from '../../src/index.js';
import { sampleData } from '../assets/sample-data.js';
import { init, initCommonEvents } from '../global.js';
const route = useRoute();


const gridContainer = ref(null);
const grid = ref(null);

onMounted(() => {
    init();
    grid.value = new Grid(gridContainer.value);

    grid.value.bind('onFirstUpdated', function() {
        console.log('duration:', `${this.renderDuration}ms`);
    });

    const render = () => {
        const options = {
            bindWindowResize: true,
            theme: route.query.theme,
            selectVisible: true,
            frozenColumn: 0,
            frozenRow: 1
        };
        grid.value.setOption(options);
        grid.value.setData(sampleData());
        grid.value.render();
    };

    [].forEach(function(item) {
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

    loadAgain();
    render();
});

onBeforeUnmount(() => {
    if (grid.value) {
        grid.value.destroy();
    }
});
</script>
