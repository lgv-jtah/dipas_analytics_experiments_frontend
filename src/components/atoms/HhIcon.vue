<!-- HhIcon: thin SVG icon set matching Hamburg's clean visual identity -->
<template>
  <svg
    class="hh-icon"
    :class="`hh-icon--${size}`"
    :width="dims"
    :height="dims"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.75"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    v-bind="$attrs"
  >
    <!-- key-message-extraction -->
    <template v-if="name === 'key'">
      <circle cx="7.5" cy="15.5" r="3.5" />
      <path d="M14 12l7-7" />
      <path d="M18.5 7.5L21 5" />
      <path d="M16 10l1.5 1.5" />
    </template>

    <!-- stance-detection -->
    <template v-else-if="name === 'stance'">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </template>

    <!-- title-generation -->
    <template v-else-if="name === 'title'">
      <path d="M4 6h16M4 12h10M4 18h6" />
      <path d="M18 15l2 2 4-4" />
    </template>

    <!-- experiments -->
    <template v-else-if="name === 'experiments'">
      <path d="M9 3v8.5L4.5 18a1 1 0 00.9 1.5h13.2a1 1 0 00.9-1.5L15 11.5V3" />
      <path d="M9 3h6" />
      <circle cx="10" cy="15" r="1" fill="currentColor" stroke="none" />
      <circle cx="14" cy="17" r="0.75" fill="currentColor" stroke="none" />
    </template>

    <!-- chevron-right -->
    <template v-else-if="name === 'chevron-right'">
      <polyline points="9 18 15 12 9 6" />
    </template>

    <!-- chevron-left -->
    <template v-else-if="name === 'chevron-left'">
      <polyline points="15 18 9 12 15 6" />
    </template>

    <!-- menu / hamburger -->
    <template v-else-if="name === 'menu'">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </template>

    <!-- close -->
    <template v-else-if="name === 'close'">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </template>

    <!-- hamburg castle (simplified) -->
    <template v-else-if="name === 'castle'">
      <rect x="3" y="14" width="18" height="7" rx="1" />
      <path d="M5 14V9h3v5M11 14V9h2v5M16 14V9h3v5" />
      <path d="M5 9V7h2V5h2V7h2V5h2V7h2V5h2V7h2v2" />
    </template>

    <!-- evaluation (clipboard + checkmark) -->
    <template v-else-if="name === 'evaluation'">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <polyline points="9 12 11 14 15 10" />
    </template>

    <!-- contributions (list of items) -->
    <template v-else-if="name === 'contributions'">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <line x1="7" y1="9" x2="17" y2="9" />
      <line x1="7" y1="13" x2="13" y2="13" />
      <line x1="7" y1="17" x2="10" y2="17" />
    </template>

    <!-- progress / chart -->
    <template v-else-if="name === 'progress'">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 15" />
    </template>

    <!-- user / evaluator -->
    <template v-else-if="name === 'user'">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </template>

    <!-- check -->
    <template v-else-if="name === 'check'">
      <polyline points="20 6 9 17 4 12" />
    </template>

    <!-- cross / x -->
    <template v-else-if="name === 'x'">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </template>

    <!-- arrow-right -->
    <template v-else-if="name === 'arrow-right'">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </template>

    <!-- fallback dot -->
    <template v-else-if="name === 'settings'">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </template>

    <!-- fallback dot -->
    <template v-else>
      <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
    </template>
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: { type: String, required: true },
  size: { type: String, default: 'md' }, // xs | sm | md | lg | xl
})

const sizeMap = { xs: 12, sm: 16, md: 20, lg: 24, xl: 32 }
const dims = computed(() => sizeMap[props.size] ?? 20)
</script>

<style scoped>
.hh-icon { display: inline-block; flex-shrink: 0; vertical-align: middle; }
.hh-icon--xs  { width: 12px; height: 12px; }
.hh-icon--sm  { width: 16px; height: 16px; }
.hh-icon--md  { width: 20px; height: 20px; }
.hh-icon--lg  { width: 24px; height: 24px; }
.hh-icon--xl  { width: 32px; height: 32px; }
</style>
