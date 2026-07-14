<template>
  <header class="top-bar">
    <div class="top-bar__left">
      <button
        v-if="showMobileToggle"
        class="top-bar__mobile-toggle"
        aria-label="Toggle menu"
        @click="$emit('mobile-toggle')"
      >
        <HhIcon name="menu" size="md" />
      </button>
      <HhText tag="span" variant="label" color="secondary" class="top-bar__breadcrumb">
        {{ currentPageLabel }}
      </HhText>
    </div>
    <div class="top-bar__right">
      <div class="top-bar__city-badge">
        <HhIcon name="castle" size="sm" class="top-bar__city-icon" />
        <HhText tag="span" variant="caption" color="secondary">Hamburg</HhText>
      </div>
    </div>
  </header>
</template>

<script setup>
import HhIcon from '../atoms/HhIcon.vue'
import HhText from '../atoms/HhText.vue'

defineProps({
  currentPageLabel: { type: String, default: '' },
  showMobileToggle: { type: Boolean, default: false },
})
defineEmits(['mobile-toggle'])
</script>

<style scoped>
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-6);
  height: 56px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}
.top-bar__left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
.top-bar__mobile-toggle {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  padding: var(--space-1);
  border-radius: var(--radius-sm);
  transition: color var(--transition-fast), background var(--transition-fast);
}
.top-bar__mobile-toggle:hover {
  background: var(--color-hh-gray-100);
  color: var(--color-text-primary);
}
.top-bar__right {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}
.top-bar__city-badge {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  background: var(--color-accent-subtle);
  border-radius: var(--radius-full);
}
.top-bar__city-icon {
  color: var(--color-accent);
}
</style>
