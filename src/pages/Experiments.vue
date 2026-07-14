<template>
  <AppShell>
    <PageHeader
      title="Experiments"
      description="Design, run and compare NLP experiments across all DIPAS analytics modules. Track metrics and reproduce results."
      icon="experiments"
      badge="New"
      badge-variant="red"
    >
      <template #actions>
        <HhButton variant="ghost" size="sm">Import Config</HhButton>
        <HhButton variant="primary" size="sm">New Experiment</HhButton>
      </template>
    </PageHeader>

    <div class="exp-layout">
      <!-- Summary cards -->
      <div class="exp-summary">
        <HhCard v-for="s in summary" :key="s.label" class="summary-card">
          <div class="summary-card__inner">
            <HhText variant="caption" color="secondary">{{ s.label }}</HhText>
            <HhText variant="subheading">{{ s.value }}</HhText>
          </div>
        </HhCard>
      </div>

      <!-- Experiment table -->
      <HhCard title="All Experiments" variant="accent">
        <div class="exp-table-wrap">
          <table class="exp-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Module</th>
                <th>Model</th>
                <th>F1 Score</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="exp in experiments" :key="exp.id" class="exp-row">
                <td>
                  <HhText variant="label">{{ exp.name }}</HhText>
                </td>
                <td>
                  <HhBadge variant="navy">{{ exp.module }}</HhBadge>
                </td>
                <td>
                  <HhText variant="caption" color="secondary">{{ exp.model }}</HhText>
                </td>
                <td>
                  <span class="f1-score" :style="{ color: f1Color(exp.f1) }">{{ exp.f1 }}</span>
                </td>
                <td>
                  <HhBadge :variant="statusVariant(exp.status)">{{ exp.status }}</HhBadge>
                </td>
                <td>
                  <HhText variant="caption" color="secondary">{{ exp.date }}</HhText>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </HhCard>

      <!-- Compare panel -->
      <HhCard title="Quick Compare" variant="subtle">
        <div class="compare-placeholder">
          <HhIcon name="experiments" size="xl" class="placeholder-icon" />
          <HhText variant="body" color="secondary">Select two or more experiments to compare metrics side by side.</HhText>
        </div>
      </HhCard>
    </div>
  </AppShell>
</template>

<script setup>
import AppShell from '../components/templates/AppShell.vue'
import PageHeader from '../components/molecules/PageHeader.vue'
import HhCard from '../components/molecules/HhCard.vue'
import HhButton from '../components/atoms/HhButton.vue'
import HhBadge from '../components/atoms/HhBadge.vue'
import HhText from '../components/atoms/HhText.vue'
import HhIcon from '../components/atoms/HhIcon.vue'

const summary = [
  { label: 'Total Experiments', value: '24' },
  { label: 'Running',           value: '2' },
  { label: 'Best F1',           value: '0.913' },
  { label: 'Models Used',       value: '7' },
]

const experiments = [
  { id: 1,  name: 'KME-BERT-v3',        module: 'Key Msgs', model: 'bert-base-german-cased',    f1: '0.913', status: 'Complete',  date: '23 Jun 2026' },
  { id: 2,  name: 'Stance-RoBERTa-v2',  module: 'Stance',   model: 'xlm-roberta-large',         f1: '0.887', status: 'Complete',  date: '22 Jun 2026' },
  { id: 3,  name: 'TitleGen-GPT-de-v1', module: 'Titles',   model: 'gpt-4o-mini',               f1: '0.851', status: 'Running',   date: '24 Jun 2026' },
  { id: 4,  name: 'KME-TF-IDF-baseline',module: 'Key Msgs', model: 'TF-IDF + cosine',           f1: '0.742', status: 'Complete',  date: '19 Jun 2026' },
  { id: 5,  name: 'Stance-GPT-v1',      module: 'Stance',   model: 'gpt-4o',                    f1: '—',     status: 'Running',   date: '24 Jun 2026' },
  { id: 6,  name: 'TitleGen-T5-v2',     module: 'Titles',   model: 'google/mt5-base',            f1: '0.796', status: 'Complete',  date: '17 Jun 2026' },
  { id: 7,  name: 'Stance-BERT-v1',     module: 'Stance',   model: 'deepset/gbert-base',        f1: '0.803', status: 'Complete',  date: '15 Jun 2026' },
  { id: 8,  name: 'KME-Hybrid-v1',      module: 'Key Msgs', model: 'BERT + TF-IDF ensemble',   f1: '0.871', status: 'Complete',  date: '13 Jun 2026' },
]

function statusVariant(s) {
  if (s === 'Complete') return 'success'
  if (s === 'Running')  return 'warning'
  return 'default'
}

function f1Color(f1) {
  if (f1 === '—') return 'var(--color-text-secondary)'
  const v = parseFloat(f1)
  if (v >= 0.9)  return '#1A7A4A'
  if (v >= 0.85) return '#4A7A1A'
  if (v >= 0.75) return '#9A6800'
  return 'var(--color-accent)'
}
</script>

<style scoped>
.exp-layout { display: flex; flex-direction: column; gap: var(--space-6); }
.exp-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: var(--space-4);
}
.summary-card__inner { display: flex; flex-direction: column; gap: var(--space-1); }

.exp-table-wrap { overflow-x: auto; }
.exp-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}
.exp-table th {
  text-align: left;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
  padding: var(--space-2) var(--space-3);
  border-bottom: 2px solid var(--color-border);
  white-space: nowrap;
}
.exp-row td {
  padding: var(--space-3) var(--space-3);
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle;
}
.exp-row:last-child td { border-bottom: none; }
.exp-row:hover td { background: var(--color-hh-gray-50); }

.f1-score {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  font-variant-numeric: tabular-nums;
}

.compare-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-8);
  text-align: center;
}
.placeholder-icon { color: var(--color-hh-gray-300); }
</style>
