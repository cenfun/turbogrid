<template>
    <div class="main flex-auto flex-column">
        <div class="controller">
            <div>
                <div class="controller-title">Custom Element for Grid</div>
                <select class="st-data" @change="onDataChange">
                    <option>random-5x10</option>
                    <option>random-100x2k</option>
                    <option>sample-data</option>
                </select>
            </div>
            <div>
                <label>
                    <input type="checkbox" checked class="cb-shadow" @change="onDataChange" />
                    Shadow Dom
                </label>
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
    ref, onMounted, onBeforeUnmount
} from 'vue';

class GridElement extends HTMLElement {

    connectedCallback() {
        const shadow = this.getAttribute('shadow');
        if (shadow) {
            const shadowElem = this.attachShadow({
                mode: 'open'
            });
            this.component = new Grid(shadowElem);
        } else {
            this.component = new Grid(this);
        }
    }

    disconnectedCallback() {
        this.component.destroy();
    }
}

if (!customElements.get('grid-element')) {
    customElements.define('grid-element', GridElement);
}

const gridContainer = ref(null);
const grid = ref(null);
const gridElement = ref(null);

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
    if (grid.value) {
        grid.value.destroy();
        grid.value = null;
    }
    if (gridElement.value) {
        gridElement.value.remove();
        gridElement.value = null;
    }

    const ge = document.createElement('grid-element');
    ge.className = 'grid-element';
    gridElement.value = ge;

    const shadowDom = document.querySelector('.cb-shadow').checked;
    if (shadowDom) {
        ge.setAttribute('shadow', 'shadow');
    }

    gridContainer.value.appendChild(ge);

    const g = ge.component;
    grid.value = g;

    g.bind('onFirstUpdated', function() {
        console.log('duration:', `${this.renderDuration}ms`);
    });

    g.setOption({
        theme: document.querySelector('.st-theme').value,
        frozenColumn: 0,
        frozenRow: 1
    });
    g.setData(data);
    g.render();

    // Init common events after grid is created
    initCommonEvents(g);
};

onMounted(() => {
    const dataStr = document.querySelector('.st-data').value;
    if (dataStr.startsWith('random')) {
        renderData(randomData(dataStr));
    } else {
        renderData(sampleData);
    }

    onResize = () => {
        if (grid.value) {
            grid.value.resize();
        }
    };
    window.addEventListener('resize', onResize);
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', onResize);
    if (grid.value) {
        grid.value.destroy();
    }
});
</script>

<style scoped>
.grid-element {
    width: 100%;
    height: 100%;
    display: block;
}
</style>
