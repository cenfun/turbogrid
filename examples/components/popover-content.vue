<template>
  <div class="popover-row-info">
    <div class="popover-row-name">
      {{ row?.name || '' }}
    </div>
    <ul class="popover-row-fields">
      <li
        v-for="field in fields"
        :key="field.key"
      >
        {{ field.key }}: {{ field.value }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    row: {
        type: Object,
        default: null
    }
});

const fields = computed(() => {
    const row = props.row || {};
    return Object.keys(row).filter((key) => {
        return !key.startsWith('tg_') && key !== 'subs';
    }).map((key) => ({
        key,
        value: String(row[key])
    }));
});
</script>
<style lang="scss" scoped>
.popover-row-info {
    font-size: 12px;

    .popover-row-name {
        margin-bottom: 5px;
    }

    ul {
        margin: 0;
        padding-left: 16px;
    }
}
</style>
