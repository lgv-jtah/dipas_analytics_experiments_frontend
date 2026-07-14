<template>
  <AppShell>
    <PageHeader
      title="Evaluation Overview"
      :description="evaluator
        ? `Showing your personal progress as '${evaluator}'.`
        : 'Showing combined progress across all evaluators. Set your name to see your own stats.'"
      icon="progress"
    >
      <template #actions>
        <div class="evaluator-row">
          <HhIcon name="user" size="sm" class="evaluator-row__icon" />
          <template v-if="evaluator">
            <span class="evaluator-row__name">{{ evaluator }}</span>
            <HhButton variant="ghost" size="sm" @click="showEvaluatorModal = true">Change</HhButton>
          </template>
          <template v-else>
            <HhButton variant="secondary" size="sm" @click="showEvaluatorModal = true">Set your name</HhButton>
          </template>
        </div>
      </template>
    </PageHeader>

    <!-- Evaluator name prompt modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showEvaluatorModal" class="modal-backdrop" @click.self="showEvaluatorModal = false">
          <div class="modal">
            <HhText tag="h2" variant="subheading" class="modal__title">Who are you?</HhText>
            <HhText tag="p" variant="body" color="secondary" class="modal__desc">
              Your name is stored locally and attached to every evaluation you submit.
            </HhText>
            <input
              v-model="nameInput"
              class="modal__input"
              placeholder="Enter your name or ID"
              @keydown.enter="saveEvaluator"
              autofocus
            />
            <div class="modal__actions">
              <HhButton variant="ghost" size="md" @click="showEvaluatorModal = false">Cancel</HhButton>
              <HhButton variant="primary" size="md" :disabled="!nameInput.trim()" @click="saveEvaluator">
                Confirm
              </HhButton>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Loading / error states -->
    <div v-if="loading" class="state-message">
      <HhText variant="body" color="secondary">Loading stats…</HhText>
    </div>
    <div v-else-if="error" class="state-message state-message--error">
      <HhText variant="body" color="accent">Could not load stats. Is the backend running?</HhText>
    </div>

    <template v-else>
      <!-- Summary stat cards -->
      <div class="stats-grid">
        <HhCard variant="accent" class="stat-card">
          <template #header>
            <div class="stat-card__header">
              <HhIcon name="key" size="sm" class="stat-card__icon" />
              <HhText tag="span" variant="label" color="secondary">Key Messages</HhText>
            </div>
          </template>
          <HhText tag="p" variant="display" class="stat-card__number">
            {{ stats.evaluated_key_messages }}
            <HhText tag="span" variant="caption" color="secondary"> / {{ stats.total_key_messages }}</HhText>
          </HhText>
          <HhProgressBar
            :value="stats.evaluated_key_messages"
            :max="stats.total_key_messages"
            variant="accent"
            class="stat-card__bar"
          />
          <div class="stat-card__breakdown">
            <HhBadge variant="success">{{ stats.correct_key_messages }} correct</HhBadge>
            <HhBadge variant="red">{{ stats.incorrect_key_messages }} incorrect</HhBadge>
          </div>
        </HhCard>

        <HhCard variant="accent" class="stat-card">
          <template #header>
            <div class="stat-card__header">
              <HhIcon name="stance" size="sm" class="stat-card__icon" />
              <HhText tag="span" variant="label" color="secondary">Stances</HhText>
            </div>
          </template>
          <HhText tag="p" variant="display" class="stat-card__number">
            {{ stats.evaluated_stances }}
            <HhText tag="span" variant="caption" color="secondary"> / {{ stats.total_stances }}</HhText>
          </HhText>
          <HhProgressBar
            :value="stats.evaluated_stances"
            :max="stats.total_stances"
            variant="navy"
            class="stat-card__bar"
          />
          <div class="stat-card__breakdown">
            <HhBadge variant="success">{{ stats.correct_stances }} correct</HhBadge>
            <HhBadge variant="red">{{ stats.incorrect_stances }} incorrect</HhBadge>
          </div>
        </HhCard>

        <HhCard class="stat-card stat-card--cta" :interactive="true" @click="$router.push('/evaluation/contributions')">
          <div class="cta-content">
            <HhIcon name="contributions" size="lg" class="cta-content__icon" />
            <div>
              <HhText tag="p" variant="label">Start Evaluating</HhText>
              <HhText tag="p" variant="caption" color="secondary">Browse contributions and evaluate key messages and stances</HhText>
            </div>
            <HhIcon name="arrow-right" size="md" class="cta-content__arrow" />
          </div>
        </HhCard>
      </div>

      <!-- Accuracy section -->
      <div v-if="stats.evaluated_key_messages > 0 || stats.evaluated_stances > 0" class="accuracy-section">
        <HhText tag="h2" variant="subheading" class="section-title">Accuracy so far</HhText>
        <div class="accuracy-grid">
          <HhCard v-if="stats.evaluated_key_messages > 0">
            <template #header>Key Message Accuracy</template>
            <div class="accuracy-bar-row">
              <HhText tag="span" variant="label" color="accent" class="accuracy-pct">
                {{ kmAccuracyPct }}%
              </HhText>
              <HhProgressBar
                :value="stats.correct_key_messages"
                :max="stats.evaluated_key_messages"
                variant="success"
                :show-label="false"
              />
            </div>
            <HhText tag="p" variant="caption" color="secondary">
              {{ stats.correct_key_messages }} of {{ stats.evaluated_key_messages }} evaluated key messages marked correct
            </HhText>
          </HhCard>

          <HhCard v-if="stats.evaluated_stances > 0">
            <template #header>Stance Accuracy</template>
            <div class="accuracy-bar-row">
              <HhText tag="span" variant="label" color="accent" class="accuracy-pct">
                {{ stanceAccuracyPct }}%
              </HhText>
              <HhProgressBar
                :value="stats.correct_stances"
                :max="stats.evaluated_stances"
                variant="success"
                :show-label="false"
              />
            </div>
            <HhText tag="p" variant="caption" color="secondary">
              {{ stats.correct_stances }} of {{ stats.evaluated_stances }} evaluated stances marked correct
            </HhText>
          </HhCard>
        </div>
      </div>
    </template>
  </AppShell>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppShell from '../components/templates/AppShell.vue'
import PageHeader from '../components/molecules/PageHeader.vue'
import HhCard from '../components/molecules/HhCard.vue'
import HhText from '../components/atoms/HhText.vue'
import HhIcon from '../components/atoms/HhIcon.vue'
import HhBadge from '../components/atoms/HhBadge.vue'
import HhButton from '../components/atoms/HhButton.vue'
import HhProgressBar from '../components/atoms/HhProgressBar.vue'
import { getEvaluationStats, getTesterStats } from '../services/api.js'
import { useEvaluator } from '../composables/useEvaluator.js'

const { evaluator, setEvaluator } = useEvaluator()

const loading = ref(true)
const error = ref(false)
const stats = ref({
  total_key_messages: 0, evaluated_key_messages: 0,
  correct_key_messages: 0, incorrect_key_messages: 0,
  total_stances: 0, evaluated_stances: 0,
  correct_stances: 0, incorrect_stances: 0,
})

const showEvaluatorModal = ref(false)
const nameInput = ref(evaluator.value || '')

async function loadStats() {
  loading.value = true
  error.value = false
  try {
    stats.value = evaluator.value
      ? await getTesterStats(evaluator.value)
      : await getEvaluationStats()
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

async function saveEvaluator() {
  if (nameInput.value.trim()) {
    setEvaluator(nameInput.value)
    showEvaluatorModal.value = false
    await loadStats()
  }
}

const kmAccuracyPct = computed(() =>
  stats.value.evaluated_key_messages > 0
    ? Math.round((stats.value.correct_key_messages / stats.value.evaluated_key_messages) * 100)
    : 0
)
const stanceAccuracyPct = computed(() =>
  stats.value.evaluated_stances > 0
    ? Math.round((stats.value.correct_stances / stats.value.evaluated_stances) * 100)
    : 0
)

onMounted(async () => {
  // Prompt for name on first visit
  if (!evaluator.value) {
    showEvaluatorModal.value = true
  }
  await loadStats()
})
</script>

<style scoped>
/* Evaluator row in header */
.evaluator-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
}
.evaluator-row__icon { color: var(--color-text-secondary); }
.evaluator-row__name {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

/* Stat cards */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--space-5);
  margin-bottom: var(--space-10);
}
.stat-card__header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.stat-card__icon { color: var(--color-accent); }
.stat-card__number {
  margin: var(--space-2) 0;
  line-height: 1;
}
.stat-card__bar { margin-bottom: var(--space-3); }
.stat-card__breakdown {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

/* CTA card */
.stat-card--cta { cursor: pointer; }
.cta-content {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}
.cta-content__icon { color: var(--color-accent); flex-shrink: 0; }
.cta-content__arrow { color: var(--color-text-secondary); margin-left: auto; flex-shrink: 0; }

/* Accuracy section */
.section-title { margin-bottom: var(--space-4); }
.accuracy-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-5);
}
.accuracy-bar-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-2);
}
.accuracy-pct {
  font-size: var(--font-size-xl) !important;
  font-weight: var(--font-weight-bold) !important;
  min-width: 3.5ch;
}

/* Loading / error */
.state-message {
  padding: var(--space-8);
  text-align: center;
}
.state-message--error { color: var(--color-accent); }

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.modal {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  width: min(420px, 90vw);
  box-shadow: var(--shadow-lg);
}
.modal__title { margin-bottom: var(--space-2); }
.modal__desc { margin-bottom: var(--space-5); }
.modal__input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-5);
  box-sizing: border-box;
  outline: none;
  transition: border-color var(--transition-fast);
}
.modal__input:focus { border-color: var(--color-accent); }
.modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
}
.modal-enter-active, .modal-leave-active {
  transition: opacity var(--transition-fast);
}
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
