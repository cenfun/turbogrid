<template>
    <div class="main flex-auto flex-column">
        <div class="controller">
            <div>
                <div class="controller-title">Grid Online Render:</div>
            </div>
            <div>
                <div class="tg-form">
                    options:
                    <textarea class="tg-textarea tg_options"></textarea>
                </div>
                <div class="tg-form">
                    data:
                    <textarea class="tg-textarea tg_data"></textarea>
                </div>
            </div>
            <div>
                <input type="button" class="bt-render" value="render()" />
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

const onResize = () => {
    if (grid.value) {
        grid.value.resize();
    }
};

onMounted(() => {
    const myOption = {
        rowHeight: 23,
        selectVisible: false,
        sortField: '',
        sortOnInit: false,
        frozenColumn: -1,
        frozenRow: -1,
        textSelectable: false,
        scrollbarSize: 15
    };

    const myData = {
        columns: [{
            id: 'name',
            width: 180,
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
            }]
        }, {
            name: 'Group',
            subs: [{
                name: 'Holding'
            }, {
                name: 'Holding'
            }]
        }]
    };

    document.querySelector('.tg_options').value = JSON.stringify(myOption, null, 4);
    document.querySelector('.tg_data').value = JSON.stringify(myData, null, 4);

    const g = new Grid(gridContainer.value);
    grid.value = g;

    g.bind('onFirstUpdated', function() {
        console.log('duration:', `${this.renderDuration}ms`);
    });

    const render = () => {
        const options = JSON.parse(document.querySelector('.tg_options').value);
        options.theme = document.querySelector('.st-theme').value;
        g.setOption(options);
        const data = JSON.parse(document.querySelector('.tg_data').value);
        g.setData(data);
        g.render();
    };

    ['.st-theme', '.tg_options', '.tg_data', '.bt-render'].forEach(function(item) {
        document.querySelector(item).addEventListener('change', function() {
            render();
        });
    });

    initCommonEvents(g);

    window.addEventListener('resize', onResize);

    render();
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', onResize);
    if (grid.value) {
        grid.value.destroy();
    }
});
</script>

<style scoped>
.tg-form {
    width: calc(50% - 5px);
}

.tg-textarea {
    height: 123px;
    width: 100%;
}
</style>
