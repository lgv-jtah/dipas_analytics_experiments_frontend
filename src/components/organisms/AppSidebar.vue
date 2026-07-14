<template>
  <aside class="sidebar" :class="{ 'sidebar--collapsed': collapsed }">
    <!-- Brand / Logo -->
    <div class="sidebar__brand">
      <div class="sidebar__logo">
        <HhIcon name="castle" size="xl" class="sidebar__castle" />
      </div>
      <Transition name="sidebar-label">
        <div v-show="!collapsed" class="sidebar__brand-text">
          <HhText tag="span" variant="label" color="inverse" class="sidebar__brand-title">
            DIPAS Analytics
          </HhText>
          <HhText tag="span" variant="caption" color="secondary" class="sidebar__brand-sub">
            Freie und Hansestadt Hamburg
          </HhText>
        </div>
      </Transition>
    </div>

    <HhDivider class="sidebar__divider" />

    <!-- Navigation -->
    <nav class="sidebar__nav" role="navigation" aria-label="Main navigation">
      <HhText tag="p" variant="caption" class="sidebar__section-label" v-show="!collapsed">
        Evaluation
      </HhText>
      <ul class="sidebar__list">
        <li v-for="item in evaluationNavItems" :key="item.to">
          <NavItem
            :to="item.to"
            :icon="item.icon"
            :label="item.label"
            :badge="item.badge"
            :collapsed="collapsed"
          />
        </li>
      </ul>

      <div class="sidebar__section-gap" />

      <!-- <HhText tag="p" variant="caption" class="sidebar__section-label" v-show="!collapsed">
        Analysis
      </HhText>
      <ul class="sidebar__list">
        <li v-for="item in analysisNavItems" :key="item.to">
          <NavItem
            :to="item.to"
            :icon="item.icon"
            :label="item.label"
            :badge="item.badge"
            :collapsed="collapsed"
          />
        </li>
      </ul> -->
    </nav>

    <!-- Footer nav -->
    <div class="sidebar__footer">
      <HhDivider class="sidebar__divider" />
      <ul class="sidebar__list sidebar__list--footer">
        <li>
          <NavItem
            to="/settings"
            icon="settings"
            label="Settings"
            :collapsed="collapsed"
          />
        </li>
      </ul>
      <button
        class="sidebar__collapse-btn"
        :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        @click="$emit('toggle')"
      >
        <HhIcon :name="collapsed ? 'chevron-right' : 'chevron-left'" size="md" />
        <Transition name="sidebar-label">
          <span v-show="!collapsed" class="sidebar__collapse-label">Collapse</span>
        </Transition>
      </button>
    </div>
  </aside>
</template>

<script setup>
import HhIcon from '../atoms/HhIcon.vue'
import HhText from '../atoms/HhText.vue'
import HhDivider from '../atoms/HhDivider.vue'
import NavItem from '../molecules/NavItem.vue'

defineProps({
  collapsed: { type: Boolean, default: false },
})
defineEmits(['toggle'])

const evaluationNavItems = [
  { to: '/evaluation',              icon: 'progress',       label: 'Overview' },
  { to: '/evaluation/contributions', icon: 'contributions',  label: 'Contributions' },
]

const analysisNavItems = [
  { to: '/key-message-extraction', icon: 'key',        label: 'Key Message Extraction' },
  { to: '/stance-detection',       icon: 'stance',     label: 'Stance Detection' },
  { to: '/title-generation',       icon: 'title',      label: 'Title Generation' },
  { to: '/experiments',            icon: 'experiments', label: 'Experiments', badge: 'New' },
]
</script>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  width: var(--sidebar-width);
  min-height: 100vh;
  background: var(--sidebar-bg);
  transition: width var(--transition-normal);
  overflow: hidden;
  flex-shrink: 0;
}
.sidebar--collapsed {
  width: 68px;
}

/* Brand */
.sidebar__brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-5) var(--space-4);
  min-height: 72px;
  overflow: hidden;
}
.sidebar__logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: var(--color-accent);
  border-radius: var(--radius-md);
  flex-shrink: 0;
}
.sidebar__castle {
  color: var(--color-hh-white);
}
.sidebar__brand-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
  white-space: nowrap;
}
.sidebar__brand-title {
  color: var(--color-hh-white) !important;
  font-weight: var(--font-weight-bold) !important;
  font-size: var(--font-size-sm) !important;
  letter-spacing: 0.04em !important;
}
.sidebar__brand-sub {
  color: rgba(255, 255, 255, 0.45) !important;
  font-size: var(--font-size-xs) !important;
  font-weight: var(--font-weight-regular) !important;
}

/* Section gap */
.sidebar__section-gap {
  height: var(--space-4);
}

/* Divider */
.sidebar__divider {
  background: rgba(255, 255, 255, 0.08) !important;
  margin: 0 var(--space-3);
}

/* Nav */
.sidebar__nav {
  flex: 1;
  padding: var(--space-4) 0;
  overflow-y: auto;
  overflow-x: hidden;
}
.sidebar__section-label {
  padding: 0 var(--space-6) var(--space-2);
  color: rgba(255, 255, 255, 0.35) !important;
  font-size: var(--font-size-xs) !important;
  font-weight: var(--font-weight-semibold) !important;
  text-transform: uppercase !important;
  letter-spacing: 0.08em !important;
}
.sidebar__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

/* Footer */
.sidebar__footer {
  padding-bottom: var(--space-4);
}
.sidebar__list--footer {
  padding: var(--space-2) 0;
}
.sidebar__collapse-btn {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-3) var(--space-5);
  margin-top: var(--space-2);
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.45);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: color var(--transition-fast);
  white-space: nowrap;
  overflow: hidden;
}
.sidebar__collapse-btn:hover {
  color: var(--color-hh-white);
}
.sidebar__collapse-label {
  overflow: hidden;
  white-space: nowrap;
}

/* sidebar label transitions */
.sidebar-label-enter-active,
.sidebar-label-leave-active {
  transition: opacity var(--transition-fast);
}
.sidebar-label-enter-from,
.sidebar-label-leave-to {
  opacity: 0;
}
</style>
