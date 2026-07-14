<template>
  <div class="app-shell">
    <!-- Sidebar (desktop) -->
    <AppSidebar :collapsed="sidebarCollapsed" @toggle="sidebarCollapsed = !sidebarCollapsed" />

    <!-- Main area -->
    <div class="app-shell__main">
      <AppTopBar
        :current-page-label="currentPageLabel"
        :show-mobile-toggle="true"
        @mobile-toggle="sidebarCollapsed = !sidebarCollapsed"
      />
      <main class="app-shell__content" role="main">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from '../organisms/AppSidebar.vue'
import AppTopBar from '../organisms/AppTopBar.vue'

const sidebarCollapsed = ref(false)

const route = useRoute()
const routeLabels = {
  '/key-message-extraction': 'Key Message Extraction',
  '/stance-detection':       'Stance Detection',
  '/title-generation':       'Title Generation',
  '/experiments':            'Experiments',
  '/evaluation':             'Evaluation Overview',
  '/evaluation/contributions': 'Contributions',
}
const currentPageLabel = computed(() => {
  // Match dynamic routes like /evaluation/contributions/:id
  if (route.path.startsWith('/evaluation/contributions/')) return 'Contribution Detail'
  return routeLabels[route.path] ?? 'Overview'
})
</script>

<style scoped>
.app-shell {
  display: flex;
  min-height: 100vh;
  background: var(--color-surface-subtle);
}
.app-shell__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}
.app-shell__content {
  flex: 1;
  padding: var(--space-8) var(--space-8);
  overflow-y: auto;
}

@media (max-width: 768px) {
  .app-shell__content {
    padding: var(--space-5) var(--space-4);
  }
}
</style>
