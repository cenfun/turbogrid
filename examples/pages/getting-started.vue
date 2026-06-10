<template>
    <div class="page">
        <div class="readme">
            <h3>Getting Started</h3>
            <pre><code class="language-js">
                npm i turbogrid
            </code></pre>
            <h3>In Browser</h3>
            <pre><code class="language-html">
                &lt;script src="path-to/dist/turbogrid.js"&gt;&lt;/script&gt;
                &lt;script&gt;
                    // console.log(window.turbogrid);
                &lt;/script&gt;
            </code></pre>
            <h3>Usage</h3>
            <div class="usage-code">
                <pre><code class="language-js">
                    const Grid = window.turbogrid.Grid;
                    const container = document.querySelector(".container");
                    container.style.height = "120px";
                    const grid = new Grid(container);
                    grid.setOption({
                        sortField: "name"
                    });
                    grid.setData({
                        columns: [{
                            id: "name",
                            name: "Name"
                        }, {
                            id: "value",
                            name: "Value"
                        }],
                        rows: [{
                            name: "Row 1",
                            value: "1"
                        }, {
                            name: "Row 2",
                            value: "2"
                        }, {
                            name: 'Row 3',
                            value: '3'
                        }]
                    });
                    grid.render();
                </code></pre>
            </div>
            <h3>Preview</h3>
            <div ref="previewContainer" class="container"></div>
        </div>
    </div>
</template>

<script setup>
import { Grid } from '../../src/index.js';
import { formatCodes } from '../global.js';
import {
    ref, onMounted, onBeforeUnmount, nextTick
} from 'vue';

const previewContainer = ref(null);
const grid = ref(null);

onMounted(() => {
    const container = previewContainer.value;
    container.style.height = '110px';
    grid.value = new Grid(container);
    grid.value.setOption({
        sortField: 'name'
    });
    grid.value.setData({
        columns: [{
            id: 'name',
            name: 'Name'
        }, {
            id: 'value',
            name: 'Value'
        }],
        rows: [{
            name: 'Row 1',
            value: '1'
        }, {
            name: 'Row 2',
            value: '2'
        }, {
            name: 'Row 3',
            value: '3'
        }]
    });
    grid.value.render();

    nextTick(() => {
        //formatCodes();
    });
});

onBeforeUnmount(() => {
    grid.value?.destroy();
});
</script>

<style scoped>
.readme {
    margin-bottom: 20px;
    padding: 10px;
}

.readme h3 {
    margin: 5px 0 0;
    padding: 10px 0;
    font-size: 18px;
}

.readme h3:first-child {
    padding-top: 0;
}

.readme p {
    margin: 0;
    padding: 0;
    font-size: 16px;
}

.container {
    border: 1px solid #ccc;
}
</style>
