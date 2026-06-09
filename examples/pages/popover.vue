<template>
    <div class="main flex-auto flex-column">
        <div class="controller">
            <div>
                <div class="controller-title">Grid Hover Icon Usage:</div>
            </div>
            <div>
                <label>
                    <input type="checkbox" class="cb_rowNumberVisible" />
                    rowNumberVisible
                </label>

                <label>
                    <input type="checkbox" checked class="cb_selectVisible" />
                    selectVisible
                </label>
            </div>

            <div>
                <label for="rd-1">
                    <input name="usage" type="radio" value="1" id="rd-1" checked />
                    right float on name column
                </label>
                <label for="rd-2">
                    <input name="usage" type="radio" value="2" id="rd-2" />
                    a separated column for icon
                </label>
            </div>
        </div>
        <div ref="gridContainer" class="grid-container flex-auto"></div>
    </div>
</template>

<script setup>
import {
    onMounted, onBeforeUnmount, ref
} from 'vue';
import { Grid } from 'turbogrid';
import { initCommonEvents } from '../utils/helpers.js';

const gridContainer = ref(null);
const grid = ref(null);

const onResize = function() {
    grid.value.resize();
};

onMounted(() => {
    grid.value = new Grid(gridContainer.value);

    grid.value.bind('onFirstUpdated', function() {
        console.log('duration:', `${this.renderDuration}ms`);
    });

    grid.value.bind('onClick', function(e, d) {
        const icon = d.e.target;
        if (icon.classList.contains('tg-popover-icon')) {
            // eslint-disable-next-line no-undef
            showPopover(icon, d.rowItem);
        }
    });

    grid.value.bind('onScroll', function(e, d) {
        // eslint-disable-next-line no-undef
        hidePopover();
    });

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
            theme: document.querySelector('.st-theme') ? document.querySelector('.st-theme').value : 'default',
            rowNumberVisible: document.querySelector('.cb_rowNumberVisible').checked,
            selectVisible: document.querySelector('.cb_selectVisible').checked,
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

    document.querySelector('#rd-1').addEventListener('click', function() {
        render1();
    });

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

    document.querySelector('#rd-2').addEventListener('click', function() {
        render2();
    });

    ['.st-theme', '.cb_selectVisible', '.cb_rowNumberVisible'].forEach(function(item) {
        const el = document.querySelector(item);
        if (el) {
            el.addEventListener('change', function() {
                const checked = document.querySelector('#rd-1').checked;
                if (checked) {
                    render1();
                } else {
                    render2();
                }
            });
        }
    });

    initCommonEvents(grid.value);

    window.addEventListener('resize', onResize);

    render1();
});

onBeforeUnmount(() => {
    if (grid.value) {
        grid.value.destroy();
        grid.value = null;
    }
    window.removeEventListener('resize', onResize);
});
</script>

<style scoped>
input[type="radio"]:checked ~ label {
    font-weight: bold;
}

.tg-popover-icon {
    position: absolute;
    top: 0;
    right: 0;
    width: 20px;
    height: 32px;
    padding: 2px 0;
    cursor: pointer;
}

.tg-popover-icon svg {
    background: #fff;
}

.tg-dark .tg-popover-icon svg {
    background: #1e1e1e;
}

.grid-container .tg-popover-icon.tg-popover-icon-pin {
    display: block;
}
</style>
