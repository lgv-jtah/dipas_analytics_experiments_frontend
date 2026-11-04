<!--
  VoteStanceBars: two stacked horizontal bars for one contribution - the vote
  split (thumbs up/down) and the comment-stance split (favor/against/neutral/
  mixed). Bars always show absolute counts, not only percentages. Plain inline
  CSS, design tokens only, no dependencies.
-->
<template>
  <div class="vsb">
    <!-- Votes bar -->
    <div class="vsb__block">
      <div class="vsb__row">
        <HhText tag="span" variant="label">{{ strings.votesBarTitle }}</HhText>
        <HhText tag="span" variant="caption" color="secondary">
          {{ formatShare(votes.thumbs_up_share) }} {{ strings.votesPro.toLowerCase() }}
        </HhText>
      </div>
      <div v-if="votesTotal > 0" class="vsb__bar" role="img"
           :aria-label="`${strings.votesPro} ${votes.votes_pro}, ${strings.votesContra} ${votes.votes_contra}`">
        <div
          class="vsb__seg vsb__seg--pro"
          :style="{ width: pct(votes.votes_pro, votesTotal) }"
          :title="`${strings.votesPro}: ${votes.votes_pro}`"
        >
          <span v-if="segWide(votes.votes_pro, votesTotal)" class="vsb__seg-label">{{ votes.votes_pro }}</span>
        </div>
        <div
          class="vsb__seg vsb__seg--contra"
          :style="{ width: pct(votes.votes_contra, votesTotal) }"
          :title="`${strings.votesContra}: ${votes.votes_contra}`"
        >
          <span v-if="segWide(votes.votes_contra, votesTotal)" class="vsb__seg-label">{{ votes.votes_contra }}</span>
        </div>
      </div>
      <HhText v-else tag="p" variant="caption" color="secondary" class="vsb__empty">
        {{ strings.noVotes }}
      </HhText>
      <div v-if="votesTotal > 0" class="vsb__legend">
        <span class="vsb__key vsb__key--pro">{{ strings.votesPro }} ({{ votes.votes_pro }})</span>
        <span class="vsb__key vsb__key--contra">{{ strings.votesContra }} ({{ votes.votes_contra }})</span>
      </div>
    </div>

    <!-- Comment stances bar -->
    <div class="vsb__block">
      <div class="vsb__row">
        <HhText tag="span" variant="label">{{ strings.commentsBarTitle }}</HhText>
        <HhText tag="span" variant="caption" color="secondary">
          {{ formatShare(comments.comment_favor_share) }} {{ strings.catFavor.toLowerCase() }}
        </HhText>
      </div>
      <div v-if="comments.n_comments > 0" class="vsb__bar">
        <div
          v-for="seg in commentSegments"
          :key="seg.key"
          class="vsb__seg"
          :class="`vsb__seg--${seg.key}`"
          :style="{ width: pct(seg.count, comments.n_comments) }"
          :title="`${seg.label}: ${seg.count}`"
        >
          <span v-if="segWide(seg.count, comments.n_comments)" class="vsb__seg-label">{{ seg.count }}</span>
        </div>
      </div>
      <HhText v-else tag="p" variant="caption" color="secondary" class="vsb__empty">
        {{ strings.noComments }}
      </HhText>
      <div v-if="comments.n_comments > 0" class="vsb__legend">
        <span v-for="seg in commentSegments" :key="seg.key"
              class="vsb__key" :class="`vsb__key--${seg.key}`">
          {{ seg.label }} ({{ seg.count }})
        </span>
      </div>
    </div>

    <HhText v-if="snapshotUtc" tag="p" variant="caption" color="secondary" class="vsb__snapshot">
      {{ strings.snapshotPrefix }}: {{ snapshotUtc }}
    </HhText>
    <HhText tag="p" variant="caption" color="secondary" class="vsb__note">
      {{ strings.descriptiveNote }}
    </HhText>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import HhText from '../atoms/HhText.vue'
import { votesStanceStrings, formatShare } from '../../i18n/votesStance.js'

const props = defineProps({
  votes: { type: Object, required: true },        // { votes_pro, votes_contra, thumbs_up_share }
  comments: { type: Object, required: true },      // { favor, against, neutral, mixed, n_comments, comment_favor_share }
  snapshotUtc: { type: String, default: '' },
  strings: { type: Object, default: () => votesStanceStrings },
})

const votesTotal = computed(
  () => (props.votes.votes_pro ?? 0) + (props.votes.votes_contra ?? 0)
)

const commentSegments = computed(() => [
  { key: 'favor', label: props.strings.catFavor, count: props.comments.favor },
  { key: 'against', label: props.strings.catAgainst, count: props.comments.against },
  { key: 'neutral', label: props.strings.catNeutral, count: props.comments.neutral },
  { key: 'mixed', label: props.strings.catMixed, count: props.comments.mixed },
])

function pct(value, total) {
  if (!total) return '0%'
  return `${(100 * value) / total}%`
}

// Only print a count inside a segment that is wide enough to read it.
function segWide(value, total) {
  return total > 0 && value / total >= 0.12
}
</script>

<style scoped>
.vsb {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.vsb__block {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.vsb__row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.vsb__bar {
  display: flex;
  width: 100%;
  height: 22px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--color-hh-gray-100);
}
.vsb__seg {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  transition: width var(--transition-normal);
}
.vsb__seg-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-hh-white);
}
/* Segment colours (design tokens / semantic palette) */
.vsb__seg--pro,
.vsb__seg--favor { background: #1A7A4A; }
.vsb__seg--contra,
.vsb__seg--against { background: var(--color-accent); }
.vsb__seg--neutral { background: var(--color-hh-gray-300); }
.vsb__seg--mixed { background: var(--color-hh-navy-mid); }

.vsb__legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}
.vsb__key {
  position: relative;
  padding-left: 16px;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}
.vsb__key::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 10px;
  height: 10px;
  border-radius: 2px;
}
.vsb__key--pro::before,
.vsb__key--favor::before { background: #1A7A4A; }
.vsb__key--contra::before,
.vsb__key--against::before { background: var(--color-accent); }
.vsb__key--neutral::before { background: var(--color-hh-gray-300); }
.vsb__key--mixed::before { background: var(--color-hh-navy-mid); }

.vsb__empty { margin: 0; }
.vsb__snapshot { margin: 0; }
.vsb__note {
  margin: 0;
  font-style: italic;
}
</style>
