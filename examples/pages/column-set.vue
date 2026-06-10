<template>
    <div class="main flex-auto flex-column">
        <div class="controller">
            <div>
                <div class="controller-title">Grid Column Set Example:</div>
                <select class="st-data">
                    <option>sample-data</option>
                    <option>random-10x10</option>
                    <option>random-10x2k</option>
                </select>
            </div>
            <div>
                <button class="bt-set">
                    <div class="icon icon-setting"></div>
                    Column Set
                </button>
            </div>
        </div>
        <div ref="gridContainer" class="grid-container flex-auto"></div>
    </div>
</template>

<script setup>
import {
    ref, onMounted, onBeforeUnmount, reactive, createApp, h, defineComponent
} from 'vue';
import { Grid, Util } from '../../src/index.js';
import { sampleData } from '../data/sample-data.js';
import { randomData } from '../data/random-data.js';
import { initCommonEvents } from '../global.js';
import VuiPopover from 'vine-ui';

const gridContainer = ref(null);
const grid = ref(null);
const popoverApp = ref(null);

const ColumnSetContent = defineComponent({
    template: `
        <div class="column-set-content">
            <div class="column-set-grid" ref="gridContainer"></div>
            <div class="column-set-action">
                <button @click="moveSelectedRowsToTop($event)">
                    <div class="icon icon-double-up"></div>
                    Top
                </button>
                <button @click="moveSelectedRowsUp($event)">
                    <div class="icon icon-up"></div>
                    Up
                </button>
                <button @click="moveSelectedRowsDown($event)">
                    <div class="icon icon-down"></div>
                    Down
                </button>
                <button @click="moveSelectedRowsToBottom($event)">
                    <div class="icon icon-double-down"></div>
                    Bottom
                </button>
            </div>
            <div class="column-set-action">
                <input ref="columnName" value="Column Name"/>
                <button @click="addRow()">Add</button>
                <button @click="removeSelected()">Remove Selected</button>
            </div>
        </div>
    `,
    props: {
        list: {
            type: Array,
            default: function() {
                return [];
            }
        }
    },
    mounted() {
        this.init();
    },
    watch: {
        list: function() {
            this.init();
        }
    },
    methods: {
        init() {
            const g = new Grid(this.$refs.gridContainer);
            g.setOption({
                theme: document.querySelector('.st-theme').value,
                rowDragVisible: true,
                selectVisible: true,
                selectAllVisible: false,
                collapseAllVisible: false,
                headerVisible: false
            });

            g.bind('onRowRemoved', () => {
                this.change();
            });
            g.bind('onRowAdded', () => {
                this.change();
            });
            g.bind('onRowMoved', () => {
                this.change();
            });
            g.bind('onRowDropped', () => {
                this.change();
            });

            Util.forEachTree(this.list, function(item) {
                item.tg_bak_formatter = item.formatter;
                delete item.formatter;
                item.selectable = true;
            });

            const data = {
                columns: [{
                    id: 'name',
                    name: 'Column Name',
                    width: 248,
                    resizable: false,
                    sortable: false
                }],
                rows: this.list
            };

            g.setData(data);
            g.render();

            this.grid = g;
        },

        removeSelected() {
            const selectedRows = this.grid.getSelectedRows();
            if (!selectedRows.length) {
                return;
            }
            this.grid.deleteRow(selectedRows);
        },

        addRow() {
            const it = this.$refs.columnName;
            const name = it.value;
            if (!name) {
                return;
            }
            this.grid.addRow({
                name: name,
                selectable: true
            });
            it.value = '';
        },

        moveSelectedRowsToTop() {
            this.grid.moveSelectedRowsToTop();
        },
        moveSelectedRowsUp() {
            this.grid.moveSelectedRowsUp();
        },
        moveSelectedRowsDown() {
            this.grid.moveSelectedRowsDown();
        },
        moveSelectedRowsToBottom() {
            this.grid.moveSelectedRowsToBottom();
        },

        change() {
            const list = this.grid.exportData().rows;
            Util.forEachTree(list, function(item) {
                if (item.tg_bak_formatter) {
                    item.formatter = item.tg_bak_formatter;
                    delete item.tg_bak_formatter;
                }
            });
            this.$emit('change', list);
        }
    }
});

const onResize = () => {
    grid.value?.resize();
};

onMounted(() => {
    grid.value = new Grid(gridContainer.value);

    grid.value.bind('onFirstUpdated', function() {
        console.log('duration:', `${this.renderDuration}ms`);
    });

    const renderData = (data) => {
        const options = {
            theme: document.querySelector('.st-theme').value,
            selectVisible: true,
            frozenColumn: 0
        };
        grid.value.setOption(options);
        grid.value.setData(data);
        grid.value.render();
    };

    const render = () => {
        const dataStr = document.querySelector('.st-data').value;
        if (dataStr.startsWith('random')) {
            renderData(randomData(dataStr));
            return;
        }
        const d = JSON.parse(JSON.stringify(sampleData));
        renderData(d);
    };

    const state = reactive({
        visible: false,
        target: null,
        list: null
    });

    const showPopover = (e) => {
        if (state.visible) {
            state.visible = false;
            return;
        }
        state.visible = true;
        state.target = e.currentTarget;
        state.list = grid.value.exportData().columns;
    };

    document.querySelector('.bt-set').addEventListener('click', function(e) {
        showPopover(e);
    });

    // Mount the popover app
    const popoverContainer = document.createElement('div');
    document.body.appendChild(popoverContainer);
    const app = createApp({
        render() {
            return h(VuiPopover, {
                title: 'Column Set',
                width: 350,
                visible: state.visible,
                target: state.target,
                onClose: function() {
                    state.visible = false;
                }
            }, {
                default: () => {
                    return h(ColumnSetContent, {
                        list: state.list,
                        onChange: function(list) {
                            const data = grid.value.getData();
                            data.columns = list;
                            grid.value.setData(data);
                            grid.value.render();
                        }
                    });
                }
            });
        }
    });
    app.mount(popoverContainer);
    popoverApp.value = app;

    ['.st-data', '.st-theme'].forEach(function(item) {
        document.querySelector(item).addEventListener('change', function() {
            render();
        });
    });

    initCommonEvents(grid.value);

    window.addEventListener('resize', onResize);

    render();
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', onResize);
    if (popoverApp.value) {
        popoverApp.value.unmount();
    }
    if (grid.value) {
        grid.value.destroy();
    }
});
</script>

<style scoped>
.bt-set,
.column-set-content button {
    display: flex;
    flex-direction: row;
    align-items: center;
    cursor: pointer;
}

.bt-set .icon {
    margin-right: 5px;
}

.column-set-content button .icon {
    width: 12px;
    height: 12px;
    margin-right: 5px;
    background-size: 12px 12px;
}

.column-set-content button,
.column-set-content input {
    margin-right: 5px;
}

button svg {
    display: block;
    width: 20px;
    height: 20px;
    margin-right: 3px;
}

.column-set-grid {
    height: 350px;
}

.column-set-action {
    display: flex;
    flex-direction: row;
    margin-top: 10px;
}
</style>
