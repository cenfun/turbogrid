<template>
  <div class="main">
    <div class="controller">
      <div class="controller-header">
        <div class="controller-title">
          highlightKeywordsFilter
          <span>String patterns (space-separated keywords, * wildcards, \* literals, and case: prefix)</span>
        </div>
      </div>

      <div>
        options:
        <label>matchMode:
          <select
            v-model="matchMode"
            @change="updateOptions"
          >
            <option>or</option>
            <option>and</option>
            <option>negatedFirst</option>
            <option>positiveFirst</option>
          </select>
        </label>

        <label>
          <input
            v-model="caseSensitive"
            type="checkbox"
            @change="updateOptions"
          >
          caseSensitive (match case)
        </label>

        <label>negatedPrefix:
          <select
            v-model="negatedPrefix"
            @change="updateOptions"
          >
            <option>-</option>
            <option>!</option>
          </select>
        </label>
      </div>

      <div>
        <label>patterns:
          <input
            v-model="keywords"
            type="text"
            placeholder="Try: grid -legacy"
            class="ip-keywords"
            @keyup="updateGrid"
          >
        </label>
        <span>Examples:</span>
        <button @click="setExample">
          grid
        </button>
        <button @click="setExample">
          grid fast
        </button>
        <button @click="setExample">
          grid {{ negatedPrefix }}legacy
        </button>
        <button @click="setExample">
          vue*on
        </button>
        <button @click="setExample">
          case:Grid
        </button>
        <button @click="setExample">
          \*
        </button>
        <button @click="setExample">
          TestSource @tag
        </button>
        <button @click="setExample">
          @smoke
        </button>
        <button @click="setExample">
          {{ negatedPrefix }}@smoke
        </button>
      </div>

      <div>
        <b>Current call:</b>
        <code>highlightKeywordsFilter(rowItem, ['name', 'category', 'description'], keywords)</code>
      </div>
    </div>

    <div
      ref="gridContainer"
      class="grid-container"
    />
  </div>
</template>

<script setup>
import {
    onMounted, onBeforeUnmount, ref
} from 'vue';
import { useRoute } from 'vue-router';
import { Grid } from '../../src/index.js';
import { init, initCommonEvents } from '../global.js';

const route = useRoute();
const gridContainer = ref(null);
const grid = ref(null);
const keywords = ref('grid');

// false: case-insensitive matching (default)
const caseSensitive = ref(false);
const matchMode = ref('or');
const negatedPrefix = ref('-');

const data = {
    columns: [{
        id: 'name',
        name: 'Name',
        width: 190
    }, {
        id: 'category',
        name: 'Category',
        width: 130
    }, {
        id: 'description',
        name: 'Description',
        width: 460
    }, {
        id: 'status',
        name: 'Status',
        width: 100
    }],
    rows: [{
        name: 'TurboGrid',
        category: 'Grid',
        description: 'A fast JavaScript data grid with zero dependencies',
        status: 'Active'
    }, {
        name: 'Vue integration',
        category: 'Framework',
        description: 'Render a responsive grid inside a Vue application',
        status: 'Active'
    }, {
        name: 'Large data grid',
        category: 'Performance',
        description: 'Fast rendering for one hundred thousand rows',
        status: 'Active'
    }, {
        name: 'Legacy table',
        category: 'Legacy',
        description: 'A legacy table without virtual grid rendering',
        status: 'Deprecated'
    }, {
        name: 'Keyword highlighter',
        category: 'Search',
        description: 'Filter rows and highlight every matched keyword',
        status: 'Active'
    }, {
        name: 'Custom matcher',
        category: 'Advanced',
        description: 'Use a function to return the exact text to highlight',
        status: 'Experimental'
    }, {
        name: 'Grid*View',
        category: 'Escaping',
        description: 'Escape the wildcard to find a literal * character',
        status: 'Active'
    }, {
        name: 'TestSource parser',
        category: '@tag',
        description: 'Tagged test source for regression coverage',
        status: 'Active'
    }, {
        name: 'Smoke test',
        category: '@smoke',
        description: 'A smoke-tagged row that can be excluded with -@smoke',
        status: 'Active'
    }]
};

const updateGrid = () => {
    if (grid.value) {
        grid.value.update();
    }
};

const updateOptions = () => {
    if (!grid.value) {
        return;
    }
    Object.assign(grid.value.getOption('highlightKeywords'), {
        caseSensitive: caseSensitive.value,
        matchMode: matchMode.value,
        negatedPrefix: negatedPrefix.value
    });
    updateGrid();
};

const setExample = (e) => {
    keywords.value = e.target.innerText.trim();
    updateGrid();
};

const onResize = () => {
    grid.value.resize();
};

onMounted(() => {
    init();
    grid.value = new Grid(gridContainer.value);
    grid.value.setOption({
        theme: route.query.theme,
        rowNumberVisible: true,
        frozenColumn: 0,
        rowNotFound: '<div>No matching rows</div>',
        textSelectable: true,
        highlightKeywords: {
            caseSensitive: caseSensitive.value,
            matchMode: matchMode.value,
            negatedPrefix: negatedPrefix.value
        },
        rowFilter: function(rowItem) {
            return this.highlightKeywordsFilter(
                rowItem,
                ['name', 'category', 'description'],
                keywords.value
            );
        }
    });
    grid.value.setData(data);
    initCommonEvents(grid.value);
    window.addEventListener('resize', onResize);
    grid.value.render();
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', onResize);
    if (grid.value) {
        grid.value.destroy();
    }
});
</script>
