<template>
    <div class="main flex-auto flex-column">
        <div class="controller">
            <div>
                <div class="controller-title">Grid Column Width API:</div>
                <select class="st-data">
                    <option>custom-data</option>
                    <option>auto-width-data</option>
                    <option>random-5x10</option>
                    <option>random-10x2k</option>
                </select>
            </div>
            <div>
                <button>setColumnWidth(0, 100)</button>
                <button>setColumnWidth(0, 300)</button>
                <button>setColumnWidth(0, 500)</button>
            </div>
            <div>
                <button>hideColumn(1)</button>
                <button>showColumn(1)</button>
                <button>hideColumn([1, 3, 5])</button>
                <button>showColumn([1, 3, 5])</button>
            </div>
            <div>
                <button>hideColumn("two")</button>
                <button>showColumn("two")</button>
                <button>hideColumn("two_center")</button>
                <button>showColumn("two_center")</button>
            </div>
            <div>
                <button>deleteColumn(-2)</button>
                <button>addColumn(["Column 1", "Column 2"])</button>
                <button>deleteRow(-1)</button>
                <button>addRow(["Row 1", "Row 2"])</button>
            </div>
            <div>
                <label>
                    <input type="checkbox" class="cb-autoColumnWidth">
                    autoColumnWidth
                </label>
                <label>
                    frozenColumn
                    <input type="number" min="-1" max="5" step="1" value="0" class="ip-number ip_frozenColumn" />
                </label>
                <label>
                    <input type="checkbox" class="cb_frozenRight" />
                    frozenRight
                </label>

                <button>update()</button>
                <button>rerender()</button>
            </div>
            <div>
                <div>onColumnWidthChanged: <span class="onColumnWidthChanged"></span></div>
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
import { randomData } from '../data/random-data.js';
import { initCommonEvents } from '../global.js';

const autoWidthData = {
    columns: [{
        name: 'width 100',
        width: 100
    }, {
        name: 'default width'
    }, {
        name: 'widthWeight 2',
        widthWeight: 2
    }, {
        name: 'widthWeight 0.5',
        widthWeight: 0.5
    }, {
        name: 'default width'
    }, {
        name: '50',
        width: 50
    }, {
        name: 'end column'
    }],
    rows: [{
        name: 'Row 1'
    }, {
        name: 'Row 2'
    }, {
        name: 'Row 3'
    }, {
        name: 'Row 4'
    }, {
        name: 'Row 5'
    }]
};

const customData = {
    columns: [{
        id: 'name',
        width: 120,
        name: 'Name'
    }, {
        name: 'Column 2(invisible)',
        invisible: true
    }, {
        name: 'Colum 3'
    }, {
        name: 'Column Name Column 4'
    }, ... ['one', 'two', 'three'].map((id) => {
        return {
            id,
            name: id,
            subs: ['left', 'center', 'right'].map((k) => {
                return {
                    id: `${id}_${k}`,
                    name: `${id} ${k}`
                };
            })
        };
    }), {
        name: 'Column 8'
    }, {
        name: 'Column Name Column  8'
    }, {
        name: 'Column C10'
    }, {
        name: 'Column Name Column Name  10'
    }, {
        name: 'Column Column 16'
    }, {
        name: 'Column Name Column 16'
    }, {
        name: 'Column Column Co 19'
    }, {
        name: 'Column Name Column Name  19'
    }, {
        name: 'Column Column Col 20'
    }, {
        name: 'Column Name Column Name Column  20'
    }, {
        name: 'Column Column Column Column 30'
    }, {
        name: 'Column Name Column Name Column Name Column Name 30'
    }, {
        name: 'Column Column Column Column Column Column Column'
    }, {
        name: 'Column Name Column Name Column Name Column Name Column Name Column Name Column Name '
    }, {
        id: 'g1',
        name: 'Group g1',
        subs: [{
            name: 'Column g1 c1'
        }, {
            name: 'Column g1 c2'
        }]
    }, {
        id: 'g2',
        name: 'Group g2',
        subs: [{
            name: 'Column g2 c1'
        }, {
            name: 'Column g2 c2'
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

const gridContainer = ref(null);
const grid = ref(null);

const onResize = () => {
    grid.value?.resize();
};

onMounted(() => {
    grid.value = new Grid(gridContainer.value);

    grid.value.bind('onFirstUpdated', function() {
        // console.log('duration:', `${this.renderDuration}ms`);
    });

    grid.value.bind('onColumnWidthChanged', function(e, d) {
        document.querySelector('.onColumnWidthChanged').innerHTML = `${d.tg_index}, ${d.name}, ${d.tg_width}`;
    });

    grid.value.bind('onLayout onResize', function(e, d) {
        // console.log(e.type, d);
    });

    const renderData = (data) => {
        const options = {
            theme: document.querySelector('.st-theme').value,
            frozenColumn: parseInt(document.querySelector('.ip_frozenColumn').value),
            frozenRow: 0,
            autoColumnWidth: document.querySelector('.cb-autoColumnWidth').checked,
            frozenRight: document.querySelector('.cb_frozenRight').checked
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

        if (dataStr === 'auto-width-data') {
            renderData(autoWidthData);
            return;
        }

        const data = JSON.parse(JSON.stringify(customData));
        renderData(data);
    };

    ['.st-data', '.st-theme', '.ip_frozenColumn', '.cb-autoColumnWidth', '.cb_frozenRight'].forEach(function(item) {
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
.icon-info {
    width: 18px;
    height: 18px;
    margin: 3px 0 0 3px;
}

.grid-container .tg-header-item {
    border: 1px solid #080;
}

.grid-container .tg-header-item.tg-header-group-item::after {
    border: none;
}
</style>
