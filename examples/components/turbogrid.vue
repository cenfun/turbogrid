<template>
  <div
    ref="gridEl"
    class="tg-grid-block"
  />
</template>

<script setup>
import {
    onBeforeUnmount, onMounted, ref, toRaw, watch
} from 'vue';
// In an application outside this repository: import { Grid } from 'turbogrid';
import { Grid } from '../../src/index.js';

defineOptions({
    name: 'TurboGrid'
});

const props = defineProps({
    columns: {
        type: Array,
        default: () => null
    },
    rows: {
        type: Array,
        default: () => null
    },
    options: {
        type: Object,
        default: () => ({})
    },
    formatters: {
        type: Object,
        default: () => ({})
    },
    events: {
        type: Object,
        default: () => ({})
    },
    renderSettings: {
        type: [Boolean, Object],
        default: null
    },
    updateToken: {
        type: [String, Number],
        default: ''
    },
    autoColumnWidth: {
        type: Boolean,
        default: true
    },
    autoTooltip: {
        type: Boolean,
        default: true
    }
});

const emit = defineEmits(['ready', 'tooltip']);
const gridEl = ref(null);
let grid = null;
let firstUpdated = false;
let mounted = false;
let queued = false;
let boundEvents = {};

const text = (value) => document.createTextNode(String(value ?? ''));

// Grid mutates its input. Copy tree items without losing formatter functions.
const copyItems = (items) => items.map((item) => {
    const copy = {};
    Object.entries(toRaw(item)).forEach(([key, value]) => {
        if (key.startsWith('tg_')) {
            return;
        }
        copy[key] = key === 'subs' && Array.isArray(value) ? copyItems(value) : value;
    });
    return copy;
});

// Only forward context; the parent owns tooltip content, DOM, and cleanup.
const dismissTooltip = () => emit('tooltip', null);

const createGrid = () => {
    if (grid || !gridEl.value) {
        return;
    }
    grid = new Grid(gridEl.value);
    grid.once('onFirstUpdated.turboGrid', () => {
        firstUpdated = true;
        emit('ready', grid);
    });
    grid.bind('onMouseOver.turboGrid', (event, data) => {
        if (props.autoTooltip) {
            emit('tooltip', data);
        }
    });
    grid.bind('onMouseOut.turboGrid', dismissTooltip);
    grid.bind('onScroll.turboGrid', dismissTooltip);
};

const syncEvents = () => {
    // Remove old handlers, including removed keys, before binding replacements.
    Object.entries(boundEvents).forEach(([type, handler]) => {
        grid.unbind(type, handler);
    });
    boundEvents = {};
    Object.entries(props.events || {}).forEach(([type, handler]) => {
        if (typeof handler === 'function') {
            grid.bind(type, handler);
            boundEvents[type] = handler;
        }
    });
};

const getRenderSettings = () => {
    if (props.renderSettings === true && firstUpdated) {
        return {
            scrollLeft: grid.getScrollLeft(),
            scrollTop: grid.getScrollTop()
        };
    }
    if (props.renderSettings && typeof props.renderSettings === 'object') {
        return {
            ... toRaw(props.renderSettings)
        };
    }
    return {};
};

const renderGrid = () => {
    if (!mounted || !Array.isArray(props.columns) || !Array.isArray(props.rows)) {
        return;
    }
    createGrid();
    if (!grid) {
        return;
    }
    const settings = getRenderSettings();
    dismissTooltip();
    syncEvents();
    grid.setFormatter({
        string: text,
        number: text,
        header: text,
        ... toRaw(props.formatters)
    });
    grid.setOption({
        bindContainerResize: true,
        bindWindowResize: true,
        rowNotFound: 'No matching records',
        autoColumnWidth: props.autoColumnWidth,
        textSelectable: true,
        ... toRaw(props.options)
    });
    grid.setData({
        columns: copyItems(props.columns),
        rows: copyItems(props.rows)
    });
    // New cloned data and configuration always require full initialization.
    grid.render({
        ... settings,
        type: 'all'
    });
};

const scheduleRender = () => {
    if (!mounted || queued) {
        return;
    }
    queued = true;
    queueMicrotask(() => {
        queued = false;
        // mounted also guards queued work after unmount.
        renderGrid();
    });
};

watch([
    () => props.columns,
    () => props.rows,
    () => props.options,
    () => props.formatters,
    () => props.renderSettings,
    () => props.autoColumnWidth
], scheduleRender, {
    flush: 'post'
});

// Binding changes must not reset rows, selection, sorting, or column widths.
watch(() => props.events, () => {
    if (mounted && grid) {
        syncEvents();
    }
}, {
    flush: 'post'
});

watch(() => props.autoTooltip, (enabled) => {
    if (!enabled) {
        dismissTooltip();
    }
}, {
    flush: 'post'
});

watch(() => props.updateToken, () => {
    if (grid && firstUpdated) {
        dismissTooltip();
        grid.update();
    } else {
        scheduleRender();
    }
}, {
    flush: 'post'
});

onMounted(() => {
    mounted = true;
    scheduleRender();
});

onBeforeUnmount(() => {
    mounted = false;
    dismissTooltip();
    if (grid) {
        grid.destroy();
        grid = null;
    }
    boundEvents = {};
});

defineExpose({
    getGrid: () => grid
});
</script>

<style scoped>
.tg-grid-block {
    position: relative;
    width: 100%;
    height: 100%;
    min-width: 10px;
    min-height: 10px;
    overflow: hidden;
}
</style>
