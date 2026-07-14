<template>
  <div class="page-header">
    <div class="page-header__top">
      <div class="page-header__title-row">
        <HhIcon v-if="icon" :name="icon" size="lg" class="page-header__icon" />
        <HhText tag="h1" variant="heading" class="page-header__title">{{ title }}</HhText>
        <HhBadge v-if="badge" :variant="badgeVariant" size="md">{{ badge }}</HhBadge>
      </div>
      <div v-if="$slots.actions" class="page-header__actions">
        <slot name="actions" />
      </div>
    </div>
    <HhText v-if="description" tag="p" variant="body" color="secondary" class="page-header__desc">
      {{ description }}
    </HhText>
    <HhDivider class="page-header__divider" />
  </div>
</template>

<script setup>
import HhIcon from '../atoms/HhIcon.vue'
import HhText from '../atoms/HhText.vue'
import HhBadge from '../atoms/HhBadge.vue'
import HhDivider from '../atoms/HhDivider.vue'

defineProps({
  title:        { type: String, required: true },
  description:  { type: String, default: '' },
  icon:         { type: String, default: '' },
  badge:        { type: String, default: '' },
  badgeVariant: { type: String, default: 'default' },
})
</script>

<style scoped>
.page-header {
  margin-bottom: var(--space-8);
}
.page-header__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-3);
  flex-wrap: wrap;
}
.page-header__title-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
.page-header__icon {
  color: var(--color-accent);
}
.page-header__title {
  line-height: var(--line-height-tight);
}
.page-header__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}
.page-header__desc {
  margin-bottom: var(--space-4);
}
.page-header__divider {
  margin-top: var(--space-3);
}
</style>
