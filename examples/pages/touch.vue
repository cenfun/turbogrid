<template>
  <div class="main main-touch">
    <div class="controller">
      <div class="controller-header">
        <div class="controller-title">
          Grid Touch:
        </div>
        <select
          v-model="dataStr"
          class="st-data"
          @change="render"
        >
          <option />
          <option>random-1x3</option>
          <option>random-1x30</option>
          <option>random-10x3</option>
          <option>random-30x100</option>
          <option>random-50x1k</option>
        </select>
      </div>
      <div>
        <label>
          <input
            v-model="autoHeight"
            type="checkbox"
            class="cb_autoHeight"
            @change="render"
          >
          autoHeight
        </label>
        <label>
          <input
            v-model="preventDefault"
            type="checkbox"
            class="cb_preventDefault"
          >
          prevent default onTouchStart
        </label>
      </div>
    </div>
    <div class="something-up">
      <div
        ref="output"
        class="output"
      />
      <div>
        <button
          class="bt-outputHeightMinus"
          @click="outputHeightMinus"
        >
          -
        </button>
        <button
          class="bt-outputHeightPlus"
          @click="outputHeightPlus"
        >
          +
        </button>
      </div>
    </div>
    <div
      ref="gridContainer"
      class="grid-container grid-container-touch"
    />
    <div class="something-down">
      something else
    </div>
  </div>
</template>

<script setup>
import {
    ref, onMounted, onBeforeUnmount
} from 'vue';
import { useRoute } from 'vue-router';
import { Grid } from '../../src/index.js';
import { sampleData, randomData } from '../assets/sample-data.js';
import { init, initCommonEvents } from '../global.js';
const route = useRoute();


const grid = ref(null);
const gridContainer = ref(null);
const dataStr = ref('');
const autoHeight = ref(false);
const preventDefault = ref(false);
const output = ref(null);

const renderData = (data) => {
    if (!autoHeight.value) {
        gridContainer.value.style.height = '500px';
    }

    const options = {
        bindWindowResize: true,
        theme: route.query.theme,
        selectVisible: true,
        frozenColumn: 0,
        frozenRow: 0,
        scrollbarSize: 10,
        autoHeight: autoHeight.value
    };
    grid.value.setOption(options);
    grid.value.setData(data);
    grid.value.render();
};

const render = () => {
    if (dataStr.value.startsWith('random')) {
        renderData(randomData(dataStr.value));
        return;
    }
    renderData(sampleData());
};

const outputHeightMinus = () => {
    output.value.style.height = `${output.value.clientHeight - 100}px`;
    grid.value.resize();
};

const outputHeightPlus = () => {
    output.value.style.height = `${output.value.clientHeight + 100}px`;
    grid.value.resize();
};

onMounted(() => {
    init();
    const log = console.log;
    let line = 0;
    console.log = function() {
        log.apply(null, arguments);

        if (!output.value) {
            return;
        }

        const arr = [];
        for (let i = 0, l = arguments.length; i < l; i++) {
            arr.push(arguments[i]);
        }
        const str = arr.join(' ');

        const item = document.createElement('div');
        item.innerText = `${line}, ${str}`;

        output.value.appendChild(item);
        output.value.scrollTop = output.value.scrollHeight;

        line += 1;
    };

    const g = new Grid(gridContainer.value);
    grid.value = g;

    g.bind('onFirstUpdated', function() {
        console.log('duration:', `${this.renderDuration}ms`);
        console.log(navigator.userAgent);
    });

    g.bind('onMouseWheel', function(e, d) {
        console.log('onMouseWheel:', d.deltaX, d.deltaY);
    });

    g.bind('onClick', function(e, d) {
        console.log('onClick', `row:${d.rowItem.tg_index}, column:${d.columnItem.tg_index}`);
    });

    g.bind('onTouchStart', function(e, d) {
        if (preventDefault.value) {
            d.e.preventDefault();
        }

        let info = '';
        if (d.rowItem && d.columnItem) {
            info = `row:${d.rowItem.tg_index}, column:${d.columnItem.tg_index}`;
        }
        console.log('onTouchStart', info);
    });

    g.bind('onTouchMove', function(e, d) {
        let info = '';
        if (d.rowItem && d.columnItem) {
            info = `row:${d.rowItem.tg_index}, column:${d.columnItem.tg_index}`;
        }
        console.log('onTouchMove', info);
    });

    g.bind('onTouchEnd', function(e, d) {
        let info = '';
        if (d.rowItem && d.columnItem) {
            info = `row:${d.rowItem.tg_index}, column:${d.columnItem.tg_index}`;
        }
        console.log('onTouchEnd', info);
    });

    initCommonEvents(g);

    render();
});

onBeforeUnmount(() => {
    if (grid.value) {
        grid.value.destroy();
    }
});
</script>

<style lang="scss">
.main-touch {
    display: block;
    overflow-y: auto;
}

.something-up {
    margin: 5px;
}

.output {
    height: 90px;
    margin-bottom: 5px;
    border: 1px solid #ccc;
    background-color: #f5f5f5;
    overflow: hidden scroll;

    div {
        padding: 3px 5px;
        font-size: 12px;
    }
}

.grid-container-touch {
    height: 500px;
}

.something-down {
    height: 800px;
    margin: 5px;
    padding: 5px;
    border: 1px solid #ccc;
    background: #f5f5f5;
}
</style>
