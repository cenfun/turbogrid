<template>
  <div
    class="app-search"
    @keydown="onKeydown"
  >
    <VuiInput
      ref="inputEl"
      v-model="keywords"
      type="text"
      placeholder="Search..."
      icon="search"
      cleanable
      select-on-focus
      width="200px"
      @focus="onFocus"
      @input="onInput"
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
    ref, computed, nextTick, watch
} from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { VuiInput } from 'vine-ui';
import { getExampleList, getApiList } from '../global.js';

const router = useRouter();
const route = useRoute();

const inputEl = ref(null);
const listEl = ref(null);

// VuiInput only exposes its cid, so resolve the underlying DOM via the cid attribute
const getInputRoot = () => {
    const el = inputEl.value;
    return el && el.cid ? document.querySelector(`[cid="${el.cid}"]`) : null;
};

const getInputEl = () => {
    const root = getInputRoot();
    return root ? root.querySelector('input') : null;
};
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
        const input = getInputEl();
        if (input) {
            input.blur();
        }
    }
};

const onInput = () => {
    selectedIndex.value = 0;
    if (keywords.value.trim()) {
        visible.value = true;
    }
    // When keywords is empty, keep visible as-is (controlled by focus/blur)
};

// Keep the search box usable after the built-in clear button is clicked:
// reset the selection and restore focus so the user can keep typing
watch(keywords, (val) => {
    if (!val) {
        selectedIndex.value = 0;
        nextTick(() => {
            const input = getInputEl();
            if (input) {
                input.focus();
            }
        });
    }
});

const onClick = (item) => {
    goto(item);
};

// Close on outside click
const onDocumentClick = (e) => {
    const root = getInputRoot();
    if (root && !root.contains(e.target) && listEl.value && !listEl.value.contains(e.target)) {
        visible.value = false;
    }
};

if (typeof document !== 'undefined') {
    document.addEventListener('click', onDocumentClick);
}
</script>

<style lang="scss">
.app-search {
    position: relative;
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

.app-search-item-label {
    flex: 1;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;

    strong {
        color: #00a8e1;
    }
}

.app-search-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 10px;
    font-size: 13px;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background: #f5f5f5;
    }

    &.selected {
        background: #e8f4fd;
    }

    &.turbogrid .app-search-item-label,
    &.methods .app-search-item-label,
    &.data .app-search-item-label,
    &.options .app-search-item-label,
    &.events .app-search-item-label,
    &.lifecycle .app-search-item-label,
    &.tg .app-search-item-label,
    &.doc .app-search-item-label,
    &.preview .app-search-item-label {
        padding-left: 18px;
        background-repeat: no-repeat;
        background-position: 0 center;
        background-size: 14px;
    }

    &.turbogrid .app-search-item-label {
        background-image: url("../assets/images/function.svg");
    }

    &.methods .app-search-item-label {
        background-image: url("../assets/images/method.svg");
    }

    &.data .app-search-item-label {
        background-image: url("../assets/images/data.svg");
    }

    &.options .app-search-item-label {
        background-image: url("../assets/images/setting.svg");
    }

    &.events .app-search-item-label {
        background-image: url("../assets/images/event.svg");
    }

    &.lifecycle .app-search-item-label {
        background-image: url("../assets/images/cycle.svg");
    }

    &.tg .app-search-item-label {
        background-image: url("../assets/images/namespace.svg");
    }

    &.doc .app-search-item-label {
        background-image: url("../assets/images/doc.svg");
    }

    &.preview .app-search-item-label {
        background-image: url("../assets/images/preview.svg");
    }
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
</style>
