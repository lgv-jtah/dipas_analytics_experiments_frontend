<!--
  HighlightedContributionText: renders the full contribution text with each gold
  key message's located source passages highlighted, coloured by that key
  message's gold comment stance (favor / against / disputed / neutral).

  The text is segmented at every span boundary into non-overlapping pieces; each
  piece records the set of key messages whose spans cover it. A piece covered by
  one or more key messages becomes an interactive highlight (role="button") that
  links to the key-message panel: hovering, focusing or clicking it emits
  `activate` with the key message's id, and when a key message is active its
  pieces are emphasised.

  Citizen contribution text is rendered with text interpolation only, NEVER
  v-html, so HTML-looking content is shown literally and cannot inject markup.
-->
<template>
  <p class="hct" :class="{ 'hct--has-highlights': hasHighlights }">
    <template v-for="(piece, i) in pieces" :key="i">
      <span
        v-if="piece.covering.length"
        class="hct__mark"
        :class="[
          `hct__mark--${piece.stance}`,
          { 'hct__mark--active': piece.active },
        ]"
        role="button"
        tabindex="0"
        :aria-pressed="piece.active ? 'true' : 'false'"
        :aria-label="piece.aria"
        :title="piece.title"
        @mouseenter="emitActivate(piece.primaryId)"
        @mouseleave="emitActivate(null)"
        @focus="emitActivate(piece.primaryId)"
        @blur="emitActivate(null)"
        @click="toggle(piece.primaryId)"
        @keydown.enter.prevent="toggle(piece.primaryId)"
        @keydown.space.prevent="toggle(piece.primaryId)"
      >{{ piece.text }}</span>
      <template v-else>{{ piece.text }}</template>
    </template>
  </p>
</template>

<script setup>
import { computed } from 'vue'
import { useVotesStanceStrings } from '../../composables/useVotesStanceLang.js'
import { getVotesStanceExtraStrings, interpolate } from '../../i18n/votesStanceExtra.js'

const props = defineProps({
  // The raw contribution text to render.
  text: { type: String, default: '' },
  // Gold key messages, each: { id, key_message, highlight_stance,
  // spans: [{start,end}], favor, against, neutral }.
  keyMessages: { type: Array, default: () => [] },
  // The currently active key-message id, or null.
  activeId: { type: [Number, String], default: null },
})

const emit = defineEmits(['activate'])

const { lang } = useVotesStanceStrings()
const x = computed(() => getVotesStanceExtraStrings(lang.value))

// Precedence for colouring a piece covered by several key messages when none of
// them is the active one: a clear objection dominates, then a split, then
// agreement, then neutral. Lower number wins.
const STANCE_RANK = { against: 0, disputed: 1, favor: 2, neutral: 3 }

// Build the clamped, valid highlight intervals from the key messages' spans.
const intervals = computed(() => {
  const len = props.text.length
  const out = []
  for (const km of props.keyMessages) {
    for (const span of km.spans || []) {
      // Clamp to the text bounds and drop anything empty or inverted, so a stale
      // or out-of-range span can never slice outside the string.
      const start = Math.max(0, Math.min(Number(span.start), len))
      const end = Math.max(0, Math.min(Number(span.end), len))
      if (Number.isFinite(start) && Number.isFinite(end) && end > start) {
        out.push({ start, end, km })
      }
    }
  }
  return out
})

// Describe one key message for the tooltip / aria label, with its counts.
function describe(km) {
  return interpolate(x.value.highlightAria, {
    km: km.key_message,
    favor: km.favor ?? 0,
    against: km.against ?? 0,
    neutral: km.neutral ?? 0,
  })
}

// Segment the text at every interval boundary into non-overlapping pieces. Each
// piece carries the set of key messages whose intervals cover it, the colour to
// paint it, whether the active key message is among them, and the id a click
// should toggle.
const pieces = computed(() => {
  const text = props.text
  const len = text.length
  const ivs = intervals.value
  if (!len) return []
  if (!ivs.length) return [{ text, covering: [] }]

  const bounds = new Set([0, len])
  for (const iv of ivs) {
    bounds.add(iv.start)
    bounds.add(iv.end)
  }
  const ordered = [...bounds].sort((a, b) => a - b)

  const out = []
  for (let i = 0; i < ordered.length - 1; i++) {
    const a = ordered[i]
    const b = ordered[i + 1]
    if (a >= b) continue
    const covering = ivs.filter((iv) => iv.start <= a && iv.end >= b)
    if (!covering.length) {
      out.push({ text: text.slice(a, b), covering: [] })
      continue
    }
    const kms = covering.map((iv) => iv.km)
    const active = kms.some((km) => km.id === props.activeId)
    // Colour: the active key message's stance when it covers this piece,
    // otherwise the precedence winner among the covering key messages.
    let paint
    if (active) {
      paint = kms.find((km) => km.id === props.activeId)
    } else {
      paint = [...kms].sort(
        (p, q) => STANCE_RANK[p.highlight_stance] - STANCE_RANK[q.highlight_stance]
      )[0]
    }
    out.push({
      text: text.slice(a, b),
      covering: kms,
      stance: paint.highlight_stance,
      active,
      primaryId: paint.id,
      aria: kms.map(describe).join(' · '),
      title: kms.map(describe).join('\n'),
    })
  }
  return out
})

const hasHighlights = computed(() => intervals.value.length > 0)

function emitActivate(id) {
  emit('activate', id)
}

// Click / Enter / Space toggles the key message: activate it, or clear the
// selection when it is already the active one.
function toggle(id) {
  emit('activate', props.activeId === id ? null : id)
}
</script>

<style scoped>
.hct {
  margin: 0;
  line-height: var(--line-height-loose);
  white-space: pre-wrap;
}

.hct__mark {
  border-radius: 3px;
  padding: 0 1px;
  cursor: pointer;
  /* Translucent in-text backgrounds so the text underneath stays legible. */
  background: var(--hct-bg, rgba(174, 174, 178, 0.3));
  box-shadow: inset 0 -2px 0 0 var(--hct-line, transparent);
  transition: background var(--transition-fast), box-shadow var(--transition-fast);
}
.hct__mark:focus-visible {
  outline: 2px solid var(--color-text-primary);
  outline-offset: 1px;
}

/* Stance colours: solid line underneath, translucent fill above. */
.hct__mark--favor {
  --hct-bg: rgba(26, 122, 74, 0.20);
  --hct-line: #1A7A4A;
}
.hct__mark--against {
  --hct-bg: rgba(200, 16, 46, 0.18);
  --hct-line: var(--color-accent);
}
.hct__mark--disputed {
  --hct-bg: rgba(199, 119, 0, 0.22);
  --hct-line: #C77700;
}
.hct__mark--neutral {
  --hct-bg: rgba(174, 174, 178, 0.35);
  --hct-line: var(--color-hh-gray-300);
}

/* The active key message's passages are emphasised. */
.hct__mark--active {
  font-weight: var(--font-weight-semibold);
  box-shadow: inset 0 -3px 0 0 var(--hct-line, transparent);
  filter: saturate(1.3);
}
</style>
