<template>
  <div class="main">
    <div class="controller">
      <div class="controller-header">
        <div class="controller-title">
          Grid POC:
        </div>
        <select class="st-data">
          <option>test-data</option>
          <option>random-3x10</option>
          <option>random-10x100</option>
        </select>
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
    onMounted, onBeforeUnmount, ref
} from 'vue';
import { useRoute } from 'vue-router';
import { Grid } from '../../src/index.js';
import { randomData } from '../assets/sample-data.js';
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

    const testData = {
        columns: [{
            id: 'name',
            width: 180,
            name: 'Name'
        }, {
            name: 'DataPoint'
        }, {
            name: 'DataPoint'
        }, {
            name: 'Group',
            subs: [{
                name: 'DataPoint'
            }, {
                name: 'DataPoint'
            }]
        }, {
            name: 'Group',
            subs: [{
                name: 'DataPoint'
            }, {
                name: 'DataPoint'
            }]
        }, {
            name: 'Group',
            subs: [{
                name: 'DataPoint'
            }, {
                name: 'DataPoint'
            }]
        }],
        rows: [{
            name: 'Total'
        }, {
            name: 'Group',
            subs: [{
                name: 'Holding'
            }, {
                name: 'Holding'
            }]
        }, {
            name: 'Group',
            subs: [{
                name: 'Holding'
            }, {
                name: 'Holding'
            }]
        }, {
            name: 'Group',
            subs: [{
                name: 'Holding'
            }, {
                name: 'Holding'
            }]
        }, {
            name: 'Group',
            subs: [{
                name: 'Holding'
            }, {
                name: 'Holding'
            }]
        }]
    };

    const renderData = (data) => {
        const options = {
            bindWindowResize: true,
            theme: route.query.theme,
            frozenColumn: 0,
            frozenRow: 0
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
        renderData(testData);
    };

    ['.st-data'].forEach(function(item) {
        document.querySelector(item).addEventListener('change', function() {
            render();
        });
    });

    initCommonEvents(grid.value);

    render();
});

onBeforeUnmount(() => {
    if (grid.value) {
        grid.value.destroy();
    }
});
</script>

<style lang="scss">
</style>
