<template>
  <div class="main">
    <div class="controller">
      <div class="controller-header">
        <div class="controller-title">
          TurboGrid Vue Component
        </div>
      </div>
      <div>
        <button @click="addRow">
          Add row via props
        </button>
        <button @click="updateAmount">
          Update cell via getGrid
        </button>
        <button @click="toggleFilter">
          Toggle pending filter via updateToken
        </button>
        <button @click="replaceClickHandler">
          Replace click handler
        </button>
        <button @click="removeClickHandler">
          Remove click handler
        </button>
        <button @click="visible = !visible">
          {{ visible ? 'Unmount' : 'Mount' }} grid
        </button>
      </div>
      <div>
        <label><input
          v-model="preserveScroll"
          type="checkbox"
        > Preserve scroll on prop changes</label>
        <label><input
          v-model="autoTooltip"
          type="checkbox"
        > Parent tooltip for truncated text</label>
        <label><input
          v-model="autoColumnWidth"
          type="checkbox"
        > Auto column width</label>
      </div>
      <div>
        <span>Rows: {{ rows.length }}</span>
        <span>Pending filter: {{ pendingOnly ? 'on' : 'off' }}</span>
        <span>Ready: {{ ready }}</span>
        <span>Selected: {{ selectedIds.join(', ') || 'None' }}</span>
        <span>Click: {{ lastClick }}</span>
      </div>
      <details>
        <summary>Reusable wrapper source (turbogrid.vue)</summary>
        <pre class="wrapper-source">{{ wrapperSource }}</pre>
      </details>
    </div>
    <div class="grid-container">
      <TurboGrid
        v-if="visible"
        ref="turboGrid"
        :columns="columns"
        :rows="rows"
        :options="options"
        :formatters="formatters"
        :events="events"
        :render-settings="preserveScroll"
        :update-token="updateToken"
        :auto-column-width="autoColumnWidth"
        :auto-tooltip="autoTooltip"
        @ready="onReady"
        @tooltip="onTooltip"
      />
      <p v-else>
        Grid unmounted. Mount it again to create a fresh instance.
      </p>
    </div>
  </div>
</template>

<script setup>
import {
    computed, onBeforeUnmount, onMounted, ref, shallowRef, watch
} from 'vue';
import { useRoute } from 'vue-router';
import TurboGrid from '../components/turbogrid.vue';
import wrapperSource from '../components/turbogrid.vue?raw';
import { init } from '../global.js';

const route = useRoute();
const turboGrid = ref(null);
const visible = ref(true);
const ready = ref(false);
const preserveScroll = ref(true);
const autoTooltip = ref(true);
const autoColumnWidth = ref(true);
const pendingOnly = ref(false);
const updateToken = ref(0);
const selectedIds = ref([]);
const lastClick = ref('None');
const clickVersion = ref(1);
const clickEnabled = ref(true);
let nextId = 201;
let tooltipNode = null;
let tooltipTitle = '';
let renderedRows = null;

// Tooltip policy belongs to the parent, not the reusable Grid component.
const hideTooltip = () => {
    if (tooltipNode && tooltipNode.getAttribute('title') === tooltipTitle) {
        tooltipNode.removeAttribute('title');
    }
    tooltipNode = null;
    tooltipTitle = '';
};

const hasTooltip = (node) => node instanceof Element && node.closest('[title], [tooltip]');
const isTruncated = (node) => node.scrollWidth > node.clientWidth || node.scrollHeight > node.clientHeight;

const getTooltipNode = (data) => {
    const cell = data?.cellNode;
    if (!cell || hasTooltip(data.e?.target)) {
        return null;
    }
    const node = cell.querySelector('.tg-tree-name') || cell;
    if (hasTooltip(node)) {
        return null;
    }
    return isTruncated(node) ? node : null;
};

const onTooltip = (data) => {
    hideTooltip();
    const node = getTooltipNode(data);
    if (node) {
        tooltipTitle = node.textContent;
        node.title = tooltipTitle;
        tooltipNode = node;
    }
};

const columns = [{
    id: 'title',
    name: 'Order',
    type: 'string',
    initWidth: 220,
    maxWidth: 700
}, {
    id: 'amount',
    name: 'Amount',
    type: 'number',
    formatter: 'money',
    width: 130
}, {
    id: 'status',
    name: 'Status',
    type: 'string',
    width: 130
}, {
    id: 'description',
    name: 'Description',
    type: 'string',
    width: 260
}];
const rows = shallowRef(Array.from({
    length: 200
}, (_, index) => ({
    id: `order-${index + 1}`,
    title: `Order ${index + 1}: a long title demonstrating a truncated-text tooltip`,
    amount: (index + 1) * 10,
    status: index % 2 ? 'Completed' : 'Pending',
    description: 'Vue owns business data; Grid owns the rendered cell DOM.'
})));

const money = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
});
const formatters = {
    money: (value, row) => document.createTextNode(money.format(row.amount))
};
const options = computed(() => ({
    theme: route.query.theme || 'default',
    selectVisible: true,
    rowNumberVisible: true,
    frozenColumn: 0,
    rowFilter: (row) => !pendingOnly.value || row.status === 'Pending'
}));
const syncSelection = function() {
    const ids = this.getSelectedRows().map((row) => row.id);
    if (ids.length !== selectedIds.value.length || ids.some((id, index) => id !== selectedIds.value[index])) {
        selectedIds.value = ids;
    }
};

const syncSelectionAfterRebuild = function() {
    const currentRows = this.getRows();
    // Avoid scanning every row on ordinary virtual-scroll updates.
    if (currentRows !== renderedRows) {
        renderedRows = currentRows;
        syncSelection.call(this);
    }
};

const events = computed(() => {
    const version = clickVersion.value;
    const handlers = {
        onSelectChanged: syncSelection,
        // Full data/options rebuilds do not emit onSelectChanged.
        onUpdated: syncSelectionAfterRebuild
    };
    if (clickEnabled.value) {
        handlers.onClick = (event, data) => {
            if (data?.rowItem) {
                lastClick.value = `handler ${version}: ${data.rowItem.id}`;
            }
        };
    }
    return handlers;
});

const addRow = () => {
    const id = nextId++;
    rows.value = [... rows.value, {
        id: `order-${id}`,
        title: `New order ${id}`,
        amount: 0,
        status: 'Pending',
        description: 'Added by replacing the rows prop.'
    }];
    selectedIds.value = [];
};

const updateAmount = () => {
    const grid = turboGrid.value?.getGrid();
    const row = ready.value && grid?.getRowItemById('order-1');
    if (!row) {
        return;
    }
    const amount = row.amount + 10;
    // Keep the business value in sync without replacing the prop array here.
    rows.value[0].amount = amount;
    grid.updateCell(row, 'amount', amount);
};

const toggleFilter = () => {
    pendingOnly.value = !pendingOnly.value;
    updateToken.value += 1;
};

const replaceClickHandler = () => {
    clickEnabled.value = true;
    clickVersion.value += 1;
};

const removeClickHandler = () => {
    clickEnabled.value = false;
    lastClick.value = 'Removed';
};

const onReady = () => {
    ready.value = true;
};

watch(visible, () => {
    ready.value = false;
    selectedIds.value = [];
});

onMounted(init);
onBeforeUnmount(hideTooltip);
</script>

<style scoped>
.wrapper-source {
    max-height: 240px;
    white-space: pre;
}
</style>
