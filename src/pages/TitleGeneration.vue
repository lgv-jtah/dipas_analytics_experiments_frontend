<template>
  <AppShell>
    <PageHeader
      title="Title Generation"
      description="Generate concise, descriptive titles for citizen contributions and participation topics using generative language models."
      icon="title"
      badge="Generative AI"
      badge-variant="navy"
    >
      <template #actions>
        <HhButton variant="ghost" size="sm">History</HhButton>
        <HhButton variant="primary" size="sm">Generate Titles</HhButton>
      </template>
    </PageHeader>

    <div class="tg-layout">
      <!-- Input panel -->
      <HhCard title="Input Text" variant="accent">
        <div class="tg-input-group">
          <label class="field-label">Paste contribution text</label>
          <textarea
            v-model="inputText"
            class="hh-textarea"
            rows="8"
            placeholder="Enter or paste a citizen contribution here to generate a concise title..."
          />
        </div>
        <div class="tg-options">
          <div class="field-group">
            <label class="field-label">Number of suggestions</label>
            <select v-model="numSuggestions" class="hh-select">
              <option :value="3">3</option>
              <option :value="5">5</option>
              <option :value="10">10</option>
            </select>
          </div>
          <div class="field-group">
            <label class="field-label">Language</label>
            <select class="hh-select">
              <option>German (Deutsch)</option>
              <option>English</option>
            </select>
          </div>
        </div>
        <template #footer>
          <HhButton variant="primary" full @click="generate">
            Generate {{ numSuggestions }} Titles
          </HhButton>
        </template>
      </HhCard>

      <!-- Output panel -->
      <HhCard title="Generated Titles">
        <div v-if="generated.length" class="tg-results">
          <div
            v-for="(title, i) in generated"
            :key="i"
            class="tg-result-item"
            :class="{ 'tg-result-item--selected': selected === i }"
            @click="selected = i"
          >
            <div class="tg-result-item__rank">{{ i + 1 }}</div>
            <HhText variant="body" class="tg-result-item__title">{{ title.text }}</HhText>
            <HhBadge variant="default">{{ title.score }}%</HhBadge>
          </div>
          <div class="tg-actions">
            <HhButton variant="secondary" size="sm" :disabled="selected === null">
              Copy Selected
            </HhButton>
            <HhButton variant="ghost" size="sm">Export All</HhButton>
          </div>
        </div>
        <div v-else class="results-placeholder">
          <HhIcon name="title" size="xl" class="placeholder-icon" />
          <HhText variant="body" color="secondary">No titles generated yet.</HhText>
          <HhText variant="caption" color="secondary">Enter text and click Generate to get started.</HhText>
        </div>
      </HhCard>
    </div>
  </AppShell>
</template>

<script setup>
import { ref } from 'vue'
import AppShell from '../components/templates/AppShell.vue'
import PageHeader from '../components/molecules/PageHeader.vue'
import HhCard from '../components/molecules/HhCard.vue'
import HhButton from '../components/atoms/HhButton.vue'
import HhBadge from '../components/atoms/HhBadge.vue'
import HhText from '../components/atoms/HhText.vue'
import HhIcon from '../components/atoms/HhIcon.vue'

const inputText = ref('')
const numSuggestions = ref(3)
const generated = ref([])
const selected = ref(null)

const mockTitles = [
  'Förderung nachhaltiger Mobilität im Stadtgebiet',
  'Citizen Call for Improved Cycling Infrastructure',
  'Verkehrsberuhigung und Aufenthaltsqualität in Wohnquartieren',
  'Sustainable Urban Mobility: Community Perspectives',
  'Verbesserung der Radverkehrsinfrastruktur in Hamburg',
  'Strengthening Public Transport Connections to Outer Districts',
  'Klimaanpassung durch begrünte Innenstadtbereiche',
  'Modernisation of Pedestrian Zones in Central Hamburg',
  'Lärmschutz und Luftqualität als Planungsprioritäten',
  'Community Feedback on Urban Green Space Development',
]

function generate() {
  if (!inputText.value.trim()) return
  selected.value = null
  generated.value = mockTitles
    .slice(0, numSuggestions.value)
    .map((text, i) => ({ text, score: 95 - i * 4 }))
}
</script>

<style scoped>
.tg-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-6);
  align-items: start;
}
.tg-input-group { margin-bottom: var(--space-4); }
.field-label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-2);
}
.field-group { display: flex; flex-direction: column; gap: var(--space-2); }
.hh-textarea, .hh-select {
  width: 100%;
  padding: var(--space-3);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  font-family: var(--font-family);
  font-size: var(--font-size-sm);
  background: var(--color-surface);
  color: var(--color-text-primary);
  outline: none;
  resize: vertical;
  transition: border-color var(--transition-fast);
}
.hh-textarea:focus, .hh-select:focus { border-color: var(--color-accent); }
.tg-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}
.tg-results { display: flex; flex-direction: column; gap: var(--space-3); }
.tg-result-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: border-color var(--transition-fast), background var(--transition-fast);
}
.tg-result-item:hover { background: var(--color-accent-subtle); border-color: var(--color-accent); }
.tg-result-item--selected { border-color: var(--color-accent); background: var(--color-accent-subtle); }
.tg-result-item__rank {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: var(--color-accent);
  color: white;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  flex-shrink: 0;
}
.tg-result-item__title { flex: 1; }
.tg-actions {
  display: flex;
  gap: var(--space-2);
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border);
}
.results-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-10);
  text-align: center;
}
.placeholder-icon { color: var(--color-hh-gray-300); }

@media (max-width: 768px) {
  .tg-layout { grid-template-columns: 1fr; }
}
</style>
