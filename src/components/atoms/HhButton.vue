<template>
  <button
    class="hh-button"
    :class="[`hh-button--${variant}`, `hh-button--${size}`, { 'hh-button--full': full }]"
    :disabled="disabled || loading"
    v-bind="$attrs"
  >
    <span v-if="loading" class="hh-button__spinner" aria-hidden="true"></span>
    <slot />
  </button>
</template>

<script setup>
defineProps({
  variant:  { type: String, default: 'primary' }, // primary | secondary | ghost | danger
  size:     { type: String, default: 'md' },       // sm | md | lg
  full:     { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  loading:  { type: Boolean, default: false },
})
</script>

<style scoped>
.hh-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font-family: var(--font-family);
  font-weight: var(--font-weight-medium);
  border: 1.5px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background var(--transition-fast), border-color var(--transition-fast),
              color var(--transition-fast), box-shadow var(--transition-fast);
  white-space: nowrap;
  user-select: none;
}

.hh-button--sm  { font-size: var(--font-size-sm);  padding: 6px 14px; }
.hh-button--md  { font-size: var(--font-size-base); padding: 9px 20px; }
.hh-button--lg  { font-size: var(--font-size-lg);  padding: 12px 28px; }
.hh-button--full { width: 100%; }

/* primary */
.hh-button--primary {
  background: var(--color-accent);
  color: var(--color-text-inverse);
  border-color: var(--color-accent);
}
.hh-button--primary:hover:not(:disabled) {
  background: var(--color-accent-dark);
  border-color: var(--color-accent-dark);
  box-shadow: var(--shadow-sm);
}
.hh-button--primary:active:not(:disabled) { background: var(--color-hh-red-dark); }

/* secondary */
.hh-button--secondary {
  background: transparent;
  color: var(--color-accent);
  border-color: var(--color-accent);
}
.hh-button--secondary:hover:not(:disabled) {
  background: var(--color-accent-subtle);
}

/* ghost */
.hh-button--ghost {
  background: transparent;
  color: var(--color-text-primary);
  border-color: var(--color-border);
}
.hh-button--ghost:hover:not(:disabled) {
  background: var(--color-hh-gray-100);
}

/* danger */
.hh-button--danger {
  background: #FFF0F2;
  color: var(--color-accent);
  border-color: var(--color-accent);
}
.hh-button--danger:hover:not(:disabled) {
  background: var(--color-accent);
  color: var(--color-text-inverse);
}

.hh-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* spinner */
.hh-button__spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: hh-spin 0.65s linear infinite;
}
@keyframes hh-spin { to { transform: rotate(360deg); } }
</style>
