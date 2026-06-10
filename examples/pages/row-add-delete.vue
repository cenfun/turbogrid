<template>
    <div class="main flex-auto flex-column">
        <div class="controller">
            <div>
                <div class="controller-title">Grid row add and delete:</div>
                <select class="st-data">
                    <option>random-3x10</option>
                    <option>random-100x2k</option>
                    <option>sample-data</option>
                </select>
            </div>
            <div>
                <button>addRow("New Row")</button>
                <button>addRow({"name":"Row id1","id":"id1"})</button>
                <button>addRow({"name":"Row 50","height":50})</button>
                <button>addRow(["Row 1", "Row 2"])</button>
                <button>addRow([{"name":"New Row 1"}, {"name":"New Row 2"}])</button>
                <button>addRow("New Row Parent",2)</button>
                <button>addRow(["Row 1 Parent","Row 2 Parent"],2)</button>
                <button>addRow("New Row position",null,2)</button>
                <button>addRow("New Row position",2,2)</button>
            </div>
            <div>
                <button>deleteRow(0)</button>
                <button>deleteRow("id1")</button>
                <button>deleteRow([2,5,"id1"])</button>
                <button>deleteRow(-1)</button>
            </div>
            <div>
                <button>toggleAllRows()</button>
                <button>exportData()</button>
            </div>
            <div>
                <input class="bt-del" type="button" value="delete selected rows" />
                <input type="text" value="" placeholder="keywords" class="ip-keywords" />
                test collapsed or flush rows
            </div>
            <div>
                <div class="flex-auto flex-column flex-column-5">
                    <div>Event logs <button class="bt-clear">Clear Logs</button></div>
                    <div class="log-container">
                        <div class="log-content"></div>
                    </div>
                </div>
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
import { initCommonEvents, appendLog } from '../global.js';

const gridContainer = ref(null);
const grid = ref(null);
const keywords = ref('');

const onResize = () => {
    grid.value.resize();
};

onMounted(() => {
    grid.value = new Grid(gridContainer.value);

    grid.value.bind('onFirstUpdated', function(e, d) {
        console.log('duration:', `${this.renderDuration}ms`);
        appendLog(`event: ${e.type}`, d);
    }).bind('onClick', function(e, d) {
        if (d.e.target.classList.contains('tg-cell-hover-icon')) {
            this.deleteRow(d.rowItem);
        }
    }).bind('onRowMouseEnter', function(e, d) {
        const cellNode = this.getCellNode(d.rowItem, 'name');
        if (!cellNode) {
            return;
        }
        let icon = cellNode.querySelector('.tg-cell-hover-icon');
        if (!icon) {
            icon = document.createElement('div');
            icon.className = 'tg-cell-hover-icon icon-remove';
            icon.innerHTML = '<svg viewBox="0 0 2300 2300" id="remove" width="100%" height="100%"><path d="M1990.5 389.5l-80-80-760 770-760-770-80 80 770 760-770 760 80 80 760-770 760 770 80-80-770-760z"></path></svg>';
            cellNode.appendChild(icon);
        }
    }).bind('onRowAdded', function(e, d) {
        appendLog(`event: ${e.type}`, d);
        d.forEach((rowItem) => {
            const $nodes = this.getRowNodes(rowItem);
            $nodes.addClass('tg-blink');
        });
    }).bind('onRowRemoved', function(e, d) {
        appendLog(`event: ${e.type}`, d);
    }).bind('onSelectChanged', function(e, d) {
        appendLog(`event: ${e.type}`, d);
    });

    const renderData = (data) => {
        const options = {
            theme: document.querySelector('.st-theme').value,
            selectVisible: true,
            frozenColumn: 0,
            rowFilter: (rowItem) => {
                if (!keywords.value) {
                    return true;
                }
                if (rowItem.tg_frozen) {
                    return true;
                }
                let name = rowItem.name || rowItem.c0;
                if (name) {
                    const arr = keywords.value.toLowerCase().split(' ');
                    name = name.toLowerCase();
                    for (let i = 0, l = arr.length; i < l; i++) {
                        const item = arr[i];
                        if (item && name.indexOf(item) !== -1) {
                            return true;
                        }
                    }
                }
                return false;
            }
        };
        grid.value.setFormatter({
            string: function(value, rowItem, columnItem, cellNode) {
                if (columnItem.id === 'name') {
                    if (!rowItem.tg_random) {
                        rowItem.tg_random = Math.random().toString().substr(2, 3);
                    }
                    return `${value} (${rowItem.tg_random})`;
                }
                return value;
            }
        });
        grid.value.setOption(options);
        grid.value.setData(data);
        grid.value.render();
        console.log('render');
    };

    const render = () => {
        const dataStr = document.querySelector('.st-data').value;
        if (dataStr.startsWith('random')) {
            renderData(randomData(dataStr));
            return;
        }
        renderData(sampleData);
    };

    document.querySelector('.ip-keywords').addEventListener('keyup', () => {
        const k = document.querySelector('.ip-keywords').value;
        if (k === keywords.value) {
            return;
        }
        keywords.value = k;
        grid.value.update();
    });

    document.querySelector('.bt-del').addEventListener('click', () => {
        const selectedRows = grid.value.getSelectedRows();
        if (!selectedRows.length) {
            return;
        }
        grid.value.deleteRow(selectedRows);
    });

    document.querySelector('.bt-clear').addEventListener('click', () => {
        document.querySelector('.log-content').innerHTML = '';
    });

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
.icon-remove {
    width: 16px;
    height: 16px;
    cursor: pointer;
    position: absolute;
    top: 50%;
    right: 2px;
    transform: translate(0, -50%);
}
</style>
