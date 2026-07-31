<template>
    <div class="main flex-auto flex-column">
        <div class="controller">
            <div>
                <div class="controller-title">Grid customize scrollbar:</div>
                <select class="st-data">
                    <option>sample-data</option>
                    <option>random-5x20</option>
                    <option>random-100x20k</option>
                </select>
            </div>
            <div>
                <label for="cb_frozenBottom">
                    <input type="checkbox" id="cb_frozenBottom" class="cb_frozenBottom" />
                    frozenBottom
                </label>
                <label>
                    frozenColumn
                    <input type="number" min="-1" max="5" step="1" value="0" class="ip-number ip_frozenColumn" />
                </label>
                <label>
                    frozenRow
                    <input type="number" min="-1" max="5" step="1" value="1" class="ip-number ip_frozenRow" />
                </label>

                <button>update()</button>
                <button>rerender()</button>
            </div>
            <div>

                <label>
                    scrollPaneMinWidth
                    <input type="number" value="30" class="ip-number ip_scrollPaneMinWidth" />
                </label>

                <label>scrollbarType
                    <select class="st_scrollbarType">
                        <option>auto</option>
                        <option>touch</option>
                        <option>mobile</option>
                        <option></option>
                    </select>
                </label>

                <label>scrollbarSize
                    <input type="number" value="12" class="ip-number ip_scrollbarSize" />
                </label>

                <label for="cb_scrollbarRound">
                    <input type="checkbox" id="cb_scrollbarRound" class="cb_scrollbarRound" />
                    scrollbarRound
                </label>

            </div>
            <div>
                <label>
                    <input type="checkbox" id="cb_scrollPaneGradient" class="cb_scrollPaneGradient" />
                    scrollPaneGradient
                </label>

                <label for="cb_scrollbarFade">
                    <input type="checkbox" id="cb_scrollbarFade" class="cb_scrollbarFade" />
                    scrollbarFade
                </label>

                <label>
                    scrollbarFadeTimeout
                    <input type="number" value="1000" class="ip-number ip_scrollbarFadeTimeout" />
                </label>

            </div>

        </div>
        <div ref="gridContainer" class="grid-container grid-gradient flex-auto"></div>
    </div>
</template>

<script setup>
import {
    onMounted, onBeforeUnmount, ref
} from 'vue';
import { useRoute } from 'vue-router';
import { Grid } from '../../src/index.js';
import { sampleData } from '../assets/sample-data.js';
import { randomData } from '../assets/random-data.js';
import { initCommonEvents } from '../global.js';
const route = useRoute();


const gridContainer = ref(null);
const grid = ref(null);

const onResize = () => {
    if (grid.value) {
        grid.value.resize();
    }
};

onMounted(() => {
    const g = new Grid(gridContainer.value);
    grid.value = g;

    g.bind('onFirstUpdated', function() {
        console.log('duration:', `${this.renderDuration}ms`);
    });

    const renderData = function(data) {

        const options = {
            theme: route.query.theme || 'default',
            scrollPaneMinWidth: parseInt(document.querySelector('.ip_scrollPaneMinWidth').value, 10),
            scrollPaneGradient: document.querySelector('.cb_scrollPaneGradient').checked,
            scrollbarSize: parseInt(document.querySelector('.ip_scrollbarSize').value),
            scrollbarRound: document.querySelector('.cb_scrollbarRound').checked,
            scrollbarFade: document.querySelector('.cb_scrollbarFade').checked,
            scrollbarType: document.querySelector('.st_scrollbarType').value,
            scrollbarFadeTimeout: parseInt(document.querySelector('.ip_scrollbarFadeTimeout').value, 10),
            frozenBottom: document.querySelector('.cb_frozenBottom').checked,
            frozenColumn: parseInt(document.querySelector('.ip_frozenColumn').value),
            frozenRow: parseInt(document.querySelector('.ip_frozenRow').value)
        };

        g.setOption(options);
        g.setData(data);
        g.render();
    };

    function render() {
        const dataStr = document.querySelector('.st-data').value;

        if (dataStr.startsWith('random')) {
            renderData(randomData(dataStr));
            return;
        }

        renderData(sampleData);
    }

    [
        '.st-data',
        
        '.ip_frozenColumn',
        '.ip_frozenRow',
        '.cb_frozenBottom',
        '.ip_scrollbarSize',
        '.cb_scrollbarRound',
        '.cb_scrollbarFade',
        '.st_scrollbarType',
        '.ip_scrollbarFadeTimeout',
        '.ip_scrollPaneMinWidth',
        '.cb_scrollPaneGradient'
    ].forEach(function(item) {
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
    if (onResize) {
        window.removeEventListener('resize', onResize);
    }
});
</script>

<style scoped>
.grid-gradient .tg-gradient-top .tg-scroll-view::before {
    position: absolute;
    top: 0;
    left: 0;
    content: "";
    z-index: 10;
    display: block;
    width: 100%;
    height: 50px;
    background-image: linear-gradient(to bottom, rgb(255 0 0), rgb(255 0 0 / 0%));
    pointer-events: none;
}

.grid-gradient .tg-gradient-bottom::before {
    position: absolute;
    left: 0;
    bottom: 0;
    content: "";
    z-index: 10;
    display: block;
    width: 100%;
    height: 50px;
    background-image: linear-gradient(to bottom, rgb(255 0 0 / 0%), rgb(255 0 0));
    pointer-events: none;
}

.grid-gradient .tg-gradient-left .tg-scroll-view::after {
    position: absolute;
    top: 0;
    left: 0;
    content: "";
    z-index: 10;
    display: block;
    width: 50px;
    height: 100%;
    background-image: linear-gradient(to right, rgb(255 0 0), rgb(255 0 0 / 0%));
    pointer-events: none;
}

.grid-gradient .tg-gradient-right::after {
    position: absolute;
    top: 0;
    right: 0;
    content: "";
    z-index: 10;
    display: block;
    width: 50px;
    height: 100%;
    background-image: linear-gradient(to right, rgb(255 0 0 / 0%), rgb(255 0 0));
    pointer-events: none;
}
</style>
