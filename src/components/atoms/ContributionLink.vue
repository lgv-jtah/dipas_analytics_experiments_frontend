<!--
  ContributionLink: a small external-link icon that opens a contribution's original
  page on the public beteiligung.hamburg portal in a new tab. It renders nothing at
  all for a contribution that has no mapped (or no valid) URL, so callers can drop it
  in unconditionally next to any contribution id.

  It is deliberately a leaf anchor, not a button, and is meant to sit beside -- not
  inside -- a clickable row/card. The @click.stop / @keydown.stop guards keep a click
  on the icon from also triggering a parent row's navigation handler, while still
  letting the browser follow the href normally (no preventDefault).
-->
<template>
  <a
    v-if="href"
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
    :title="label"
    :aria-label="label"
    class="contribution-link"
    @click.stop
    @keydown.stop
  >
    <HhIcon name="external-link" :size="size" />
  </a>
</template>

<script setup>
import { computed } from 'vue'
import HhIcon from './HhIcon.vue'
import { getContributionLink } from '../../utils/contributionLink.js'

const props = defineProps({
  // The contribution to link to. Accepts the numeric id or its string form; an id
  // with no valid mapped URL simply renders nothing.
  contributionId: { type: [Number, String], required: true },
  // Accessible name / tooltip for the link. Defaults to the English wording; the
  // Votes-vs-Stance views pass a localized label from their i18n string sets.
  label: {
    type: String,
    default: 'Open the original contribution on beteiligung.hamburg',
  },
  // Icon size token forwarded to HhIcon (xs | sm | md | lg | xl).
  size: { type: String, default: 'sm' },
})

// Resolved, security-checked URL (or null). The util is the single place that
// validates the href, so the template only has to decide whether to render.
const href = computed(() => getContributionLink(props.contributionId))
</script>

<style scoped>
.contribution-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  text-decoration: none;
  border-radius: var(--radius-sm);
  transition: color var(--transition-fast);
}
.contribution-link:hover {
  color: var(--color-accent);
}
.contribution-link:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
</style>
