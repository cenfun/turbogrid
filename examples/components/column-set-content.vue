<template>
  <div class="column-set-content">
    <div
      ref="gridContainer"
      class="column-set-grid"
    />
    <div class="column-set-action">
      <button @click="moveSelectedRowsToTop">
        <VuiIcon
          icon="double-up"
          size="12px"
        />
        Top
      </button>
      <button @click="moveSelectedRowsUp">
        <VuiIcon
          icon="up"
          size="12px"
        />
        Up
      </button>
      <button @click="moveSelectedRowsDown">
        <VuiIcon
          icon="down"
          size="12px"
        />
        Down
      </button>
      <button @click="moveSelectedRowsToBottom">
        <VuiIcon
          icon="double-down"
          size="12px"
        />
        Bottom
      </button>
    </div>
    <div class="column-set-action">
      <input
        ref="columnName"
        value="Column Name"
      >
      <button @click="addRow">
        Add
      </button>
      <button @click="removeSelected">
        Remove Selected
      </button>
    </div>
  </div>
</template>

<script setup>
import {
    onBeforeUnmount, onMounted, ref, watch
} from 'vue';
import { Grid, Util } from '../../src/index.js';
import { VuiIcon } from 'vine-ui';

const props = defineProps({
    list: {
        type: Array,
        default: () => []
    },
    theme: {
        type: String,
        default: ''
    }
});

const emit = defineEmits(['change']);
const gridContainer = ref(null);
const columnName = ref(null);
let grid;

const change = () => {
    const list = grid.exportData().rows;
    Util.forEachTree(list, (item) => {
        if (item.tg_bak_formatter) {
            item.formatter = item.tg_bak_formatter;
            delete item.tg_bak_formatter;
        }
    });
    emit('change', list);
};

const init = () => {
    if (!gridContainer.value) {
        return;
    }
    if (grid) {
        grid.destroy();
    }
    grid = new Grid(gridContainer.value);
    grid.setOption({
        theme: props.theme,
        rowDragVisible: true,
        selectVisible: true,
        selectAllVisible: false,
        collapseAllVisible: false,
        headerVisible: false
    });

    ['onRowRemoved', 'onRowAdded', 'onRowMoved', 'onRowDropped'].forEach((eventName) => {
        grid.bind(eventName, change);
    });

    Util.forEachTree(props.list, (item) => {
        item.tg_bak_formatter = item.formatter;
        delete item.formatter;
        item.selectable = true;
    });

    grid.setData({
        columns: [{
            id: 'name',
            name: 'Column Name',
            width: 248,
            resizable: false,
            sortable: false
        }],
        rows: props.list
    });
    grid.render();
};

const removeSelected = () => {
    const selectedRows = grid.getSelectedRows();
    if (selectedRows.length) {
        grid.deleteRow(selectedRows);
    }
};

const addRow = () => {
    const name = columnName.value.value;
    if (!name) {
        return;
    }
    grid.addRow({
        name,
        selectable: true
    });
    columnName.value.value = '';
};

const moveSelectedRowsToTop = () => grid.moveSelectedRowsToTop();
const moveSelectedRowsUp = () => grid.moveSelectedRowsUp();
const moveSelectedRowsDown = () => grid.moveSelectedRowsDown();
const moveSelectedRowsToBottom = () => grid.moveSelectedRowsToBottom();

watch(() => props.list, init);
onMounted(init);
onBeforeUnmount(() => {
    if (grid) {
        grid.destroy();
        grid = null;
    }
});
</script>
