<template>
    <div class="main flex-auto flex-column">
        <div class="controller">
            <div>
                <div class="controller-title">Grid frozen row/column example:</div>
                <select class="st-data">
                    <option>sample-data</option>
                    <option>random-3x10</option>
                    <option>random-3x30</option>
                    <option>random-100x20k</option>
                    <option>frozen_right</option>
                </select>
            </div>
            <div>
                <label>
                    frozenColumn
                    <input type="number" min="-1" max="5" step="1" value="0" class="ip-number ip_frozenColumn" />
                </label>

                <label>
                    <input type="checkbox" class="cb_frozenRight" />
                    frozenRight
                </label>

                <label>
                    frozenRow
                    <input type="number" min="-1" max="5" step="1" value="1" class="ip-number ip_frozenRow" />
                </label>

                <label>
                    <input type="checkbox" class="cb_frozenBottom" />
                    frozenBottom
                </label>

                <label>
                    <input type="checkbox" class="cb_frozenRowHoverable" />
                    frozenRowHoverable
                </label>
            </div>
            <div>

                <label>
                    <input type="checkbox" class="cb_selectVisible" />
                    selectVisible
                </label>

                <label>
                    <input type="checkbox" class="cb_rowNumberVisible" />
                    rowNumberVisible
                </label>

                <label>
                    <input type="checkbox" class="cb_rowDragVisible" />
                    rowDragVisible
                </label>

                <label>
                    <input type="checkbox" class="cb_autoHeight" />
                    autoHeight
                </label>
            </div>
        </div>
        <div ref="gridContainer" class="grid-container flex-auto"></div>
    </div>
</template>

<script setup>
import {
    onMounted, onBeforeUnmount, ref
} from 'vue';
import { useRoute } from 'vue-router';
import { Grid } from '../../src/index.js';
import { sampleData } from '../assets/sample-data.js';
import { randomData } from '../assets/random-data.js';
import { initCommonEvents } from '../global.js';
const route = useRoute();


const gridContainer = ref(null);
const grid = ref(null);

const frozenRightData = {
    options: {
        frozenRight: true
    },
    columns: [{
        id: 'action',
        name: 'Action',
        width: 120,
        formatter: function(value, rowItem, columnItem) {
            if (rowItem.tg_frozen) {
                return '';
            }
            return `
                <a href="#">Add</a>
                <a href="#">Delete</a>
                <a href="#">Edit</a>
            `;
        }
    }, {
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

    rowsLength: 200
};

onMounted(() => {
    const container = gridContainer.value;
    const g = new Grid(container);
    grid.value = g;

    g.bind('onFirstUpdated', function() {
        console.log('duration:', `${this.renderDuration}ms`);
    });

    const renderData = (data) => {
        const options = {
            theme: route.query.theme,
            selectVisible: document.querySelector('.cb_selectVisible').checked,
            rowNumberVisible: document.querySelector('.cb_rowNumberVisible').checked,
            rowDragVisible: document.querySelector('.cb_rowDragVisible').checked,
            frozenRight: document.querySelector('.cb_frozenRight').checked,
            frozenBottom: document.querySelector('.cb_frozenBottom').checked,
            frozenRowHoverable: document.querySelector('.cb_frozenRowHoverable').checked,
            frozenColumn: parseInt(document.querySelector('.ip_frozenColumn').value, 10),
            frozenRow: parseInt(document.querySelector('.ip_frozenRow').value, 10),
            autoHeight: document.querySelector('.cb_autoHeight').checked
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

        if (dataStr === 'frozen_right') {
            renderData(frozenRightData);
            return;
        }

        renderData(sampleData);
    };

    [
        
        '.st-data',
        '.ip_frozenColumn',
        '.ip_frozenRow',
        '.cb_frozenRight',
        '.cb_frozenBottom',
        '.cb_selectVisible',
        '.cb_rowNumberVisible',
        '.cb_rowDragVisible',
        '.cb_frozenRowHoverable',
        '.cb_autoHeight'
    ].forEach(function(item) {
        document.querySelector(item).addEventListener('change', function() {
            render();
        });
    });

    initCommonEvents(g);

    const onResize = () => {
        g.resize();
    };
    window.addEventListener('resize', onResize);

    render();
});

onBeforeUnmount(() => {
    if (grid.value) {
        grid.value.destroy();
    }
});
</script>
