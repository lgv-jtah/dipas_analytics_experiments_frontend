<!--
  VotesStanceSummary: the headline thumbs-vs-comment-stance summary shown at the
  top of the Votes vs. Stance page. The whole page runs on the shared
  contributions only (those with both a thumbs vote and a clearly agreeing or
  disagreeing comment), so this block is the pooled picture over that set:

  * a thumbs bar and a comment-stance bar (from headline.primary),
  * the no-clear-stance line (neutral + mixed out of all comments),
  * the gap with its 90% range, a secondary unweighted gap line, and
  * a verdict-driven equivalence sentence (undecided / equivalent / not).

  Every number comes from the backend (/votes-stance/summary -> headline);
  nothing is hard-coded here. Numbers are formatted per language (German decimal
  comma and the typographic minus sign). Simple two-segment bars are drawn inline
  rather than reusing VoteStanceBars, so the summary is not stamped with the
  per-contribution "descriptive only" caveat. The block degrades gracefully to
  nothing when the backend has no headline (an older export).
-->
<template>
  <HhCard :title="x.summaryTitle" class="vss">
    <div v-if="loading" class="vss__state">
      <HhText variant="caption" color="secondary">{{ x.loading }}</HhText>
    </div>
    <div v-else-if="error" class="vss__state">
      <HhText variant="caption" color="accent">{{ x.error }}</HhText>
    </div>

    <template v-else-if="headline">
      <HhText tag="p" variant="caption" color="secondary" class="vss__intro">
        {{ x.summaryIntro }}
      </HhText>

      <!-- Thumbs bar -->
      <div class="vss__block">
        <div class="vss__row">
          <HhText tag="span" variant="label">{{ x.thumbsBarTitle }}</HhText>
          <HhText tag="span" variant="caption" color="secondary">
            {{ fmtPct(primary.vote_share) }} {{ x.thumbsUp }}
          </HhText>
        </div>
        <div class="vss__bar" role="img"
             :aria-label="`${x.thumbsUp} ${primary.vote_pro}, ${x.thumbsDown} ${primary.vote_contra}`">
          <div class="vss__seg vss__seg--pro" :style="{ width: pct(primary.vote_pro, thumbsTotal) }">
            <span v-if="wide(primary.vote_pro, thumbsTotal)" class="vss__seg-label">{{ primary.vote_pro }}</span>
          </div>
          <div class="vss__seg vss__seg--contra" :style="{ width: pct(primary.vote_contra, thumbsTotal) }">
            <span v-if="wide(primary.vote_contra, thumbsTotal)" class="vss__seg-label">{{ primary.vote_contra }}</span>
          </div>
        </div>
        <div class="vss__legend">
          <span class="vss__key vss__key--pro">{{ x.thumbsUp }} ({{ primary.vote_pro }})</span>
          <span class="vss__key vss__key--contra">{{ x.thumbsDown }} ({{ primary.vote_contra }})</span>
          <span class="vss__total">n = {{ thumbsTotal }}</span>
        </div>
      </div>

      <!-- Comment-stance bar (directional comments only: in favor vs against) -->
      <div class="vss__block">
        <div class="vss__row">
          <HhText tag="span" variant="label">{{ x.commentsBarTitle }}</HhText>
          <HhText tag="span" variant="caption" color="secondary">
            {{ fmtPct(primary.favor_share) }} {{ x.inFavor }}
          </HhText>
        </div>
        <div class="vss__bar" role="img"
             :aria-label="`${x.inFavor} ${primary.favor}, ${x.against} ${primary.against}`">
          <div class="vss__seg vss__seg--favor" :style="{ width: pct(primary.favor, directionalTotal) }">
            <span v-if="wide(primary.favor, directionalTotal)" class="vss__seg-label">{{ primary.favor }}</span>
          </div>
          <div class="vss__seg vss__seg--against" :style="{ width: pct(primary.against, directionalTotal) }">
            <span v-if="wide(primary.against, directionalTotal)" class="vss__seg-label">{{ primary.against }}</span>
          </div>
        </div>
        <div class="vss__legend">
          <span class="vss__key vss__key--favor">{{ x.inFavor }} ({{ primary.favor }})</span>
          <span class="vss__key vss__key--against">{{ x.against }} ({{ primary.against }})</span>
          <span class="vss__total">n = {{ directionalTotal }}</span>
        </div>
      </div>

      <!-- No-clear-stance line -->
      <HhText tag="p" variant="caption" color="secondary" class="vss__line">
        {{ noClearStanceText }}
      </HhText>

      <!-- Gap with its 90% range -->
      <HhText tag="p" variant="body" class="vss__gap">
        {{ x.gapLabel }}: {{ fmtPp(primary.difference_pp) }}
        <span class="vss__range">
          ({{ x.rangeLabel }}: {{ fmtPp(primary.ci90.low) }} … {{ fmtPp(primary.ci90.high) }})
        </span>
      </HhText>

      <!-- Secondary, every-idea-counts-once gap -->
      <HhText tag="p" variant="caption" color="secondary" class="vss__line">
        {{ x.unweightedGapLabel }}: {{ fmtPp(headline.unweighted.difference_pp) }}
        ({{ x.rangeLabel }}: {{ fmtPp(headline.unweighted.ci90.low) }} … {{ fmtPp(headline.unweighted.ci90.high) }})
      </HhText>

      <!-- Verdict-driven equivalence sentence -->
      <HhText tag="p" variant="caption" color="secondary" class="vss__line">
        {{ equivalenceText }}
      </HhText>
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
// The shared-contributions headline block from the backend (null for an older
// export that predates it; the whole block then degrades away).
const headline = ref(null)

// Convenience ref: the headline's primary (pooled) figures.
const primary = computed(() => headline.value?.primary ?? null)

const thumbsTotal = computed(() =>
  primary.value ? primary.value.vote_pro + primary.value.vote_contra : 0
)
// The comment bar shows only the directional comments (favor + against), so its
// two segment widths stay consistent with the favor_share percentage shown.
const directionalTotal = computed(() =>
  primary.value ? primary.value.favor + primary.value.against : 0
)

const noClearStanceText = computed(() => {
  if (!headline.value) return ''
  const n = headline.value.no_clear_stance
  return interpolate(x.value.noClearStance, {
    count: n.total,
    total: headline.value.n_comments,
    neutral: n.neutral,
    mixed: n.mixed,
  })
})

// Pick the equivalence sentence from the backend verdict. An absent or unknown
// verdict falls back to the undecided wording (the most cautious reading).
const equivalenceText = computed(() => {
  const verdict = headline.value?.equivalence?.verdict
  if (verdict === 'equivalent') return x.value.equivalenceEquivalent
  if (verdict === 'not_equivalent') return x.value.equivalenceNotEquivalent
  return x.value.equivalenceUndecided
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
    headline.value = data.headline
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
</style>
