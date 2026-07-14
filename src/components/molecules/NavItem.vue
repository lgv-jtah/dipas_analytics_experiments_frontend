<template>
  <router-link
    :to="to"
    class="nav-item"
    :class="{ 'nav-item--collapsed': collapsed }"
    custom
    v-slot="{ isActive }"
  >
    <a
      :href="to"
      class="nav-item__link"
      :class="{ 'nav-item__link--active': isActive }"
      @click.prevent="navigate"
    >
      <span class="nav-item__icon-wrap">
        <HhIcon :name="icon" size="md" />
      </span>
      <Transition name="nav-label">
        <span v-show="!collapsed" class="nav-item__label">{{ label }}</span>
      </Transition>
      <Transition name="nav-label">
        <HhBadge v-if="badge && !collapsed" variant="red" size="sm" class="nav-item__badge">
          {{ badge }}
        </HhBadge>
      </Transition>
    </a>
  </router-link>
</template>

<script setup>
import { useRouter } from 'vue-router'
import HhIcon from '../atoms/HhIcon.vue'
import HhBadge from '../atoms/HhBadge.vue'

const props = defineProps({
  to:        { type: String, required: true },
  icon:      { type: String, required: true },
  label:     { type: String, required: true },
  badge:     { type: [String, Number], default: null },
  collapsed: { type: Boolean, default: false },
})

const router = useRouter()
function navigate() {
  router.push(props.to)
}
</script>

<style scoped>
.nav-item {
  display: block;
  padding: 0 var(--space-3);
}

.nav-item__link {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-3);
  border-radius: var(--radius-md);
  color: var(--sidebar-text);
  text-decoration: none;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: background var(--transition-fast), color var(--transition-fast);
  cursor: pointer;
  overflow: hidden;
  white-space: nowrap;
}

.nav-item__link:hover {
  background: var(--sidebar-bg-hover);
  color: var(--sidebar-text-active);
}

.nav-item__link--active {
  background: var(--sidebar-bg-active);
  color: var(--sidebar-text-active);
}

.nav-item__icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
}

.nav-item__label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-item__badge {
  flex-shrink: 0;
}

/* collapsed */
.nav-item--collapsed .nav-item__link {
  justify-content: center;
  padding: var(--space-3);
}

/* label slide transition */
.nav-label-enter-active,
.nav-label-leave-active {
  transition: opacity var(--transition-fast), width var(--transition-normal);
  overflow: hidden;
}
.nav-label-enter-from,
.nav-label-leave-to {
  opacity: 0;
  width: 0;
}
</style>
