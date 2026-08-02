<template>
  <div class="main flex-auto flex-column">
    <div class="controller">
      <div>
        <div class="controller-title">
          Customize column/row CSS style:
        </div>
        <select class="st-data">
          <option>random-10x100</option>
          <option>random-100x2k</option>
        </select>
      </div>
      <div>
        <div>
          row item props:
          <pre><code class="language-js">
                        {
                            classMap: "row-class",
                            styleMap: "background:#ddd;",
                            [columnId]ClassMap: "cell-class",
                            [columnId]StyleMap: "background:#ddd;"
                        }
                    </code></pre>
        </div>

        <div>
          column item props:
          <pre><code class="language-js">
                        {
                            classMap: "column-class",
                            styleMap: "background:#ddd;",
                            headerClassMap: "header-class",
                            headerStyleMap: "background:#ddd;"
                        }
                    </code></pre>
        </div>

        <div>
          global row class:
          <pre><code class="language-css">
                        .tg-even {}
                        .tg-odd {}
                        .tg-selected {}
                        .tg-hover {}
                    </code></pre>
        </div>
      </div>

      <div>
        <button class="setErrorRow">
          setErrorRow
        </button>
        <button class="clearErrorRow">
          clearErrorRow
        </button>
      </div>
    </div>
    <div
      ref="gridContainer"
      class="grid-container grid-container-style flex-auto"
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

onMounted(() => {
    init();
    const g = new Grid(gridContainer.value);
    grid.value = g;

    g.bind('onFirstUpdated', function() {
        console.log('duration:', `${this.renderDuration}ms`);
    });

    const renderData = function(data) {
        g.setOption({
            theme: route.query.theme || 'default',
            frozenColumn: 0,
            frozenRow: 1
        });

        data.rows[2].styleMap = {
            'font-weight': 'bold'
        };

        data.rows[3].classMap = 'row-class';

        data.rows[4].styleMap = 'background:#ddd;';

        data.rows[5].c3ClassMap = 'cell-class';

        data.rows[5].c4StyleMap = 'color:red;';

        const c1 = data.columns[1];
        if (c1) {
            c1.styleMap = {
                'background': '#ddd'
            };
        }

        data.rows[5].c1StyleMap = 'background:#666;color:#fff;';

        const c2 = data.columns[2];
        if (c2) {
            c2.headerClassMap = 'header-class';
            c2.classMap = 'column-class';
        }

        const c4 = data.columns[4];
        if (c4 && !c4.subs) {
            c4.headerClassMap = 'header-class';
            c4.classMap = 'column-class';
        }

        const c6 = data.columns[6];
        if (c6 && !c6.subs) {
            c6.headerClassMap = 'header-class';
            c6.classMap = 'column-class';
        }

        g.setData(data);
        g.render();
    };

    function render() {
        const dataStr = document.querySelector('.st-data').value;

        if (dataStr.startsWith('random')) {
            renderData(randomData(dataStr));
            return;
        }

        renderData(sampleData);
    }

    document.querySelector('.setErrorRow').addEventListener('click', function() {
        const rowIndex = 1;
        const row = g.getRowItem(rowIndex);
        row.classMap = 'red-row';
        g.flushRow(rowIndex);
        g.render();
        console.log('setErrorRow');
    });

    document.querySelector('.clearErrorRow').addEventListener('click', function() {
        const rowIndex = 1;
        const row = g.getRowItem(rowIndex);
        row.classMap = '';
        g.flushRow(rowIndex);
        g.render();
    });

    ['.st-data'].forEach(function(item) {
        const el = document.querySelector(item);
        if (el) {
            el.addEventListener('change', function() {
                render();
            });
        }
    });

    initCommonEvents(g);

    const onResize = function() {
        g.resize();
    };
    window.addEventListener('resize', onResize);

    render();
});

onBeforeUnmount(() => {
    if (grid.value) {
        grid.value.destroy();
        grid.value = null;
    }
});
</script>

<style lang="scss">
.grid-container-style {
    .header-class {
        background: #ddd;

        .tg-column-name {
            color: green;
        }
    }

    .tg-row {
        &.row-class {
            background: #ddd;

            .column-class {
                background: #999;
            }
        }

        &.red-row {
            background: red;
        }
    }

    .tg-cell.column-class {
        background: #ddd;
    }

    .cell-class {
        border: 1px solid #999;
    }

    .tg-even {
        background: #f5f5f5;
    }

    .tg-odd {
        background: #fff;
    }
}
</style>
