<template>
  <div
    ref="editorElement"
    :class="classMap"
    tabindex="0"
    @focus="start"
    @click="start"
  >
    <div v-if="editing">
      <div v-if="editorType === 'number'">
        <input
          v-model="moduleValue"
          type="number"
          @blur="end"
        >
      </div>
      <div v-else-if="editorType === 'date'">
        <input
          v-model="moduleValue"
          type="date"
          @blur="end"
        >
      </div>
      <div v-else>
        <input
          v-model="moduleValue"
          @blur="end"
        >
      </div>
    </div>
    <div v-else>
      {{ originalValue }}
    </div>
  </div>
</template>

<script>
let currentInputEditor;
</script>

<script setup>
import {
    computed, nextTick, onBeforeUnmount, ref
} from 'vue';

const props = defineProps({
    type: {
        type: String,
        default: 'text'
    },
    value: {
        type: [String, Number],
        default: ''
    },
    disabled: {
        type: Boolean,
        default: false
    },
    rowItem: {
        type: Object,
        required: true
    },
    columnItem: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['editor-change']);
const editorElement = ref(null);
const editing = ref(false);
const editorType = ref(props.type);
const originalValue = ref(props.value);
const moduleValue = ref(props.value);

const classMap = computed(() => {
    const list = ['editor-input'];
    if (props.disabled) {
        list.push('editor-input-disabled');
    }
    return list;
});

const end = () => {
    editing.value = false;
    if (moduleValue.value !== props.value) {
        originalValue.value = moduleValue.value;
        emit('editor-change', moduleValue.value);
    }
};

const editor = {
    end
};

const start = () => {
    if (props.disabled || editing.value) {
        return;
    }
    if (currentInputEditor) {
        currentInputEditor.end();
    }
    editing.value = true;
    currentInputEditor = editor;

    nextTick(() => {
        const input = editorElement.value?.querySelector('input');
        if (input) {
            input.focus();
            input.select();
        }
    });
};

onBeforeUnmount(() => {
    if (currentInputEditor === editor) {
        currentInputEditor = null;
    }
});
</script>
