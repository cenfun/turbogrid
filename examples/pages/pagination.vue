<template>
    <div class="main flex-auto flex-column">
        <div class="controller">
            <div>
                <div class="controller-title">Grid pagination example</div>
                <select class="st-data">
                    <option>random-20x1k</option>
                    <option>random-20x5k</option>
                </select>
            </div>
            <div>
                <label>
                    page:
                    <select class="st_page"></select>
                </label>

                <label>
                    page size:
                    <select class="st_pageSize">
                        <option>50</option>
                        <option>100</option>
                        <option>200</option>
                    </select>
                </label>

                <label>total page:
                    <span class="totalPage"></span>
                </label>

                <label>
                    total size:
                    <span class="totalSize"></span>
                </label>
            </div>
            <div class="page-list"></div>
            <div>
                <div>
                    <div>We do NOT recommend using pagination which is NOT good solution to Grid usage.</div>
                    <ul>
                        <li>Grid rendering 100,000+ rows with high performance.</li>
                        <li>It unnecessary to load all data to front-end because of high cost to back-end, but you could think about loading data dynamically.</li>
                        <li>Require pagination management, UI controller and back-end API</li>
                    </ul>
                    <div>Pagination issues:</div>
                    <ul>
                        <li>Group/tree structure rows</li>
                        <li>Sorting cross-page</li>
                        <li>keeping selection state cross-page</li>
                        <li>Selecting all rows</li>
                    </ul>
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
import { randomData } from '../assets/random-data.js';
import { initCommonEvents } from '../global.js';

const gridContainer = ref(null);
const grid = ref(null);

const onResize = () => {
    grid.value.resize();
};

onMounted(() => {
    grid.value = new Grid(gridContainer.value);

    grid.value.bind('onFirstUpdated', function() {
        console.log('duration:', `${this.renderDuration}ms`);
    });

    let _totalData;
    let _dataStr;
    const getRandomData = function() {
        const dataStr = document.querySelector('.st-data').value;
        if (dataStr !== _dataStr) {
            _totalData = null;
            _dataStr = dataStr;
        }

        if (_totalData) {
            return _totalData;
        }

        _totalData = randomData(dataStr);

        return _totalData;
    };

    function render() {
        const options = {
            theme: document.querySelector('.st-theme').value,
            frozenColumn: 0,
            frozenRow: -1
        };
        grid.value.setOption(options);

        const pageData = pageHandler(getRandomData());

        grid.value.showLoading();
        setTimeout(function() {
            grid.value.hideLoading();

            grid.value.setData(pageData);
            grid.value.render();

        }, 1000);
    }

    const pageNode = document.querySelector('.st_page');
    const pageList = document.querySelector('.page-list');
    pageList.addEventListener('click', function(e) {
        if (!e.target.classList.contains('page-item')) {
            return;
        }
        const page = parseInt(e.target.innerHTML, 10) || 1;
        pageNode.value = page;
        render();
    });

    const pageHandler = function(td) {
        const totalRows = td.rows;
        const totalSize = totalRows.length;
        document.querySelector('.totalSize').innerHTML = totalSize;

        const pageSize = parseInt(document.querySelector('.st_pageSize').value, 10);

        const totalPage = Math.ceil(totalSize / pageSize);
        document.querySelector('.totalPage').innerHTML = totalPage;

        let page = parseInt(document.querySelector('.st_page').value, 10) || 1;
        page = Math.max(1, page);
        page = Math.min(totalPage, page);

        pageNode.innerHTML = '';
        pageList.innerHTML = '';

        for (let i = 1; i <= totalPage; i++) {
            const option = document.createElement('option');
            option.innerHTML = i;
            pageNode.appendChild(option);

            const item = document.createElement('div');
            item.className = `page-item page-item_${i}`;
            item.innerHTML = i;
            pageList.appendChild(item);
        }

        pageNode.value = page;

        const selected = pageList.querySelector('.selected');
        if (selected) {
            selected.classList.remove('selected');
        }

        pageList.querySelector(`.page-item_${page}`).classList.add('selected');

        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const pageRows = totalRows.slice(start, end);

        return {
            rows: pageRows,
            columns: td.columns
        };
    };

    ['.st-data', '.st-theme', '.st_pageSize', '.st_page'].forEach(function(item) {
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
.page-list {
    position: relative;
    margin-top: 5px;
}

.page-item {
    border: 1px solid #ccc;
    padding: 3px 5px;
    min-width: 30px;
    text-align: center;
    cursor: pointer;
    margin: 0 5px 5px 0;
    border-radius: 3px;
}

.page-item:hover {
    background: #f5f5f5;
}

.page-item.selected {
    background: #eee;
    border: 1px solid #333;
    font-weight: bold;
}
</style>
