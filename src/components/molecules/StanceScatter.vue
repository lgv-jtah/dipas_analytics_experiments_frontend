<!--
  StanceScatter: a responsive inline-SVG scatter of thumbs-up share (x) vs.
  comment favor share (y), one point per contribution. A 45-degree line marks
  perfect agreement; point radius grows with the number of labelled comments.
  Clicking a point emits `select` with the contribution id. No dependencies.
-->
<template>
  <div class="scatter">
    <HhText
      v-if="rows.length > 0"
      tag="p"
      variant="caption"
      color="secondary"
      class="scatter__count"
      aria-live="polite"
    >
      {{ countLine }}
    </HhText>

    <svg
      v-if="points.length > 0"
      class="scatter__svg"
      :viewBox="`0 0 ${SIZE} ${SIZE}`"
      role="img"
      :aria-label="strings.scatterTitle"
      preserveAspectRatio="xMidYMid meet"
    >
      <!-- Plot frame -->
      <rect :x="PAD" :y="PAD" :width="PLOT" :height="PLOT" class="scatter__frame" />

      <!-- Gridlines + axis ticks at 0/25/50/75/100 -->
      <g v-for="t in ticks" :key="`t-${t}`">
        <line :x1="sx(t)" :y1="PAD" :x2="sx(t)" :y2="PAD + PLOT" class="scatter__grid" />
        <line :x1="PAD" :y1="sy(t)" :x2="PAD + PLOT" :y2="sy(t)" class="scatter__grid" />
        <text :x="sx(t)" :y="PAD + PLOT + 16" class="scatter__tick" text-anchor="middle">{{ t }}</text>
        <text :x="PAD - 8" :y="sy(t) + 4" class="scatter__tick" text-anchor="end">{{ t }}</text>
      </g>

      <!-- 45-degree agreement line -->
      <line :x1="sx(0)" :y1="sy(0)" :x2="sx(100)" :y2="sy(100)" class="scatter__agreement" />

      <!-- Points -->
      <circle
        v-for="p in points"
        :key="p.contribution_id"
        :cx="sx(p.x)"
        :cy="sy(p.y)"
        :r="radius(p.n)"
        class="scatter__point"
        tabindex="0"
        @click="$emit('select', p.contribution_id)"
        @keydown.enter="$emit('select', p.contribution_id)"
      >
        <title>#{{ p.contribution_id }} — {{ strings.axisX }}: {{ p.x.toFixed(0) }}{{ strings.pctSuffix }}, {{ strings.axisY }}: {{ p.y.toFixed(0) }}{{ strings.pctSuffix }} ({{ p.n }})</title>
      </circle>

      <!-- Axis labels -->
      <text :x="PAD + PLOT / 2" :y="SIZE - 4" class="scatter__axis" text-anchor="middle">{{ strings.axisX }}</text>
      <text :x="14" :y="PAD + PLOT / 2" class="scatter__axis"
            text-anchor="middle" :transform="`rotate(-90 14 ${PAD + PLOT / 2})`">{{ strings.axisY }}</text>
    </svg>

    <HhText v-else tag="p" variant="caption" color="secondary">
      {{ strings.scatterEmpty }}
    </HhText>

    <HhText tag="p" variant="caption" color="secondary" class="scatter__hint">
      {{ strings.scatterHint }}
    </HhText>

    <HhText tag="p" variant="caption" color="secondary" class="scatter__hint">
      {{ strings.clearComment }}
    </HhText>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import HhText from '../atoms/HhText.vue'
import { votesStanceStrings, formatDotCount } from '../../i18n/votesStance.js'

const props = defineProps({
  // rows: [{ contribution_id, thumbs_up_share, comment_favor_share, n_comments }]
  rows: { type: Array, default: () => [] },
  strings: { type: Object, default: () => votesStanceStrings },
})
defineEmits(['select'])

const SIZE = 360
const PAD = 40
const PLOT = SIZE - 2 * PAD
const ticks = [0, 25, 50, 75, 100]

// Keep only contributions that have both a vote share and a favor share.
const points = computed(() =>
  props.rows
    .filter(
      (r) =>
        r.thumbs_up_share !== null &&
        r.thumbs_up_share !== undefined &&
        r.comment_favor_share !== null &&
        r.comment_favor_share !== undefined
    )
    .map((r) => ({
      contribution_id: r.contribution_id,
      x: r.thumbs_up_share * 100,
      y: r.comment_favor_share * 100,
      n: r.n_comments ?? 0,
    }))
)

// Caption summarising how many contributions are plotted as dots. Reuses the
// single `points` filter so the count matches the dots exactly. Note: under the
// live source `rows` also includes contributions without live data, which lack a
// favor share and so are filtered out here — they count as "no clear comment".
// formatDotCount always appends the overlap sentence because many dots share a
// position (in the gold data, 80 dots sit on 29 distinct positions), so fewer
// dots are visible than the count; those figures are not shown on the page.
const countLine = computed(() =>
  formatDotCount(props.strings, {
    shown: points.value.length,
    total: props.rows.length,
    missing: props.rows.length - points.value.length,
  })
)

// Data (0..100) -> SVG coordinates. y is inverted so 0% sits at the bottom.
function sx(value) {
  return PAD + (value / 100) * PLOT
}
function sy(value) {
  return PAD + PLOT - (value / 100) * PLOT
}

// Radius grows with sqrt of the comment count, clamped to a readable range.
function radius(n) {
  return Math.max(3, Math.min(12, 3 + Math.sqrt(n) * 1.6))
}
</script>

<style scoped>
.scatter {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.scatter__svg {
  width: 100%;
  height: auto;
  max-width: 480px;
  margin: 0 auto;
}
.scatter__frame {
  fill: var(--color-surface-subtle);
  stroke: var(--color-border-strong);
  stroke-width: 1;
}
.scatter__grid {
  stroke: var(--color-border);
  stroke-width: 1;
}
.scatter__agreement {
  stroke: var(--color-hh-navy-mid);
  stroke-width: 1.5;
  stroke-dasharray: 4 4;
}
.scatter__point {
  fill: var(--color-accent);
  fill-opacity: 0.55;
  stroke: var(--color-accent-dark);
  stroke-width: 1;
  cursor: pointer;
  transition: fill-opacity var(--transition-fast);
}
.scatter__point:hover,
.scatter__point:focus {
  fill-opacity: 0.85;
  outline: none;
}
.scatter__tick {
  fill: var(--color-text-secondary);
  font-size: 10px;
}
.scatter__axis {
  fill: var(--color-text-secondary);
  font-size: 11px;
  font-weight: var(--font-weight-medium);
}
.scatter__hint {
  margin: 0;
}
.scatter__count {
  margin: 0;
}
</style>
