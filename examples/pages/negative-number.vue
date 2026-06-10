<template>
    <div class="main flex-auto flex-column">
        <div class="controller">
            <div>
                <div class="controller-title">Negative Number Align:</div>
            </div>
            <div>
                <label>
                    <input type="checkbox" checked class="cb_negativeFormatter" />
                    negative formatter
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
import { Grid, Util } from '../../src/index.js';
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

    g.bind('onFirstUpdated', function () {
        console.log('duration:', `${this.renderDuration}ms`);
    });

    const numFix = function (num, fix) {
        const n = Util.toNum;
        const f = Util.isNum(fix) ? fix : 2;
        return n(num).toFixed(n(f, true));
    };

    const renderData = (data) => {
        g.setOption({
            theme: document.querySelector('.st-theme').value,
            sortOnInit: true,
            sortField: 'number'
        });

        const negativeFormatter = document.querySelector('.cb_negativeFormatter').checked;

        g.setFormatter({
            number: function (value, rowItem, columnItem, cellNode) {
                if (Util.isNum(value)) {
                    if (value < 0 && negativeFormatter) {
                        value = `(${numFix(-value)})`;
                        if (cellNode) {
                            cellNode.classList.add('tg-cell-negative');
                        }
                    }
                }
                return value;
            }
        });
        g.setData(data);
        g.render();
    };

    const testData = {
        columns: [{
            id: 'name',
            name: 'Name',
            width: 160
        }, {
            id: 'id',
            name: 'Id'
        }, {
            id: 'number',
            name: 'Number',
            type: 'number'
        }, {
            id: 'string_number',
            name: 'String Number',
            type: 'number',
            width: 130
        }, {
            id: 'index',
            name: 'Index'
        }, {
            id: 'number_left',
            name: 'Number Left',
            width: 100,
            align: 'left',
            type: 'number'
        }],
        rows: [{
            id: 'g1',
            name: 'Group 1',
            number: 18,
            number_left: 8,
            subs: [{
                id: 'id1',
                name: 'Holding 1',
                index: 1,
                number: NaN,
                number_left: 50,
                string_number: '80.13'
            }, {
                id: 'id2',
                name: 'Holding 2',
                index: 2,
                number: 80,
                number_left: -20,
                string_number: '-9.33'
            }, {
                id: 'id3',
                name: 'Holding 3',
                index: 3,
                number: NaN,
                number_left: -50,
                string_number: '5.23'
            }, {
                id: 'id4',
                name: 'Holding 3',
                index: 4,
                number: 70,
                number_left: 50,
                string_number: '5.56'
            }, {
                id: 'id5',
                name: 'Holding 5',
                index: 5,
                number: 30,
                number_left: -30,
                string_number: '-15.35'
            }]
        }, {
            id: 'g2',
            name: 'Group 2',
            number: -38,
            number_left: -10,
            string_number: '5.78',
            subs: [{
                id: 'id9',
                name: 'Holding 9',
                index: 9,
                number: -20,
                number_left: -30,
                string_number: null
            }, {
                id: 'id10',
                name: 'Holding 10',
                index: 10,
                number: 80,
                number_left: 30,
                string_number: '-6.05'
            }, {
                id: 'id11',
                name: 'Holding 11',
                index: 11,
                number: -25,
                number_left: 30,
                string_number: '6.59'
            }]
        }, {
            id: 'g3',
            name: 'Group 3',
            subs: [{
                id: 'id6',
                name: 'Holding 6',
                index: 6,
                number_left: -10,
                string_number: '12.26'
            }, {
                id: 'id7',
                name: 'Holding 7',
                index: 7,
                number_left: -30,
                string_number: '15.26'
            }, {
                id: 'id8',
                name: 'Holding 8',
                index: 8,
                number: 80,
                number_left: 30
            }]
        }]
    };

    const render = () => {
        renderData(testData);
    };

    ['.st-theme', '.cb_negativeFormatter'].forEach(function (item) {
        document.querySelector(item).addEventListener('change', function () {
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

<style scoped></style>
