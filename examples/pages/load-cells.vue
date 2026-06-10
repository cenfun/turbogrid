<template>
    <div class="main flex-auto flex-column">
        <div class="controller">
            <div>
                <div class="controller-title">Dynamic Load Cells (request by row id and column id)</div>
            </div>
            <div>
                <button>scrollToRow(2000)</button>
                <button>scrollToColumn(20)</button>
                <button>scrollToCell(3000, 30)</button>
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
import { initCommonEvents } from '../global.js';
const route = useRoute();


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

    const mockDataByIdList = function(requestCellIdList) {
        const dataList = [];
        for (let i = 0, l = requestCellIdList.length; i < l; i++) {
            const rowItem = requestCellIdList[i];
            const rowId = rowItem.id;
            const item = {
                id: rowId,
                data: {}
            };
            rowItem.columnIds.forEach(function(columnId) {
                if (Math.random() > 0.2) {
                    item.data[columnId] = Math.round(10000 * Math.random());
                } else {
                    item.data[columnId] = null;
                }
            });
            dataList.push(item);
        }
        return dataList;
    };

    let timeout_requestData;
    const requestData = function(requestCellIdList) {
        clearTimeout(timeout_requestData);
        g.showLoading();

        timeout_requestData = setTimeout(function() {
            g.hideLoading();

            console.log(requestCellIdList);

            const dataList = mockDataByIdList(requestCellIdList);

            dataList.forEach(function(item) {
                const rowId = item.id;
                Object.keys(item.data).forEach((columnId) => {
                    g.updateCell(rowId, columnId, item.data[columnId]);
                });
            });

        }, 1000);
    };

    const checkData = function(viewport) {
        const requestCellIdList = [];

        viewport.rows.forEach(function(row) {
            const rowItem = g.getViewRowItem(row);
            if (rowItem) {

                const requestColumnIdList = [];

                viewport.columns.forEach(function(columnIndex) {
                    const columnItem = g.getViewColumnItem(columnIndex);
                    const columnId = columnItem.id;
                    if (typeof rowItem[columnId] === 'undefined') {
                        requestColumnIdList.push(columnId);
                    }
                });

                if (requestColumnIdList.length) {
                    requestCellIdList.push({
                        id: rowItem.id,
                        columnIds: requestColumnIdList
                    });
                }

            }
        });

        if (!requestCellIdList.length) {
            return;
        }

        requestData(requestCellIdList);
    };

    g.bind('onUpdated', function(e, viewport) {
        checkData(viewport);
    });

    const getDynamicData = function(totalColumns, totalRows) {
        const columns = [];
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
        const rows = [];
        let index = 0;
        const appendRows = function(list) {
            const row = {
                id: `r_${index}`,
                name: `Row_${index}`,
                index: index
            };
            list.push(row);
        };
        while (index < totalRows) {
            appendRows(rows);
            index += 1;
        }
        columns.unshift({
            id: 'name',
            name: 'Name',
            type: 'tree',
            width: 200
        });
        return {
            columns: columns,
            rows: rows
        };
    };

    const render = function() {
        g.setOption({
            theme: route.query.theme,
            frozenColumn: 0,
            frozenRow: -1
        });
        g.setFormatter({
            null: function(value) {
                const defaultFormatter = this.getDefaultFormatter('null');
                if (value === null) {
                    return defaultFormatter(value);
                }
                return value;
            }
        });
        const dynamicData = getDynamicData(100, 5000);
        g.setData(dynamicData);
        g.render();
    };

    [].forEach(function(item) {
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
