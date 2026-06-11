<template>
  <div class="app-search">
    <input
      ref="inputEl"
      v-model="keywords"
      type="text"
      placeholder="Search..."
      @focus="onFocus"
      @keydown="onKeydown"
      @input="onInput"
    >
    <div
      v-if="keywords"
      class="app-search-clear icon icon-close"
      title="Clear"
      @mousedown.prevent
      @click.stop="clearKeywords"
    />
    <div
      v-show="visible && filteredList.length"
      ref="listEl"
      class="app-search-list"
    >
      <div
        v-for="(item, index) in filteredList"
        :key="item.id"
        :class="['app-search-item', item.typeClass, { selected: index === selectedIndex }]"
        @click="onClick(item)"
      >
        <span
          class="app-search-item-label"
          v-html="item.label"
        />
        <span
          v-if="item.category"
          class="app-search-item-category"
        >{{ item.category }}</span>
      </div>
    </div>
    <div
      v-show="visible && keywords && !filteredList.length"
      class="app-search-list"
    >
      <div class="app-search-info">
        No Results
      </div>
    </div>
  </div>
</template>

<script setup>
import {
    ref, computed, nextTick
} from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { getExampleList, getApiList } from '../global.js';

const router = useRouter();
const route = useRoute();

const inputEl = ref(null);
const listEl = ref(null);
const keywords = ref('');
const visible = ref(false);
const selectedIndex = ref(0);

// Build page items from getExampleList
const buildPageItems = () => {
    const items = [];
    const walk = (nodes) => {
        nodes.forEach((node) => {
            if (node.id) {
                items.push({
                    id: `page:${node.id}`,
                    name: node.name,
                    route: node.id,
                    anchor: null,
                    category: node.id === 'api-doc' ? '' : 'Examples',
                    typeClass: node.id === 'api-doc' ? 'doc' : 'preview'
                });
            }
            if (node.subs) {
                walk(node.subs);
            }
        });
    };
    walk(getExampleList(), '');
    return items;
};

const pageItems = buildPageItems();

// Build API items
const apiItems = getApiList().map((item) => {
    const categoryMap = {
        'turbogrid': 'Turbogrid',
        'methods': 'Methods',
        'data': 'Data',
        'options': 'Options',
        'events': 'Events',
        'lifecycle': 'Lifecycle',
        'tg': 'Turbogrid'
    };
    return {
        id: `api:${item.name}`,
        name: item.text || item.name,
        route: 'api-doc',
        anchor: item.name,
        category: categoryMap[item.type] || '',
        typeClass: item.type
    };
}).filter(Boolean);

const apiDocIndex = pageItems.findIndex((item) => item.route === 'api-doc');
let allItems = [... pageItems, ... apiItems];
if (apiDocIndex !== -1) {
    allItems = [
        ... pageItems.slice(0, apiDocIndex + 1),
        ... apiItems,
        ... pageItems.slice(apiDocIndex + 1)
    ];
}

const filteredList = computed(() => {
    const k = keywords.value.trim().toLowerCase();

    if (!k) {
        // No keywords: show all items with plain labels
        return allItems.map((item) => ({
            ... item,
            label: item.name
        }));
    }

    const list = allItems.filter((item) => {
        return item.name.toLowerCase().indexOf(k) !== -1;
    });

    // Sort: exact match first, then by name
    list.sort((a, b) => {
        const an = a.name.toLowerCase();
        const bn = b.name.toLowerCase();
        // Exact match first
        if (an === k) {
            return -1;
        }
        if (bn === k) {
            return 1;
        }
        // Starts with match next
        if (an.startsWith(k) && !bn.startsWith(k)) {
            return -1;
        }
        if (bn.startsWith(k) && !an.startsWith(k)) {
            return 1;
        }
        // Then alphabetical
        return an > bn ? 1 : -1;
    });

    // Highlight keywords in label
    return list.map((item) => {
        const idx = item.name.toLowerCase().indexOf(k);
        let label = item.name;
        if (idx !== -1) {
            label = `${item.name.substring(0, idx)}<strong>${item.name.substring(idx, idx + k.length)}</strong>${item.name.substring(idx + k.length)}`;
        }
        return {
            ... item,
            label
        };
    });
});

const scrollItemIntoView = (index) => {
    nextTick(() => {
        const list = listEl.value;
        if (!list) {
            return;
        }
        const target = list.children[index];
        if (!target) {
            return;
        }
        const tt = target.offsetTop;
        const th = target.clientHeight;
        const lt = list.scrollTop;
        const lh = list.clientHeight;
        if (tt < lt) {
            list.scrollTop = tt;
        } else if (tt + th > lt + lh) {
            list.scrollTop = tt + th - lh;
        }
    });
};

const goto = (item) => {
    visible.value = false;
    selectedIndex.value = 0;

    const query = {
        ... route.query
    };

    if (item.anchor) {
        query.position = item.anchor;
    } else {
        delete query.position;
    }

    // switch language if navigating to API doc from non-doc page
    let routePath = item.route;
    if (routePath === 'api-doc' && route.path === '/api-doc-zh') {
        routePath = 'api-doc-zh';
    }

    router.push({
        path: `/${routePath}`,
        query
    });
};

const onFocus = () => {
    visible.value = true;
};

// eslint-disable-next-line complexity
const onKeydown = (e) => {
    const keyCode = e.keyCode;
    const list = filteredList.value;

    if (keyCode === 13) {
        // Enter
        e.preventDefault();
        if (list.length > 0 && selectedIndex.value >= 0 && selectedIndex.value < list.length) {
            goto(list[selectedIndex.value]);
        }
        return;
    }

    if (keyCode === 38) {
        // Up
        e.preventDefault();
        if (list.length > 0) {
            selectedIndex.value = selectedIndex.value > 0 ? selectedIndex.value - 1 : list.length - 1;
            scrollItemIntoView(selectedIndex.value);
        }
        return;
    }

    if (keyCode === 40) {
        // Down
        e.preventDefault();
        if (list.length > 0) {
            selectedIndex.value = selectedIndex.value < list.length - 1 ? selectedIndex.value + 1 : 0;
            scrollItemIntoView(selectedIndex.value);
        }
        return;
    }

    if (keyCode === 27) {
        // Escape
        visible.value = false;
        inputEl.value.blur();
    }
};

const onInput = () => {
    selectedIndex.value = 0;
    if (keywords.value.trim()) {
        visible.value = true;
    }
    // When keywords is empty, keep visible as-is (controlled by focus/blur)
};

const clearKeywords = () => {
    keywords.value = '';
    selectedIndex.value = 0;
    visible.value = true;
    nextTick(() => {
        if (inputEl.value) {
            inputEl.value.focus();
        }
    });
};

const onClick = (item) => {
    goto(item);
};

// Close on outside click
const onDocumentClick = (e) => {
    if (inputEl.value && !inputEl.value.contains(e.target) && listEl.value && !listEl.value.contains(e.target)) {
        visible.value = false;
    }
};

if (typeof document !== 'undefined') {
    document.addEventListener('click', onDocumentClick);
}
</script>

<style lang="scss" scoped>
.app-search {
    position: relative;

    input {
        max-width: 200px;
        padding: 3px 24px 3px 22px;
        line-height: 100%;
        border: 1px solid #555;
        border-radius: 5px;
        background-image: url("../assets/images/search.svg");
        background-repeat: no-repeat;
        background-position: 3px center;
        background-size: 16px;
        outline: none;
    }
}

.app-search-clear {
    position: absolute;
    top: 50%;
    right: 4px;
    z-index: 1;
    width: 14px;
    height: 14px;
    background-size: 14px 14px;
    transform: translateY(-50%);
}

.app-search-list {
    position: absolute;
    top: 100%;
    right: 0;
    z-index: 999;
    width: 320px;
    max-height: 350px;
    border: 1px solid #ccc;
    background: #fff;
    box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
    overflow: hidden auto;
}

.app-search-info {
    padding: 10px;
    color: gray;
    font-size: 13px;
}

.app-search-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 10px;
    font-size: 13px;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
}

.app-search-item:last-child {
    border-bottom: none;
}

.app-search-item:hover {
    background: #f5f5f5;
}

.app-search-item.selected {
    background: #e8f4fd;
}

.app-search-item-label {
    flex: 1;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
}

.app-search-item-label :deep(strong) {
    color: #00a8e1;
}

.app-search-item-category {
    flex-shrink: 0;
    margin-left: 8px;
    padding: 1px 6px;
    color: #888;
    font-size: 11px;
    border-radius: 3px;
    background: #f0f0f0;
}

.app-search-item.turbogrid .app-search-item-label {
    padding-left: 18px;
    background-image: url("../assets/images/function.svg");
    background-repeat: no-repeat;
    background-position: 0 center;
    background-size: 14px;
}

.app-search-item.methods .app-search-item-label {
    padding-left: 18px;
    background-image: url("../assets/images/method.svg");
    background-repeat: no-repeat;
    background-position: 0 center;
    background-size: 14px;
}

.app-search-item.data .app-search-item-label {
    padding-left: 18px;
    background-image: url("../assets/images/data.svg");
    background-repeat: no-repeat;
    background-position: 0 center;
    background-size: 14px;
}

.app-search-item.options .app-search-item-label {
    padding-left: 18px;
    background-image: url("../assets/images/setting.svg");
    background-repeat: no-repeat;
    background-position: 0 center;
    background-size: 14px;
}

.app-search-item.events .app-search-item-label {
    padding-left: 18px;
    background-image: url("../assets/images/event.svg");
    background-repeat: no-repeat;
    background-position: 0 center;
    background-size: 14px;
}

.app-search-item.lifecycle .app-search-item-label {
    padding-left: 18px;
    background-image: url("../assets/images/cycle.svg");
    background-repeat: no-repeat;
    background-position: 0 center;
    background-size: 14px;
}

.app-search-item.tg .app-search-item-label {
    padding-left: 18px;
    background-image: url("../assets/images/namespace.svg");
    background-repeat: no-repeat;
    background-position: 0 center;
    background-size: 14px;
}

.app-search-item.doc .app-search-item-label {
    padding-left: 18px;
    background-image: url("../assets/images/doc.svg");
    background-repeat: no-repeat;
    background-position: 0 center;
    background-size: 14px;
}

.app-search-item.preview .app-search-item-label {
    padding-left: 18px;
    background-image: url("../assets/images/preview.svg");
    background-repeat: no-repeat;
    background-position: 0 center;
    background-size: 14px;
}
</style>
