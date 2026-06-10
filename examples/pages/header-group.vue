<template>
    <div class="main flex-auto flex-column">
        <div class="controller">
            <div>
                <div class="controller-title">Grid Header Group:</div>
            </div>
            <div>
                <textarea class="tg_data" style="width: 100%; height: 100px;"></textarea>
            </div>
            <div>
                <input type="button" class="bt-render" value="render()" />
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
import { initCommonEvents } from '../utils/helpers.js';

const gridContainer = ref(null);
const grid = ref(null);

const onResize = () => {
    if (grid.value) {
        grid.value.resize();
    }
};

const customData = {
    columns: [{
        id: 'name',
        name: 'Sector Name',
        width: 200
    }, {
        id: 'G1',
        name: 'G1',
        subs: [{
            id: 'C1-1',
            name: 'C1-1'
        }, {
            id: 'G1-2',
            name: 'G1-2',
            subs: [{
                id: 'C1-2-1',
                name: 'C1-2-1'
            }, {
                id: 'G1-2-2',
                name: 'G1-2-2'
            }]
        }, {
            id: 'G1-3',
            name: 'G1-3',
            subs: [{
                id: 'C1-3-1',
                name: 'C1-3-1 Long'
            }, {
                id: 'G1-3-2',
                name: 'G1-3-2',
                subs: [{
                    id: 'C1-3-2-1',
                    name: 'C1-3-2-1'
                }]
            }]
        }]
    }, {
        id: 'c1',
        name: 'header group',
        type: 'number',
        subs: [{
            id: 'c11',
            name: 'header sub 1'
        }, {
            id: 'c12',
            name: 'header sub 2',
            subs: [{
                id: 'c121',
                name: 'header sub 2-1'
            }, {
                id: 'c122',
                name: 'header sub 2-2',
                subs: [{
                    id: 'c1221',
                    name: 'header sub 2-2-1'
                }, {
                    id: 'c1222',
                    name: 'header sub 2-2-2'
                }]
            }]
        }]

    }, {
        'id': 'group_1',
        'name': 'Total Return mo-end Annlzd EMPT',
        'apiDataType': 'NUMERIC',
        'align': 'right',
        'width': null,
        'sortable': true,
        'subs': [{
            'align': 'right',
            'id': 'FACT830_2',
            'name': '3Y Long Name Long Name Long Name Long Name Long Name Long Name Long Name Long Name Long Name',
            'type': 'number'
        }, {
            'align': 'right',
            'id': 'FACT830_3',
            'name': '5Y 1 Month Rolling',
            'subs': [{
                'align': 'right',
                'id': 'FACT830_3:window_1',
                'name': '12/01/2012 - 12/31/2012',
                'type': 'number'
            }, {
                'align': 'right',
                'id': 'FACT830_3:window_2',
                'name': '12/01/2013 - 12/31/2013',
                'type': 'number'
            }, {
                'align': 'right',
                'id': 'FACT830_3:window_3',
                'name': '12/01/2014 - 12/31/2014',
                'type': 'number'
            }]
        }]
    }],

    rows: [{
        name: 'Holding 1'
    }, {
        name: 'Holding 2'
    }, {
        name: 'Holding 3'
    }]
};

onMounted(() => {
    const g = new Grid(gridContainer.value);
    grid.value = g;

    g.bind('onFirstUpdated', function() {
        console.log('duration:', `${this.renderDuration}ms`);
    });

    document.querySelector('.tg_data').value = JSON.stringify(customData, null, 4);

    const render = () => {
        g.setOption({
            theme: document.querySelector('.st-theme').value,
            selectVisible: true,
            frozenColumn: 0,
            frozenRow: -1,
            sortField: 'c1',
            sortOnInit: true
        });

        g.setFormatter({
            header: function(value, rowItem, columnItem, cellNode) {
                if (columnItem.tg_group) {
                    console.log('header-formatter', value);
                }
                return value;
            },
            tree: function(value, rowItem, columnItem, cellNode) {
                const defaultFormatter = this.getDefaultFormatter('tree');
                if (rowItem.type !== 'summary') {
                    value = `${value}<div class="tg-hover-icon"><div class="icon icon-info"></div></div>`;
                }
                return defaultFormatter(value, rowItem, columnItem, cellNode);
            }
        });

        const data = JSON.parse(document.querySelector('.tg_data').value);
        g.setData(data);
        g.render();
    };

    document.querySelector('.bt-render').addEventListener('click', function() {
        render();
    });

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
.tg-hover-icon {
    position: absolute;
    top: 50%;
    right: 0;
    display: none;
    transform: translate(0, -50%);
}

.tg-hover .tg-hover-icon {
    display: inline-block;
}

.grid-container .tg-header-item {
    border: 1px solid #080;
}

.grid-container .tg-header-item.tg-header-group-item::after {
    border: none;
}
</style>
