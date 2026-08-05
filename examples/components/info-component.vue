<template>
  <span>( Selected: {{ info.selected }} )</span>
</template>

<script setup>
defineProps({
    info: {
        type: Object,
        required: true
    }
});
</script>
