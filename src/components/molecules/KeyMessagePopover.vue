<!--
  KeyMessagePopover: the small hover/focus tooltip shown over a highlighted
  passage in the contribution text. It lists every gold key message whose located
  passage covers the hovered span and, for each, a colour swatch + legend label
  (matching the highlight legend) and the comment counts behind it.

  It is a presentational component: all positioning is decided by the parent and
  handed in via the `position` prop (applied as fixed coordinates). The popover
  forwards pointerenter / pointerleave so the parent can keep it open while the
  pointer travels from the passage onto the popover (grace handling).

  Key message and count text is rendered with interpolation only, NEVER v-html,
  so citizen-authored key-message text is shown literally and cannot inject markup.
-->
<template>
  <div
    class="kmpop"
    role="tooltip"
    :id="popoverId"
    :style="rootStyle"
    :aria-hidden="visible ? null : 'true'"
    @pointerenter="emit('pointerenter')"
    @pointerleave="emit('pointerleave')"
  >
    <div v-for="item in items" :key="item.id" class="kmpop__item">
      <p class="kmpop__km">{{ item.key_message }}</p>
      <div class="kmpop__legend">
        <span
          class="kmpop__swatch"
          :class="`kmpop__swatch--${item.highlight_stance}`"
          aria-hidden="true"
        ></span>
        <span class="kmpop__legend-label">{{ legendLabel(item.highlight_stance) }}</span>
      </div>
      <p class="kmpop__counts">{{ countsLine(item) }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useVotesStanceStrings } from '../../composables/useVotesStanceLang.js'
import { getVotesStanceExtraStrings } from '../../i18n/votesStanceExtra.js'

const props = defineProps({
  // Key messages covering the hovered passage. Each: { id, key_message,
  // highlight_stance, favor, against, neutral, mixed? }.
  items: { type: Array, default: () => [] },
  // Fixed-position coordinates computed by the parent.
  position: { type: Object, default: () => ({ top: 0, left: 0, placement: 'above' }) },
  // The id used to wire aria-describedby from the hovered mark to this popover.
  popoverId: { type: String, required: true },
  // Whether the popover is shown; drives aria-hidden for assistive tech.
  visible: { type: Boolean, default: true },
})

const emit = defineEmits(['pointerenter', 'pointerleave'])

const { lang } = useVotesStanceStrings()
const x = computed(() => getVotesStanceExtraStrings(lang.value))

// Map a highlight stance to its legend label (same wording as the colour legend).
const LEGEND_KEY = {
  favor: 'legendFavor',
  against: 'legendAgainst',
  disputed: 'legendDisputed',
  neutral: 'legendNeutral',
}
function legendLabel(stance) {
  const key = LEGEND_KEY[stance]
  return key ? x.value[key] : ''
}

// "{favor} In favor · {against} Against · {neutral} Neutral", with the mixed
// group appended only when a key message actually has mixed-stance comments.
function countsLine(item) {
  const favor = item.favor ?? 0
  const against = item.against ?? 0
  const neutral = item.neutral ?? 0
  const mixed = item.mixed ?? 0
  const s = x.value
  let line = `${favor} ${s.kmInFavor} · ${against} ${s.kmAgainst} · ${neutral} ${s.kmNeutral}`
  if (mixed > 0) line += ` · ${mixed} ${s.kmMixed}`
  return line
}

const rootStyle = computed(() => ({
  position: 'fixed',
  top: `${props.position?.top ?? 0}px`,
  left: `${props.position?.left ?? 0}px`,
}))
</script>

<style scoped>
.kmpop {
  /* Positioned via inline fixed coordinates; this just sizes and elevates it. */
  max-width: min(320px, calc(100vw - 32px));
  z-index: 1000;
  box-sizing: border-box;
  padding: var(--space-3) var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.kmpop__item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.kmpop__item + .kmpop__item {
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border);
}
.kmpop__km {
  margin: 0;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  line-height: var(--line-height-normal);
}
.kmpop__legend {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}
.kmpop__swatch {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  flex: none;
}
.kmpop__swatch--favor { background: #1A7A4A; }
.kmpop__swatch--against { background: var(--color-accent); }
.kmpop__swatch--disputed { background: #C77700; }
.kmpop__swatch--neutral { background: var(--color-hh-gray-300); }
.kmpop__legend-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}
.kmpop__counts {
  margin: 0;
  font-size: var(--font-size-xs);
  color: var(--color-text-primary);
}
</style>
