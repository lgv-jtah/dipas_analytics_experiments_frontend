<template>
  <component
    :is="tag"
    class="hh-text"
    :class="[`hh-text--${variant}`, `hh-text--${color}`]"
  >
    <slot />
  </component>
</template>

<script setup>
defineProps({
  tag:     { type: String, default: 'p' },
  variant: { type: String, default: 'body' }, // display | heading | subheading | body | caption | label
  color:   { type: String, default: 'primary' }, // primary | secondary | inverse | accent
})
</script>

<style scoped>
.hh-text--display    { font-size: var(--font-size-3xl); font-weight: var(--font-weight-bold); line-height: var(--line-height-tight); }
.hh-text--heading    { font-size: var(--font-size-2xl); font-weight: var(--font-weight-semibold); line-height: var(--line-height-tight); }
.hh-text--subheading { font-size: var(--font-size-xl);  font-weight: var(--font-weight-semibold); line-height: var(--line-height-tight); }
.hh-text--body       { font-size: var(--font-size-base); font-weight: var(--font-weight-regular); line-height: var(--line-height-normal); }
.hh-text--caption    { font-size: var(--font-size-sm); font-weight: var(--font-weight-regular); line-height: var(--line-height-normal); }
.hh-text--label      { font-size: var(--font-size-sm); font-weight: var(--font-weight-medium); letter-spacing: 0.01em; line-height: var(--line-height-normal); }

.hh-text--primary   { color: var(--color-text-primary); }
.hh-text--secondary { color: var(--color-text-secondary); }
.hh-text--inverse   { color: var(--color-text-inverse); }
.hh-text--accent    { color: var(--color-accent); }
</style>
