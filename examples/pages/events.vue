<template>
    <div class="main flex-auto flex-column">
        <div class="controller">
            <div>
                <div class="controller-title">Grid Events Example:</div>
                <select class="st-data">
                    <option>sample-data</option>
                    <option>random-3x10</option>
                    <option>random-100x20k</option>
                </select>
            </div>
            <div>
                <div class="flex-column flex-column-5">
                    <div>Bind Events: <button title="remove" class="bt-event-remove">&gt;&gt;</button></div>
                    <select multiple="multiple" class="event-list event-list-bind"></select>
                </div>
                <div class="flex-column flex-column-5">
                    <div>Unbind Events: <button title="add" class="bt-event-add">&lt;&lt;</button></div>
                    <select multiple="multiple" class="event-list event-list-unbind"></select>
                </div>
                <div class="flex-auto flex-column flex-column-5">
                    <div>Event logs <button class="bt-clear">Clear Logs</button></div>
                    <div class="log-container">
                        <div class="log-content"></div>
                    </div>
                </div>
            </div>
            <div>
                <button>render()</button>
                <button>rerender()</button>
                <button>addRow({"id":"id1","name":"Row"})</button>
                <button>deleteRow("id1")</button>
                <button>showMask()</button>
                <button>hideMask()</button>
            </div>
        </div>
        <div ref="gridContainer" class="grid-container flex-auto"></div>
    </div>
</template>

<script setup>
import {
    ref, onMounted, onBeforeUnmount
} from 'vue';
import { Grid } from 'turbogrid';
import { sampleData } from '../data/sample-data.js';
import { randomData } from '../data/random-data.js';
import { initCommonEvents, appendLog } from '../utils/helpers.js';

const gridContainer = ref(null);
const grid = ref(null);

const onResize = () => {
    grid.value?.resize();
};

onMounted(() => {
    grid.value = new Grid(gridContainer.value);

    grid.value.bind('onFirstUpdated', function() {
        console.log('duration:', `${this.renderDuration}ms`);
    });

    const bindEvents = function() {
        grid.value.unbind('.tge');
        const es = [];
        const types = document.querySelector('.event-list-bind').querySelectorAll('option');
        for (let i = 0; i < types.length; i++) {
            es.push(types[i].innerHTML);
        }

        es.forEach(function(type) {
            grid.value.bind(`${type}.tge`, function(e, d) {
                appendLog(type, d);
            });
        });
    };

    const currentBind = {
        onScroll: true,
        onSort: true,
        onClick: true,
        onUpdated: true,
        onFirstUpdated: true,
        onSelectChanged: true
    };

    const event_list_bind = document.querySelector('.event-list-bind');
    const event_list_unbind = document.querySelector('.event-list-unbind');

    const drawEventList = function() {

        event_list_bind.innerHTML = '';
        event_list_unbind.innerHTML = '';

        const events = grid.value.getAllEvents();
        console.log(events);
        events.forEach(function(type, i) {
            const item = document.createElement('option');
            item.innerHTML = type;
            if (currentBind[type]) {
                event_list_bind.appendChild(item);
            } else {
                event_list_unbind.appendChild(item);
            }
        });

        bindEvents();
    };

    drawEventList();

    const getValues = function(select) {
        const list = [];
        const options = select.querySelectorAll('option');
        for (let i = 0; i < options.length; i++) {
            const option = options[i];
            if (option.selected) {
                list.push(option.innerHTML);
            }
        }
        return list;
    };

    event_list_bind.addEventListener('dblclick', function() {
        getValues(this).forEach(function(k) {
            currentBind[k] = false;
        });
        drawEventList();
    });
    event_list_unbind.addEventListener('dblclick', function() {
        getValues(this).forEach(function(k) {
            currentBind[k] = true;
        });
        drawEventList();
    });

    document.querySelector('.bt-event-add').addEventListener('click', function() {
        getValues(event_list_unbind).forEach(function(k) {
            currentBind[k] = true;
        });
        drawEventList();
    });

    document.querySelector('.bt-event-remove').addEventListener('click', function() {
        getValues(event_list_bind).forEach(function(k) {
            currentBind[k] = false;
        });
        drawEventList();
    });

    document.querySelector('.bt-clear').addEventListener('click', function() {
        document.querySelector('.log-content').innerHTML = '';
    });

    const renderData = function(data) {

        grid.value.setOption({
            theme: document.querySelector('.st-theme') ? document.querySelector('.st-theme').value : 'default',
            selectVisible: true,
            frozenColumn: 0,
            frozenRow: 1
        });

        data.columns[0].type = 'tree';
        grid.value.setData(data);
        grid.value.render();
    };

    function render() {
        const dataStr = document.querySelector('.st-data').value;

        if (dataStr.startsWith('random')) {
            renderData(randomData(dataStr));
            return;
        }

        renderData(sampleData);
    }

    ['.st-data', '.st-theme'].forEach(function(item) {
        const el = document.querySelector(item);
        if (el) {
            el.addEventListener('change', function() {
                render();
            });
        }
    });

    initCommonEvents(grid.value);

    window.addEventListener('resize', onResize);

    render();
});

onBeforeUnmount(() => {
    if (grid.value) {
        grid.value.destroy();
        grid.value = null;
    }
    if (onResize) {
        window.removeEventListener('resize', onResize);
    }
});
</script>

<style scoped>
</style>
