<template>
    <div class="main flex-auto flex-column">
        <div class="controller">
            <div>
                <div class="controller-title">Dynamic Load Subs</div>
                <select class="st-data">
                    <option>test-data</option>
                    <option>sample-data</option>
                </select>
            </div>
            <div>
                <label>
                    Search:
                    <input type="text" value="" placeholder="keywords" class="ip-keywords" />
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
import { Grid } from '../../src/index.js';
import { sampleData } from '../data/sample-data.js';
import { initCommonEvents } from '../global.js';

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

    const testData = {
        columns: [{
            id: 'name',
            name: 'Name'
        }, {
            id: 'id',
            name: 'Id'
        }, {
            id: 'index',
            name: 'Index'
        }, {
            id: 'number',
            name: 'Number',
            type: 'number'
        }, {
            id: 'number2',
            name: 'Number2',
            type: 'number'
        }, {
            id: 'string_number',
            name: 'String Number',
            type: 'number',
            width: 100
        }, {
            id: 'number_string',
            name: 'Number & String',
            type: 'number',
            width: 100
        }, {
            id: 'date',
            name: 'Date',
            type: 'date',
            width: 100
        }, {
            id: 'string_null',
            name: 'String & null',
            type: 'string',
            width: 100
        }],
        rows: [{
            type: 'group',
            id: 'id1',
            name: 'Shenzhen Dynamic (subs: [])',
            subs: [],
            index: 1,
            number: NaN,
            number2: 50,
            string_number: '80.123',
            number_string: 3,
            date: '2003-6-10',
            string_null: null
        }, {
            type: 'group',
            id: 'id2',
            name: 'Beijing Dynamic (subs: [])',
            subs: [],
            index: 2,
            number: 80,
            number2: 20,
            string_number: '9.3',
            number_string: 'NaN',
            date: '2003-6-5',
            string_null: null
        }, {
            type: 'group',
            id: 'id3',
            name: 'Shanghai Dynamic (subs: [])',
            subs: [],
            index: 3,
            number: 80,
            number2: 50,
            string_number: '5.3',
            number_string: 'String',
            date: '2012-11-1',
            string_null: null
        }, {
            type: 'group',
            id: 'id4',
            name: 'Changsha Dynamic (subs: [])',
            subs: [],
            index: 4,
            number: 70,
            number2: 50,
            string_number: '5.3',
            number_string: NaN,
            date: '2017-5-6',
            string_null: 'String'
        }, {
            type: 'group',
            id: 'id5',
            name: 'Guangzhou Dynamic (subs: [])',
            subs: [],
            index: 5,
            number: 30,
            number2: 30,
            string_number: '15.5',
            number_string: 13,
            date: '2012-5-1',
            string_null: 'Null String'
        }]
    };

    const requestSubs = function(gridInstance, item) {
        const rowIndex = item.tg_index;

        gridInstance.setRowState(item, 'waiting');
        gridInstance.showLoading();

        setTimeout(function() {
            gridInstance.setRowState(item, 'waiting', false);
            gridInstance.hideLoading();

            const subs = [{
                id: 'r11',
                name: 'Row Name from server 11',
                c1: 'string value 11',
                c2: 1,
                c3_s1: 'value 3 - 1',
                c3_s2: 'value 1 - 2'
            }, {
                id: 'r12',
                name: 'Row Name from server 12',
                c1: 'string value 12',
                c2: 'value 2',
                c3_s1: 'value 3 - 1',
                c3_s2: 'value 1 - 2',
                subs: [{
                    id: 'r12',
                    name: 'Row Name from server 11',
                    c1: 'string value 11',
                    c2: 1,
                    c3_s1: 'value 3 - 1',
                    c3_s2: 'value 1 - 2'
                }]
            }];

            gridInstance.once('onUpdated', function(e, d) {
                const row = this.getRowItem(5);
                console.log(row);
            });

            gridInstance.setRowSubs(rowIndex, subs);

        }, 1000);
    };

    g.bind('onFirstUpdated', function() {
        console.log('duration:', `${this.renderDuration}ms`);
    }).bind('onRowSubsRequest', function(e, d) {
        console.log(d);
        requestSubs(this, d);
    }).bind('onClick', function(e, d) {
        if (d.columnItem.id !== 'name') {
            return;
        }
        const rowItem = d.rowItem;
        console.log(rowItem);
        if (!rowItem.tg_group) {
            return;
        }
        if (rowItem.subs) {
            g.toggleRow(rowItem);
            return;
        }
        requestSubs(this, rowItem);
    });

    let keywords = '';

    const renderData = function(data) {
        const options = {
            theme: document.querySelector('.st-theme').value,
            collapseAllOnInit: true,
            frozenColumn: 0,
            frozenRow: -1,
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

    const render = function() {
        const dataStr = document.querySelector('.st-data').value;

        if (dataStr === 'sample-data') {
            renderData(sampleData);
            return;
        }

        renderData(testData);
    };

    document.querySelector('.ip-keywords').addEventListener('keyup', function() {
        const k = this.value;
        if (k === keywords) {
            return;
        }
        keywords = k;
        g.update();
    });

    ['.st-data', '.st-theme'].forEach(function(item) {
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
.tg-waiting {
    opacity: 0.5;
}
</style>
