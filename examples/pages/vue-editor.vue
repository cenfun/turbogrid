<template>
  <div class="main">
    <div class="controller">
      <div class="controller-header">
        <div class="controller-title">
          Grid editor with Vue components <a
            href="https://cenfun.github.io/vine-ui"
            target="_blank"
          >vine-ui</a>
        </div>
      </div>
      <div>
        <button @click="exportData">
          exportData()
        </button>
        <label>
          <input
            class="bt-disable"
            type="checkbox"
            @change="onDisableChange"
          >
          disable editor
        </label>
      </div>
    </div>
    <div
      ref="gridContainer"
      class="grid-container"
    />
  </div>
</template>

<script setup>
import { Grid } from '../../src/index.js';
import { init, initCommonEvents } from '../global.js';
import {
    ref, onMounted, onBeforeUnmount
} from 'vue';
import { useRoute } from 'vue-router';
import {
    mount, VuiSwitch, VuiSelect
} from 'vine-ui';
import InputEditor from '../components/input-editor.vue';
const route = useRoute();

const hasOwn = function(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
};

const getEditable = (rowItem, columnItem) => {
    const checked = document.querySelector('.bt-disable').checked;
    if (checked) {
        return false;
    }

    if (hasOwn(columnItem, 'editable') && !columnItem.editable) {
        return false;
    }

    if (hasOwn(rowItem, 'editable') && !rowItem.editable) {
        return false;
    }

    const cellKey = `${columnItem.id}_editable`;
    if (hasOwn(rowItem, cellKey) && !rowItem[cellKey]) {
        return false;
    }

    return true;
};

const editorFormatters = {
    inputEditor: (value, rowItem, columnItem) => {
        const div = document.createElement('div');
        mount(InputEditor, {
            el: div,
            props: {
                type: columnItem.editor,
                value,
                rowItem,
                columnItem,
                disabled: !getEditable(rowItem, columnItem),
                onEditorChange: (newValue) => {
                    rowItem[columnItem.id] = newValue;
                }
            }
        });
        return div;
    },
    switchEditor: (value, rowItem, columnItem) => {
        const div = document.createElement('div');
        div.className = 'editor-switch';
        mount(VuiSwitch, {
            el: div,
            props: {
                modelValue: value,
                disabled: !getEditable(rowItem, columnItem),
                onChange: (newValue) => {
                    rowItem[columnItem.id] = newValue;
                }
            }
        });
        return div;
    },
    selectEditor: (value, rowItem, columnItem) => {
        const div = document.createElement('div');
        div.className = 'editor-select';
        mount(VuiSelect, {
            el: div,
            props: {
                options: columnItem.options,
                modelValue: value,
                disabled: !getEditable(rowItem, columnItem),
                'onUpdate:modelValue': (newValue) => {
                    rowItem[columnItem.id] = newValue;
                }
            }
        });
        return div;
    }
};

const editorData = {
    columns: [{
        id: 'name',
        name: 'Name',
        formatter: 'inputEditor',
        editor: 'text'
    }, {
        id: 'text',
        name: 'Text',
        formatter: 'inputEditor',
        editor: 'text'
    }, {
        id: 'readonly',
        name: 'Readonly',
        editable: false
    }, {
        id: 'number',
        name: 'Number',
        type: 'number',
        formatter: 'inputEditor',
        editor: 'number'
    }, {
        id: 'date',
        name: 'Date',
        width: 120,
        formatter: 'inputEditor',
        editor: 'date'
    }, {
        id: 'switch',
        name: 'Switch',
        formatter: 'switchEditor'
    }, {
        id: 'select',
        name: 'Select',
        width: 120,
        formatter: 'selectEditor',
        options: [{
            label: 'Option 1',
            value: '1'
        }, {
            label: 'Option 2',
            value: '2'
        }, {
            label: 'Option 3',
            value: '3'
        }]
    }],

    rows: [{
        name: 'readonly row',
        text: 'My Text',
        readonly: 'readonly',
        number: 123,
        date: '2024-03-28',
        switch: true,
        select: '2',
        editable: false
    }, {
        name: 'This is name 1',
        text: 'My Text 1',
        readonly: 'readonly 1',
        number: 123,
        date: '2024-03-28',
        switch: true,
        select: '1'
    }, {
        name: 'readonly name, date and select',
        name_editable: false,
        text: 'My Text 2',
        readonly: 'readonly 2',
        number: 456,
        date: '2024-03-28',
        date_editable: false,
        switch: false,
        select: '2',
        select_editable: false
    }]
};

let i = 3;
while (i < 100) {
    editorData.rows.push({
        name: `This is name ${i}`,
        text: `My Text ${i}`,
        readonly: `readonly ${i}`,
        number: Math.round(1000 * Math.random()),
        date: '2024-03-28',
        switch: Math.random() > 0.5,
        select: Math.ceil(3 * Math.random())
    });
    i++;
}

const gridContainer = ref(null);
const grid = ref(null);


const exportData = () => {
    if (grid.value) {
        const data = grid.value.exportData();
        console.log(data);
    }
};

const onDisableChange = () => {
    if (grid.value) {
        grid.value.rerender();
    }
};

onMounted(() => {
    init();
    const g = new Grid(gridContainer.value);
    grid.value = g;

    g.bind('onFirstUpdated', function() {
        console.log('duration:', `${this.renderDuration}ms`);
    });

    g.bind('onSort', function(e, d) {
        if (d.e.target.classList.contains('tg-header-icon')) {
            d.e.preventDefault();
            console.log('event prevented');
        }
    });

    const renderData = (data) => {
        g.setOption({
            bindWindowResize: true,
            theme: route.query.theme,
            selectVisible: true
        });
        g.setFormatter(editorFormatters);
        g.setData(data);
        g.render();
    };

    const doRender = () => {
        renderData(editorData);
    };

    initCommonEvents(g);

    doRender();
});

onBeforeUnmount(() => {
    if (grid.value) {
        grid.value.destroy();
    }
});
</script>

<style lang="scss">
.editor-input {
    input {
        width: 100%;
        height: 100%;
        outline: none;
    }
}

.editor-input-disabled {
    color: gray;
}

.editor-switch {
    padding: 5px;
}

.editor-select {
    padding: 2px 5px;
    line-height: 100%;
}
</style>
