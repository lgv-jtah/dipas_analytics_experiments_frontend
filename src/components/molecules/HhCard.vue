<template>
  <div class="hh-card" :class="[`hh-card--${variant}`, { 'hh-card--interactive': interactive }]">
    <div v-if="$slots.header || title" class="hh-card__header">
      <slot name="header">
        <HhText tag="h3" variant="label" color="secondary" class="hh-card__title">
          {{ title }}
        </HhText>
      </slot>
    </div>
    <div class="hh-card__body">
      <slot />
    </div>
    <div v-if="$slots.footer" class="hh-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
import HhText from '../atoms/HhText.vue'

defineProps({
  title:       { type: String, default: '' },
  variant:     { type: String, default: 'default' }, // default | accent | subtle
  interactive: { type: Boolean, default: false },
})
</script>

<style scoped>
.hh-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}
.hh-card--accent {
  border-top: 3px solid var(--color-accent);
}
.hh-card--subtle {
  background: var(--color-surface-subtle);
  border-color: var(--color-border);
  box-shadow: none;
}
.hh-card--interactive {
  cursor: pointer;
  transition: box-shadow var(--transition-fast), transform var(--transition-fast);
}
.hh-card--interactive:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}
.hh-card__header {
  padding: var(--space-4) var(--space-5) 0;
}
.hh-card__title {
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.hh-card__body {
  padding: var(--space-5);
}
.hh-card__footer {
  padding: var(--space-4) var(--space-5);
  border-top: 1px solid var(--color-border);
  background: var(--color-surface-subtle);
}
</style>
