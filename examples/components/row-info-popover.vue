<template>
  <VuiPopover
    v-model="visible"
    title="Row Info"
    :width="260"
    :target="state.target"
    :bg-color="dark ? '#1e1e1e' : ''"
    :color="dark ? '#fff' : ''"
    @close="emit('close')"
  >
    <PopoverContent :row="state.row" />
  </VuiPopover>
</template>

<script setup>
import { ref, watch } from 'vue';
import { VuiPopover } from 'vine-ui';
import PopoverContent from './popover-content.vue';

const props = defineProps({
    state: {
        type: Object,
        required: true
    },
    dark: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['visible-change', 'close']);
const visible = ref(props.state.visible);

watch(() => props.state.visible, (value) => {
    visible.value = value;
});
watch(visible, (value) => {
    emit('visible-change', value);
});
</script>
