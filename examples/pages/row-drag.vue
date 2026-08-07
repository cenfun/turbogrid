<template>
  <div class="main">
    <div class="controller">
      <div class="controller-header">
        <div class="controller-title">
          Grid Row Drag
        </div>
        <select
          v-model="dataStr"
          class="st-data"
          @change="render"
        >
          <option value="">
            sample data
          </option>
          <option>random-3x10</option>
          <option>random-100x20k</option>
        </select>
      </div>
      <div>
        <label>
          rowDragCrossLevel
          <select
            v-model="rowDragCrossLevel"
            class="st_rowDragCrossLevel"
            @change="render"
          >
            <option>true</option>
            <option>false</option>
            <option value="handler">specified drop list</option>
          </select>
        </label>


        <label>
          <input
            v-model="rowDragVisible"
            type="checkbox"
            class="cb_rowDragVisible"
            @change="render"
          >
          rowDragVisible
        </label>


        <label>
          <input
            v-model="textSelectable"
            type="checkbox"
            class="cb_textSelectable"
            @change="render"
          >
          textSelectable
        </label>
      </div>
      <div>
        <button>exportData()</button>
        <label>
          <input
            v-model="preventDefaultOnRowDragged"
            type="checkbox"
            class="cb_preventDefaultOnRowDragged"
          >
          preventDefault onRowDragged
        </label>
      </div>
      <div>
        <div>onRowDragged: <span class="onRowDragged">{{ draggedInfo }}</span></div>
        <div>onRowDropped: <span class="onRowDropped">{{ droppedInfo }}</span></div>
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
import { randomData } from '../assets/sample-data.js';
import { init, initCommonEvents } from '../global.js';
const route = useRoute();


const gridContainer = ref(null);
const grid = ref(null);

const customData = {
    columns: [{
        id: 'name',
        name: 'Name'
    }, {
        id: 'id',
        name: 'Id'
    }, {
        id: 'index',
        name: 'Index',
        type: 'number'
    }, {
        id: 'number',
        name: 'Number',
        type: 'number'
    }, {
        id: 'number2',
        name: 'Number2',
        type: 'number'
    }, {
        id: 'string_number',
        name: 'String Number',
        type: 'number',
        width: 100
    }, {
        id: 'number_string',
        name: 'Number & String',
        type: 'number',
        width: 100
    }, {
        id: 'date',
        name: 'Date',
        type: 'date',
        width: 100
    }, {
        id: 'string_null',
        name: 'String & null',
        type: 'string',
        width: 100
    }, {
        id: 'datatype_formatter',
        name: 'type formatter',
        type: 'number',
        formatter: 'numberFormatter'
    }],
    rows: [{
        id: 'frozen',
        name: 'Frozen Row'
    }, {
        id: 'id1',
        name: 'Shenzhen',
        index: 1,
        number: NaN,
        number2: 50,
        string_number: '80.123',
        number_string: 3,
        date: '2003-6-10',
        string_null: null,
        datatype_formatter: 80
    }, {
        'id': 'level_0',
        'name': 'Level 0',
        'subs': [{
            'id': '',
            'name': 'Level 1 - 1',
            'subs': [{
                'id': '',
                'name': 'Level 2 - 1'
            }, {
                'id': '',
                'name': 'Level 2 - 2'
            }, {
                'id': '',
                'name': 'Level 2 - 3'
            }]
        }, {
            'id': '',
            'name': 'Level 1 - 2',
            'subs': [{
                'id': '',
                'name': 'Level 2 - 1'
            }, {
                'id': '',
                'name': 'Level 2 - 2'
            }, {
                'id': '',
                'name': 'Level 2 - 3'
            }]
        }, {
            'id': '',
            'name': 'Level 1 - 3',
            'subs': [{
                'id': '',
                'name': 'Level 2 - 1'
            }, {
                'id': '',
                'name': 'Level 2 - 2'
            }, {
                'id': '',
                'name': 'Level 2 - 3',
                'subs': [{
                    'id': '',
                    'name': 'Level 3 - 1'
                }, {
                    'id': '',
                    'name': 'Level 3 - 2'
                }, {
                    'id': '',
                    'name': 'Level 3 - 3'
                }]
            }]
        }]
    }, {
        id: 'id2',
        name: 'Beijing',
        index: 2,
        number: 80,
        number2: 20,
        string_number: '9.3',
        number_string: 'NaN',
        date: '2003-6-5',
        string_null: null,
        datatype_formatter: 20
    }, {
        id: 'id3',
        name: 'Shanghai',
        index: 3,
        number: 80,
        number2: 50,
        string_number: '5.3',
        number_string: 'String',
        date: '2012-11-1',
        string_null: null,
        datatype_formatter: 5
    }, {
        id: 'id4',
        name: 'Changsha',
        index: 4,
        number: 70,
        number2: 50,
        string_number: '5.3',
        number_string: NaN,
        date: '2017-5-6',
        string_null: 'String',
        datatype_formatter: 112
    }, {
        id: 'id5',
        name: 'Guangzhou',
        index: 5,
        number: 30,
        number2: 30,
        string_number: '15.5',
        number_string: 13,
        date: '2012-5-1',
        string_null: 'Null String'
    }, {
        id: 'id6',
        name: 'Hangzhou',
        index: 6,
        number: 30,
        number2: 10,
        string_number: '5.3',
        number_string: NaN,
        date: '2003-6-5',
        string_null: '',
        datatype_formatter: 5
    }, {
        id: 'id7',
        name: 'Chengdu',
        index: 7,
        number: 80,
        number2: 30,
        string_number: '15.6',
        date: '2003-6-5',
        string_null: null,
        datatype_formatter: 9
    }, {
        id: 'id8',
        name: 'DaoChengYaDing',
        index: 8,
        number: 80,
        number2: 30,
        string_number: '6.5',
        number_string: 1,
        string_null: null,
        datatype_formatter: 12
    }, {
        id: 'id9',
        name: 'lower/upper case',
        index: 9,
        number: 80,
        number2: 30,
        string_number: '6.5',
        number_string: 1,
        date: '2003-6-5',
        string_null: null,
        datatype_formatter: 3
    }, {
        id: 'id10',
        name: 'Lower/upper case',
        index: 10,
        number: 80,
        number2: 30,
        string_number: '6.5',
        number_string: 1,
        date: '2006-6-5',
        string_null: null,
        datatype_formatter: 0.53
    }, {
        id: 'id11',
        name: 'lower/upper case',
        index: 11,
        number: 80,
        number2: 30,
        string_number: '6.5',
        number_string: 1,
        date: '2001-6-5',
        string_null: null
    }]
};

const dataStr = ref('');
const rowDragCrossLevel = ref('true');
const rowDragVisible = ref(true);
const textSelectable = ref(false);
const preventDefaultOnRowDragged = ref(false);
const draggedInfo = ref('');
const droppedInfo = ref('');

const renderData = (data) => {
    const handlers = {
        true: true,
        false: false,
        handler: function(d) {
            console.log(d);
            return [data.rows[1], data.rows[2]];
        }
    };
    const options = {
        bindWindowResize: true,
        theme: route.query.theme,
        rowDragCrossLevel: handlers[rowDragCrossLevel.value],
        textSelectable: textSelectable.value,
        rowDragVisible: rowDragVisible.value,
        frozenColumn: 0,
        frozenRow: 0
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
    renderData(customData);
};

onMounted(() => {
    init();
    grid.value = new Grid(gridContainer.value);

    grid.value.bind('onFirstUpdated', function() {
        console.log('duration:', `${this.renderDuration}ms`);
    });

    grid.value.bind('onRowDragged', function(e, d) {
        const {
            tg_index, tg_view_index, tg_sub_index, tg_list_index
        } = d.rowItem;

        const indexes = {
            tg_index,
            tg_view_index,
            tg_sub_index,
            tg_list_index
        };

        console.log('onRowDragged:', indexes, d);

        if (preventDefaultOnRowDragged.value) {
            d.e.preventDefault();
            console.log('event prevented');
            return;
        }

        draggedInfo.value = `${d.rowItem.name} (${d.rowItem.tg_view_index})`;
        droppedInfo.value = '';
    });

    grid.value.bind('onRowDropped', function(e, d) {
        const { dragIndex, dropIndex } = d;

        const indexes = {
            dragIndex,
            dropIndex
        };

        console.log('onRowDropped:', indexes, d);
        droppedInfo.value = `${d.rowItem.name} (${d.rowItem.tg_view_index})`;
        const $nodes = this.getRowNodes(d.rowItem);
        $nodes.addClass('tg-blink');
    });

    initCommonEvents(grid.value);

    render();
});

onBeforeUnmount(() => {
    if (grid.value) {
        grid.value.destroy();
    }
});
</script>
