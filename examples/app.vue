<template>
  <div class="app">
    <div class="app-header">
      <div class="app-header-left">
        <div
          class="app-header-menu icon icon-menu"
          @click="toggleNav"
        />
        <div class="app-header-title">
          <a
            class="app-header-name"
            href="/"
          >
            TurboGrid
          </a>
          <a
            class="app-header-version"
            href="https://github.com/cenfun/turbogrid"
            target="_blank"
          >v{{ version }}</a>
        </div>
      </div>
      <div class="app-header-right">
        <select
          v-model="theme"
          class="app-header-theme"
        >
          <option
            v-for="(t, ti) in themeOptions"
            :key="ti"
            :value="t.value"
          >
            {{ t.label }}
          </option>
        </select>
        <a
          class="icon icon-github"
          href="https://github.com/cenfun/turbogrid"
          target="_blank"
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
      v-if="navOpen"
      class="nav-popover"
    >
      <div class="nav-header">
        <router-link
          class="header-title"
          to="/"
        >
          TurboGrid
        </router-link>
        <div class="flex-auto" />
        <div
          class="icon icon-close header-icon-close"
          @click="toggleNav"
        />
      </div>
      <div class="app-nav">
        <Nav />
      </div>
    </div>
  </div>
</template>

<script setup>
import './global.scss';
import {
    ref, watch, onMounted
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Grid, VERSION } from '../src/index.js';

import Nav from './nav.vue';

const route = useRoute();
const router = useRouter();

const version = VERSION;
const themeOptions = ref([]);
const theme = ref('default');

const navOpen = ref(false);
const navClosing = ref(false);

watch(theme, (newTheme) => {
    router.push({
        query: {
            ... route.query,
            theme: newTheme
        }
    });
});

const initThemes = () => {
    const themeList = Grid.getAllThemes().map((t) => {
        return {
            label: t,
            value: t
        };
    });
    themeList.unshift({
        label: 'theme',
        value: ''
    });
    themeOptions.value = themeList;
    theme.value = route.query.theme || '';
};

onMounted(() => {
    initThemes();
});

function toggleNav() {
    if (navOpen.value) {
        closeNav();
    } else {
        openNav();
    }
}

function openNav() {
    navClosing.value = false;
    navOpen.value = true;
}

function closeNav() {
    if (!navOpen.value) {
        return;
    }
    navClosing.value = true;
    navOpen.value = false;
    setTimeout(() => {
        navClosing.value = false;
    }, 300);
}

</script>

<style lang="scss">
.app {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.app-header {
    display: flex;
    flex-shrink: 0;
    gap: 10px;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    border-bottom: 1px solid #ccc;
}

.app-header-left {
    display: flex;
    gap: 10px;
    align-items: center;
}

.app-header-menu {
    display: none;
    cursor: pointer;
}

.app-header-title {
    display: flex;
    gap: 5px;
    align-items: center;
}

.app-header-name {
    padding-left: 20px;
    font-weight: bold;
    font-size: 16px;
    text-decoration: none;
    background-image: url("./assets/images/logo.svg");
    background-repeat: no-repeat;
    background-position: left center;
    background-size: 16px;
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
    width: 230px;
    height: 100%;
    border-right: 1px solid #ccc;
}

.app-main {
    display: flex;
    flex: auto;
    flex-direction: column;
    gap: 10px;
    overflow: auto;
}

/* Mobile responsive */
@media (width <= 768px) {
    .app-header-menu {
        display: block;
    }

    .app-nav,
    .app-header-title,
    .app-header-theme {
        display: none;
    }
}
</style>
