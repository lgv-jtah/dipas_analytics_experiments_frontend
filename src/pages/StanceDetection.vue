<template>
  <AppShell>
    <PageHeader
      title="Stance Detection"
      description="Classify citizen contributions as supportive, neutral, or opposing on specific topics using fine-tuned language models."
      icon="stance"
      badge="Classification"
      badge-variant="navy"
    >
      <template #actions>
        <HhButton variant="secondary" size="sm">Import Corpus</HhButton>
        <HhButton variant="primary" size="sm">Analyse</HhButton>
      </template>
    </PageHeader>

    <div class="sd-layout">
      <!-- Stats row -->
      <div class="stats-row">
        <HhCard v-for="stat in stats" :key="stat.label" :variant="stat.accent ? 'accent' : 'default'" class="stat-card">
          <div class="stat-card__inner">
            <HhText variant="caption" color="secondary">{{ stat.label }}</HhText>
            <HhText variant="heading" :color="stat.color || 'primary'">{{ stat.value }}</HhText>
          </div>
          <HhBadge :variant="stat.badge" size="sm">{{ stat.trend }}</HhBadge>
        </HhCard>
      </div>

      <!-- Distribution chart placeholder -->
      <HhCard title="Stance Distribution" variant="accent">
        <div class="distribution">
          <div v-for="stance in stances" :key="stance.label" class="distribution__row">
            <HhText variant="label" :style="{ color: stance.color }">{{ stance.label }}</HhText>
            <div class="distribution__bar-wrap">
              <div class="distribution__bar" :style="{ width: stance.pct + '%', background: stance.color }" />
            </div>
            <HhText variant="caption" color="secondary" class="distribution__pct">{{ stance.pct }}%</HhText>
          </div>
        </div>
      </HhCard>

      <!-- Sample results -->
      <HhCard title="Sample Classifications" class="span-full">
        <div class="sample-list">
          <div v-for="item in samples" :key="item.id" class="sample-item">
            <HhBadge :variant="stanceBadge(item.stance)">{{ item.stance }}</HhBadge>
            <HhText variant="body" class="sample-item__text">{{ item.text }}</HhText>
            <HhText variant="caption" color="secondary">{{ item.confidence }}% confidence</HhText>
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

const stats = [
  { label: 'Total Contributions', value: '1,248', trend: '+12%', badge: 'success', accent: false },
  { label: 'Supportive',          value: '634',   trend: '50.8%', badge: 'success', accent: true },
  { label: 'Neutral',             value: '389',   trend: '31.2%', badge: 'default', accent: false },
  { label: 'Opposing',            value: '225',   trend: '18.0%', badge: 'red',     accent: false },
]

const stances = [
  { label: 'Supportive', pct: 51, color: '#1A7A4A' },
  { label: 'Neutral',    pct: 31, color: '#3D5A9A' },
  { label: 'Opposing',   pct: 18, color: '#C8102E' },
]

const samples = [
  { id: 1, text: 'The new cycling path along the Elbe is a fantastic addition to the city\'s infrastructure.', stance: 'Supportive', confidence: 94 },
  { id: 2, text: 'I am not sure if the proposed location makes sense given the existing traffic patterns.', stance: 'Neutral', confidence: 81 },
  { id: 3, text: 'This development will destroy the historic character of our neighborhood completely.', stance: 'Opposing', confidence: 97 },
]

function stanceBadge(stance) {
  if (stance === 'Supportive') return 'success'
  if (stance === 'Opposing')   return 'red'
  return 'navy'
}
</script>

<style scoped>
.sd-layout { display: flex; flex-direction: column; gap: var(--space-6); }
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--space-4);
}
.stat-card .hh-card__body,
.stat-card > :deep(.hh-card__body) { padding: var(--space-4) var(--space-5); }
.stat-card__inner { margin-bottom: var(--space-3); }
.span-full { grid-column: 1 / -1; }
.distribution { display: flex; flex-direction: column; gap: var(--space-4); }
.distribution__row {
  display: grid;
  grid-template-columns: 100px 1fr 48px;
  align-items: center;
  gap: var(--space-3);
}
.distribution__bar-wrap {
  height: 10px;
  background: var(--color-hh-gray-100);
  border-radius: var(--radius-full);
  overflow: hidden;
}
.distribution__bar {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.6s ease;
}
.distribution__pct { text-align: right; }
.sample-list { display: flex; flex-direction: column; gap: var(--space-4); }
.sample-item {
  display: grid;
  grid-template-columns: 100px 1fr auto;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  flex-wrap: wrap;
}
.sample-item__text { line-height: var(--line-height-normal); }

@media (max-width: 700px) {
  .sample-item { grid-template-columns: 1fr; }
}
</style>
