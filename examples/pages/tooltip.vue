<template>
    <div class="main flex-auto flex-column">
        <div class="controller">
            <div>
                <div class="controller-title">Grid Tooltip Usage:</div>
            </div>
        </div>
        <div ref="gridContainer" class="grid-container flex-auto"></div>
    </div>
</template>

<script setup>
import {
    onMounted, onBeforeUnmount, ref
} from 'vue';
import { useRoute } from 'vue-router';
import { Grid } from '../../src/index.js';
import { initCommonEvents } from '../global.js';
const route = useRoute();


const gridContainer = ref(null);
const grid = ref(null);

onMounted(() => {
    const g = new Grid(gridContainer.value);
    grid.value = g;

    g.bind('onFirstUpdated', function () {
        console.log('duration:', `${this.renderDuration}ms`);
    });

    const isNodeTruncated = function (node) {
        if (!node) {
            return false;
        }
        if (node.clientWidth < node.scrollWidth) {
            return true;
        }
        return false;
    };

    g.bind('onMouseOver', function (e, d) {
        const target = d.e.target;

        if (target.classList.contains('tg-tooltip-icon')) {
            // eslint-disable-next-line no-undef
            showTooltip(target, `Tooltip for icon: ${d.rowItem.name}`);
            return;
        }

        const value = d.rowItem[d.columnItem.id];
        if (value && isNodeTruncated(target)) {
            // eslint-disable-next-line no-undef
            showTooltip(target, `Tooltip for truncated text: ${value}`);
            return;
        }

        if (target.classList.contains('tg-header-icon')) {
            // eslint-disable-next-line no-undef
            showTooltip(target, `Tooltip for header: ${d.rowItem.name}`);
        }

    }).bind('onMouseOut', function (e, d) {
        // eslint-disable-next-line no-undef
        hideTooltip();
    });

    const customData = {
        columns: [{
            id: 'name',
            name: 'Name'
        }, {
            id: 'iconInfo',
            type: 'iconInfo',
            name: '',
            align: 'center',
            width: 26,
            resizable: false,
            sortable: false
        }, {
            id: 'dp1',
            name: 'DataPoint 1',
            width: 100
        }, {
            id: 'dp2',
            name: 'DataPoint 2'
        }, {
            name: 'Group 1',
            subs: [{
                id: 'dp3',
                name: 'DataPoint 3',
                width: 100
            }, {
                id: 'dp4',
                name: 'DataPoint 4'
            }]
        }, {
            name: 'Group 2',
            subs: [{
                id: 'dp5',
                name: 'DataPoint 5'
            }, {
                id: 'dp6',
                name: 'DataPoint 6'
            }]
        }, {
            name: 'Group 3',
            subs: [{
                id: 'dp7',
                name: 'DataPoint 7'
            }, {
                id: 'dp8',
                name: 'DataPoint 8',
                width: 100
            }]
        }],

        rows: [{
            name: 'Total'
        }, {
            name: 'Group Name',
            subs: [{
                name: 'Holding 1',
                dp1: 'Normal Text',
                dp2: 'Long Long Long Text',
                dp7: 'Right Text',
                dp8: 'Right Long Long Text'
            }, {
                name: 'Holding 2',
                dp1: 'Long Text Long Text',
                dp2: 'Text',
                dp7: 'Right Long Text Long Text',
                dp8: 'Right Text'
            }]
        }, {
            name: 'Normal Group Name',
            subs: [{
                name: 'Holding 3',
                dp1: 'Long Text Long Text',
                dp8: 'Right Long Text Long Text'
            }, {
                name: 'Holding 4',
                dp1: 'Long Text Long Text',
                dp8: 'Right Long Text Long Text'
            }]
        }, {
            name: 'Long Group Name Long Group Name Long Group Name',
            dp1: 'Long Group Value',
            subs: [{
                name: 'Long Holding Name 5 Long Holding Name 5 Long Holding Name 5',
                dp1: 'Long Holding Value',
                dp8: 'Right Long Holding Value'
            }, {
                name: 'Long Holding Name 6 Long Holding Name 6 Long Holding Name 6',
                dp1: 'Long Holding Value',
                dp8: 'Right Long Holding Value'
            }]
        }, {
            name: 'Special Group Name 1234567890 @^$^%^#**%(#',
            dp1: 'Group Value',
            subs: [{
                name: 'Holding 7',
                dp1: 'Value',
                dp8: 'Right Value'
            }, {
                name: 'Long Holding Name 8 Long Holding Name 8 Long Holding Name 8',
                dp1: 'Value',
                dp8: 'Right Value'
            }, {
                name: 'Holding Name 9 Holding Name 9',
                dp1: 'Value',
                dp8: 'Right Value'
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

    const svgIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 15" width="100%" height="100%"><path fill="currentColor" d="M6.8 6H5.5v1h1.2v4.8h1.5V6H6.8zm0-1.5h1.5V3H6.8v1.5zM7.5 0C3.4 0 0 3.4 0 7.5S3.4 15 7.5 15 15 11.6 15 7.5 11.6 0 7.5 0zm0 14C3.9 14 1 11.1 1 7.5S3.9 1 7.5 1 14 3.9 14 7.5 11.1 14 7.5 14z"></path></svg>';

    const render = function () {

        g.setOption({
            theme: route.query.theme || 'default',
            selectVisible: true,
            frozenColumn: 1,
            frozenRow: 1
        });

        g.setFormatter({

            header: function (value, rowItem, columnItem, cellNode) {
                if (columnItem.id === 'name') {
                    return `${value}<div class="tg-header-icon">${svgIcon}</div>`;
                }
                return value;
            },

            iconInfo: function (value, rowItem, columnItem, cellNode) {
                return `<div class="tg-tooltip-icon">${svgIcon}</div>`;
            }

        });

        g.setData(customData);
        g.render();

    };

    [].forEach(function (item) {
        const el = document.querySelector(item);
        if (el) {
            el.addEventListener('change', function () {
                render();
            });
        }
    });

    initCommonEvents(g);

    const onResize = function () {
        g.resize();
    };
    window.addEventListener('resize', onResize);

    render();
});

onBeforeUnmount(() => {
    if (grid.value) {
        grid.value.destroy();
        grid.value = null;
    }
});
</script>

<style lang="scss" scoped>
:deep(.grid-container) {
    .tg-header-icon {
        display: inline-block;
        width: 25px;
        height: 15px;
        padding: 0 5px;
        vertical-align: middle;
        cursor: pointer;
    }

    .tg-tooltip-icon {
        position: absolute;
        top: 50%;
        width: 16px;
        height: 16px;
        cursor: pointer;
        transform: translate(0, -50%);
    }

    .tg-tooltip .tg-tooltip-text {
        position: relative;
        padding: 5px;
        color: #000;
        pointer-events: none;
    }
}
</style>
