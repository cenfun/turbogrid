<template>
    <div class="main flex-auto flex-column">
        <div class="controller">
            <div>
                <div class="controller-title">Dynamic Load Rows (request by row index)</div>
            </div>
            <div>
                <label>
                    <button>scrollToRow(2000)</button>
                    (Locate test for dynamic data)
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
import { Grid } from 'turbogrid';
import { initCommonEvents } from '../utils/helpers.js';

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

    const getDynamicData = function(totalColumns, totalRows) {
        const columns = [{
            id: 'name',
            name: 'Dynamic Name'
        }];
        const appendColumns = function(parent) {
            for (let i = 0; i < totalColumns; i++) {
                const column = {
                    id: `c_${i}`,
                    name: `Dynamic_${i}`
                };

                if (Math.random() > 0.6) {
                    column.type = 'number';
                }

                columns.push(column);
            }
        };

        appendColumns(columns);

        return {
            columns: columns,
            rowsLength: totalRows
        };
    };

    const mockDataByIdList = function(requestRowIndexList, requestColumnIdList) {
        const dataList = [];
        for (let i = 0, l = requestRowIndexList.length; i < l; i++) {
            const index = requestRowIndexList[i];
            const item = {
                index: index,
                data: {}
            };
            requestColumnIdList.forEach(function(columnId) {
                if (columnId === 'name') {
                    item.data.name = `Row Index ${index}`;
                } else {
                    if (Math.random() > 0.2) {
                        item.data[columnId] = Math.round(10000 * Math.random());
                    }
                }
            });
            dataList.push(item);
        }
        return dataList;
    };

    let timeout_load_rows;
    g.bind('onFirstUpdated', function() {
        console.log('duration:', `${this.renderDuration}ms`);
    }).bind('onUpdated', function(e, viewport) {

        const requestRowIndexList = [];
        viewport.rows.forEach(function(row) {
            const rowItem = g.getViewRowItem(row);
            if (rowItem && !rowItem.data_loaded) {
                requestRowIndexList.push(row);
            }
        });

        if (!requestRowIndexList.length) {
            return;
        }

        const columnsData = g.getColumns();
        const requestColumnIdList = [];
        columnsData.forEach(function(column) {
            requestColumnIdList.push(column.id);
        });

        clearTimeout(timeout_load_rows);
        g.showLoading();

        timeout_load_rows = setTimeout(function() {
            g.hideLoading();

            const dataList = mockDataByIdList(requestRowIndexList, requestColumnIdList);
            dataList.forEach(function(item) {
                item.data.data_loaded = true;
                g.updateRow(item.index, item.data);
            });

        }, 1000);

    });

    g.setFormatter({
        null: function(value, rowItem) {
            const defaultFormatter = this.getDefaultFormatter('null');
            if (rowItem.data_loaded) {
                return defaultFormatter(value);
            }
            return '';
        }
    });

    const render = function() {
        const options = {
            theme: document.querySelector('.st-theme').value,
            frozenColumn: 0,
            frozenRow: 0,
            selectVisible: true
        };
        g.setOption(options);
        const dynamicData = getDynamicData(100, 5000);
        g.setData(dynamicData);
        g.render();
    };

    ['.st-theme'].forEach(function(item) {
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
