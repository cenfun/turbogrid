<template>
  <VuiPopover
    v-model="visible"
    title="Column Set"
    :width="350"
    :target="state.target"
    @close="close"
  >
    <ColumnSetContent
      :list="state.list || []"
      :theme="theme"
      @change="emit('change', $event)"
    />
  </VuiPopover>
</template>

<script setup>
import { ref, watch } from 'vue';
import { VuiPopover } from 'vine-ui';
import ColumnSetContent from './column-set-content.vue';

const props = defineProps({
    state: {
        type: Object,
        required: true
    },
    theme: {
        type: String,
        default: ''
    }
});

const emit = defineEmits(['change', 'visible-change']);
const visible = ref(props.state.visible);

watch(() => props.state.visible, (value) => {
    visible.value = value;
});
watch(visible, (value) => {
    emit('visible-change', value);
});

const close = () => {
    visible.value = false;
};
</script>
