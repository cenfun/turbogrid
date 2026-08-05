<template>
  <div class="main">
    <div class="controller">
      <div class="controller-header">
        <div class="controller-title">
          Grid row move:
        </div>
        <select class="st-data">
          <option>sample-data</option>
          <option>random-3x10</option>
          <option>random-100x2k</option>
        </select>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked
            class="cb_rowMoveCrossLevel"
          >
          rowMoveCrossLevel
        </label>


        <label>
          <input
            type="checkbox"
            checked
            class="cb_selectMultiple"
          >
          selectMultiple
        </label>

        <input
          type="text"
          value=""
          placeholder="keywords"
          class="ip-keywords"
        >
      </div>
      <div>
        <button>moveRows(["level_0"], -1)</button>
        <button>moveRows(["level_0"], 1)</button>
        <button>moveRows(["level_0"], -10)</button>
        <button>moveRows(["level_0"], 10)</button>

        <button>moveRows("level_3_3", -2)</button>
        <button>moveRows("level_3_3", 2)</button>
        <button>moveRows("level_3_3", -3)</button>
        <button>moveRows("level_3_3", 3)</button>
      </div>
      <div>
        <button>moveRowsToTop(["level_0"])</button>
        <button>moveRowsUp(["level_0"])</button>
        <button>moveRowsDown(["level_0"])</button>
        <button>moveRowsToBottom(["level_0"])</button>
      </div>
      <div>
        <button class="tg-icon moveToTop">
          <div class="icon icon-double-up" />
          moveSelectedRowsToTop()
        </button>
        <button class="tg-icon moveUp">
          <div class="icon icon-up" />
          moveSelectedRowsUp()
        </button>
        <button class="tg-icon moveDown">
          <div class="icon icon-down" />
          moveSelectedRowsDown()
        </button>
        <button class="tg-icon moveToBottom">
          <div class="icon icon-double-down" />
          moveSelectedRowsToBottom()
        </button>
      </div>
      <div>
        <div>onRowMoved: <span class="onRowMoved" /></div>
      </div>
    </div>
    <div
      ref="gridContainer"
      class="grid-container"
    />
  </div>
</template>

<script setup>
import {
    onMounted, onBeforeUnmount, ref
} from 'vue';
import { useRoute } from 'vue-router';
import { Grid } from '../../src/index.js';
import { sampleData } from '../assets/sample-data.js';
import { randomData } from '../assets/random-data.js';
import { init, initCommonEvents } from '../global.js';
const route = useRoute();


const gridContainer = ref(null);
const grid = ref(null);
const keywords = ref('');

const onResize = () => {
    if (grid.value) {
        grid.value.resize();
    }
};

onMounted(() => {
    init();
    const g = new Grid(gridContainer.value);
    grid.value = g;

    g.bind('onFirstUpdated', function(e, d) {
        console.log('duration:', `${this.renderDuration}ms`);
        console.log(`event: ${e.type}`, d);
    });

    g.bind('onRowMoved', function(e, d) {
        console.log(`event: ${e.type}`, d);
        document.querySelector('.onRowMoved').innerHTML = d.length;
    });

    g.bind('onUpdated', function(e, d) {
        console.log(`event: ${e.type}`, d);
    });

    const renderData = (data) => {
        const options = {
            theme: route.query.theme,
            rowMoveCrossLevel: document.querySelector('.cb_rowMoveCrossLevel').checked,
            selectMultiple: document.querySelector('.cb_selectMultiple').checked,
            bindWindowResize: true,
            selectVisible: true,
            frozenColumn: 0,
            rowFilter: (rowItem) => {
                if (!keywords.value) {
                    return true;
                }
                if (rowItem.tg_frozen) {
                    return true;
                }
                let name = rowItem.name || rowItem.c0;
                if (name) {
                    name = name.toLowerCase();
                    if (name.indexOf(keywords.value) !== -1) {
                        return true;
                    }
                }
                return false;
            }
        };
        g.setFormatter({
            string: function(value, rowItem, columnItem, cellNode) {
                if (columnItem.id === 'name') {
                    if (!rowItem.tg_random) {
                        rowItem.tg_random = Math.random().toString().substr(2, 3);
                    }
                    return `${value} (${rowItem.tg_random})`;
                }
                return value;
            }
        });
        g.setOption(options);
        g.setData(data);
        g.render();
        console.log('grid render');
    };

    const render = () => {
        const dataStr = document.querySelector('.st-data').value;

        if (dataStr.startsWith('random')) {
            renderData(randomData(dataStr));
            return;
        }

        renderData(sampleData);
    };

    document.querySelector('.ip-keywords').addEventListener('keyup', () => {
        const k = document.querySelector('.ip-keywords').value;
        if (k === keywords.value) {
            return;
        }
        keywords.value = k;
        g.update();
    });

    ['.st-data', '.cb_rowMoveCrossLevel', '.cb_selectMultiple'].forEach(function(item) {
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

<style lang="scss">
.tg-icon {
    display: flex;
    flex-direction: row;
    align-items: center;

    .icon {
        width: 12px;
        height: 12px;
        margin-right: 5px;
        background-size: 12px 12px;
    }
}
</style>
