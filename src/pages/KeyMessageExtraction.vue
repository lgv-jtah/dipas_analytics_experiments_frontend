<template>
  <AppShell>
    <PageHeader
      title="Key Message Extraction"
      description="Automatically identify and extract the most important key messages from public participation input data."
      icon="key"
      badge="NLP"
      badge-variant="navy"
    >
      <template #actions>
        <HhButton variant="secondary" size="sm">Upload Data</HhButton>
        <HhButton variant="primary" size="sm">Run Extraction</HhButton>
      </template>
    </PageHeader>

    <div class="page-grid">
      <HhCard title="Model Configuration" variant="accent">
        <div class="config-fields">
          <div class="field-group">
            <label class="field-label">Extraction Method</label>
            <select class="hh-select">
              <option>Abstractive (BERT-based)</option>
              <option>Extractive (TF-IDF)</option>
              <option>Hybrid</option>
            </select>
          </div>
          <div class="field-group">
            <label class="field-label">Max Key Messages</label>
            <input type="number" class="hh-input" value="5" min="1" max="20" />
          </div>
          <div class="field-group">
            <label class="field-label">Confidence Threshold</label>
            <input type="range" class="hh-range" min="0" max="100" value="70" />
            <span class="range-value">70%</span>
          </div>
        </div>
        <template #footer>
          <HhButton variant="primary" size="sm" full>Apply Configuration</HhButton>
        </template>
      </HhCard>

      <HhCard title="Results Preview">
        <div class="results-placeholder">
          <HhIcon name="key" size="xl" class="placeholder-icon" />
          <HhText variant="body" color="secondary">No extraction results yet.</HhText>
          <HhText variant="caption" color="secondary">Configure the model and run extraction to see results here.</HhText>
        </div>
      </HhCard>

      <HhCard title="Recent Runs" variant="subtle" class="span-full">
        <div class="run-list">
          <div v-for="run in recentRuns" :key="run.id" class="run-item">
            <div class="run-item__meta">
              <HhBadge :variant="run.status === 'Complete' ? 'success' : 'warning'">{{ run.status }}</HhBadge>
              <HhText variant="label">{{ run.name }}</HhText>
            </div>
            <HhText variant="caption" color="secondary">{{ run.date }} &middot; {{ run.messages }} messages extracted</HhText>
          </div>
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

const recentRuns = [
  { id: 1, name: 'Bergedorf District Consultation', date: '23 Jun 2026', messages: 42, status: 'Complete' },
  { id: 2, name: 'HafenCity Mobility Survey',       date: '20 Jun 2026', messages: 31, status: 'Complete' },
  { id: 3, name: 'Altona Green Spaces Feedback',    date: '18 Jun 2026', messages: 0,  status: 'Pending' },
]
</script>

<style scoped>
.page-grid {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: var(--space-6);
}
.span-full { grid-column: 1 / -1; }
.config-fields { display: flex; flex-direction: column; gap: var(--space-4); }
.field-group { display: flex; flex-direction: column; gap: var(--space-2); }
.field-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}
.hh-select, .hh-input {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  font-family: var(--font-family);
  font-size: var(--font-size-sm);
  background: var(--color-surface);
  color: var(--color-text-primary);
  outline: none;
  transition: border-color var(--transition-fast);
}
.hh-select:focus, .hh-input:focus {
  border-color: var(--color-accent);
}
.hh-range {
  width: 100%;
  accent-color: var(--color-accent);
}
.range-value {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}
.results-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-12) var(--space-8);
  text-align: center;
}
.placeholder-icon { color: var(--color-hh-gray-300); }
.run-list { display: flex; flex-direction: column; gap: var(--space-4); }
.run-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  gap: var(--space-4);
  flex-wrap: wrap;
}
.run-item__meta {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

@media (max-width: 900px) {
  .page-grid { grid-template-columns: 1fr; }
  .span-full { grid-column: auto; }
}
</style>
