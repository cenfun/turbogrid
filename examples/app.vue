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

<style lang="scss">
.app {
    --font-color: #1e1e1e;
    --bg-color: #fff;

    display: flex;
    flex-direction: column;
    height: 100%;
    color: var(--font-color);
    background-color: var(--bg-color);
}

a:link,
a:visited {
    color: var(--font-color);
}

.app-lightblue {
    --font-color: #1e1e1e;
    --bg-color: #fff;
}

.app-dark {
    --font-color: #fff;
    --bg-color: #1e1e1e;
}

.app-header {
    display: flex;
    flex-shrink: 0;
    gap: 10px;
    justify-content: space-between;
    align-items: center;
    padding: 5px;
    border-bottom: 1px solid #ccc;
}

.app-header-left {
    display: flex;
    gap: 10px;
    align-items: center;
}

.app-header-menu {
    display: none;
    gap: 5px;
    align-items: center;
    padding: 0 5px;
    line-height: 1;
    cursor: pointer;
}

.app-header-title {
    display: flex;
    gap: 5px;
    align-items: center;
}

.app-header-name {
    display: flex;
    gap: 5px;
    align-items: center;
    font-weight: bold;
    font-size: 18px;
    line-height: 1;
    text-decoration: none;
}

.app-header-version {
    color: #555;
    font-size: 14px;
    text-decoration: underline;
}

.app-header-right {
    display: flex;
    gap: 10px;
    align-items: center;
}

.app-body {
    display: flex;
    flex: auto;
    width: 100%;
    overflow: hidden;
}

.app-nav {
    position: relative;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    width: 231px;
    height: 100%;
    border-right: 1px solid #ccc;
}

.app-main {
    display: flex;
    flex: auto;
    flex-direction: column;
    gap: 10px;
    color: #1e1e1e;
    background-color: #fff;
    overflow: hidden;
}

/* Mobile responsive */
@media (width <= 768px) {
    .app-header-menu {
        display: flex;
    }

    .app-body {
        .app-nav {
            display: none;
        }
    }

    .app-header {
        .app-header-title,
        .app-header-theme {
            display: none;
        }
    }
}

.nav-flyover {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 999;
    display: flex;
    flex-direction: column;
    width: 230px;
    height: 100%;
    background-color: #fff;
    box-shadow: 0 2px 8px rgb(0 0 0 / 15%);
    overflow: hidden;

    .nav-header {
        display: flex;
        gap: 10px;
        justify-content: space-between;
        align-items: center;
        padding: 9px;
        border-bottom: 1px solid #ccc;
    }

    .nav-main {
        flex: auto;
        overflow: auto;
    }
}

@keyframes nav-slide-in-left {
    from {
        visibility: visible;
        transform: translate3d(-100%, 0, 0);
    }

    to {
        transform: translate3d(0, 0, 0);
    }
}

@keyframes nav-slide-out-left {
    from {
        transform: translate3d(0, 0, 0);
    }

    to {
        visibility: hidden;
        transform: translate3d(-100%, 0, 0);
    }
}

.nav-opening {
    left: 0;
    animation-name: nav-slide-in-left;
    animation-duration: 0.2s;
    animation-fill-mode: both;
}

.nav-closing {
    left: 0;
    animation-name: nav-slide-out-left;
    animation-duration: 0.2s;
    animation-fill-mode: both;
}

</style>
