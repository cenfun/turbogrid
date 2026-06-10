<template>
    <div class="main flex-auto flex-column">
        <div class="controller">
            <div>
                <div class="controller-title">Grid Infinite Scroll</div>
            </div>
            <div>
                <label>
                    rowHeight
                    <input type="number" value="30" class="ip-number ip_rowHeight" />
                </label>
                <label>
                    <input type="checkbox" class="cb_scrollbarFade" />
                    scrollbarFade
                </label>
            </div>
            <div>
                <label>
                    Page Size
                    <input type="number" value="50" class="ip-number ip_pageSize" />
                </label>
                <label>
                    <input type="checkbox" checked class="cb_rowHeightFix" />
                    rowHeightFix
                </label>
                <input class="bt-del" type="button" value="delete selected rows" />
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

    let dateGenerator = new Date();
    const createRandomNews = function() {
        const arr = [];
        arr.length = 1 + Math.ceil(15 * Math.random());
        let title = arr.join('This is news title. ');
        const svgIcon = '<svg width="13" height="13" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1500 1500" width="100%" height="100%"><path d="M752.5 2.5c-410 0-750 340-750 750s340 750 750 750 750-340 750-750-340-750-750-750zm0 1400c-360 0-650-290-650-650s290-650 650-650 650 290 650 650-290 650-650 650zm-20-490l-290-440-80 60 370 560 380-560-80-60-300 440z"></path></svg>';
        if (Math.random() > 0.8) {
            title += svgIcon;
        } else if (Math.random() > 0.7) {
            title += '<a href="#">Link</a>';
        } else if (Math.random() > 0.6) {
            title = `<span style="font-size:20px;font-weight:bold;">${title}</span>`;
        } else if (Math.random() > 0.5) {
            title = `<span style="color:#008000;">${title}</span>`;
        }
        dateGenerator = new Date(dateGenerator.getTime() - Math.round(3 * 24 * 60 * 60 * 1000 * Math.random()));
        const date = dateGenerator.getTime();
        return {
            title: title,
            date: date
        };
    };

    const loadNextPage = function() {
        const rowsHeight = g.getRowsHeight();
        const scrollViewHeight = g.getScrollViewHeight();
        const scrollTop = g.getScrollTop();
        const frozenRowsHeight = g.frozenRowsHeight;

        const distance = Math.abs(rowsHeight - scrollViewHeight - scrollTop - frozenRowsHeight);
        const hasRows = g.getViewRows().length;

        if (!hasRows || distance < 20) {
            g.showLoading();

            console.log('loading data...');
            const timeout = 200 + Math.round(2000 * Math.random());
            setTimeout(function() {
                const list = [];
                let i = 0;
                const pageSize = parseInt(document.querySelector('.ip_pageSize').value, 10);
                while (i < pageSize) {
                    list.push(createRandomNews());
                    i++;
                }
                list.sort(function(a, b) {
                    return b.date - a.date;
                });

                const parent = null;
                const position = null;
                const scrollTo = false;
                g.addRow(list, parent, position, scrollTo);

                g.hideLoading();

            }, timeout);
        }
    };

    const updateWidth = function() {
        const titleColumn = g.getColumnItem('title');
        const containerWidth = g.containerWidth;
        let otherWidth = 5;
        g.viewColumns.forEach(function(item) {
            if (item.id === 'title') {
                return;
            }
            otherWidth += item.width;
        });
        const titleWidth = containerWidth - otherWidth - g.getScrollbarWidth();
        if (titleWidth === titleColumn.width) {
            return;
        }
        console.log(`updateWidth: ${titleWidth}`);

        g.setColumnWidth(titleColumn, titleWidth);
    };

    g.bind('onUpdated', function(e, d) {
        updateWidth();
        loadNextPage();
    });

    function getData() {
        return {
            columns: [{
                id: 'tg_index',
                name: 'NO.',
                sortable: false,
                align: 'center',
                width: 50,
                formatter: function(v) {
                    return v + 1;
                }
            }, {
                id: 'title',
                name: 'Title',
                sortable: false,
                resizable: false,
                maxWidth: 2048
            }, {
                id: 'date',
                name: 'Date',
                type: 'date',
                width: 90,
                sortable: false,
                formatter: function(v) {
                    if (typeof v === 'number') {
                        return new Intl.DateTimeFormat('en-US', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                        }).format(v);
                    }
                }
            }],
            rows: []
        };
    }

    function render() {
        const options = {
            theme: document.querySelector('.st-theme').value,
            rowHeight: parseInt(document.querySelector('.ip_rowHeight').value, 10),
            scrollbarFade: document.querySelector('.cb_scrollbarFade').checked,
            frozenRow: 1,
            selectVisible: true,
            textSelectable: true,
            cellResizeObserver: function(rowItem, columnItem) {
                if (columnItem.id === 'title') {
                    return true;
                }
            }
        };
        g.setOption(options);
        g.setData(getData());
        g.render();
    }

    document.querySelector('.bt-del').addEventListener('click', function() {
        const selectedRows = g.getSelectedRows();
        if (!selectedRows.length) {
            return;
        }
        g.deleteRow(selectedRows);
    });

    ['.st-theme', '.ip_pageSize', '.ip_rowHeight', '.cb_scrollbarFade', '.cb_rowHeightFix'].forEach(function(item) {
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
