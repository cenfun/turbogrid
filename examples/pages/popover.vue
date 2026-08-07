<template>
  <div class="main">
    <div class="controller">
      <div class="controller-header">
        <div class="controller-title">
          Grid Hover Icon Usage:
        </div>
      </div>
      <div>
        <label>
          <input
            v-model="rowNumberVisible"
            type="checkbox"
            class="cb_rowNumberVisible"
            @change="renderCommon"
          >
          rowNumberVisible
        </label>

        <label>
          <input
            v-model="selectVisible"
            type="checkbox"
            class="cb_selectVisible"
            @change="renderCommon"
          >
          selectVisible
        </label>
      </div>

      <div>
        <label for="rd-1">
          <input
            id="rd-1"
            v-model="usage"
            name="usage"
            type="radio"
            value="1"
            @change="renderCommon"
          >
          right float on name column
        </label>
        <label for="rd-2">
          <input
            id="rd-2"
            v-model="usage"
            name="usage"
            type="radio"
            value="2"
            @change="renderCommon"
          >
          a separated column for icon
        </label>
      </div>
    </div>
    <div
      ref="gridContainer"
      class="grid-container grid-container-popover"
    />
  </div>
</template>

<script setup>
import {
    onBeforeUnmount, onMounted, reactive, ref
} from 'vue';
import { useRoute } from 'vue-router';
import { Grid } from '../../src/index.js';
import { init, initCommonEvents } from '../global.js';
import { mount } from 'vine-ui';
import RowInfoPopover from '../components/row-info-popover.vue';
const route = useRoute();

const gridContainer = ref(null);
const grid = ref(null);
const popoverApp = ref(null);
const rowNumberVisible = ref(false);
const selectVisible = ref(true);
const usage = ref('1');

const state = reactive({
    visible: false,
    target: null,
    row: null
});

const dark = route.query.theme === 'dark';
let pinnedIcon;
let pendingPopover;
let reopenTimer;

const clearReopenTimer = function() {
    if (reopenTimer) {
        clearTimeout(reopenTimer);
        reopenTimer = null;
    }
};

const unpinPopoverIcon = function() {
    if (pinnedIcon) {
        pinnedIcon.classList.remove('tg-popover-icon-pin');
        pinnedIcon = null;
    }
};

const setPopoverVisible = function(visible) {
    state.visible = visible;
};

const openPopover = function(target, row) {
    pinnedIcon = target;
    pinnedIcon.classList.add('tg-popover-icon-pin');
    state.target = target;
    state.row = row;
    setPopoverVisible(true);
};

const showPopover = function(target, row) {
    clearReopenTimer();
    if (pinnedIcon && (!state.visible || pinnedIcon !== target)) {
        pendingPopover = {
            target,
            row
        };
        setPopoverVisible(false);
        return;
    }
    openPopover(target, row);
};

const hidePopover = function() {
    clearReopenTimer();
    pendingPopover = null;
    setPopoverVisible(false);
};

const onPopoverClose = function() {
    unpinPopoverIcon();
    if (!pendingPopover) {
        return;
    }
    const nextPopover = pendingPopover;
    pendingPopover = null;
    // VuiPopover defers outside-click closing with setTimeout. Reopen in the
    // following task so that the pending close cannot hide the new popover.
    reopenTimer = setTimeout(() => {
        reopenTimer = null;
        openPopover(nextPopover.target, nextPopover.row);
    });
};

const getCommonData = function() {
    return {
        columns: [{
            id: 'name',
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
            name: 'Group Name',
            subs: [{
                name: 'Holding 1'
            }, {
                name: 'Holding 2'
            }]
        }, {
            name: 'Normal Group Name',
            subs: [{
                name: 'Holding 3'
            }, {
                name: 'Holding 4'
            }]
        }, {
            name: 'Long Group Name Long Group Name Long Group Name',
            subs: [{
                name: 'Long Holding Name 5 Long Holding Name 5 Long Holding Name 5'
            }, {
                name: 'Long Holding Name 6 Long Holding Name 6 Long Holding Name 6'
            }]
        }, {
            name: 'Special Group Name 1234567890 @^$^%^#**%(#',
            subs: [{
                name: 'Holding 7'
            }, {
                name: 'Long Holding Name 8 Long Holding Name 8 Long Holding Name 8'
            }, {
                name: 'Holding Name 9 Holding Name 9'
            }, {
                name: 'Holding 10'
            }, {
                name: 'Holding 11'
            }, {
                name: 'Holding 12'
            }, {
                name: 'Holding 13'
            }, {
                name: 'Holding 14'
            }, {
                name: 'Holding 15'
            }, {
                name: 'Holding 16'
            }, {
                name: 'Holding 17'
            }, {
                name: 'Holding 18'
            }, {
                name: 'Holding 19'
            }, {
                name: 'Holding 20'
            }, {
                name: 'Holding 21'
            }, {
                name: 'Holding 22'
            }, {
                name: 'Holding 23'
            }, {
                name: 'Holding 24'
            }, {
                name: 'Holding 25'
            }, {
                name: 'Holding 26'
            }, {
                name: 'Holding 27'
            }, {
                name: 'Holding 28'
            }, {
                name: 'Holding 29'
            }, {
                name: 'Holding 30'
            }]
        }]
    };

};

const getCommonOption = function() {
    return {
        bindWindowResize: true,
        theme: route.query.theme || 'default',
        rowNumberVisible: rowNumberVisible.value,
        selectVisible: selectVisible.value,
        frozenColumn: 0,
        frozenRow: 0
    };
};

const svgIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1500 1500" width="100%" height="100%"><path fill="currentColor" d="M752.5 2.5c-410 0-750 340-750 750s340 750 750 750 750-340 750-750-340-750-750-750zm0 1400c-360 0-650-290-650-650s290-650 650-650 650 290 650 650-290 650-650 650zm-20-490l-290-440-80 60 370 560 380-560-80-60-300 440z"></path></svg>';

const render1 = function() {
    const options = getCommonOption();

    grid.value.setOption(options);
    grid.value.setFormatter({
        tree: function(value, rowItem, columnItem, cellNode) {
            const defaultFormatter = this.getDefaultFormatter('tree');
            const icon_hover = `<div class="tg-cell-hover-icon tg-popover-icon">${svgIcon}</div>`;
            return defaultFormatter(value + icon_hover, rowItem, columnItem, cellNode);
        }
    });

    const data = getCommonData();
    data.columns[0].type = 'tree';
    grid.value.setData(data);

    grid.value.render();
};

const render2 = function() {
    const options = getCommonOption();
    grid.value.setOption(options);
    grid.value.setFormatter();

    const data = getCommonData();
    const hoverIconColumn = {
        id: 'hoverIcon',
        type: 'hoverIcon',
        name: '',
        align: 'center',
        width: 22,
        formatter: function(value, rowItem, columnItem, cellNode) {
            if (rowItem.tg_frozen) {
                return '';
            }
            return `<div class="tg-cell-hover-icon tg-popover-icon">${svgIcon}</div>`;
        },
        resizable: false,
        sortable: false,
        exportable: false
    };
    data.columns.splice(1, 0, hoverIconColumn);
    grid.value.setData(data);

    grid.value.render();
};

const renderCommon = () => {
    if (usage.value === '1') {
        render1();
    } else {
        render2();
    }
};

onMounted(() => {
    init();
    grid.value = new Grid(gridContainer.value);

    popoverApp.value = mount(RowInfoPopover, {
        props: {
            state,
            dark,
            onVisibleChange: function(visible) {
                setPopoverVisible(visible);
            },
            onClose: function() {
                onPopoverClose();
            }
        }
    });

    grid.value.bind('onFirstUpdated', function() {
        console.log('duration:', `${this.renderDuration}ms`);
    });

    grid.value.bind('onClick', function(e, d) {
        const icon = d.e.target;
        if (icon.classList.contains('tg-popover-icon')) {
            showPopover(icon, d.rowItem);
        }
    });

    grid.value.bind('onScroll', function(e, d) {
        hidePopover();
    });

    initCommonEvents(grid.value);

    render1();
});

onBeforeUnmount(() => {
    hidePopover();
    if (popoverApp.value) {
        popoverApp.value.unmount();
        popoverApp.value = null;
    }
    unpinPopoverIcon();
    if (grid.value) {
        grid.value.destroy();
        grid.value = null;
    }
});
</script>

<style lang="scss">
.grid-container-popover {
    .tg-popover-icon {
        position: absolute;
        top: 50%;
        right: 0;
        width: 16px;
        height: 16px;
        cursor: pointer;
        transform: translateY(-50%);

        svg {
            display: block;
            width: 16px;
            height: 16px;
            background: #fff;
            overflow: hidden;
            pointer-events: none;
        }
    }

    .tg-popover-icon-pin {
        display: block;
    }
}

</style>
