<!--
  KeyMessageStancePanel: on a contribution page, shows the HAND-LABELLED (gold)
  key messages for that contribution and, for each, how many comments are in
  favor / against / neutral. Each count expands (<details>) to the comments
  behind it. A "too few comments" badge marks key messages with fewer than three
  comments that take a clear stance.

  The panel links with the highlighted contribution text by PINNING, not hover:
  clicking (or Enter/Space on) a key-message row emits `activate` to toggle that
  key message as the page-level active one, and clicking the active row again
  clears it. Each row is exposed as a toggle button (role="button" +
  aria-pressed) so assistive tech announces the pinned state. The row whose id
  matches `activeId` is emphasised, and scrolled into view only when the pin came
  from the text side (see `pinOrigin`). A key message whose source passage was
  not located in the text shows a short "passage not found" note instead of a
  swatch.

  The panel can either be driven by its parent (via the `keyMessages`/`activeId`
  props) or fetch its own gold key messages when used standalone (the fallback).

  This is deliberately separate from the model key-message evaluation list on the
  same page: the two lists can word key messages differently and have different
  counts, so they are never merged. Citizen comment text is rendered with text
  interpolation only (never v-html). Data comes from the backend
  (/contributions/{id}/votes-stance/key-messages); the panel hides itself when
  there is nothing gold to show.
-->
<template>
  <HhCard v-if="visible" :title="x.kmPanelTitle" class="kmsp">
    <HhText tag="p" variant="caption" color="secondary" class="kmsp__intro">
      {{ x.kmPanelIntro }}
    </HhText>

    <div v-if="loading" class="kmsp__state">
      <HhText variant="caption" color="secondary">{{ x.loading }}</HhText>
    </div>

    <ul v-else class="kmsp__list">
      <li
        v-for="km in rows"
        :key="km.id"
        class="kmsp__item"
        :class="{ 'kmsp__item--active': km.id === activeId }"
        :ref="(el) => setRowRef(km.id, el)"
        role="button"
        tabindex="0"
        :aria-pressed="km.id === activeId ? 'true' : 'false'"
        @click="toggle(km.id)"
        @keydown.enter.prevent="toggle(km.id)"
        @keydown.space.prevent="toggle(km.id)"
      >
        <div class="kmsp__head">
          <span
            v-if="hasHighlights && km.highlight_stance"
            class="kmsp__swatch"
            :class="`kmsp__swatch--${km.highlight_stance}`"
            aria-hidden="true"
          ></span>
          <HhText tag="span" variant="body" class="kmsp__km">{{ km.key_message }}</HhText>
          <span v-if="km.too_few" class="kmsp__badge">{{ x.kmTooFew }}</span>
        </div>

        <!-- Highlight available for this contribution but this key message's
             source passage was not located in the text. -->
        <p v-if="showNoPassage(km)" class="kmsp__no-passage">
          <HhText tag="span" variant="caption" color="secondary">{{ x.kmNoPassage }}</HhText>
        </p>

        <div class="kmsp__groups">
          <details v-for="group in groupsFor(km)" :key="group.key" class="kmsp__group">
            <summary class="kmsp__summary" :class="`kmsp__summary--${group.key}`">
              {{ group.label }}: {{ group.items.length }}
            </summary>
            <ul v-if="group.items.length" class="kmsp__comments">
              <!-- Text interpolation only; never v-html for citizen comments. -->
              <li v-for="(c, ci) in group.items" :key="ci" class="kmsp__comment">
                {{ c.comment_text }}
              </li>
            </ul>
            <p v-else class="kmsp__comment kmsp__comment--empty">
              <HhText tag="span" variant="caption" color="secondary">{{ x.kmNoComments }}</HhText>
            </p>
          </details>
        </div>
      </li>
    </ul>
  </HhCard>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import HhCard from './HhCard.vue'
import HhText from '../atoms/HhText.vue'
import { getContributionKeyMessages } from '../../services/api.js'
import { useVotesStanceStrings } from '../../composables/useVotesStanceLang.js'
import { getVotesStanceExtraStrings } from '../../i18n/votesStanceExtra.js'
import { prefersReducedMotion } from '../../utils/motion.js'

const props = defineProps({
  contributionId: { type: Number, required: true },
  // When provided (non-null), the panel is driven by the parent and does NOT
  // fetch its own data. Each entry is expected to carry a stable `id`.
  keyMessages: { type: Array, default: null },
  // The active key-message id, or null.
  activeId: { type: [Number, String], default: null },
  // Which side pinned the active key message: 'text' or 'panel' (or null). The
  // panel scrolls the active row into view ONLY for a text-originated pin, so a
  // pin made here never scrolls its own row (and the text only scrolls for 'panel').
  pinOrigin: { type: String, default: null },
})

const emit = defineEmits(['activate'])

const { lang } = useVotesStanceStrings()
const x = computed(() => getVotesStanceExtraStrings(lang.value))

// Parent-driven mode (keyMessages provided) has nothing to load; only the
// self-fetch fallback starts in a loading state.
const loading = ref(props.keyMessages == null)
const fetchedRows = ref([])

// Attach a stable id (falling back to the list index) to every row, so parent
// and self-fetch modes both have one to key hover/active linking on.
function withIds(list) {
  return (list || []).map((km, i) => ({ ...km, id: km.id ?? i }))
}

// Rows come from the parent when it passes them, otherwise from the self-fetch.
const rows = computed(() =>
  props.keyMessages != null ? withIds(props.keyMessages) : fetchedRows.value
)

// Highlights are available when at least one row carries a spans_source (the
// backend attaches it whenever the span artifact is present).
const hasHighlights = computed(() =>
  rows.value.some((km) => km.spans_source != null)
)

// Hide the whole panel for non-gold contributions (no rows) or on error, so the
// contribution page stays clean; show it while loading and once rows exist.
const visible = computed(() => loading.value || rows.value.length > 0)

// A row has "no located passage" when highlights exist for the contribution but
// this key message produced no span.
function showNoPassage(km) {
  return km.spans_source != null && (!km.spans || km.spans.length === 0)
}

// Build the three expandable groups (favor / against / neutral) for one key
// message, each with its comment list.
function groupsFor(km) {
  return [
    { key: 'favor', label: x.value.kmInFavor, items: km.comments.favor },
    { key: 'against', label: x.value.kmAgainst, items: km.comments.against },
    { key: 'neutral', label: x.value.kmNeutral, items: km.comments.neutral },
  ]
}

// Click / Enter / Space toggles the active key message.
function toggle(id) {
  emit('activate', props.activeId === id ? null : id)
}

// Per-row element refs, so an activation elsewhere can scroll the matching row
// into view.
const rowEls = new Map()
function setRowRef(id, el) {
  if (el) rowEls.set(id, el)
  else rowEls.delete(id)
}

watch(
  () => props.activeId,
  (id) => {
    if (id === null || id === undefined) return
    // Only scroll the row for a pin that originated in the highlighted text; a
    // pin made here must not scroll its own row.
    if (props.pinOrigin !== 'text') return
    const el = rowEls.get(id)
    // Guard scrollIntoView: it is absent in some test (jsdom) environments.
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        block: 'nearest',
      })
    }
  }
)

onMounted(async () => {
  // Parent-driven mode: nothing to fetch.
  if (props.keyMessages != null) {
    loading.value = false
    return
  }
  try {
    fetchedRows.value = withIds(await getContributionKeyMessages(props.contributionId))
  } catch {
    // A non-gold contribution (404) or a backend without the artifact: hide.
    fetchedRows.value = []
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.kmsp { margin-bottom: var(--space-8); }
.kmsp__intro { margin: 0 0 var(--space-4); }
.kmsp__state { padding: var(--space-4) 0; }
.kmsp__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.kmsp__item {
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  cursor: pointer;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}
.kmsp__item:focus-visible {
  outline: 2px solid var(--color-text-primary);
  outline-offset: 1px;
}
.kmsp__item--active {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 1px var(--color-accent);
}
.kmsp__head {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}
.kmsp__swatch {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  flex: none;
}
.kmsp__swatch--favor { background: #1A7A4A; }
.kmsp__swatch--against { background: var(--color-accent); }
.kmsp__swatch--disputed { background: #C77700; }
.kmsp__swatch--neutral { background: var(--color-hh-gray-300); }
.kmsp__km { font-weight: var(--font-weight-semibold); flex: 1; min-width: 0; }
.kmsp__badge {
  flex: none;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  background: var(--color-hh-gray-300);
  color: var(--color-text-primary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  white-space: nowrap;
}
.kmsp__no-passage { margin: 0 0 var(--space-3); }
.kmsp__groups {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}
.kmsp__group {
  flex: 1 1 200px;
  min-width: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-3);
}
.kmsp__summary {
  cursor: pointer;
  user-select: none;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  position: relative;
  padding-left: 16px;
}
.kmsp__summary::marker { content: ''; }
.kmsp__summary::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 10px;
  height: 10px;
  border-radius: 2px;
}
.kmsp__summary--favor::before { background: #1A7A4A; }
.kmsp__summary--against::before { background: var(--color-accent); }
.kmsp__summary--neutral::before { background: var(--color-hh-gray-300); }
.kmsp__comments {
  margin: var(--space-2) 0 0;
  padding-left: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.kmsp__comment {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  line-height: var(--line-height-normal);
}
.kmsp__comment--empty { margin: var(--space-2) 0 0; }
</style>
