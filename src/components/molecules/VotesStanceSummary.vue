<!--
  VotesStanceSummary: the overall thumbs-vs-comment-stance summary shown at the
  top of the Votes vs. Stance page. It has two parts:

  * the PRE-REGISTERED headline (a thumbs bar and a comment-stance bar, the
    no-clear-stance line, and the gap with its 90% range), and
  * a visibly separated, NOT pre-registered shared-contributions block.

  Every number comes from the backend (/votes-stance/summary); nothing is
  hard-coded here. Numbers are formatted per language (German decimal comma and
  the typographic minus sign). Simple two-segment bars are drawn inline rather
  than reusing VoteStanceBars, so the summary is not stamped with the
  per-contribution "descriptive only" caveat, which does not apply to these
  pre-registered figures.
-->
<template>
  <HhCard :title="x.summaryTitle" class="vss">
    <div v-if="loading" class="vss__state">
      <HhText variant="caption" color="secondary">{{ x.loading }}</HhText>
    </div>
    <div v-else-if="error" class="vss__state">
      <HhText variant="caption" color="accent">{{ x.error }}</HhText>
    </div>

    <template v-else-if="overall">
      <HhText tag="p" variant="caption" color="secondary" class="vss__intro">
        {{ x.summaryIntro }}
      </HhText>

      <!-- Thumbs bar -->
      <div class="vss__block">
        <div class="vss__row">
          <HhText tag="span" variant="label">{{ x.thumbsBarTitle }}</HhText>
          <HhText tag="span" variant="caption" color="secondary">
            {{ fmtPct(overall.primary.vote_share) }} {{ x.thumbsUp }}
          </HhText>
        </div>
        <div class="vss__bar" role="img"
             :aria-label="`${x.thumbsUp} ${overall.primary.vote_pro}, ${x.thumbsDown} ${overall.primary.vote_contra}`">
          <div class="vss__seg vss__seg--pro" :style="{ width: pct(overall.primary.vote_pro, thumbsTotal) }">
            <span v-if="wide(overall.primary.vote_pro, thumbsTotal)" class="vss__seg-label">{{ overall.primary.vote_pro }}</span>
          </div>
          <div class="vss__seg vss__seg--contra" :style="{ width: pct(overall.primary.vote_contra, thumbsTotal) }">
            <span v-if="wide(overall.primary.vote_contra, thumbsTotal)" class="vss__seg-label">{{ overall.primary.vote_contra }}</span>
          </div>
        </div>
        <div class="vss__legend">
          <span class="vss__key vss__key--pro">{{ x.thumbsUp }} ({{ overall.primary.vote_pro }})</span>
          <span class="vss__key vss__key--contra">{{ x.thumbsDown }} ({{ overall.primary.vote_contra }})</span>
          <span class="vss__total">n = {{ thumbsTotal }}</span>
        </div>
      </div>

      <!-- Comment-stance bar (directional comments only: in favor vs against) -->
      <div class="vss__block">
        <div class="vss__row">
          <HhText tag="span" variant="label">{{ x.commentsBarTitle }}</HhText>
          <HhText tag="span" variant="caption" color="secondary">
            {{ fmtPct(overall.primary.favor_share) }} {{ x.inFavor }}
          </HhText>
        </div>
        <div class="vss__bar" role="img"
             :aria-label="`${x.inFavor} ${overall.primary.favor}, ${x.against} ${overall.primary.against}`">
          <div class="vss__seg vss__seg--favor" :style="{ width: pct(overall.primary.favor, directionalTotal) }">
            <span v-if="wide(overall.primary.favor, directionalTotal)" class="vss__seg-label">{{ overall.primary.favor }}</span>
          </div>
          <div class="vss__seg vss__seg--against" :style="{ width: pct(overall.primary.against, directionalTotal) }">
            <span v-if="wide(overall.primary.against, directionalTotal)" class="vss__seg-label">{{ overall.primary.against }}</span>
          </div>
        </div>
        <div class="vss__legend">
          <span class="vss__key vss__key--favor">{{ x.inFavor }} ({{ overall.primary.favor }})</span>
          <span class="vss__key vss__key--against">{{ x.against }} ({{ overall.primary.against }})</span>
          <span class="vss__total">n = {{ directionalTotal }}</span>
        </div>
      </div>

      <!-- No-clear-stance line -->
      <HhText tag="p" variant="caption" color="secondary" class="vss__line">
        {{ noClearStanceText }}
      </HhText>

      <!-- Gap with its 90% range -->
      <HhText tag="p" variant="body" class="vss__gap">
        {{ x.gapLabel }}: {{ fmtPp(overall.primary.difference_pp) }}
        <span class="vss__range">
          ({{ x.rangeLabel }}: {{ fmtPp(overall.primary.ci90.low) }} … {{ fmtPp(overall.primary.ci90.high) }})
        </span>
      </HhText>
      <HhText tag="p" variant="caption" color="secondary" class="vss__line">
        {{ x.equivalenceNote }}
      </HhText>

      <!-- Visibly separate, NOT pre-registered shared-contributions block -->
      <div v-if="shared" class="vss__shared">
        <div class="vss__shared-head">
          <HhText tag="span" variant="label">{{ x.sharedTitle }}</HhText>
          <span class="vss__badge">{{ x.notPreRegistered }}</span>
        </div>
        <HhText tag="p" variant="caption" color="secondary" class="vss__line">
          {{ x.sharedIntro }}
        </HhText>
        <HhText tag="p" variant="caption" color="secondary" class="vss__line">
          {{ sharedCountsText }}
        </HhText>
        <ul class="vss__shared-list">
          <li>
            <strong>{{ x.pooledLabel }}:</strong>
            {{ fmtPp(shared.pooled.difference_pp) }}
            ({{ x.rangeLabel }}: {{ fmtPp(shared.pooled.ci90.low) }} … {{ fmtPp(shared.pooled.ci90.high) }})
          </li>
          <li>
            <strong>{{ x.unweightedLabel }}:</strong>
            {{ fmtPp(shared.unweighted.difference_pp) }}
            ({{ x.rangeLabel }}: {{ fmtPp(shared.unweighted.ci90.low) }} … {{ fmtPp(shared.unweighted.ci90.high) }})
          </li>
        </ul>
      </div>
    </template>
  </HhCard>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import HhCard from './HhCard.vue'
import HhText from '../atoms/HhText.vue'
import { getVotesStanceSummary } from '../../services/api.js'
import { useVotesStanceStrings } from '../../composables/useVotesStanceLang.js'
import {
  getVotesStanceExtraStrings,
  interpolate,
  formatPercent,
  formatSignedPp,
} from '../../i18n/votesStanceExtra.js'

// Share the feature-wide language ref so this block flips with the page.
const { lang } = useVotesStanceStrings()
const x = computed(() => getVotesStanceExtraStrings(lang.value))

const loading = ref(true)
const error = ref(false)
const overall = ref(null)
const shared = ref(null)

const thumbsTotal = computed(() =>
  overall.value ? overall.value.primary.vote_pro + overall.value.primary.vote_contra : 0
)
// The comment bar shows only the directional comments (favor + against), so its
// two segment widths stay consistent with the favor_share percentage shown.
const directionalTotal = computed(() =>
  overall.value ? overall.value.primary.favor + overall.value.primary.against : 0
)

const noClearStanceText = computed(() => {
  if (!overall.value) return ''
  const n = overall.value.no_clear_stance
  return interpolate(x.value.noClearStance, {
    count: n.total,
    total: overall.value.n_comments,
    neutral: n.neutral,
    mixed: n.mixed,
  })
})

const sharedCountsText = computed(() => {
  if (!shared.value) return ''
  return interpolate(x.value.sharedCounts, {
    thumbs: shared.value.thumbs_side_contributions,
    comment: shared.value.comment_side_contributions,
    both: shared.value.both_sides_contributions,
  })
})

function fmtPct(value) {
  return formatPercent(value, lang.value, { digits: 1 })
}
function fmtPp(value) {
  return formatSignedPp(value, lang.value, { digits: 1 })
}
function pct(value, total) {
  if (!total) return '0%'
  return `${(100 * value) / total}%`
}
function wide(value, total) {
  return total > 0 && value / total >= 0.12
}

onMounted(async () => {
  try {
    const data = await getVotesStanceSummary()
    overall.value = data.overall
    shared.value = data.shared
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.vss { margin-bottom: var(--space-6); }
.vss__state { padding: var(--space-4) 0; }
.vss__intro { margin: 0 0 var(--space-4); }
.vss__block {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}
.vss__row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.vss__bar {
  display: flex;
  width: 100%;
  height: 22px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--color-hh-gray-100);
}
.vss__seg {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  transition: width var(--transition-normal);
}
.vss__seg-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-hh-white);
}
.vss__seg--pro,
.vss__seg--favor { background: #1A7A4A; }
.vss__seg--contra,
.vss__seg--against { background: var(--color-accent); }
.vss__legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  align-items: center;
}
.vss__key {
  position: relative;
  padding-left: 16px;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}
.vss__key::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 10px;
  height: 10px;
  border-radius: 2px;
}
.vss__key--pro::before,
.vss__key--favor::before { background: #1A7A4A; }
.vss__key--contra::before,
.vss__key--against::before { background: var(--color-accent); }
.vss__total {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}
.vss__line { margin: 0 0 var(--space-2); }
.vss__gap { margin: var(--space-2) 0; font-weight: var(--font-weight-semibold); }
.vss__range { font-weight: normal; color: var(--color-text-secondary); }
.vss__shared {
  margin-top: var(--space-5);
  padding: var(--space-4);
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius-md);
  background: var(--color-hh-gray-50);
}
.vss__shared-head {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-2);
}
.vss__badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  background: var(--color-hh-navy-mid);
  color: var(--color-hh-white);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.vss__shared-list {
  margin: var(--space-2) 0 0;
  padding-left: var(--space-5);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}
.vss__shared-list li { margin-bottom: var(--space-1); }
</style>
