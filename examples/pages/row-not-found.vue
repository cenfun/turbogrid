<template>
    <div class="main flex-auto flex-column">
        <div class="controller">
            <div>
                <div class="controller-title">Grid no rows demo</div>
                <select class="st-data">
                    <option>random-3x10</option>
                    <option>random-100x2k</option>
                    <option>random-10x10k</option>
                    <option>random-10x100k</option>
                </select>
            </div>
            <div>rowNotFound:
                <input type="text" class="ip_rowNotFound" size="45" value="No Results" />
            </div>
            <div>
                <label>frozenColumn
                    <input type="number" min="-1" max="5" step="1" value="1" class="ip-number ip_frozenColumn" />
                </label>
                <label>frozenRow
                    <input type="number" min="-1" max="5" step="1" value="-1" class="ip-number ip_frozenRow" />
                </label>
                <input type="checkbox" id="cb_frozenBottom" class="cb_frozenBottom" />
                <label for="cb_frozenBottom">frozenBottom</label>
            </div>
            <div>
                <button>addRow("New Row")</button>
            </div>
            <div>
                <input type="text" value="" placeholder="keywords" class="ip-keywords" />
                <button class="bt-del">delete selected rows</button>
                <span class="message_log"></span>
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
import { initCommonEvents } from '../global.js';

const gridContainer = ref(null);
const grid = ref(null);

const onResize = () => {
    if (grid.value) {
        grid.value.resize();
    }
};

onMounted(() => {
    let keywords = '';
    const g = new Grid(gridContainer.value);
    grid.value = g;

    g.bind('onFirstUpdated', function() {
        console.log('duration:', `${this.renderDuration}ms`);
    });

    const renderData = function(data) {
        const rowNotFound = document.querySelector('.ip_rowNotFound').value;

        const options = {
            rowNotFound: rowNotFound,

            frozenBottom: document.querySelector('.cb_frozenBottom').checked,
            frozenColumn: parseInt(document.querySelector('.ip_frozenColumn').value, 10),
            frozenRow: parseInt(document.querySelector('.ip_frozenRow').value, 10),
            theme: document.querySelector('.st-theme').value,

            textSelectable: true,
            selectVisible: true,
            rowFilter: function(rowItem) {
                if (!keywords) {
                    return true;
                }
                if (rowItem.tg_frozen) {
                    return true;
                }
                let name = rowItem.name || rowItem.c0;
                if (name) {
                    name = name.toLowerCase();
                    if (name.indexOf(keywords) !== -1) {
                        return true;
                    }
                }
                return false;
            }
        };

        g.setOption(options);
        g.setData(data);
        g.render();
    };

    function render() {
        const dataStr = document.querySelector('.st-data').value;

        if (dataStr.startsWith('random')) {
            renderData(randomData(dataStr));
            return;
        }

        renderData(sampleData);
    }

    document.querySelector('.ip-keywords').addEventListener('keyup', function() {
        const k = this.value;
        if (k === keywords) {
            return;
        }
        keywords = k;
        g.update();
    });

    document.querySelector('.bt-del').addEventListener('click', function() {
        const log = document.querySelector('.message_log');
        const selectedRows = g.getSelectedRows();
        if (!selectedRows.length) {
            log.innerHTML = 'Nothing selected';
            return;
        }

        g.deleteRow(selectedRows);

        log.innerHTML = `${selectedRows.length} row(s) be removed`;
    });

    ['.st-data', '.st-theme', '.ip_rowNotFound', '.ip_frozenColumn', '.ip_frozenRow', '.cb_frozenBottom', '.st-theme'].forEach(function(item) {
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
