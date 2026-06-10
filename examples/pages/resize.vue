<template>
    <div class="main flex-auto flex-column">
        <div class="controller">
            <div>
                <div class="controller-title">Grid resize example:</div>
                <select class="st-data">
                    <option>sample-data</option>
                    <option>random-3x10</option>
                    <option>random-100x20k</option>
                </select>
            </div>
            <div>
                <label>
                    width:
                    <input class="it_width" value="100%" />
                    <select class="st_width">
                        <option>100%</option>
                        <option>500px</option>
                        <option>800px</option>
                    </select>
                </label>

                <label>
                    height:
                    <input class="it_height" value="100%" />
                    <select class="st_height">
                        <option>100%</option>
                        <option>300px</option>
                        <option>600px</option>
                        <option>0</option>
                    </select>
                </label>

                <button>resize()</button>
            </div>
            <div>
                <button>resize(600, 400)</button>
                <button>resize(800)</button>
                <button>resize({"width":1024, "height":768})</button>
                <button>resize("100%", "100%")</button>
                <button>resize(0, 0)</button>
            </div>
            <div>
                <label for="cb_bindWindowResize">
                    <input type="checkbox" id="cb_bindWindowResize" class="cb_bindWindowResize" checked />
                    bindWindowResize
                </label>
                <label for="cb_bindContainerResize">
                    <input type="checkbox" id="cb_bindContainerResize" class="cb_bindContainerResize" checked />
                    bindContainerResize
                </label>

                <label>
                    <input type="checkbox" class="cb_containerHidden" />
                    container hidden
                </label>
            </div>
        </div>
        <div class="flex-auto">
            <div class="grid-holder">
                <div ref="gridContainer" class="grid-container"></div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {
    onMounted, onBeforeUnmount, ref
} from 'vue';
import { Grid } from '../../src/index.js';
import { sampleData } from '../data/sample-data.js';
import { randomData } from '../data/random-data.js';
import { initCommonEvents } from '../utils/helpers.js';

const gridContainer = ref(null);
const grid = ref(null);

const onResize = () => {
    grid.value.resize();
};

const updateContainerSize = () => {
    const width = document.querySelector('.it_width').value;
    const height = document.querySelector('.it_height').value;

    const elem = gridContainer.value;
    elem.style.width = width;
    elem.style.height = height;
};

onMounted(() => {
    grid.value = new Grid(gridContainer.value);

    grid.value.bind('onFirstUpdated', function() {
        console.log('duration:', `${this.renderDuration}ms`);
    });

    grid.value.bind('onResize', function(e, d) {
        console.log(e.type, d);
    });

    grid.value.bind('onLayout', function(e, d) {
        console.log(e.type, d);
    });

    const renderData = (data) => {
        grid.value.setOption({
            theme: document.querySelector('.st-theme').value,
            bindWindowResize: document.querySelector('.cb_bindWindowResize').checked,
            bindContainerResize: document.querySelector('.cb_bindContainerResize').checked
        });
        grid.value.setData(data);
        grid.value.render();
    };

    const render = () => {
        const dataStr = document.querySelector('.st-data').value;

        if (dataStr.startsWith('random')) {
            renderData(randomData(dataStr));
            return;
        }

        renderData(sampleData);
    };

    ['.it_width', '.it_height'].forEach(function(item) {
        document.querySelector(item).addEventListener('change', function(e) {
            updateContainerSize();
        });
    });

    ['.st_width', '.st_height'].forEach(function(item) {
        document.querySelector(item).addEventListener('change', function() {
            document.querySelector('.it_width').value = document.querySelector('.st_width').value;
            document.querySelector('.it_height').value = document.querySelector('.st_height').value;
            updateContainerSize();
        });
    });

    document.querySelector('.cb_containerHidden').addEventListener('click', function(e) {
        gridContainer.value.style.display = this.checked ? 'none' : 'block';
    });

    ['.st-data', '.st-theme', '.cb_bindWindowResize', '.cb_bindContainerResize'].forEach(function(item) {
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
    if (grid.value) {
        grid.value.destroy();
    }
});
</script>

<style scoped>
.grid-holder {
    margin: 5px;
    width: calc(100% - 12px);
    height: calc(100% - 12px);
}

.grid-container {
    margin: 0;
    width: 100%;
    height: 100%;
    border: 1px solid #333;
}
</style>
