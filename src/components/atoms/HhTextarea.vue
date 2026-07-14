<!-- HhTextarea: styled multi-line text input -->
<template>
  <textarea
    class="hh-textarea"
    v-bind="$attrs"
    :value="modelValue"
    :placeholder="placeholder"
    :rows="rows"
    :disabled="disabled"
    @input="$emit('update:modelValue', $event.target.value)"
  />
</template>

<script setup>
defineProps({
  modelValue:  { type: String, default: '' },
  placeholder: { type: String, default: '' },
  rows:        { type: Number, default: 3 },
  disabled:    { type: Boolean, default: false },
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.hh-textarea {
  display: block;
  width: 100%;
  padding: var(--space-3) var(--space-4);
  font-family: var(--font-family);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
  color: var(--color-text-primary);
  background: var(--color-surface);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  resize: vertical;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  box-sizing: border-box;
}

.hh-textarea::placeholder {
  color: var(--color-text-secondary);
  opacity: 0.7;
}

.hh-textarea:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-subtle);
}

.hh-textarea:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  resize: none;
}
</style>
