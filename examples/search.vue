<template>
  <div class="app-search">
    <input
      v-model="state.keywords"
      type="text"
    >
  </div>
</template>
<script setup>
import { state } from './global.js';

</script>
<style lang="scss" scoped>
.app-search {
    input {
        width: 100%;
        height: 25px;
        padding-right: 23px;
        padding-left: 5px;
        line-height: 25px;
        border: 1px solid #555;
        border-radius: 5px;
        background-image: url("./assets/images/search.svg");
        background-repeat: no-repeat;
        background-position: 97% center;
        background-size: 16px;
    }
}
</style>
