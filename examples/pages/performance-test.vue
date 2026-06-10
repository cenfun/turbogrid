<template>
    <div class="main flex-auto flex-column">
        <div class="controller">
            <div>
                <div class="controller-title">Grid Performance Test:</div>
            </div>
            <div>
                <label>
                    columns
                    <select class="st-columns">
                        <option>10</option>
                        <option>20</option>
                        <option>30</option>
                        <option>50</option>
                    </select>
                    <input value="10" class="ip-columns" />
                </label>
                <label>
                    rows
                    <select class="st-rows">
                        <option>100</option>
                        <option>1k</option>
                        <option>5k</option>
                        <option selected>10k</option>
                        <option>100k</option>
                        <option>1m</option>
                        <option>2m</option>
                        <option>3m</option>
                        <option>5m</option>
                    </select>
                    <input value="10k" class="ip-rows" />
                </label>
                <label>
                    <input type="checkbox" class="cb-subs" />
                    subs
                </label>
                <button class="bt-start">Start Test</button>
                <div class="log-random"></div>
            </div>
            <div>
                <div><b>Test Results:</b> <span class="time-result time-total-1"></span></div>
                <div>Previous1: <span class="time-result time-total-2"></span></div>
                <div>Previous2: <span class="time-result time-total-3"></span></div>
                <div><b>Average:</b> <span class="time-result time-total-a"></span></div>
            </div>
            <div>

                <label>
                    frozenColumn:
                    <input type="number" min="-1" max="5" step="1" value="-1" class="ip-number ip_frozenColumn" />
                </label>
                <label>
                    frozenRow:
                    <input type="number" min="-1" max="5" step="1" value="-1" class="ip-number ip_frozenRow" />
                </label>

                <label>
                    <input type="checkbox" class="cb_frozenBottom" />
                    frozenBottom
                </label>

                <label>
                    <input type="checkbox" class="cb_rowNumberVisible" />
                    rowNumberVisible
                </label>

                <label>
                    <input type="checkbox" class="cb_selectVisible" />
                    selectVisible
                </label>

                <label>
                    <input type="checkbox" class="cb_sortOnInit" />
                    sortOnInit
                </label>

                <button class="bt-delete">Delete Selected Rows</button>

            </div>
            <div>
                <div><b>Benchmark</b> (Intel i7-8700T 2.4GHz, 16.0GB, Win10 x64)</div>
            </div>
            <div class="benchmark">
                <div>
                    <b>Chrome</b>
                    <div>v83</div>
                </div>
                <div class="red">
                    <div class="benchmark-cr">10 x 3m</div>
                    <div>1,611ms</div>
                </div>
                <div class="orange">
                    <div class="benchmark-cr">10 x 2m</div>
                    <div>1,086ms</div>
                </div>
                <div class="green">
                    <div class="benchmark-cr">10 x 100k</div>
                    <div>90ms</div>
                </div>
                <div class="benchmark-spacing"></div>
                <div>
                    <b>FireFox</b>
                    <div>v77</div>
                </div>
                <div class="red">
                    <div class="benchmark-cr">10 x 5m</div>
                    <div>1,335ms</div>
                </div>
                <div class="orange">
                    <div class="benchmark-cr">10 x 4m</div>
                    <div>957ms</div>
                </div>
                <div class="green">
                    <div class="benchmark-cr">10 x 300k</div>
                    <div>105ms</div>
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
import { randomData } from '../data/random-data.js';
import { initCommonEvents } from '../global.js';

const gridContainer = ref(null);
const grid = ref(null);
const reportList = ref([]);
const previousData = ref(null);

const onResize = function() {
    if (grid.value) {
        grid.value.resize();
    }
};

const getColor = function(v) {
    v = parseInt(`${v}`);
    if (v <= 120) {
        return `<span class="green">${v}ms</span>`;
    }
    if (v <= 1200) {
        return `<span class="orange">${v}ms</span>`;
    }
    return `<span class="red">${v}ms</span>`;
};

const updateReport = function() {
    if (reportList.value.length > 3) {
        reportList.value.length = 3;
    }

    const nodes = document.querySelectorAll('.time-result');
    for (let i = 0; i < nodes.length; i++) {
        nodes[i].innerHTML = '';
    }

    let total = 0;
    reportList.value.forEach(function(item, i) {
        total += item;
        const index = i + 1;
        document.querySelector(`.time-total-${index}`).innerHTML = getColor(item);
    });

    const avg = total / reportList.value.length;
    document.querySelector('.time-total-a').innerHTML = getColor(avg);

};

const getRandomData = function() {

    const columns = document.querySelector('.ip-columns').value;
    const rows = document.querySelector('.ip-rows').value;
    const hasSubs = document.querySelector('.cb-subs').checked;

    const time_random = new Date();
    const data = randomData(`${columns}x${rows}-${hasSubs ? 'subs' : 'no-subs'}`);
    const duration = getColor(new Date() - time_random);

    const str = `generated data (${columns}x${rows} cached) cost: <b>${duration}</b>`;
    document.querySelector('.log-random').innerHTML = str;

    if (data !== previousData.value) {
        reportList.value = [];
    }
    previousData.value = data;

    return data;
};

const renderGrid = function() {

    if (grid.value) {
        grid.value.destroy();
    }

    const newGrid = new Grid(gridContainer.value);
    grid.value = newGrid;

    newGrid.bind('onFirstUpdated', function() {
        reportList.value.unshift(this.renderDuration);
        updateReport();
    });

    newGrid.bind('onSelectChanged', function(e, d) {
        console.log('onSelectChanged', d.length);
    });

    const options = {
        theme: document.querySelector('.st-theme') ? document.querySelector('.st-theme').value : 'default',
        rowNumberVisible: document.querySelector('.cb_rowNumberVisible').checked,
        frozenColumn: parseInt(document.querySelector('.ip_frozenColumn').value),
        frozenRow: parseInt(document.querySelector('.ip_frozenRow').value),
        frozenBottom: document.querySelector('.cb_frozenBottom').checked,
        selectVisible: document.querySelector('.cb_selectVisible').checked,
        bindWindowResize: true
    };
    const sortOnInit = document.querySelector('.cb_sortOnInit').checked;
    if (sortOnInit) {
        options.sortOnInit = true;
        options.sortField = 'index';
        options.sortAsc = false;
    }
    newGrid.setOption(options);

    const data = getRandomData();
    newGrid.setData(data);

    newGrid.render();

};

const render = function() {

    if (grid.value) {
        grid.value.showLoading();
    }

    setTimeout(function() {
        renderGrid();
    });

};

onMounted(() => {
    grid.value = new Grid(gridContainer.value);

    document.querySelector('.bt-start').addEventListener('click', function() {
        render();
    });

    document.querySelector('.bt-delete').addEventListener('click', function() {

        if (!grid.value) {
            return;
        }

        const now = new Date().getTime();
        const selectedRows = grid.value.getSelectedRows();
        if (!selectedRows.length) {
            console.log('Nothing selected');
            return;
        }

        grid.value.deleteRow(selectedRows);
        console.log(`${selectedRows.length} row(s) be removed.`);
        console.log(`delete cost:${new Date().getTime() - now}ms`);

    });

    ['.st-columns', '.st-rows'].forEach((item) => {
        const el = document.querySelector(item);
        if (el) {
            el.addEventListener('change', function() {
                const c = document.querySelector('.st-columns').value;
                const r = document.querySelector('.st-rows').value;
                document.querySelector('.ip-columns').value = c;
                document.querySelector('.ip-rows').value = r;
                render();
            });
        }
    });

    const crs = document.querySelectorAll('.benchmark-cr');
    for (let i = 0; i < crs.length; i += 1) {
        crs[i].addEventListener('click', function(e) {
            const v = (`${this.innerHTML}`).trim();
            if (v) {
                const arr = v.split(' x ');
                document.querySelector('.ip-columns').value = arr[0];
                document.querySelector('.ip-rows').value = arr[1];
            }
        });
    }

    ['.st-theme', '.cb-subs', '.cb_selectVisible', '.cb_sortOnInit', '.cb_rowNumberVisible', '.cb_frozenBottom', '.ip_frozenRow', '.ip_frozenColumn'].forEach(function(item) {
        const el = document.querySelector(item);
        if (el) {
            el.addEventListener('change', function() {
                render();
            });
        }
    });

    initCommonEvents(grid.value);

    window.addEventListener('resize', onResize);

    render();
});

onBeforeUnmount(() => {
    if (grid.value) {
        grid.value.destroy();
        grid.value = null;
    }
    window.removeEventListener('resize', onResize);
});
</script>

<style scoped>
.ip-columns {
    width: 50px;
}

.ip-rows {
    width: 100px;
}

.red {
    color: red;
}

.orange {
    color: orange;
}

.green {
    color: green;
}

.benchmark .red,
.benchmark .orange,
.benchmark .green {
    border-left: 1px solid #ccc;
    padding: 0 5px;
}

.benchmark-spacing {
    width: 20px;
}

.benchmark-cr {
    cursor: pointer;
}
</style>
