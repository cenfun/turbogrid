<template>
  <div :class="['app', 'app-'+state.theme]">
    <div class="app-header">
      <div class="app-header-left">
        <div class="app-header-menu">
          <VuiIconLabel
            icon="menu"
            size="20px"
            @click="toggleMenu"
          />
          <a
            class="app-header-name"
            href="./"
          >
            TurboGrid
          </a>
        </div>
        <div class="app-header-title">
          <a
            class="app-header-name"
            href="./"
          >
            <VuiIcon icon="logo" />
            TurboGrid
          </a>
          <a
            class="app-header-version"
            href="https://github.com/cenfun/turbogrid"
            target="_blank"
          >v{{ state.version }}</a>
        </div>
      </div>

      <div class="app-header-right">
        <Search />
        <VuiSelect
          v-model="state.theme"
          :options="state.themeOptions"
          class="app-header-theme"
        />
      </div>
    </div>
    <div class="app-body">
      <div class="app-nav">
        <Nav />
      </div>
      <div class="app-main">
        <router-view />
      </div>
    </div>
    <div
      v-if="state.flyoverVisible"
      ref="flyoverEl"
      class="nav-flyover"
    >
      <div class="nav-header">
        <div class="app-header-title">
          <a
            class="app-header-name"
            href="./"
          >
            <VuiIcon icon="logo" />
            TurboGrid
          </a>
          <a
            class="app-header-version"
            href="https://github.com/cenfun/turbogrid"
            target="_blank"
          >v{{ state.version }}</a>
        </div>
        <VuiIcon
          icon="close"
          size="20px"
          button
          @click="toggleMenu"
        />
      </div>
      <div class="nav-main">
        <Nav />
      </div>
    </div>
  </div>
</template>

<script setup>
import './global.scss';
import 'prismjs/themes/prism.css';
import {
    ref, watch, onMounted,
    nextTick
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
    VuiSelect, VuiIcon, VuiIconLabel, setIcons
} from 'vine-ui';

import { Grid } from '../src/index.js';

import Nav from './components/nav.vue';
import Search from './components/search.vue';

import { state } from './global.js';

const moduleStrings = import.meta.glob('./assets/images/*.svg', {
    query: '?raw',
    eager: true
});

const icons = {};
const keys = Object.keys(moduleStrings);
for (const src of keys) {
    const icon = src.split('/').pop().slice(0, -4);
    icons[icon] = moduleStrings[src].default;
}

setIcons(icons);

const route = useRoute();
const router = useRouter();

const flyoverEl = ref();

const bindAnimation = (closing, callback) => {

    const elem = flyoverEl.value;
    if (!elem) {
        return;
    }

    elem.addEventListener('animationend', () => {
        if (closing) {
            elem.classList.remove('nav-closing');
        } else {
            elem.classList.remove('nav-opening');
        }
        if (callback) {
            callback();
        }
    }, {
        once: true
    });

    if (closing) {
        elem.classList.add('nav-closing');
    } else {
        elem.classList.add('nav-opening');
    }
};

const autoCloseHandler = (e) => {
    if (flyoverEl.value && !flyoverEl.value.contains(e.target)) {
        document.removeEventListener('click', autoCloseHandler);
        toggleMenu();
    }
};

const toggleMenu = () => {
    if (state.flyoverVisible) {
        bindAnimation(true, () => {
            document.removeEventListener('click', autoCloseHandler);
            state.flyoverVisible = false;
        });
    } else {
        state.flyoverVisible = true;
        nextTick(() => {
            bindAnimation(false, () => {
                document.addEventListener('click', autoCloseHandler);
            });
        });
    }
};


const initThemes = () => {
    state.theme = route.query.theme || '';

    const themeList = Grid.getAllThemes().map((t) => {
        return {
            label: t,
            value: t
        };
    });

    state.themeOptions = themeList;

    // console.log('initThemes', route.query, state.theme, state.themeOptions);

};

watch(() => route.query, () => {
    initThemes();
});

watch(() => state.theme, (newTheme) => {
    const newQuery = {
        ... route.query
    };
    if (newTheme) {
        newQuery.theme = newTheme;
    } else {
        delete newQuery.theme;
    }
    router.push({
        query: newQuery
    });
});

watch(() => route.path, () => {
    if (state.flyoverVisible) {
        toggleMenu();
    }
});


onMounted(() => {
    initThemes();
});
</script>
