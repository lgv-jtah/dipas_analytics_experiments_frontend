<template>
  <AppShell>
    <PageHeader
      title="Contributions"
      description="Select a contribution to review its AI-predicted key messages and stances."
      icon="contributions"
      :badge="contributions.length ? String(contributions.length) : ''"
    >
      <template #actions>
        <input
          v-model="search"
          class="search-input"
          placeholder="Search contributions…"
        />
      </template>
    </PageHeader>

    <div v-if="loading" class="state-message">
      <HhText variant="body" color="secondary">Loading contributions…</HhText>
    </div>
    <div v-else-if="error" class="state-message state-message--error">
      <HhText variant="body" color="accent">Could not load contributions. Is the backend running?</HhText>
    </div>
    <template v-else>
      <!-- Evaluation progress reminder -->
      <div v-if="!evaluator" class="banner">
        <HhIcon name="user" size="sm" />
        <HhText tag="span" variant="caption">
          You haven't set your evaluator name yet.
          <router-link to="/evaluation" class="banner__link">Set it on the overview page</router-link>
          before submitting evaluations.
        </HhText>
      </div>

      <div v-if="filteredContributions.length === 0" class="state-message">
        <HhText variant="body" color="secondary">No contributions match your search.</HhText>
      </div>

      <div class="contribution-list">
        <div
          v-for="contribution in filteredContributions"
          :key="contribution.contribution_id"
          class="contribution-item"
          @click="goToContribution(contribution.contribution_id)"
        >
          <div class="contribution-item__meta">
            <HhBadge variant="navy" size="sm">#{{ contribution.contribution_id }}</HhBadge>
            <HhIcon name="arrow-right" size="sm" class="contribution-item__arrow" />
          </div>
          <HhText tag="p" variant="body" class="contribution-item__text">
            {{ truncate(contribution.contribution_content, 200) }}
          </HhText>
        </div>
      </div>
    </template>
  </AppShell>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '../components/templates/AppShell.vue'
import PageHeader from '../components/molecules/PageHeader.vue'
import HhText from '../components/atoms/HhText.vue'
import HhIcon from '../components/atoms/HhIcon.vue'
import HhBadge from '../components/atoms/HhBadge.vue'
import { getContributions } from '../services/api.js'
import { useEvaluator } from '../composables/useEvaluator.js'

const router = useRouter()
const { evaluator } = useEvaluator()

const contributions = ref([])
const loading = ref(true)
const error = ref(false)
const search = ref('')

const filteredContributions = computed(() => {
  if (!search.value.trim()) return contributions.value
  const q = search.value.toLowerCase()
  return contributions.value.filter(c =>
    String(c.contribution_id).includes(q) ||
    c.contribution_content.toLowerCase().includes(q)
  )
})

function truncate(text, max) {
  return text.length > max ? text.slice(0, max) + '…' : text
}

function goToContribution(id) {
  router.push(`/evaluation/contributions/${id}`)
}

onMounted(async () => {
  try {
    contributions.value = await getContributions()
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* Search */
.search-input {
  padding: var(--space-2) var(--space-4);
  font-family: var(--font-family);
  font-size: var(--font-size-sm);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  outline: none;
  width: 220px;
  transition: border-color var(--transition-fast);
}
.search-input:focus { border-color: var(--color-accent); }

/* Banner */
.banner {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: #FFF8E6;
  border: 1px solid #F0D080;
  border-radius: var(--radius-md);
  margin-bottom: var(--space-6);
  color: #9A6800;
}
.banner__link {
  color: var(--color-accent);
  text-decoration: underline;
  cursor: pointer;
}

/* List */
.contribution-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.contribution-item {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4) var(--space-5);
  cursor: pointer;
  transition: box-shadow var(--transition-fast), border-color var(--transition-fast),
              transform var(--transition-fast);
}
.contribution-item:hover {
  border-color: var(--color-accent);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.contribution-item__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-2);
}
.contribution-item__arrow {
  color: var(--color-text-secondary);
  transition: transform var(--transition-fast);
}
.contribution-item:hover .contribution-item__arrow {
  transform: translateX(3px);
  color: var(--color-accent);
}

.contribution-item__text {
  color: var(--color-text-primary);
  margin: 0;
}

/* States */
.state-message {
  padding: var(--space-8);
  text-align: center;
}
.state-message--error { color: var(--color-accent); }
</style>
