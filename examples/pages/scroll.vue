<template>
  <div
    ref="main"
    class="main"
  >
    <div class="controller">
      <div class="controller-header">
        <div class="controller-title">
          Grid scroll API:
        </div>
      </div>
      <div>
        <button>scrollToRow(0)</button>
        <button>scrollToRow(9)</button>
        <button>scrollToRow("h0")</button>
        <button>scrollToRow({"id":"total"})</button>
        <button>scrollToFirstRow()</button>
        <button>scrollToLastRow()</button>

        <button>scrollRowIntoView(20)</button>
        <button>scrollRowIntoView("h1")</button>
        <button>scrollRowIntoView("h_last")</button>
      </div>
      <div>
        <button>scrollToColumn(0)</button>
        <button>scrollToColumn(5)</button>
        <button>scrollToColumn("dp15")</button>
        <button>scrollToColumn({"id":"dp_last"})</button>

        <button>scrollToFirstColumn()</button>
        <button>scrollToLastColumn()</button>
        <button>scrollToLastColumn(true)</button>

        <button>scrollColumnIntoView("dp5")</button>
        <button>scrollColumnIntoView("dp23")</button>
        <button>scrollColumnIntoView("dp_last")</button>
      </div>
      <div>
        <button>scrollToCell(0,0)</button>
        <button>scrollToCell(3,8)</button>
        <button>scrollToCell("h1","dp5")</button>

        <button>scrollCellIntoView("h1","dp5")</button>
        <button>scrollCellIntoView("h0","dp20")</button>
        <button>scrollCellIntoView("h0","dp_last")</button>
        <button>scrollCellIntoView("h_last","dp12")</button>
        <button>scrollCellIntoView("h_last","dp_last")</button>
      </div>
      <div>
        <button>setScrollTop(300)</button>
        <button>setScrollTop(0)</button>
        <button>setScrollLeft(200)</button>
        <button>setScrollLeft(0)</button>
        <button>getScrollLeft()</button>
        <button>getScrollTop()</button>
      </div>
      <div>
        <input
          type="button"
          value="change container"
          class="bt-change_container"
          @click="changeContainer"
        >
        <input
          type="button"
          value="change container and size"
          class="bt-change_container_size"
          @click="changeContainerSize"
        >
        <div>Sets a highlight row and check scrollToRow API when resize with container changing</div>
      </div>
      <div>
        <label>
          <input
            v-model="preventDefaultOnMouseWheel"
            type="checkbox"
            class="cb_preventDefaultOnMouseWheel"
          >
          preventDefault onMouseWheel
        </label>
        <label>
          <input
            v-model="appendRandomRows"
            type="checkbox"
            class="cb_appendRandomRows"
            @change="render"
          >
          append random rows
          <input
            v-model.number="rowsCount"
            type="number"
            min="0"
            class="ip-rows"
            @change="render"
          >
        </label>
        <label>
          <input
            v-model="frozenRight"
            type="checkbox"
            class="cb_frozenRight"
            @change="render"
          >
          frozenRight
        </label>
        <label>
          <input
            v-model="frozenBottom"
            type="checkbox"
            class="cb_frozenBottom"
            @change="render"
          >
          frozenBottom
        </label>
      </div>
      <div>
        <div>onScroll: <span class="onScroll">{{ scrollInfo }}</span></div>
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
import { init, initCommonEvents } from '../global.js';
const route = useRoute();


const customData = {
    columns: [{
        id: 'name',
        name: 'Name'
    }, {
        id: 'dp1',
        name: 'DP 1'
    }, {
        id: 'dp2',
        name: 'DP 2'
    }, {
        name: 'Group 1',
        subs: [{
            id: 'dp3',
            name: 'DP 3'
        }, {
            id: 'dp4',
            name: 'DP 4'
        }]
    }, {
        name: 'Group 2',
        subs: [{
            id: 'dp5',
            name: 'DP 5'
        }, {
            id: 'dp6',
            name: 'DP 6'
        }]
    }, {
        name: 'Group 3',
        subs: [{
            id: 'dp7',
            name: 'DP 7'
        }, {
            id: 'dp8',
            name: 'DP 8'
        }]
    }, {
        id: 'dp9',
        name: 'DP 9'
    }, {
        id: 'dp10',
        name: 'DP 10'
    }, {
        id: 'dp11',
        name: 'DP 11'
    }, {
        id: 'dp12',
        name: 'DP 12'
    }, {
        id: 'dp13',
        name: 'DP 13'
    }, {
        id: 'dp14',
        name: 'DP 14'
    }, {
        id: 'dp15',
        name: 'DP 15'
    }, {
        id: 'dp16',
        name: 'DP 16'
    }, {
        id: 'dp17',
        name: 'DP 17'
    }, {
        id: 'dp18',
        name: 'DP 18'
    }, {
        id: 'dp19',
        name: 'DP 19'
    }, {
        id: 'dp20',
        name: 'DP 20'
    }, {
        id: 'dp21',
        name: 'DP 21'
    }, {
        id: 'dp22',
        name: 'DP 22'
    }, {
        id: 'dp23',
        name: 'DP 23'
    }, {
        id: 'dp24',
        name: 'DP 24'
    }, {
        id: 'dp25',
        name: 'DP 25'
    }, {
        id: 'dp_last',
        width: 500,
        name: 'DP Last'
    }],

    rows: [{
        id: 'total',
        name: 'Total'
    }, {
        name: 'Group',
        subs: [{
            name: 'Holding'
        }, {
            name: 'Holding'
        }]
    }, {
        name: 'Group',
        subs: [{
            name: 'Holding'
        }, {
            name: 'Holding'
        }]
    }, {
        name: 'Group',
        subs: [{
            name: 'Holding'
        }, {
            name: 'Holding'
        }, {
            name: 'Holding'
        }, {
            name: 'Holding'
        }, {
            name: 'Holding'
        }, {
            name: 'Holding'
        }, {
            id: 'h0',
            name: 'Holding (id=h0)'
        }, {
            name: 'Holding'
        }, {
            name: 'Holding'
        }, {
            name: 'Holding'
        }, {
            name: 'Holding'
        }, {
            name: 'Holding'
        }, {
            name: 'Holding'
        }, {
            name: 'Holding'
        }, {
            name: 'Holding'
        }, {
            id: 'h1',
            name: 'Holding (id=h1)'
        }, {
            name: 'Holding'
        }, {
            name: 'Holding'
        }, {
            name: 'Holding'
        }, {
            name: 'Holding'
        }, {
            name: 'Holding'
        }, {
            name: 'Holding'
        }, {
            name: 'Holding'
        }, {
            name: 'Holding'
        }, {
            name: 'Holding'
        }, {
            name: 'Holding'
        }, {
            name: 'Holding'
        }, {
            name: 'Holding'
        }, {
            name: 'Holding'
        }, {
            name: 'Holding'
        }, {
            name: 'Holding'
        }, {
            name: 'Holding'
        }, {
            name: 'Holding'
        }, {
            name: 'Holding'
        }, {
            name: 'Holding'
        }, {
            id: 'h_last',
            name: 'Holding (id=h_last)'
        }]
    }]
};

const gridContainer = ref(null);
const grid = ref(null);
const preventDefaultOnMouseWheel = ref(false);
const appendRandomRows = ref(false);
const rowsCount = ref(2000);
const frozenRight = ref(false);
const frozenBottom = ref(false);
const scrollInfo = ref('');
const main = ref(null);
let zoomIn = false;

const changeContainer = () => {
    const c = gridContainer.value;
    main.value.appendChild(c);
    if (grid.value) {
        grid.value.resize();
    }
};

const changeContainerSize = () => {
    const c = gridContainer.value;
    if (zoomIn) {
        c.style.margin = '5px';
    } else {
        c.style.margin = '5px 205px 105px 5px';
    }
    zoomIn = !zoomIn;
    main.value.appendChild(c);
    if (grid.value) {
        grid.value.resize();
    }
};

const render = function() {
    grid.value.setOption({
        bindWindowResize: true,
        theme: route.query.theme || 'default',
        frozenRight: frozenRight.value,
        frozenBottom: frozenBottom.value,
        frozenColumn: 0,
        frozenRow: 0
    });
    grid.value.setFormatter({
        tree: function(value, rowItem, columnItem, cellNode) {
            const defaultFormatter = this.getDefaultFormatter('tree');
            return defaultFormatter(`${value} (index=${rowItem.tg_index})`, rowItem, columnItem, cellNode);
        },
        header: function(v, rowItem, columnItem, cellNode) {
            let s = `index:${columnItem.tg_index} `;
            if (columnItem.id) {
                s += `id:${columnItem.id} `;
            }
            cellNode.title = s;
            return v;
        }
    });

    const data = JSON.parse(JSON.stringify(customData));
    if (appendRandomRows.value) {
        const rows = rowsCount.value;
        let i = 0;
        while (i < rows) {
            data.rows.splice(2, 0, {
                name: `Row ${i + 11}`
            });
            i++;
        }
    }

    grid.value.setData(data);
    grid.value.render();
};

onMounted(() => {
    init();
    const g = new Grid(gridContainer.value);
    grid.value = g;

    g.bind('onFirstUpdated', function() {
        console.log('duration:', `${this.renderDuration}ms`);
    });

    g.bind('onMouseWheel', function(e, d) {
        if (preventDefaultOnMouseWheel.value) {
            d.e.preventDefault();
            console.log('event prevented');
        }
    });

    g.bind('onScroll', function(e, d) {
        console.log(d);
        scrollInfo.value = JSON.stringify(d);
    });

    initCommonEvents(g);

    render();
});


onBeforeUnmount(() => {
    if (grid.value) {
        grid.value.destroy();
        grid.value = null;
    }
});
</script>
