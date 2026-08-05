<template>
  <div class="main">
    <div class="controller">
      <div class="controller-header">
        <div class="controller-title">
          ComfyUI custom nodes data example:
        </div>
      </div>
      <div>
        <button @click="showMask()">
          showMask()
        </button>
        <button @click="hideMask()">
          hideMask()
        </button>
        <button @click="showMask({opacity:'0.3'})">
          showMask({"opacity":"0.3"})
        </button>
      </div>
      <div>
        <input
          v-model="keywords"
          type="text"
          placeholder="keywords"
          class="ip-keywords"
          @keyup="onKeywordsChange"
        >
        rowFilter
      </div>
      <div>
        <div>onSelectChanged: <span class="onSelectChanged">{{ selectedCount }}</span></div>
      </div>
    </div>
    <div
      ref="gridContainer"
      class="grid-container custom-nodes-grid"
    />
  </div>
</template>

<script setup>
import {
    onMounted, onBeforeUnmount, ref
} from 'vue';
import { Grid } from '../../src/index.js';
import { init, initCommonEvents } from '../global.js';

const gridContainer = ref(null);
const grid = ref(null);
const keywords = ref('');
const selectedCount = ref(0);

onMounted(async () => {
    init();
    // Dynamically import comfyui data (435KB) to avoid initial bundle bloat
    const { comfyuiData } = await import('../assets/comfyui-data.js');

    const container = gridContainer.value;
    const g = new Grid(container);
    grid.value = g;

    g.bind('onFirstUpdated', function() {
        // console.log('duration:', `${this.renderDuration}ms`);
    });

    g.bind('onSelectChanged', (e, d) => {
        selectedCount.value = d.length;
    });

    const render = () => {
        const data = {
            rows: comfyuiData,
            columns: [{
                id: 'title',
                name: 'Name',
                width: 150,
                minWidth: 100,
                maxWidth: 500,
                formatter: (v, rowItem, columnItem) => {
                    return `<a href="${rowItem.reference}" target="_blank">${v}</a>`;
                }
            }, {
                id: 'description',
                name: 'Description',
                width: 400,
                maxWidth: 5000
            }, {
                id: 'author',
                name: 'Author',
                width: 100
            }, {
                id: 'stars',
                name: '★',
                align: 'center',
                formatter: (v) => {
                    if (v < 0) {
                        return 'N/A';
                    }
                    if (typeof v === 'number') {
                        return v.toLocaleString();
                    }
                    return v;
                }
            }, {
                id: 'last_update',
                name: 'Last Update',
                align: 'center',
                type: 'date',
                formatter: (v) => {
                    if (v < 0) {
                        return 'N/A';
                    }
                    return `${v}`.split(' ')[0];
                }
            }, {
                id: 'installed',
                name: 'Install',
                formatter: (v, rowItem, columnItem) => {
                    // empty formatter
                }
            }]
        };

        const options = {
            theme: 'dark',
            selectVisible: true,
            selectMultiple: true,
            selectAllVisible: true,
            rowNumberVisible: true,
            scrollbarRound: true,
            frozenColumn: 0,
            rowHeight: 36,
            textSelectable: true,
            cellResizeObserver: function(rowItem, columnItem) {
                if (columnItem.id === 'title' || columnItem.id === 'description') {
                    return true;
                }
            },
            bindWindowResize: true,
            rowFilter: (rowItem) => {
                return g.highlightKeywordsFilter(rowItem, ['author', 'description', 'title'], keywords.value);
            }
        };
        g.setOption(options);
        g.setData(data);
        g.render();
    };

    initCommonEvents(g);

    render();
});

function onKeywordsChange() {
    if (grid.value) {
        grid.value.update();
    }
}

function showMask(options) {
    if (grid.value) {
        grid.value.showMask(options);
    }
}

function hideMask() {
    if (grid.value) {
        grid.value.hideMask();
    }
}

onBeforeUnmount(() => {
    if (grid.value) {
        grid.value.destroy();
    }
});
</script>

<style lang="scss">
.custom-nodes-grid {
    a {
        color: #55f;
        font-weight: bold;
        text-decoration: none;

        &:hover {
            color: #77f;
            text-decoration: underline;
        }
    }

    .tg-installed {
        background: #003807;
    }
}

.cm-warn-note {
    padding: 10px;
    color: #ff3800 !important;
    font-size: 13px;
    border-radius: 5px;
    background-color: #101010 !important;
    overflow: auto;
    overflow-x: hidden;
}
</style>
