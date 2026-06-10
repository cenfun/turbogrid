<template>
    <div class="main flex-auto flex-column">
        <div class="controller">
            <div>
                <div class="controller-title">Grid scroll API:</div>
            </div>
            <div>
                <button>scrollToRow(0)</button>
                <button>scrollToRow(9)</button>
                <button>scrollToRow("h0")</button>
                <button>scrollToRow({"id":"total"})</button>
                <button>scrollToFirstRow()</button>
                <button>scrollToLastRow()</button>

                <button>scrollRowIntoView(20)</button>
                <button>scrollRowIntoView("h1")</button>
                <button>scrollRowIntoView("h_last")</button>
            </div>
            <div>
                <button>scrollToColumn(0)</button>
                <button>scrollToColumn(5)</button>
                <button>scrollToColumn("dp15")</button>
                <button>scrollToColumn({"id":"dp_last"})</button>

                <button>scrollToFirstColumn()</button>
                <button>scrollToLastColumn()</button>
                <button>scrollToLastColumn(true)</button>

                <button>scrollColumnIntoView("dp5")</button>
                <button>scrollColumnIntoView("dp23")</button>
                <button>scrollColumnIntoView("dp_last")</button>
            </div>
            <div>
                <button>scrollToCell(0,0)</button>
                <button>scrollToCell(3,8)</button>
                <button>scrollToCell("h1","dp5")</button>

                <button>scrollCellIntoView("h1","dp5")</button>
                <button>scrollCellIntoView("h0","dp20")</button>
                <button>scrollCellIntoView("h0","dp_last")</button>
                <button>scrollCellIntoView("h_last","dp12")</button>
                <button>scrollCellIntoView("h_last","dp_last")</button>
            </div>
            <div>
                <button>setScrollTop(300)</button>
                <button>setScrollTop(0)</button>
                <button>setScrollLeft(200)</button>
                <button>setScrollLeft(0)</button>
                <button>getScrollLeft()</button>
                <button>getScrollTop()</button>
            </div>
            <div>
                <input type="button" value="change container" class="bt-change_container" />
                <input type="button" value="change container and size" class="bt-change_container_size" />
                <div>Sets a highlight row and check scrollToRow API when resize with container changing</div>
            </div>
            <div>
                <label>
                    <input type="checkbox" class="cb_preventDefaultOnMouseWheel" />
                    preventDefault onMouseWheel
                </label>
                <label>
                    <input type="checkbox" class="cb_appendRandomRows" />
                    append random rows
                    <input type="number" min="0" value="2000" class="ip-rows" />
                </label>
                <label>
                    <input type="checkbox" class="cb_frozenRight" />
                    frozenRight
                </label>
                <label>
                    <input type="checkbox" class="cb_frozenBottom" />
                    frozenBottom
                </label>
            </div>
            <div>
                <div>onScroll: <span class="onScroll"></span></div>
            </div>
        </div>
        <div ref="gridContainer" class="grid-container flex-auto"></div>
    </div>
</template>

<script setup>
import {
    onMounted, onBeforeUnmount, ref
} from 'vue';
import { Grid } from '../../src/index.js';
import { initCommonEvents } from '../utils/helpers.js';

const gridContainer = ref(null);
const grid = ref(null);

const onResize = () => {
    if (grid.value) {
        grid.value.resize();
    }
};

onMounted(() => {
    const customData = {
        columns: [{
            id: 'name',
            name: 'Name'
        }, {
            id: 'dp1',
            name: 'DP 1'
        }, {
            id: 'dp2',
            name: 'DP 2'
        }, {
            name: 'Group 1',
            subs: [{
                id: 'dp3',
                name: 'DP 3'
            }, {
                id: 'dp4',
                name: 'DP 4'
            }]
        }, {
            name: 'Group 2',
            subs: [{
                id: 'dp5',
                name: 'DP 5'
            }, {
                id: 'dp6',
                name: 'DP 6'
            }]
        }, {
            name: 'Group 3',
            subs: [{
                id: 'dp7',
                name: 'DP 7'
            }, {
                id: 'dp8',
                name: 'DP 8'
            }]
        }, {
            id: 'dp9',
            name: 'DP 9'
        }, {
            id: 'dp10',
            name: 'DP 10'
        }, {
            id: 'dp11',
            name: 'DP 11'
        }, {
            id: 'dp12',
            name: 'DP 12'
        }, {
            id: 'dp13',
            name: 'DP 13'
        }, {
            id: 'dp14',
            name: 'DP 14'
        }, {
            id: 'dp15',
            name: 'DP 15'
        }, {
            id: 'dp16',
            name: 'DP 16'
        }, {
            id: 'dp17',
            name: 'DP 17'
        }, {
            id: 'dp18',
            name: 'DP 18'
        }, {
            id: 'dp19',
            name: 'DP 19'
        }, {
            id: 'dp20',
            name: 'DP 20'
        }, {
            id: 'dp21',
            name: 'DP 21'
        }, {
            id: 'dp22',
            name: 'DP 22'
        }, {
            id: 'dp23',
            name: 'DP 23'
        }, {
            id: 'dp24',
            name: 'DP 24'
        }, {
            id: 'dp25',
            name: 'DP 25'
        }, {
            id: 'dp_last',
            width: 500,
            name: 'DP Last'
        }],

        rows: [{
            id: 'total',
            name: 'Total'
        }, {
            name: 'Group',
            subs: [{
                name: 'Holding'
            }, {
                name: 'Holding'
            }]
        }, {
            name: 'Group',
            subs: [{
                name: 'Holding'
            }, {
                name: 'Holding'
            }]
        }, {
            name: 'Group',
            subs: [{
                name: 'Holding'
            }, {
                name: 'Holding'
            }, {
                name: 'Holding'
            }, {
                name: 'Holding'
            }, {
                name: 'Holding'
            }, {
                name: 'Holding'
            }, {
                id: 'h0',
                name: 'Holding (id=h0)'
            }, {
                name: 'Holding'
            }, {
                name: 'Holding'
            }, {
                name: 'Holding'
            }, {
                name: 'Holding'
            }, {
                name: 'Holding'
            }, {
                name: 'Holding'
            }, {
                name: 'Holding'
            }, {
                name: 'Holding'
            }, {
                id: 'h1',
                name: 'Holding (id=h1)'
            }, {
                name: 'Holding'
            }, {
                name: 'Holding'
            }, {
                name: 'Holding'
            }, {
                name: 'Holding'
            }, {
                name: 'Holding'
            }, {
                name: 'Holding'
            }, {
                name: 'Holding'
            }, {
                name: 'Holding'
            }, {
                name: 'Holding'
            }, {
                name: 'Holding'
            }, {
                name: 'Holding'
            }, {
                name: 'Holding'
            }, {
                name: 'Holding'
            }, {
                name: 'Holding'
            }, {
                name: 'Holding'
            }, {
                name: 'Holding'
            }, {
                name: 'Holding'
            }, {
                name: 'Holding'
            }, {
                name: 'Holding'
            }, {
                id: 'h_last',
                name: 'Holding (id=h_last)'
            }]
        }]
    };

    const g = new Grid(gridContainer.value);
    grid.value = g;

    g.bind('onFirstUpdated', function() {
        console.log('duration:', `${this.renderDuration}ms`);
    });

    g.bind('onMouseWheel', function(e, d) {
        if (document.querySelector('.cb_preventDefaultOnMouseWheel').checked) {
            d.e.preventDefault();
            console.log('event prevented');
        }
    });

    g.bind('onScroll', function(e, d) {
        console.log(d);
        document.querySelector('.onScroll').innerHTML = JSON.stringify(d);
    });

    const render = function() {
        g.setOption({
            theme: document.querySelector('.st-theme') ? document.querySelector('.st-theme').value : 'default',
            frozenRight: document.querySelector('.cb_frozenRight').checked,
            frozenBottom: document.querySelector('.cb_frozenBottom').checked,
            frozenColumn: 0,
            frozenRow: 0
        });
        g.setFormatter({
            tree: function(value, rowItem, columnItem, cellNode) {
                const defaultFormatter = this.getDefaultFormatter('tree');
                return defaultFormatter(`${value} (index=${rowItem.tg_index})`, rowItem, columnItem, cellNode);
            },
            header: function(v, rowItem, columnItem, cellNode) {
                let s = `index:${columnItem.tg_index} `;
                if (columnItem.id) {
                    s += `id:${columnItem.id} `;
                }
                cellNode.title = s;
                return v;
            }
        });

        const data = JSON.parse(JSON.stringify(customData));
        if (document.querySelector('.cb_appendRandomRows').checked) {
            const rows = Number(document.querySelector('.ip-rows').value);
            let i = 0;
            while (i < rows) {
                data.rows.splice(2, 0, {
                    name: `Row ${i + 11}`
                });
                i++;
            }
        }

        g.setData(data);
        g.render();
    };

    document.querySelector('.bt-change_container').addEventListener('click', function() {
        const c = gridContainer.value;
        document.querySelector('.main').appendChild(c);
        if (g) {
            g.resize();
        }
    });

    let zoomIn = false;
    document.querySelector('.bt-change_container_size').addEventListener('click', function() {
        const c = gridContainer.value;
        if (zoomIn) {
            c.style.margin = '5px';
        } else {
            c.style.margin = '5px 205px 105px 5px';
        }
        zoomIn = !zoomIn;
        document.querySelector('.main').appendChild(c);
        if (g) {
            g.resize();
        }
    });

    ['.st-theme', '.cb_appendRandomRows', '.ip-rows', '.cb_frozenRight', '.cb_frozenBottom'].forEach(function(item) {
        const el = document.querySelector(item);
        if (el) {
            el.addEventListener('change', function() {
                render();
            });
        }
    });

    initCommonEvents(g);

    window.addEventListener('resize', onResize);

    render();
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
</style>
