<template>
  <div class="hh-divider" :class="`hh-divider--${orientation}`" role="separator" aria-hidden="true" />
</template>

<script setup>
defineProps({
  orientation: { type: String, default: 'horizontal' }, // horizontal | vertical
})
</script>

<style scoped>
.hh-divider--horizontal {
  width: 100%;
  height: 1px;
  background: var(--color-border);
}
.hh-divider--vertical {
  height: 100%;
  width: 1px;
  background: var(--color-border);
}
</style>
