<template>
    <div class="main flex-auto flex-column">
        <div class="controller">
            <div>
                <div class="controller-title">Grid row select API:</div>
            </div>
            <div>
                <button>selectAll()</button>
                <button>selectAll(false)</button>
            </div>
            <div>
                <div>onSelectChanged: <span class="onSelectChanged"></span></div>
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

    g.bind('onFirstUpdated', function() {
        console.log('duration:', `${this.renderDuration}ms`);
    });

    g.bind('onCellUpdated onHeaderUpdated', function(e, d) {
        const node = d.node;
        const classList = node.classList;
        node.addEventListener('animationend', function() {
            classList.remove('tg-blink');
        });
        classList.add('tg-blink');
    });

    g.bind('onClick', function(e, d) {
        const rowList = [d.rowItem].concat(d.rowItem.subs);
        this.setRowSelected(rowList, d.e);
    });

    g.bind('onSelectChanged', function(e, d) {
        console.log(d);
        document.querySelector('.onSelectChanged').innerHTML = d.length;
    });

    const render = () => {
        const options = {
            theme: document.querySelector('.st-theme').value,
            collapseAllVisible: true,
            selectVisible: true,
            rowHeight: 35,
            frozenColumn: 0,
            frozenRow: 0
        };
        g.setOption(options);

        g.setFormatter({
            iconLabelFormatter: function(value) {
                if (value === 'onwatch') {
                    return '<span class="tg-dot tg-dot-orangered"></span>On Watch';
                } else if (value === 'approved') {
                    return '<span class="tg-dot tg-dot-green"></span>Approved';
                }
                return value;
            }
        });

        const data = {
            columns: [{
                id: 'name',
                name: 'Shareclass Name'
            }, {
                id: 'ticker',
                name: 'Ticker'
            }, {
                id: 'secid',
                name: 'Sec ID'
            }, {
                id: 'previous',
                name: 'Previous',
                width: 90,
                formatter: 'iconLabelFormatter'
            }, {
                id: 'updated',
                name: 'Updated',
                width: 90,
                formatter: 'iconLabelFormatter'
            }, {
                id: 'date',
                name: 'Date of Change',
                width: 100
            }],
            rows: [{
                name: 'American Funds',
                ticker: 'RWMFX',
                secid: '123456',
                selectable: true,
                subs: [{
                    name: 'Empower',
                    previous: 'onwatch',
                    updated: 'approved',
                    date: 'Dec 17, 2017'
                }, {
                    name: 'Fidelity',
                    previous: 'onwatch',
                    updated: 'approved',
                    date: 'Dec 17, 2017'
                }, {
                    name: 'Lincoln',
                    previous: 'onwatch',
                    updated: 'approved',
                    date: 'Dec 17, 2017'
                }, {
                    name: 'John Hancock',
                    previous: 'onwatch',
                    updated: 'approved',
                    date: 'Dec 17, 2017'
                }, {
                    name: 'Nationwide',
                    previous: 'onwatch',
                    updated: 'approved',
                    date: 'Dec 17, 2017'
                }, {
                    name: 'Voya',
                    previous: 'onwatch',
                    updated: 'approved',
                    date: 'Dec 17, 2017'
                }]
            }, {
                name: 'DFA International',
                ticker: 'RWMFX',
                secid: '123456',
                selectable: true,
                subs: [{
                    name: 'Empower',
                    previous: 'onwatch',
                    updated: 'approved',
                    date: 'Dec 17, 2017'
                }, {
                    name: 'Lincoln',
                    previous: 'onwatch',
                    updated: 'approved',
                    date: 'Dec 17, 2017'
                }]
            }]
        };

        g.setData(data);
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
.tg-dot {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 5px;
    margin-right: 3px;
}

.tg-dot.tg-dot-orangered {
    background: orangered;
}

.tg-dot.tg-dot-green {
    background: green;
}
</style>
