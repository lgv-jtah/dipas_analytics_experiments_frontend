<!-- HhVerdictPicker: correct / incorrect radio-style pick -->
<template>
  <div class="verdict-picker" :class="{ 'verdict-picker--disabled': disabled }">
    <button
      type="button"
      class="verdict-picker__option verdict-picker__option--correct"
      :class="{ 'verdict-picker__option--active': modelValue === 'correct' }"
      :disabled="disabled"
      @click="$emit('update:modelValue', 'correct')"
    >
      <span class="verdict-picker__icon" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
      Correct
    </button>
    <button
      type="button"
      class="verdict-picker__option verdict-picker__option--incorrect"
      :class="{ 'verdict-picker__option--active': modelValue === 'incorrect' }"
      :disabled="disabled"
      @click="$emit('update:modelValue', 'incorrect')"
    >
      <span class="verdict-picker__icon" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </span>
      Incorrect
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: String, default: null }, // 'correct' | 'incorrect' | null
  disabled:   { type: Boolean, default: false },
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.verdict-picker {
  display: inline-flex;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.verdict-picker__option {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 7px 16px;
  font-family: var(--font-family);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  background: var(--color-surface);
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: background var(--transition-fast), color var(--transition-fast);
  white-space: nowrap;
  user-select: none;
}

.verdict-picker__option + .verdict-picker__option {
  border-left: 1.5px solid var(--color-border);
}

.verdict-picker__option:hover:not(:disabled) {
  background: var(--color-hh-gray-50);
  color: var(--color-text-primary);
}

.verdict-picker__option--correct.verdict-picker__option--active {
  background: #E6F9F0;
  color: #1A7A4A;
  font-weight: var(--font-weight-semibold);
}

.verdict-picker__option--incorrect.verdict-picker__option--active {
  background: var(--color-accent-subtle);
  color: var(--color-accent);
  font-weight: var(--font-weight-semibold);
}

.verdict-picker__icon {
  display: inline-flex;
  align-items: center;
}

.verdict-picker--disabled .verdict-picker__option {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>
