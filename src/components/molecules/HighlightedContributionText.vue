<!--
  HighlightedContributionText: renders the full contribution text with each gold
  key message's located source passages highlighted, coloured by that key
  message's gold comment stance (favor / against / disputed / neutral).

  The text is segmented at every span boundary into non-overlapping pieces; each
  piece records the set of key messages whose spans cover it. A piece covered by
  one or more key messages becomes an interactive highlight (role="button").

  Two distinct interactions:
   - HOVER / FOCUS opens a local popover (KeyMessagePopover) describing the key
     message(s) covering that passage. This is purely local: it never changes the
     page-level active key message, so the stance panel's emphasis stays put.
   - CLICK / Enter / Space PINS (toggles) the active key message by emitting
     `activate`; emphasis of the active key message's passages follows from the
     `activeId` prop. Escape unpins and closes the popover.

  Citizen contribution text is rendered with text interpolation only, NEVER
  v-html, so HTML-looking content is shown literally and cannot inject markup.
-->
<template>
  <p ref="rootRef" class="hct" :class="{ 'hct--has-highlights': hasHighlights }">
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
        :aria-describedby="hoveredIndex === i ? popoverId : null"
        :ref="(el) => setMarkRef(i, el)"
        @mouseenter="openPopover(i, $event)"
        @mouseleave="scheduleClose"
        @focus="openPopover(i, $event)"
        @blur="closePopover"
        @click="toggle(piece.primaryId)"
        @keydown.enter.prevent="toggle(piece.primaryId)"
        @keydown.space.prevent="toggle(piece.primaryId)"
        @keydown.esc.prevent="onMarkEsc"
      >{{ piece.text }}</span>
      <template v-else>{{ piece.text }}</template>
    </template>
  </p>

  <Teleport to="body">
    <KeyMessagePopover
      v-if="hoveredPiece"
      ref="popoverRef"
      :items="hoveredPiece.covering"
      :position="popoverPos"
      :popover-id="popoverId"
      :visible="true"
      @pointerenter="cancelClose"
      @pointerleave="scheduleClose"
    />
  </Teleport>
</template>

<script>
// Module-scoped counter (runs once, not per instance): each component instance
// takes the next value, giving every popover a unique id for aria-describedby.
let popoverSeq = 0
</script>

<script setup>
import { computed, ref, nextTick, onMounted, onBeforeUnmount, watch } from 'vue'
import KeyMessagePopover from './KeyMessagePopover.vue'
import { useVotesStanceStrings } from '../../composables/useVotesStanceLang.js'
import { getVotesStanceExtraStrings, interpolate } from '../../i18n/votesStanceExtra.js'
import { computePopoverPosition } from '../../utils/popoverPosition.js'
import { prefersReducedMotion } from '../../utils/motion.js'

const props = defineProps({
  // The raw contribution text to render.
  text: { type: String, default: '' },
  // Gold key messages, each: { id, key_message, highlight_stance,
  // spans: [{start,end}], favor, against, neutral, mixed? }.
  keyMessages: { type: Array, default: () => [] },
  // The currently active (pinned) key-message id, or null.
  activeId: { type: [Number, String], default: null },
  // Which side pinned the active key message: 'text' (this component) or 'panel'
  // (the stance panel), or null when nothing is pinned. This component scrolls
  // the passage into view ONLY for a panel-originated pin, so a pin made here
  // never scrolls its own passage (and the panel only scrolls for 'text').
  pinOrigin: { type: String, default: null },
})

const emit = defineEmits(['activate'])

const { lang } = useVotesStanceStrings()
const x = computed(() => getVotesStanceExtraStrings(lang.value))

// A unique, stable popover id for this instance, so aria-describedby references
// the right popover when several highlighted texts exist on a page.
const popoverId = `kmpop-${++popoverSeq}`

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

// Describe one key message for the aria label, with its counts.
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
    })
  }
  return out
})

const hasHighlights = computed(() => intervals.value.length > 0)

// --- Pinning (page-level active key message) ---

// Click / Enter / Space toggles the key message: activate it, or clear the
// selection when it is already the active one. This is the ONLY path that
// changes the page-level active id; hover never does. Toggling a key message
// OFF also dismisses the popover, which matters on touch where a tap both opens
// the popover (emulated mouseenter) and pins/unpins (click).
function toggle(id) {
  const next = props.activeId === id ? null : id
  emit('activate', next)
  if (next === null) closePopover()
}

// --- Local hover popover (never emits activate) ---

// The root <p>, used to tell an outside pointerdown (touch dismissal) from a tap
// on a mark or the popover.
const rootRef = ref(null)
// Index of the piece whose popover is open, or null. Local-only state.
const hoveredIndex = ref(null)
const popoverPos = ref({ top: 0, left: 0, placement: 'above' })
const popoverRef = ref(null)
// The mark element the popover is anchored to, kept so scroll/resize can recompute.
let anchorEl = null
// Grace timer so the pointer can travel from the passage onto the popover.
let closeTimer = null

const hoveredPiece = computed(() =>
  hoveredIndex.value === null ? null : pieces.value[hoveredIndex.value] ?? null
)

// Record each mark element by its piece index, so an external activation can
// scroll the first passage of a key message into view.
const markEls = []
function setMarkRef(i, el) {
  markEls[i] = el || undefined
}

function openPopover(i, event) {
  cancelClose()
  hoveredIndex.value = i
  anchorEl = (event && event.currentTarget) || markEls[i] || null
  // Wait for the popover to render so its real size can be measured.
  nextTick(() => {
    recomputePosition()
    addViewportListeners()
  })
}

function recomputePosition() {
  const anchor = anchorEl
  if (!anchor || typeof anchor.getBoundingClientRect !== 'function') return
  const anchorRect = anchor.getBoundingClientRect()
  const popEl = popoverRef.value && popoverRef.value.$el
  const popRect =
    popEl && typeof popEl.getBoundingClientRect === 'function'
      ? popEl.getBoundingClientRect()
      : { width: 320, height: 0 }
  const viewport = {
    width: window.innerWidth || 0,
    height: window.innerHeight || 0,
  }
  popoverPos.value = computePopoverPosition(
    anchorRect,
    { width: popRect.width, height: popRect.height },
    viewport
  )
}

function scheduleClose() {
  cancelClose()
  closeTimer = setTimeout(closePopover, 120)
}

function cancelClose() {
  if (closeTimer !== null) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
}

function closePopover() {
  cancelClose()
  hoveredIndex.value = null
  anchorEl = null
  removeViewportListeners()
}

// Escape on a focused mark closes the popover AND unpins any active key message.
function onMarkEsc() {
  closePopover()
  emit('activate', null)
}

// --- Viewport listeners (only while a popover is open) ---

function onViewportChange() {
  recomputePosition()
}

function addViewportListeners() {
  // Capture phase so scrolls in any ancestor container also trigger a recompute.
  window.addEventListener('scroll', onViewportChange, true)
  window.addEventListener('resize', onViewportChange)
}

function removeViewportListeners() {
  window.removeEventListener('scroll', onViewportChange, true)
  window.removeEventListener('resize', onViewportChange)
}

// --- Global Escape: unpin + close even when a mark is not focused ---

// Act only when there is something to dismiss (an open popover or a pinned key
// message), the event was not already handled (e.g. by a focused mark, which
// calls preventDefault), and focus is not inside a form field or open dialog.
function onDocumentKeydown(e) {
  if (e.key !== 'Escape' || e.defaultPrevented) return
  const open = hoveredIndex.value !== null
  const pinned = props.activeId !== null && props.activeId !== undefined
  if (!open && !pinned) return
  const ae = document.activeElement
  if (ae) {
    const tag = ae.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
    if (typeof ae.closest === 'function' && ae.closest('dialog, [role="dialog"]')) return
  }
  if (open) closePopover()
  if (pinned) emit('activate', null)
}

// --- Outside pointerdown (touch dismissal) ---

// On touch a tap emulates mouseenter (opens the popover) + click (pins it), with
// no leave to close it. Dismiss the popover when the pointer goes down anywhere
// that is neither a mark nor the popover itself.
function onDocumentPointerDown(e) {
  if (hoveredIndex.value === null) return
  const t = e.target
  const onMark = t && typeof t.closest === 'function' && t.closest('.hct__mark')
  const popEl = popoverRef.value && popoverRef.value.$el
  const inPopover = popEl && typeof popEl.contains === 'function' && popEl.contains(t)
  if (!onMark && !inPopover) closePopover()
}

// --- Scroll the active key message's passage into view on external activation ---

watch(
  () => props.activeId,
  (id) => {
    if (id === null || id === undefined) return
    // Only scroll the passage for a pin that originated in the stance panel; a
    // pin made here must not scroll its own passage.
    if (props.pinOrigin !== 'panel') return
    const idx = pieces.value.findIndex(
      (p) => p.covering && p.covering.some((km) => km.id === id)
    )
    if (idx < 0) return
    const el = markEls[idx]
    // Guard scrollIntoView: it is absent in some test (jsdom) environments.
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        block: 'center',
      })
    }
  }
)

onMounted(() => {
  document.addEventListener('keydown', onDocumentKeydown)
  document.addEventListener('pointerdown', onDocumentPointerDown, true)
})

onBeforeUnmount(() => {
  cancelClose()
  removeViewportListeners()
  document.removeEventListener('keydown', onDocumentKeydown)
  document.removeEventListener('pointerdown', onDocumentPointerDown, true)
})
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
