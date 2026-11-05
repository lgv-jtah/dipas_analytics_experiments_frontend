<!--
  VotesStance page: descriptive per-contribution comparison of the thumbs-up
  share among votes and the favor share among comment stances. Source selector
  (gold / live / model), a scatter and a sortable table. Clicking a scatter
  point or a table row opens that contribution's detail page. The page also
  carries plain-language explanations for a general audience (intro, source
  help, scatter hint, and a collapsible column legend); their wording lives in
  src/i18n/votesStance.js.
-->
<template>
  <AppShell>
    <PageHeader :title="t.pageTitle" icon="stance" :description="t.pageDescription" />

    <!-- DE/EN language switch, shared with the contribution-page panel -->
    <div class="vs-langbar">
      <LanguageToggle />
    </div>

    <!-- Plain-language introduction -->
    <HhCard variant="subtle" class="vs-intro">
      <HhText tag="p" variant="body">{{ t.pageIntro }}</HhText>
    </HhCard>

    <!-- Descriptive-only caveat + snapshot time -->
    <HhCard variant="subtle" class="vs-note">
      <HhText tag="p" variant="caption" color="secondary" class="vs-note__text">
        {{ displayNote }}
      </HhText>
      <HhText tag="p" variant="caption" color="secondary">
        {{ t.descriptiveNotePlain }}
      </HhText>
      <HhText v-if="snapshotUtc" tag="p" variant="caption" color="secondary">
        {{ t.snapshotPrefix }}: {{ snapshotUtc }}
      </HhText>
    </HhCard>

    <!-- Overall summary (gold only): pre-registered headline + shared block -->
    <VotesStanceSummary />

    <!-- Most agreed-with / most rejected gold key messages -->
    <KeyMessageOverview />

    <!-- States -->
    <div v-if="loading" class="vs-state">
      <HhText variant="body" color="secondary">{{ t.loading }}</HhText>
    </div>
    <div v-else-if="error" class="vs-state vs-state--error">
      <HhText variant="body" color="accent">{{ t.error }}</HhText>
    </div>

    <template v-else>
      <!-- Scatter -->
      <HhCard :title="t.scatterTitle" class="vs-scatter">
        <StanceScatter :rows="rows" :strings="t" @select="goToContribution" />
      </HhCard>

      <!-- Table -->
      <HhCard class="vs-table-card">
        <div class="vs-table-wrap">
          <table class="vs-table">
            <thead>
              <tr>
                <th
                  v-for="col in activeColumns"
                  :key="col.key"
                  :class="{ 'vs-th--active': sortKey === col.key }"
                  @click="setSort(col.key)"
                >
                  {{ col.label }}
                  <span v-if="sortKey === col.key" class="vs-th__arrow">
                    {{ sortDir === 'asc' ? '▲' : '▼' }}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in sortedRows"
                :key="row.contribution_id"
                class="vs-tr"
                @click="goToContribution(row.contribution_id)"
              >
                <td>#{{ row.contribution_id }}</td>
                <td>{{ fmt(row.thumbs_up_share) }}</td>
                <td>{{ fmt(row.comment_favor_share) }}</td>
                <td>{{ fmtDiff(row) }}</td>
                <td>{{ row.n_comments }}</td>
                <td class="vs-counts">
                  {{ row.counts.favor }} / {{ row.counts.against }} /
                  {{ row.counts.neutral }} / {{ row.counts.mixed }}
                </td>
                <td v-if="source === 'live'" class="vs-counts">
                  {{ row.live_pairs_verified }} / {{ row.live_pairs_total }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Collapsible, plain-language legend explaining each table column -->
        <details class="vs-help">
          <summary class="vs-help__summary">{{ t.tableHelp.title }}</summary>
          <HhText tag="p" variant="caption" color="secondary">{{ t.tableHelp.contribution }}</HhText>
          <HhText tag="p" variant="caption" color="secondary">{{ t.tableHelp.thumbsUpShare }}</HhText>
          <HhText tag="p" variant="caption" color="secondary">{{ t.tableHelp.favorShare }}</HhText>
          <HhText tag="p" variant="caption" color="secondary">{{ t.tableHelp.difference }}</HhText>
          <HhText tag="p" variant="caption" color="secondary">{{ t.tableHelp.nComments }}</HhText>
          <HhText tag="p" variant="caption" color="secondary">{{ t.tableHelp.counts }}</HhText>
          <HhText tag="p" variant="caption" color="secondary">{{ t.tableHelp.na }}</HhText>
        </details>
      </HhCard>
    </template>
  </AppShell>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '../components/templates/AppShell.vue'
import PageHeader from '../components/molecules/PageHeader.vue'
import HhCard from '../components/molecules/HhCard.vue'
import HhText from '../components/atoms/HhText.vue'
import StanceScatter from '../components/molecules/StanceScatter.vue'
import LanguageToggle from '../components/molecules/LanguageToggle.vue'
import VotesStanceSummary from '../components/molecules/VotesStanceSummary.vue'
import KeyMessageOverview from '../components/molecules/KeyMessageOverview.vue'
import {
  getVotesStanceSnapshotInfo,
  getVotesStanceOverview,
} from '../services/api.js'
import { formatShare } from '../i18n/votesStance.js'
import { useVotesStanceStrings } from '../composables/useVotesStanceLang.js'

// `t` is a computed ref of the active-language strings: use t.value in <script>,
// while templates auto-unwrap it. `lang` drives the English-only backend note below.
const { lang, strings: t } = useVotesStanceStrings()
const router = useRouter()

const loading = ref(true)
const error = ref(false)
const rows = ref([])

// Hand labels only: source is pinned to 'gold' and never changes (the selectors
// were removed). model and evaluator stay inert placeholders so the live/model
// request paths below keep compiling without being reachable from the UI.
const source = ref('gold')
const model = ref('')
const evaluator = ref('')

const snapshotUtc = ref('')
const note = ref('')

const columns = computed(() => [
  { key: 'contribution_id', label: t.value.table.contribution },
  { key: 'thumbs_up_share', label: t.value.table.thumbsUpShare },
  { key: 'comment_favor_share', label: t.value.table.favorShare },
  { key: 'difference', label: t.value.table.difference },
  { key: 'n_comments', label: t.value.table.nComments },
  { key: 'counts', label: t.value.table.counts },
])

// The "Pairs verified" column only applies to the live source.
const activeColumns = computed(() =>
  source.value === 'live'
    ? [...columns.value, { key: 'live_pairs_verified', label: t.value.pairsVerified }]
    : columns.value
)

const sortKey = ref('contribution_id')
const sortDir = ref('asc')

// The backend-provided note is English, so only show it in English mode; in
// German, always use the translated caveat. English behaviour is unchanged.
const displayNote = computed(() =>
  lang.value === 'en' ? (note.value || t.value.descriptiveNote) : t.value.descriptiveNote
)

function fmt(value) {
  return formatShare(value, t.value)
}

// The signed gap between the comment favor share and the thumbs-up share (favor minus thumbs), in percentage points.
// This direction (favor minus vote) deliberately matches the stakeholder slides and the pre-registered vote-ratio analysis, so don't flip it on its own.
function difference(row) {
  if (
    row.thumbs_up_share === null ||
    row.thumbs_up_share === undefined ||
    row.comment_favor_share === null ||
    row.comment_favor_share === undefined
  ) {
    return null
  }
  return (row.comment_favor_share - row.thumbs_up_share) * 100
}

// Format the difference with the locale's own sign glyphs. toFixed() always emits
// an ASCII hyphen "-", but German shows the minus as U+2212 (via diffMinus), so we
// strip the hyphen and re-prepend the locale minus; positives get the locale plus.
function fmtDiff(row) {
  const d = difference(row)
  if (d === null) return t.value.na
  const s = d.toFixed(0)
  if (s.startsWith('-')) {
    return `${t.value.diffMinus}${s.slice(1)}${t.value.diffSuffix}`
  }
  return `${d > 0 ? t.value.diffPlus : ''}${s}${t.value.diffSuffix}`
}

function sortValue(row, key) {
  if (key === 'difference') return difference(row)
  if (key === 'counts') return row.n_comments
  return row[key]
}

const sortedRows = computed(() => {
  const dir = sortDir.value === 'asc' ? 1 : -1
  return [...rows.value].sort((a, b) => {
    const av = sortValue(a, sortKey.value)
    const bv = sortValue(b, sortKey.value)
    // Nulls always sort last, regardless of direction.
    if (av === null || av === undefined) return 1
    if (bv === null || bv === undefined) return -1
    if (av < bv) return -1 * dir
    if (av > bv) return 1 * dir
    return 0
  })
})

function setSort(key) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
}

function goToContribution(id) {
  router.push(`/evaluation/contributions/${id}`)
}

async function loadOverview() {
  loading.value = true
  error.value = false
  try {
    const params = { source: source.value }
    // Inert while source is pinned to 'gold': these branches only fire for the
    // live/model sources, which the UI no longer offers. Kept so re-enabling the
    // selectors later needs no change here.
    if (source.value === 'model') params.model = model.value
    if (source.value === 'live' && evaluator.value) params.evaluator = evaluator.value
    rows.value = await getVotesStanceOverview(params)
  } catch {
    error.value = true
    rows.value = []
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    const info = await getVotesStanceSnapshotInfo()
    snapshotUtc.value = info.snapshot_utc || ''
    note.value = info.note || ''
    // Hand labels only: the scatter and table always use the gold source, and
    // the source/model/evaluator selectors are intentionally not shown.
    source.value = 'gold'
  } catch {
    error.value = true
  }
  await loadOverview()
})

// Reload whenever a control changes; model only matters for source=model and
// evaluator only for source=live, but reloading on any change is simplest.
watch([source, model, evaluator], loadOverview)
</script>

<style scoped>
.vs-langbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: var(--space-4);
}
.vs-intro {
  margin-bottom: var(--space-4);
}
.vs-note {
  margin-bottom: var(--space-4);
}
.vs-note__text {
  margin: 0 0 var(--space-1);
  font-style: italic;
}
.vs-controls {
  margin-bottom: var(--space-6);
}
.vs-controls__row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
}
.vs-controls__hint {
  margin: var(--space-3) 0 0;
}
.vs-controls__help {
  margin: var(--space-3) 0 0;
}
.vs-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 180px;
}
.vs-field__label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.vs-select {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
}
.vs-scatter {
  margin-bottom: var(--space-6);
}
.vs-state {
  padding: var(--space-8);
  text-align: center;
}
.vs-table-wrap {
  overflow-x: auto;
}
.vs-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}
.vs-table th {
  text-align: left;
  padding: var(--space-3);
  border-bottom: 2px solid var(--color-border);
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-semibold);
}
.vs-table th:hover {
  color: var(--color-text-primary);
}
.vs-th--active {
  color: var(--color-accent) !important;
}
.vs-th__arrow {
  font-size: 0.7em;
}
.vs-table td {
  padding: var(--space-3);
  border-bottom: 1px solid var(--color-border);
}
.vs-tr {
  cursor: pointer;
  transition: background var(--transition-fast);
}
.vs-tr:hover {
  background: var(--color-hh-gray-50);
}
.vs-counts {
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.vs-help {
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
}
.vs-help__summary {
  cursor: pointer;
  user-select: none;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
}
.vs-help__summary:hover {
  color: var(--color-text-primary);
}
.vs-help > :not(summary) {
  margin: var(--space-3) 0 0;
}
</style>
