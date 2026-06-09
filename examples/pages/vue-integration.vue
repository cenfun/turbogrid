<template>
    <div class="main flex-auto flex-column">
        <div class="controller">
            <div>
                <div class="controller-title">Vue Integration</div>
                <select class="st-data" @change="onDataChange">
                    <option>random-5x10</option>
                    <option>random-100x2k</option>
                    <option>sample-data</option>
                </select>
            </div>
            <div>

            </div>
        </div>
        <div ref="gridContainer" class="grid-container flex-auto"></div>
    </div>
</template>

<script setup>
import { Grid } from 'turbogrid';
import { sampleData } from '../data/sample-data.js';
import { randomData } from '../data/random-data.js';
import { initCommonEvents } from '../utils/helpers.js';
import {
    createApp, defineComponent, shallowReactive, toRefs, ref, onMounted, onBeforeUnmount
} from 'vue';

// ====================================================================

const infoData = shallowReactive({
    selected: 0
});

const InfoComponent = defineComponent({
    setup() {
        return toRefs(infoData);
    },
    template: '( Selected: {{selected}} )'
});

// =====================================================================

const gridContainer = ref(null);
const grid = ref(null);
const infoApp = ref(null);

let onResize;

const onDataChange = () => {
    const dataStr = document.querySelector('.st-data').value;
    if (dataStr.startsWith('random')) {
        renderData(randomData(dataStr));
        return;
    }
    renderData(sampleData);
};

const renderData = (data) => {
    if (!grid.value) {
        return;
    }
    grid.value.setOption({
        theme: document.querySelector('.st-theme').value,
        selectVisible: true,
        bindWindowResize: true
    });
    grid.value.setFormatter({
        header: function(value, rowItem, columnItem) {
            if (columnItem.id === 'name') {
                return `${value}<span class="tg-name-info"></span>`;
            }
            return value;
        }
    });
    grid.value.setData(data);
    grid.value.render();
};

onMounted(() => {
    const container = gridContainer.value;
    const g = new Grid(container);
    grid.value = g;

    const updateInfo = () => {
        if (!infoApp.value) {
            infoApp.value = createApp(InfoComponent).mount('.tg-name-info');
        }
        infoData.selected = g.getSelectedRows().length;
    };

    g.bind('onFirstUpdated', function() {
        console.log('duration:', `${this.renderDuration}ms`);
    });

    g.bind('onUpdated', () => {
        infoApp.value = null;
        updateInfo();
    });

    g.bind('onSelectChanged', () => {
        updateInfo();
    });

    initCommonEvents(g);

    onResize = () => {
        g.resize();
    };
    window.addEventListener('resize', onResize);

    const dataStr = document.querySelector('.st-data').value;
    if (dataStr.startsWith('random')) {
        renderData(randomData(dataStr));
    } else {
        renderData(sampleData);
    }
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', onResize);
    if (grid.value) {
        grid.value.destroy();
    }
});
</script>

<style scoped>
.tg-name-info {
    margin-left: 10px;
    color: #f00;
    font-weight: bold;
}
</style>
