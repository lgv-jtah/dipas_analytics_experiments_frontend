<!--
  ContributionCardsSection: a single-column list of per-contribution cards on the
  Votes vs. Stance page. Each card reuses VoteStanceBars to draw one
  contribution's thumbs bar and comment-stance bar, under a clickable header that
  opens the contribution's detail page.

  By default only the "shared" contributions are shown (those with at least one
  thumbs vote AND at least one clear comment); a checkbox reveals all of them.
  The list is sortable by the comments-minus-thumbs gap, by the number of thumbs,
  or by contribution id. All chrome strings come from votesStanceExtra.js; the
  bar strings come from votesStance.js, cloned with an empty descriptiveNote so
  each card is not stamped with the per-contribution "descriptive only" footer
  (that caveat already lives once at the top of the page).
-->
<template>
  <HhCard :title="x.cardsTitle" class="cc">
    <div class="cc__head">
      <span class="cc__badge">{{ x.notPreRegistered }}</span>
    </div>
    <HhText tag="p" variant="caption" color="secondary" class="cc__intro">
      {{ x.cardsIntro }}
    </HhText>

    <!-- Controls: sort selector + show-all toggle -->
    <div class="cc__controls">
      <label class="cc__field">
        <span class="cc__field-label">{{ x.sortLabel }}</span>
        <select v-model="sortKey" class="cc__select">
          <option value="gap">{{ x.sortGap }}</option>
          <option value="thumbs">{{ x.sortThumbs }}</option>
          <option value="id">{{ x.sortId }}</option>
        </select>
      </label>
      <label class="cc__check">
        <input type="checkbox" v-model="showAll" />
        <span>{{ x.showAllLabel }}</span>
      </label>
    </div>

    <HhText tag="p" variant="caption" color="secondary" class="cc__showing">
      {{ showingText }}
    </HhText>

    <!-- Empty state -->
    <HhText
      v-if="visibleRows.length === 0"
      tag="p"
      variant="body"
      color="secondary"
      class="cc__empty"
    >
      {{ x.cardsEmpty }}
    </HhText>

    <!-- Cards -->
    <ul v-else class="cc__list">
      <li v-for="row in visibleRows" :key="row.contribution_id" class="cc__card">
        <div
          class="cc__card-head"
          role="button"
          tabindex="0"
          :aria-label="openLabel(row.contribution_id)"
          @click="onActivate(row.contribution_id)"
          @keydown.enter.prevent="onActivate(row.contribution_id)"
          @keydown.space.prevent="onActivate(row.contribution_id)"
        >
          <span class="cc__card-id">#{{ row.contribution_id }}</span>
          <span v-if="titleFor(row)" class="cc__card-title" :title="titleFor(row)">
            {{ titleFor(row) }}
          </span>
        </div>
        <VoteStanceBars
          :votes="{
            votes_pro: row.votes_pro,
            votes_contra: row.votes_contra,
            thumbs_up_share: row.thumbs_up_share,
          }"
          :comments="{
            favor: row.counts.favor,
            against: row.counts.against,
            neutral: row.counts.neutral,
            mixed: row.counts.mixed,
            n_comments: row.n_comments,
            comment_favor_share: row.comment_favor_share,
          }"
          :strings="barStrings"
        />
      </li>
    </ul>
  </HhCard>
</template>

<script setup>
import { ref, computed } from 'vue'
import HhCard from './HhCard.vue'
import HhText from '../atoms/HhText.vue'
import VoteStanceBars from './VoteStanceBars.vue'
import { useVotesStanceStrings } from '../../composables/useVotesStanceLang.js'
import {
  getVotesStanceExtraStrings,
  interpolate,
} from '../../i18n/votesStanceExtra.js'

const props = defineProps({
  // Full set of overview rows (all 115 gold contributions). Not filtered here by
  // any page-level control; filtering to the shared set happens in this component.
  rows: { type: Array, required: true },
  // Map of String(contribution_id) -> short title. Missing ids render id-only.
  titles: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['select'])

// `t` is the base (votesStance.js) string set VoteStanceBars expects; `x` is the
// extra (votesStanceExtra.js) chrome string set for this section. Both follow the
// shared feature language.
const { lang, strings: t } = useVotesStanceStrings()
const x = computed(() => getVotesStanceExtraStrings(lang.value))

// Clone the bar strings with an empty descriptiveNote so each card does not repeat
// the per-contribution "descriptive only" footer (VoteStanceBars always renders
// that line; an empty value plus the :deep rule below leaves nothing visible).
const barStrings = computed(() => ({ ...t.value, descriptiveNote: '' }))

const sortKey = ref('gap')
const showAll = ref(false)

/**
 * Whether a row belongs to the "shared" set shown by default. A contribution is
 * shared when it has at least one thumbs vote AND at least one clear
 * (favor/against) comment — the only rows for which both bars are meaningful.
 * This is the single source of truth for that filter; the "show all" checkbox
 * simply bypasses it.
 *
 * @param {object} row - One overview row.
 * @returns {boolean} True when the row has both a thumbs vote and a clear comment.
 */
function isShared(row) {
  return (
    row.votes_pro + row.votes_contra > 0 &&
    row.counts.favor + row.counts.against > 0
  )
}

/**
 * The comments-minus-thumbs gap for a row, as a 0..1 fraction. Returning null for
 * rows with a missing share lets the sort push them to the end (see visibleRows).
 *
 * @param {object} row - One overview row.
 * @returns {number|null} comment_favor_share - thumbs_up_share, or null when
 *   either share is null/undefined.
 */
function gap(row) {
  if (
    row.thumbs_up_share === null ||
    row.thumbs_up_share === undefined ||
    row.comment_favor_share === null ||
    row.comment_favor_share === undefined
  ) {
    return null
  }
  return row.comment_favor_share - row.thumbs_up_share
}

/**
 * Total number of thumbs votes (up plus down) on a row, used by the thumbs sort.
 *
 * @param {object} row - One overview row.
 * @returns {number} votes_pro + votes_contra.
 */
function thumbsTotal(row) {
  return row.votes_pro + row.votes_contra
}

/**
 * The short title for a row's contribution, looked up by String(id) in the titles
 * map. Returns '' when no title was loaded, in which case the header shows the id
 * alone (the v-if in the template hides the empty title span).
 *
 * @param {object} row - One overview row.
 * @returns {string} The truncated title, or '' if unknown.
 */
function titleFor(row) {
  return props.titles[String(row.contribution_id)] || ''
}

/**
 * Build the localized accessible label for a card header (e.g. "Open idea #42").
 *
 * @param {number|string} id - The contribution id.
 * @returns {string} The interpolated aria-label.
 */
function openLabel(id) {
  return interpolate(x.value.openContribution, { id })
}

// The rows actually rendered: the shared set (or all rows when "show all" is on),
// copied before sorting so the parent's `rows` prop is never mutated in place.
const visibleRows = computed(() => {
  const filtered = showAll.value ? props.rows : props.rows.filter(isShared)
  const copy = [...filtered]
  if (sortKey.value === 'gap') {
    // Ascending gap (most negative first), nulls always last.
    copy.sort((a, b) => {
      const ga = gap(a)
      const gb = gap(b)
      if (ga === null) return 1
      if (gb === null) return -1
      return ga - gb
    })
  } else if (sortKey.value === 'thumbs') {
    // Most thumbs first; ties broken by ascending id for a stable order.
    copy.sort((a, b) => {
      const d = thumbsTotal(b) - thumbsTotal(a)
      return d !== 0 ? d : a.contribution_id - b.contribution_id
    })
  } else {
    // Ascending contribution id.
    copy.sort((a, b) => a.contribution_id - b.contribution_id)
  }
  return copy
})

const showingText = computed(() =>
  interpolate(x.value.cardsShowing, {
    shown: visibleRows.value.length,
    total: props.rows.length,
  })
)

/**
 * Emit `select` with the contribution id so the parent page navigates to that
 * contribution's detail page. Fired by click, Enter and Space on a card header.
 *
 * @param {number|string} id - The activated contribution's id.
 */
function onActivate(id) {
  emit('select', id)
}
</script>

<style scoped>
.cc {
  margin-bottom: var(--space-6);
}
.cc__head {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-2);
}
/* Mirrors the .vss__badge style from VotesStanceSummary.vue. */
.cc__badge {
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
.cc__intro {
  margin: 0 0 var(--space-4);
}
.cc__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: var(--space-4);
  margin-bottom: var(--space-3);
}
.cc__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 220px;
}
.cc__field-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.cc__select {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}
.cc__check {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}
.cc__showing {
  margin: 0 0 var(--space-4);
}
.cc__empty {
  margin: var(--space-4) 0 0;
}
.cc__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  max-width: 720px;
}
.cc__card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  background: var(--color-surface);
}
.cc__card-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: color var(--transition-fast);
}
.cc__card-head:hover {
  color: var(--color-accent);
}
.cc__card-head:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
.cc__card-id {
  font-weight: var(--font-weight-semibold);
  color: var(--color-accent);
}
.cc__card-title {
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}
/* VoteStanceBars always renders a descriptive-note line; with the empty string we
   pass it, hide the (now empty) element so no stray gap remains on each card. */
.cc__card :deep(.vsb__note) {
  display: none;
}
</style>
