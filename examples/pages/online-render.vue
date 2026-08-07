<template>
  <div class="main">
    <div class="controller">
      <div class="controller-header">
        <div class="controller-title">
          Grid Online Render:
        </div>
      </div>
      <div>
        <div class="tg-form">
          options:
          <textarea
            v-model="optionsText"
            class="tg-textarea tg_options"
          />
        </div>
        <div class="tg-form">
          data:
          <textarea
            v-model="dataText"
            class="tg-textarea tg_data"
          />
        </div>
      </div>
      <div>
        <input
          type="button"
          class="bt-render"
          value="render()"
          @click="render"
        >
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


const gridContainer = ref(null);
const grid = ref(null);
const optionsText = ref('');
const dataText = ref('');

const render = () => {
    const options = JSON.parse(optionsText.value);
    options.bindWindowResize = true;
    options.theme = route.query.theme;
    grid.value.setOption(options);
    const data = JSON.parse(dataText.value);
    grid.value.setData(data);
    grid.value.render();
};

onMounted(() => {
    init();
    const myOption = {
        rowHeight: 23,
        selectVisible: false,
        sortField: '',
        sortOnInit: false,
        frozenColumn: -1,
        frozenRow: -1,
        textSelectable: false,
        scrollbarSize: 15
    };

    const myData = {
        columns: [{
            id: 'name',
            width: 180,
            name: 'Name'
        }, {
            name: 'DataPoint'
        }, {
            name: 'DataPoint'
        }, {
            name: 'Group',
            subs: [{
                name: 'DataPoint'
            }, {
                name: 'DataPoint'
            }]
        }, {
            name: 'Group',
            subs: [{
                name: 'DataPoint'
            }, {
                name: 'DataPoint'
            }]
        }, {
            name: 'Group',
            subs: [{
                name: 'DataPoint'
            }, {
                name: 'DataPoint'
            }]
        }],
        rows: [{
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
            }]
        }, {
            name: 'Group',
            subs: [{
                name: 'Holding'
            }, {
                name: 'Holding'
            }]
        }]
    };

    optionsText.value = JSON.stringify(myOption, null, 4);
    dataText.value = JSON.stringify(myData, null, 4);

    const g = new Grid(gridContainer.value);
    grid.value = g;

    g.bind('onFirstUpdated', function() {
        console.log('duration:', `${this.renderDuration}ms`);
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
.tg-form {
    width: calc(50% - 5px);
}

.tg-textarea {
    width: 100%;
    height: 123px;
}
</style>
