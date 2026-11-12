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
        <title>#{{ p.contribution_id }} — {{ strings.axisX }}: {{ p.x.toFixed(0) }}{{ strings.pctSuffix }}, {{ strings.axisY }}: {{ p.y.toFixed(0) }}{{ strings.pctSuffix }} ({{ p.n }}){{ stackCountOf(p) >= 2 ? ' ' + stackLabel(stackCountOf(p)) : '' }}</title>
      </circle>

      <!-- Axis labels -->
      <text :x="PAD + PLOT / 2" :y="SIZE - 4" class="scatter__axis" text-anchor="middle">{{ strings.axisX }}</text>
      <text :x="14" :y="PAD + PLOT / 2" class="scatter__axis"
            text-anchor="middle" :transform="`rotate(-90 14 ${PAD + PLOT / 2})`">{{ strings.axisY }}</text>

      <!-- Overlap badges: how many dots share each spot, painted on top. -->
      <g
        v-for="badge in badges"
        :key="`badge-${badge.key}`"
        class="scatter__badge"
        role="img"
        :aria-label="badge.label"
      >
        <rect
          class="scatter__badge-bg"
          :x="badge.bx - badge.bw / 2"
          :y="badge.by - badge.bh / 2"
          :width="badge.bw"
          :height="badge.bh"
          :rx="badge.rx"
          :ry="badge.rx"
        />
        <text class="scatter__badge-num" :x="badge.bx" :y="badge.by">{{ badge.count }}</text>
      </g>
    </svg>

    <HhText v-else tag="p" variant="caption" color="secondary">
      {{ strings.scatterEmpty }}
    </HhText>

    <!-- Its own caption, not folded into the long hint below, because readers skim the hint. -->
    <HhText
      v-if="points.length > 0"
      tag="p"
      variant="caption"
      color="primary"
      class="scatter__warning"
    >
      {{ strings.diagonalWarning }}
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
import {
  votesStanceStrings,
  formatDotCount,
  computeDotStacks,
  stackKey,
  interpolate,
} from '../../i18n/votesStance.js'

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
// formatDotCount always appends the overlap sentence, which points the reader at
// the numbered badges drawn on stacked dots (see `badges`). Many dots share a
// position (in the gold data, 80 dots sit on 29 distinct positions), so fewer
// distinct dots are visible than the count; those aggregate figures are not shown
// on the page.
const countLine = computed(() =>
  formatDotCount(props.strings, {
    shown: points.value.length,
    total: props.rows.length,
    missing: props.rows.length - points.value.length,
  })
)

// One entry per distinct plotted position, with how many dots share it.
const dotGroups = computed(() => computeDotStacks(points.value))
// Only positions where two or more dots overlap get a badge.
const dotStacks = computed(() => dotGroups.value.filter((g) => g.count >= 2))
// Position key -> dot count, so a single point can look up its own stack size.
const stackCounts = computed(() => {
  const map = new Map()
  for (const g of dotGroups.value) map.set(g.key, g.count)
  return map
})

// How many dots sit at the same spot as `p` (including itself).
function stackCountOf(p) {
  return stackCounts.value.get(stackKey(p.x, p.y)) ?? 0
}

// Interpolated "{count} contributions are stacked here." label.
function stackLabel(count) {
  return interpolate(props.strings.dotCount.stack, { count })
}

// Each overlap stack with its resolved badge geometry, count and aria label,
// computed once per render rather than per bound attribute.
const badges = computed(() =>
  dotStacks.value.map((stack) => ({
    key: stack.key,
    count: stack.count,
    label: stackLabel(stack.count),
    ...badgeGeometry(stack),
  }))
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

// Badge placement for one stack: a fixed-size pill centred at (bx, by), sitting
// to the upper right of the widest dot. The pill size is fixed (not scaled to the
// dot) because the dot radius varies with comment count and the dots are
// translucent, so a constant opaque badge stays legible on any stack. The two
// edge guards flip it horizontally/vertically when it would otherwise spill past
// the viewBox, keeping the badge inside the plot.
function badgeGeometry(stack) {
  const cx = sx(stack.x)
  const cy = sy(stack.y)
  const maxR = radius(stack.maxN)
  const bh = 14
  const bw = 8 + 6 * String(stack.count).length
  const rx = bh / 2
  let bx = cx + maxR * 0.7 + bw / 2
  let by = cy - maxR * 0.7 - bh / 2
  if (bx + bw / 2 > SIZE) bx = cx - maxR * 0.7 - bw / 2
  if (by - bh / 2 < 0) by = cy + maxR * 0.7 + bh / 2
  return { bx, by, bw, bh, rx }
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
.scatter__warning {
  margin: 0;
  font-weight: var(--font-weight-semibold);
}
.scatter__count {
  margin: 0;
}
.scatter__badge {
  /* Badges are painted on top of the dots; let clicks fall through to the dot beneath. */
  pointer-events: none;
}
.scatter__badge-bg {
  fill: var(--color-surface);
  stroke: var(--color-border-strong);
  stroke-width: 1.5;
}
.scatter__badge-num {
  fill: var(--color-text-primary);
  font-size: 10px;
  font-weight: var(--font-weight-semibold);
  text-anchor: middle;
  dominant-baseline: central;
}
</style>
