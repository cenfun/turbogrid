<template>
    <div class="main flex-auto flex-column">
        <div class="controller">
            <div>
                <div class="controller-title">Grid Context Menu example (Right click)</div>
                <select class="st-data">
                    <option>sample-data</option>
                    <option>random-3x10</option>
                    <option>random-100x2k</option>
                </select>
            </div>
        </div>
        <div ref="gridContainer" class="grid-container flex-auto"></div>
    </div>
</template>

<script setup>
import {
    ref, onMounted, onBeforeUnmount
} from 'vue';
import { useRoute } from 'vue-router';
import { Grid } from '../../src/index.js';
import { sampleData } from '../assets/sample-data.js';
import { randomData } from '../assets/random-data.js';
import { initCommonEvents } from '../global.js';
const route = useRoute();


const gridContainer = ref(null);
const grid = ref(null);

const Copy = {
    copyContent: function(content) {
        navigator.clipboard.writeText(content);
        return true;
    },
    copyCellText: function(rowIndex, columnIndex) {
        const cellNode = grid.value.getCellNode(rowIndex, columnIndex);
        if (!cellNode) {
            return false;
        }
        return Copy.copyContent(cellNode.innerText);
    },
    copyCellHTML: function(rowIndex, columnIndex) {
        const cellNode = grid.value.getCellNode(rowIndex, columnIndex);
        if (!cellNode) {
            return false;
        }
        return Copy.copyContent(cellNode.innerHTML);
    },
    copyCellValue: function(rowIndex, columnIndex) {
        const rowItem = grid.value.getRowItem(rowIndex);
        const columnItem = grid.value.getColumnItem(columnIndex);
        if (!rowItem || !columnItem) {
            return false;
        }
        const value = grid.value.getCellValue(rowItem, columnItem);
        return Copy.copyContent(value);
    },
    copyRowJSON: function(rowIndex) {
        const rowItem = grid.value.getRowItem(rowIndex);
        if (rowItem) {
            const str = JSON.stringify(grid.value.getItemSnapshot(rowItem));
            return Copy.copyContent(str);
        }
        return false;
    }
};

const onResize = () => {
    grid.value?.resize();
};

onMounted(() => {
    let contextMenu = null;
    const showContextMenu = function(d) {
        if (d.headerNode) {
            return;
        }

        d.e.preventDefault();

        if (contextMenu) {
            contextMenu.parentNode.removeChild(contextMenu);
            contextMenu = null;
        }

        console.log(d);

        let html = '';
        html += '<div class="tg-context-menu-item text">Copy Cell Text</div>';
        html += '<div class="tg-context-menu-item html">Copy Cell HTML</div>';
        html += '<div class="tg-context-menu-item value">Copy Cell Value</div>';
        html += '<div class="tg-context-menu-item row">Copy Row JSON</div>';

        contextMenu = document.createElement('div');
        contextMenu.className = 'tg-context-menu';
        contextMenu.innerHTML = html;

        contextMenu.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });
        contextMenu.addEventListener('click', function(e) {
            const elem = e.target;
            let succeeded;
            if (elem.classList.contains('text')) {
                succeeded = Copy.copyCellText(d.row, d.column);
            } else if (elem.classList.contains('html')) {
                succeeded = Copy.copyCellHTML(d.row, d.column);
            } else if (elem.classList.contains('value')) {
                succeeded = Copy.copyCellValue(d.row, d.column);
            } else if (elem.classList.contains('row')) {
                succeeded = Copy.copyRowJSON(d.row);
            }
            console.log(succeeded);
            if (succeeded) {
                elem.innerHTML = 'Copied!';
            } else {
                elem.innerHTML = 'Copy Failed!';
            }
            setTimeout(function() {
                contextMenu.parentNode.removeChild(contextMenu);
                contextMenu = null;
            }, 200);
        });

        const top = d.e.pageY;
        const left = d.e.pageX;

        contextMenu.style.top = `${top}px`;
        contextMenu.style.left = `${left}px`;

        document.body.appendChild(contextMenu);

        const clickHandler = function(ee) {
            if (!contextMenu) {
                return;
            }
            if (contextMenu === ee.target || contextMenu.contains(ee.target)) {
                return;
            }
            contextMenu.parentNode.removeChild(contextMenu);
            contextMenu = null;
            document.removeEventListener('click', clickHandler);
        };

        document.addEventListener('click', clickHandler);
    };

    grid.value = new Grid(gridContainer.value);

    grid.value.bind('onFirstUpdated', function() {
        console.log('duration:', `${this.renderDuration}ms`);
    });

    grid.value.bind('onContextMenu', function(e, d) {
        showContextMenu(d);
    });

    const renderData = (data) => {
        const options = {
            theme: route.query.theme,
            frozenColumn: 0,
            frozenRow: 1
        };
        grid.value.setOption(options);
        grid.value.setData(data);
        grid.value.render();
    };

    const render = () => {
        const dataStr = document.querySelector('.st-data').value;
        if (dataStr.startsWith('random')) {
            renderData(randomData(dataStr));
            return;
        }
        renderData(sampleData);
    };

    ['.st-data'].forEach(function(item) {
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
.tg-context-menu {
    position: absolute;
    background: #fff;
    z-index: 10;
    border: 1px solid #ccc;
    filter: drop-shadow(1px 2px 2px rgb(0 0 0 / 30%));
}

.tg-context-menu-item {
    cursor: default;
    font-size: 14px;
    white-space: nowrap;
    padding: 5px 20px;
    color: #333;
}

.tg-context-menu-item:hover {
    color: #000;
    background: #f5f5f5;
}
</style>
