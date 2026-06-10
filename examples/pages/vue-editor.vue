<template>
    <div class="main flex-auto flex-column">
        <div class="controller">
            <div>
                <div class="controller-title">Grid editor with Vue components <a href="https://cenfun.github.io/vine-ui" target="_blank">vine-ui</a></div>
            </div>
            <div>
                <button @click="exportData">exportData()</button>
                <label>
                    <input class="bt-disable" type="checkbox" @change="onDisableChange" />
                    disable editor
                </label>
            </div>
        </div>
        <div ref="gridContainer" class="grid-container flex-auto"></div>
    </div>
</template>

<script setup>
import { Grid } from '../../src/index.js';
import { initCommonEvents } from '../utils/helpers.js';
import {
    createApp, defineComponent, ref, onMounted, onBeforeUnmount, nextTick
} from 'vue';
import { components } from 'vine-ui';

const { VuiSwitch, VuiSelect } = components;

let currentInputEditor;

const InputEditor = defineComponent({
    props: ['type', 'value', 'disabled', 'rowItem', 'columnItem'],
    template: `<div :class="classMap" @focus="start" @click="start" tabindex="0">
            <div v-if="editing">
                <div v-if="editorType==='number'">
                    <input type="number" v-model="moduleValue" @blur="end" />
                </div>
                <div v-else-if="editorType==='date'">
                    <input type="date" v-model="moduleValue" @blur="end" />
                </div>
                <div v-else>
                    <input v-model="moduleValue" @blur="end" />
                </div>
            </div>
            <div v-else>
                {{ originalValue }}
            </div>
        </div>`,
    data() {
        return {
            editing: false,
            editorType: this.$props.type,
            originalValue: this.$props.value,
            moduleValue: this.$props.value
        };
    },
    computed: {
        classMap: function() {
            const ls = ['editor-input'];
            if (this.$props.disabled) {
                ls.push('editor-input-disabled');
            }
            return ls;
        }
    },
    methods: {
        start: function() {
            if (this.$props.disabled) {
                return;
            }

            if (this.editing) {
                return;
            }

            if (currentInputEditor) {
                currentInputEditor.end();
                currentInputEditor = null;
            }

            this.editing = true;
            currentInputEditor = this;

            nextTick(() => {
                const $input = this.$el.querySelector('input');
                if ($input) {
                    $input.focus();
                    $input.select();
                }
            });
        },
        end: function() {
            this.editing = false;
            if (this.moduleValue !== this.$props.value) {
                this.$props.rowItem[this.$props.columnItem.id] = this.moduleValue;
                this.originalValue = this.moduleValue;
                this.$emit('editor-change', this.moduleValue);
            }
        }
    }
});

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
        createApp(InputEditor, {
            type: columnItem.editor,
            value,
            rowItem,
            columnItem,
            disabled: !getEditable(rowItem, columnItem),
            onEditorChange: (newValue) => {
                // console.log('editor-change', newValue);
            }
        }).mount(div);
        return div;
    },
    switchEditor: (value, rowItem, columnItem) => {
        const div = document.createElement('div');
        div.className = 'editor-switch';
        createApp(VuiSwitch, {
            checked: value,
            disabled: !getEditable(rowItem, columnItem),
            onChange: (newValue) => {
                rowItem[columnItem.id] = newValue;
            }
        }).mount(div);
        return div;
    },
    selectEditor: (value, rowItem, columnItem) => {
        const div = document.createElement('div');
        div.className = 'editor-select';
        createApp(VuiSelect, {
            options: columnItem.options,
            value,
            disabled: !getEditable(rowItem, columnItem),
            onChange: (newValue) => {
                rowItem[columnItem.id] = newValue;
            }
        }).mount(div);
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

let onResize;

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
            theme: document.querySelector('.st-theme').value,
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

    onResize = () => {
        g.resize();
    };
    window.addEventListener('resize', onResize);

    doRender();
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', onResize);
    if (grid.value) {
        grid.value.destroy();
    }
});
</script>

<style scoped>
.editor-input input {
    width: 100%;
    height: 100%;
    outline: none;
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
