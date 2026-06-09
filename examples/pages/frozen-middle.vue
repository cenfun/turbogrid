<template>
    <div class="main flex-auto flex-column">
        <div class="controller">
            <div>
                <div class="controller-title">Frozen Middle:</div>
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

// =======================================================================================
// Frozen Middle Grid
const FMG = function(container) {
    container.innerHTML = `
        <div class="fmg">
            <div class="fmg-grid fmg-grid-l"></div>
            <div class="fmg-grid fmg-grid-r"></div>
        </div>
    `;

    this.initContainer(container);
};

FMG.prototype = {
    initContainer: function(container) {
        this.container = container;
        this.containerL = container.querySelector('.fmg-grid-l');
        this.containerL.innerHTML = '';
        this.containerR = container.querySelector('.fmg-grid-r');
        this.containerR.innerHTML = '';
        this.createGrid();
    },

    getAllThemes() {
        return this.gridL.getAllThemes();
    },

    setData: function(data) {
        this.data = data;
    },

    createGrid: function() {
        this.gridL = new Grid(this.containerL);
        this.gridR = new Grid(this.containerR);

        // sync scroll
        this.gridL.bind('onScroll', (e, d) => {
            this.gridR.setScrollTop(d.scrollTop);
        });
        this.gridR.bind('onScroll', (e, d) => {
            this.gridL.setScrollTop(d.scrollTop);
        });

        // sync sort
        this.gridL.bind('onSort', (e, d) => {
            this.gridL.once('onUpdated', () => {
                this.gridR.removeSortColumn();
                this.gridR.update();
            });
        });
        this.gridR.bind('onSort', (e, d) => {
            this.gridR.once('onUpdated', () => {
                this.gridL.removeSortColumn();
                this.gridL.update();
            });
        });

        // sync hover
        this.gridL.bind('onRowMouseEnter', (e, d) => {
            this.gridR.setRowHover(d.rowItem, true);
        }).bind('onRowMouseLeave', (e, d) => {
            this.gridR.setRowHover(d.rowItem, false);
        });
        this.gridR.bind('onRowMouseEnter', (e, d) => {
            this.gridL.setRowHover(d.rowItem, true);
        }).bind('onRowMouseLeave', (e, d) => {
            this.gridL.setRowHover(d.rowItem, false);
        });
    },

    initData: function() {
        this.dataL = {
            rows: this.data.rows,
            columns: this.data.columnsL
        };
        this.dataR = {
            rows: this.data.rows,
            columns: this.data.columnsM.concat(this.data.columnsR)
        };

        let middleWidth = 0;
        this.data.columnsM.forEach(function(item) {
            middleWidth += item.width;
        });

        this.middleWidth = middleWidth;
        this.scrollbarSize = 10;
    },

    render: function() {
        this.initData();
        this.resize();

        this.gridL.setOption({
            theme: document.querySelector('.st-theme').value,
            scrollbarSize: this.scrollbarSize,
            scrollbarSizeV: 0
        });
        this.gridR.setOption({
            theme: document.querySelector('.st-theme').value,
            scrollbarSize: this.scrollbarSize,
            frozenColumn: 0
        });

        this.gridL.setData(this.dataL);
        this.gridL.render();

        this.gridR.setData(this.dataR);
        this.gridR.render();
    },

    resize: function() {
        const totalWidth = this.container.clientWidth;
        const leftWidth = Math.floor((totalWidth - this.scrollbarSize - this.middleWidth) * 0.5);
        const rightWidth = totalWidth - leftWidth;
        this.containerL.style.left = '0px';
        this.containerL.style.width = `${leftWidth}px`;

        this.containerR.style.left = `${leftWidth}px`;
        this.containerR.style.width = `${rightWidth}px`;

        if (this.gridL && this.gridR) {
            this.gridL.resize();
            this.gridR.resize();
        }
    }
};

// =======================================================================================

const getData = function() {
    const columnsL = [{
        id: 'calls',
        name: 'Calls',
        subs: [{
            id: 'calls_symbol',
            name: 'Symbol',
            width: 100
        }, {
            id: 'calls_last',
            name: 'Last'
        }, {
            id: 'calls_chg',
            name: 'Chg'
        }, {
            id: 'calls_bid',
            name: 'Bid'
        }, {
            id: 'calls_ask',
            name: 'Ask'
        }, {
            id: 'calls_vol',
            name: 'Vol'
        }]
    }];
    const columnsM = [{
        id: 'strike',
        name: 'Strike',
        headerClassMap: 'fmg-middle-header',
        classMap: 'fmg-middle-cell',
        align: 'center',
        width: 80
    }];
    const columnsR = [{
        id: 'puts',
        name: 'Puts',
        subs: [{
            id: 'puts_symbol',
            name: 'Symbol',
            width: 100
        }, {
            id: 'puts_last',
            name: 'Last'
        }, {
            id: 'puts_chg',
            name: 'Chg'
        }, {
            id: 'puts_bid',
            name: 'Bid'
        }, {
            id: 'puts_ask',
            name: 'Ask'
        }, {
            id: 'puts_vol',
            name: 'Vol'
        }]
    }];

    const rows = [];

    const addRow = function(i) {
        const row = {};

        columnsL[0].subs.forEach(function(item) {
            if (item.name === 'Symbol') {
                row[item.id] = item.name + i;
            } else {
                row[item.id] = Math.round(1000 * Math.random());
            }
        });

        columnsM.forEach(function(item) {
            row[item.id] = Math.round(1000 * Math.random());
        });

        columnsR[0].subs.forEach(function(item) {
            if (item.name === 'Symbol') {
                row[item.id] = item.name + i;
            } else {
                row[item.id] = Math.round(1000 * Math.random());
            }
        });

        rows.push(row);
    };

    let i = 0;
    while (i < 100) {
        addRow(i);
        i += 1;
    }

    return {
        columnsL: columnsL,
        columnsM: columnsM,
        columnsR: columnsR,
        rows: rows
    };
};

onMounted(() => {
    const container = gridContainer.value;
    const fmg = new FMG(container);
    fmg.setData(getData());

    const render = function() {
        fmg.render();
    };

    ['.st-theme'].forEach(function(item) {
        document.querySelector(item).addEventListener('change', function() {
            render();
        });
    });

    initCommonEvents(fmg);

    const onResize = () => {
        fmg.resize();
    };
    window.addEventListener('resize', onResize);

    render();
});

onBeforeUnmount(() => {
});
</script>

<style scoped>
.fmg {
    position: relative;
    width: 100%;
    height: 100%;
}

.fmg-grid {
    position: absolute;
    top: 0;
    height: 100%;
}

.fmg .fmg-grid .fmg-middle-header {
    color: #337f7f;
}

.fmg .fmg-grid .fmg-middle-cell {
    background: #337f7f;
    color: #fff;
    font-weight: bold;
}

.fmg .fmg-grid .tg-column-name {
    border-right: none;
}
</style>
