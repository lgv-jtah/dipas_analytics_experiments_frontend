<template>
  <component
    :is="tag"
    class="hh-badge"
    :class="[`hh-badge--${variant}`, `hh-badge--${size}`]"
  >
    <slot />
  </component>
</template>

<script setup>
defineProps({
  tag:     { type: String, default: 'span' },
  variant: { type: String, default: 'default' }, // default | red | navy | success | warning
  size:    { type: String, default: 'sm' },        // sm | md
})
</script>

<style scoped>
.hh-badge {
  display: inline-flex;
  align-items: center;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  line-height: 1;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border-radius: var(--radius-full);
}

.hh-badge--sm { padding: 3px 8px; }
.hh-badge--md { padding: 5px 12px; }

.hh-badge--default {
  background: var(--color-hh-gray-100);
  color: var(--color-hh-gray-700);
}
.hh-badge--red {
  background: var(--color-accent-subtle);
  color: var(--color-accent);
}
.hh-badge--navy {
  background: var(--color-hh-navy);
  color: var(--color-hh-white);
}
.hh-badge--success {
  background: #E6F9F0;
  color: #1A7A4A;
}
.hh-badge--warning {
  background: #FFF8E6;
  color: #9A6800;
}
</style>
