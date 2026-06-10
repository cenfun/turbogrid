<template>
    <div class="main flex-auto flex-column">
        <div class="controller">
            <div>
                <div class="controller-title">Grid POC:</div>
                <select class="st-data">
                    <option>test-data</option>
                    <option>random-3x10</option>
                    <option>random-10x100</option>
                </select>
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
import { randomData } from '../assets/random-data.js';
import { initCommonEvents } from '../global.js';

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
            theme: document.querySelector('.st-theme').value,
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

    ['.st-data', '.st-theme'].forEach(function(item) {
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
