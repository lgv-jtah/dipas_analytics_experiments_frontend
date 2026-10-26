<!--
  VotesStance page: descriptive per-contribution comparison of the thumbs-up
  share among votes and the favor share among comment stances. Source selector
  (gold / live / model), a scatter and a sortable table. Clicking a scatter
  point or a table row opens that contribution's detail page.
-->
<template>
  <AppShell>
    <PageHeader :title="t.pageTitle" icon="stance" :description="t.pageDescription" />

    <!-- Descriptive-only caveat + snapshot time -->
    <HhCard variant="subtle" class="vs-note">
      <HhText tag="p" variant="caption" color="secondary" class="vs-note__text">
        {{ note || t.descriptiveNote }}
      </HhText>
      <HhText v-if="snapshotUtc" tag="p" variant="caption" color="secondary">
        {{ t.snapshotPrefix }}: {{ snapshotUtc }}
      </HhText>
    </HhCard>

    <!-- Controls -->
    <HhCard class="vs-controls">
      <div class="vs-controls__row">
        <label class="vs-field">
          <span class="vs-field__label">{{ t.sourceLabel }}</span>
          <select v-model="source" class="vs-select">
            <option value="gold">{{ t.sourceGold }}</option>
            <option value="live">{{ t.sourceLive }}</option>
            <option value="model">{{ t.sourceModel }}</option>
          </select>
        </label>

        <label v-if="source === 'model'" class="vs-field">
          <span class="vs-field__label">{{ t.modelLabel }}</span>
          <select v-model="model" class="vs-select">
            <option v-for="m in availableModels" :key="m" :value="m">{{ m }}</option>
          </select>
        </label>

        <label v-if="source === 'live'" class="vs-field">
          <span class="vs-field__label">{{ t.evaluatorLabel }}</span>
          <select v-model="evaluator" class="vs-select">
            <option value="">{{ t.evaluatorAll }}</option>
            <option v-for="e in evaluators" :key="e" :value="e">{{ e }}</option>
          </select>
        </label>
      </div>

      <HhText v-if="source === 'live'" tag="p" variant="caption" color="secondary" class="vs-controls__hint">
        {{ t.liveHint }}
        <template v-if="rows.length">
          · {{ liveContributionsCount }} {{ t.liveContributionsWithData }}
          · {{ livePartiallyVerifiedCount }} {{ t.partiallyVerifiedComments }}
        </template>
      </HhText>
    </HhCard>

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
import {
  getVotesStanceSnapshotInfo,
  getVotesStanceOverview,
} from '../services/api.js'
import { votesStanceStrings, formatShare } from '../i18n/votesStance.js'

const t = votesStanceStrings
const router = useRouter()

const loading = ref(true)
const error = ref(false)
const rows = ref([])

const source = ref('gold')
const model = ref('')
const evaluator = ref('')

const availableModels = ref([])
const evaluators = ref([])
const snapshotUtc = ref('')
const note = ref('')

const columns = [
  { key: 'contribution_id', label: t.table.contribution },
  { key: 'thumbs_up_share', label: t.table.thumbsUpShare },
  { key: 'comment_favor_share', label: t.table.favorShare },
  { key: 'difference', label: t.table.difference },
  { key: 'n_comments', label: t.table.nComments },
  { key: 'counts', label: t.table.counts },
]

// The "Pairs verified" column only applies to the live source.
const activeColumns = computed(() =>
  source.value === 'live'
    ? [...columns, { key: 'live_pairs_verified', label: t.pairsVerified }]
    : columns
)

const sortKey = ref('contribution_id')
const sortDir = ref('asc')

const liveContributionsCount = computed(
  () => rows.value.filter((r) => r.n_comments > 0).length
)

const livePartiallyVerifiedCount = computed(() =>
  rows.value.reduce((sum, r) => sum + (r.live_comments_partially_verified || 0), 0)
)

function fmt(value) {
  return formatShare(value, t)
}

// The signed gap between vote and comment favor shares, in percentage points.
function difference(row) {
  if (
    row.thumbs_up_share === null ||
    row.thumbs_up_share === undefined ||
    row.comment_favor_share === null ||
    row.comment_favor_share === undefined
  ) {
    return null
  }
  return (row.thumbs_up_share - row.comment_favor_share) * 100
}

function fmtDiff(row) {
  const d = difference(row)
  if (d === null) return t.na
  const sign = d > 0 ? '+' : ''
  return `${sign}${d.toFixed(0)} pp`
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
    availableModels.value = info.available_models || []
    evaluators.value = info.evaluators || []
    snapshotUtc.value = info.snapshot_utc || ''
    note.value = info.note || ''
    source.value = info.default_source || 'gold'
    model.value = info.default_model || availableModels.value[0] || ''
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
</style>
