<template>
  <AppShell>
    <!-- Loading / error -->
    <div v-if="loading" class="state-message">
      <HhText variant="body" color="secondary">Loading contribution…</HhText>
    </div>
    <div v-else-if="error" class="state-message state-message--error">
      <HhText variant="body" color="accent">Could not load data. Is the backend running?</HhText>
    </div>

    <template v-else>
      <!-- Page header -->
      <PageHeader
        :title="`Contribution #${contributionId}`"
        icon="evaluation"
      >
        <template #actions>
          <HhButton variant="ghost" size="sm" @click="$router.push('/evaluation/contributions')">
            ← Back to list
          </HhButton>
        </template>
      </PageHeader>

      <!-- Contribution text -->
      <HhCard variant="subtle" class="contribution-card">
        <HhText tag="p" variant="body" class="contribution-text">
          {{ contribution.contribution_content }}
        </HhText>
      </HhCard>

      <!-- Key messages -->
      <div class="section-header">
        <HhText tag="h2" variant="subheading">Key Messages</HhText>
        <HhBadge variant="default">{{ keyMessages.length }}</HhBadge>
      </div>
      <HhText tag="p" variant="caption" color="secondary" class="section-hint">
        Evaluate whether each AI-extracted key message is a correct and meaningful summary of the contribution.
      </HhText>

      <div class="key-messages-list">
        <div
          v-for="(km, kmIndex) in keyMessages"
          :key="km.key_message"
          class="km-block"
          :class="{ 'km-block--expanded': expandedKm === kmIndex }"
        >
          <!-- Key message header -->
          <div class="km-block__header" @click="toggleKm(kmIndex)">
            <div class="km-block__left">
              <HhBadge :variant="kmTypeBadgeVariant(km.key_message_type)" size="sm">
                {{ km.key_message_type }}
              </HhBadge>
              <HhText tag="span" variant="body" class="km-block__text">
                {{ km.key_message }}
              </HhText>
            </div>
            <div class="km-block__right">
              <!-- Verdict indicator -->
              <span
                v-if="kmEvaluations[km.key_message]?.verdict"
                class="verdict-pill"
                :class="`verdict-pill--${kmEvaluations[km.key_message].verdict}`"
              >
                {{ kmEvaluations[km.key_message].verdict }}
              </span>
              <HhIcon
                :name="expandedKm === kmIndex ? 'chevron-left' : 'chevron-right'"
                size="sm"
                class="km-block__chevron"
              />
            </div>
          </div>

          <!-- Expanded key message content -->
          <Transition name="expand">
            <div v-if="expandedKm === kmIndex" class="km-block__body">
              <!-- AI explanation -->
              <div class="km-explanation">
                <HhText tag="p" variant="caption" color="secondary" class="km-explanation__label">
                  AI explanation
                </HhText>
                <HhText tag="p" variant="body" class="km-explanation__text">
                  {{ km.key_message_explanation }}
                </HhText>
              </div>

              <!-- Key message evaluation form -->
              <div class="eval-form">
                <HhText tag="p" variant="label" class="eval-form__label">
                  Is this key message correct?
                </HhText>
                <div class="eval-form__controls">
                  <HhVerdictPicker
                    v-model="kmEvaluations[km.key_message].verdict"
                    :disabled="submittingKm[km.key_message]"
                  />
                  <HhTextarea
                    v-model="kmEvaluations[km.key_message].comment"
                    placeholder="Optional note…"
                    :rows="2"
                    :disabled="submittingKm[km.key_message]"
                    class="eval-form__textarea"
                  />
                </div>

                <!-- Suggestion fields – only shown when verdict is incorrect -->
                <Transition name="suggestion">
                  <div
                    v-if="kmEvaluations[km.key_message].verdict === 'incorrect'"
                    class="suggestion-block"
                  >
                    <div class="suggestion-block__header">
                      <HhIcon name="key" size="sm" class="suggestion-block__icon" />
                      <HhText tag="p" variant="label">Suggest a better key message</HhText>
                    </div>
                    <HhText tag="p" variant="caption" color="secondary" class="suggestion-block__hint">
                      Optionally provide the key message you would have extracted and the sentence from the contribution it is based on.
                    </HhText>
                    <div class="suggestion-block__fields">
                      <div class="suggestion-block__field">
                        <label class="suggestion-block__field-label">Your key message</label>
                        <HhTextarea
                          v-model="kmEvaluations[km.key_message].suggested_key_message"
                          placeholder="e.g. Radwege sind zu schmal für den Schulweg"
                          :rows="2"
                          :disabled="submittingKm[km.key_message]"
                        />
                      </div>
                      <div class="suggestion-block__field">
                        <label class="suggestion-block__field-label">Related sentence from the contribution</label>
                        <HhTextarea
                          v-model="kmEvaluations[km.key_message].suggested_sentence"
                          placeholder="Copy the relevant sentence from the contribution text above…"
                          :rows="2"
                          :disabled="submittingKm[km.key_message]"
                        />
                      </div>
                    </div>
                  </div>
                </Transition>

                <div class="eval-form__footer">
                  <HhButton
                    variant="primary"
                    size="sm"
                    :loading="submittingKm[km.key_message]"
                    :disabled="!kmEvaluations[km.key_message].verdict"
                    @click="submitKmEvaluation(km)"
                  >
                    Save
                  </HhButton>
                  <HhText
                    v-if="kmSaveStatus[km.key_message]"
                    tag="span"
                    variant="caption"
                    :color="kmSaveStatus[km.key_message] === 'saved' ? 'secondary' : 'accent'"
                  >
                    {{ kmSaveStatus[km.key_message] === 'saved' ? 'Saved.' : 'Error saving. Try again.' }}
                  </HhText>
                </div>
              </div>

              <!-- Stances -->
              <div class="stances-section">
                <div class="stances-header">
                  <HhText tag="h3" variant="label">Comment Stances</HhText>
                  <HhBadge variant="default" size="sm">{{ km.stances?.length ?? 0 }}</HhBadge>
                </div>
                <HhText tag="p" variant="caption" color="secondary" class="section-hint">
                  Evaluate whether the AI correctly predicted each comment's stance toward this key message.
                </HhText>

                <div v-if="km.stancesLoading" class="state-message">
                  <HhText variant="caption" color="secondary">Loading stances…</HhText>
                </div>
                <div v-else-if="km.stancesError" class="state-message state-message--error">
                  <HhText variant="caption" color="accent">Could not load stances.</HhText>
                </div>
                <div v-else class="stances-list">
                  <div
                    v-for="stance in km.stances"
                    :key="stance.comment_text"
                    class="stance-card"
                  >
                    <!-- Comment text -->
                    <HhText tag="p" variant="body" class="stance-card__comment">
                      "{{ stance.comment_text }}"
                    </HhText>

                    <!-- AI prediction -->
                    <div class="stance-card__prediction">
                      <HhText tag="span" variant="caption" color="secondary">AI stance: </HhText>
                      <HhBadge :variant="stanceBadgeVariant(stance.stance)" size="sm">
                        {{ stanceLabel(stance.stance) }}
                      </HhBadge>
                    </div>

                    <!-- AI explanation -->
                    <details class="stance-card__details">
                      <summary class="stance-card__summary">
                        <HhText tag="span" variant="caption" color="secondary">View AI reasoning</HhText>
                      </summary>
                      <HhText tag="p" variant="caption" color="secondary" class="stance-card__explanation">
                        {{ stance.explanation }}
                      </HhText>
                    </details>

                    <!-- Stance evaluation form -->
                    <div class="eval-form eval-form--inline">
                      <HhVerdictPicker
                        v-model="stanceEvaluations[stanceKey(km, stance)].verdict"
                        :disabled="submittingStance[stanceKey(km, stance)]"
                      />
                      <HhTextarea
                        v-model="stanceEvaluations[stanceKey(km, stance)].comment"
                        placeholder="Optional note…"
                        :rows="2"
                        :disabled="submittingStance[stanceKey(km, stance)]"
                        class="eval-form__textarea"
                      />
                      <HhButton
                        variant="primary"
                        size="sm"
                        :loading="submittingStance[stanceKey(km, stance)]"
                        :disabled="!stanceEvaluations[stanceKey(km, stance)].verdict"
                        @click="submitStanceEvaluation(km, stance)"
                      >
                        Save
                      </HhButton>
                      <HhText
                        v-if="stanceSaveStatus[stanceKey(km, stance)]"
                        tag="span"
                        variant="caption"
                        :color="stanceSaveStatus[stanceKey(km, stance)] === 'saved' ? 'secondary' : 'accent'"
                      >
                        {{ stanceSaveStatus[stanceKey(km, stance)] === 'saved' ? 'Saved.' : 'Error saving.' }}
                      </HhText>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <!-- Evaluator-added key messages -->
      <div class="section-header added-km-section-header">
        <HhText tag="h2" variant="subheading">Added Key Messages</HhText>
        <HhBadge variant="default">{{ addedKeyMessages.length }}</HhBadge>
      </div>
      <HhText tag="p" variant="caption" color="secondary" class="section-hint">
        Key messages the model missed. Each entry is submitted to the backend immediately.
      </HhText>

      <!-- Previously saved added key messages -->
      <div v-if="addedKeyMessages.length" class="added-km-list">
        <div
          v-for="(akm, idx) in addedKeyMessages"
          :key="idx"
          class="added-km-item"
        >
          <div class="added-km-item__left">
            <HhBadge :variant="kmTypeBadgeVariant(akm.key_message_type)" size="sm">
              {{ akm.key_message_type }}
            </HhBadge>
            <HhText tag="span" variant="body">{{ akm.key_message }}</HhText>
          </div>
          <HhText
            v-if="akm.key_message_sentence"
            tag="p"
            variant="caption"
            color="secondary"
            class="added-km-item__sentence"
          >
            "{{ akm.key_message_sentence }}"
          </HhText>
        </div>
      </div>

      <!-- Add key message form toggle -->
      <div class="add-km-toggle">
        <HhButton
          variant="ghost"
          size="sm"
          @click="showAddKmForm = !showAddKmForm"
        >
          {{ showAddKmForm ? '− Cancel' : '+ Add key message' }}
        </HhButton>
      </div>

      <!-- Add key message form -->
      <Transition name="suggestion">
        <div v-if="showAddKmForm" class="add-km-form">
          <div class="add-km-form__header">
            <HhIcon name="key" size="sm" class="add-km-form__icon" />
            <HhText tag="p" variant="label">New key message</HhText>
          </div>
          <HhText tag="p" variant="caption" color="secondary" class="add-km-form__hint">
            Add a key message that the model has missed. Select its type, write the key message, and optionally copy the source sentence from the contribution above.
          </HhText>

          <div class="add-km-form__fields">
            <!-- Type selector -->
            <div class="add-km-form__field">
              <label class="add-km-form__field-label">Type</label>
              <div class="add-km-type-picker">
                <button
                  v-for="t in KM_TYPES"
                  :key="t"
                  type="button"
                  class="add-km-type-btn"
                  :class="{ 'add-km-type-btn--active': newKm.key_message_type === t }"
                  :disabled="submittingNewKm"
                  @click="newKm.key_message_type = t"
                >
                  {{ t }}
                </button>
              </div>
            </div>

            <!-- Key message text -->
            <div class="add-km-form__field">
              <label class="add-km-form__field-label">Key message</label>
              <HhTextarea
                v-model="newKm.key_message"
                placeholder="e.g. Radwege sind zu schmal für den Schulweg"
                :rows="2"
                :disabled="submittingNewKm"
              />
            </div>

            <!-- Source sentence -->
            <div class="add-km-form__field">
              <label class="add-km-form__field-label">Source sentence (optional)</label>
              <HhTextarea
                v-model="newKm.key_message_sentence"
                placeholder="Copy the relevant sentence from the contribution text above…"
                :rows="2"
                :disabled="submittingNewKm"
              />
            </div>
          </div>

          <div class="eval-form__footer">
            <HhButton
              variant="primary"
              size="sm"
              :loading="submittingNewKm"
              :disabled="!newKm.key_message.trim() || !newKm.key_message_type"
              @click="submitNewKmEvaluation"
            >
              Save
            </HhButton>
            <HhText
              v-if="newKmSaveStatus"
              tag="span"
              variant="caption"
              :color="newKmSaveStatus === 'saved' ? 'secondary' : 'accent'"
            >
              {{ newKmSaveStatus === 'saved' ? 'Saved.' : 'Error saving. Try again.' }}
            </HhText>
          </div>
        </div>
      </Transition>
    </template>
  </AppShell>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppShell from '../components/templates/AppShell.vue'
import PageHeader from '../components/molecules/PageHeader.vue'
import HhCard from '../components/molecules/HhCard.vue'
import HhText from '../components/atoms/HhText.vue'
import HhIcon from '../components/atoms/HhIcon.vue'
import HhBadge from '../components/atoms/HhBadge.vue'
import HhButton from '../components/atoms/HhButton.vue'
import HhVerdictPicker from '../components/atoms/HhVerdictPicker.vue'
import HhTextarea from '../components/atoms/HhTextarea.vue'
import {
  getContribution,
  getKeyMessages,
  getStances,
  submitKeyMessageEvaluation,
  submitStanceEvaluation as apiSubmitStance,
  getKeyMessageEvaluations,
  getStanceEvaluations,
  submitAddedKeyMessage,
  getAddedKeyMessages,
} from '../services/api.js'
import { useEvaluator } from '../composables/useEvaluator.js'

const route = useRoute()
const { evaluator } = useEvaluator()

const contributionId = Number(route.params.id)
const loading = ref(true)
const error = ref(false)
const contribution = ref(null)
const keyMessages = ref([])
const expandedKm = ref(null)

// Per-key-message evaluation state: { verdict, comment }
const kmEvaluations = reactive({})
const submittingKm = reactive({})
const kmSaveStatus = reactive({})

// Per-stance evaluation state: keyed by stanceKey(km, stance)
const stanceEvaluations = reactive({})
const submittingStance = reactive({})
const stanceSaveStatus = reactive({})

// Evaluator-added key messages
const addedKeyMessages = ref([])           // previously saved entries from backend
const showAddKmForm = ref(false)           // toggle the "add" form
const newKm = reactive({
  key_message: '',
  key_message_type: '',
  key_message_sentence: '',
})
const submittingNewKm = ref(false)
const newKmSaveStatus = ref(null)          // null | 'saved' | 'error'

const KM_TYPES = ['Zustand', 'Wunsch', 'Problem', 'Qualität']

function stanceKey(km, stance) {
  return `${km.key_message}__${stance.comment_text}`
}

// --- Type/stance label helpers ---

function kmTypeBadgeVariant(type) {
  const map = {
    Zustand: 'navy',
    Wunsch: 'warning',
    Problem: 'red',
    Qualität: 'success',
  }
  return map[type] ?? 'default'
}

function stanceBadgeVariant(stance) {
  if (stance === 'in favor') return 'success'
  if (stance === 'ablehnung') return 'red'
  return 'default'
}

function stanceLabel(stance) {
  if (stance === 'in favor') return 'In favor'
  if (stance === 'ablehnung') return 'Against'
  return 'Neutral'
}

// --- Accordion ---

async function toggleKm(index) {
  if (expandedKm.value === index) {
    expandedKm.value = null
    return
  }
  expandedKm.value = index
  const km = keyMessages.value[index]
  if (km.stances === undefined) {
    await loadStances(km)
  }
}

async function loadStances(km) {
  km.stancesLoading = true
  km.stancesError = false
  try {
    const stances = await getStances(contributionId, km.key_message)
    km.stances = stances
    // Initialise stance evaluation state
    for (const stance of stances) {
      const k = stanceKey(km, stance)
      if (!stanceEvaluations[k]) {
        stanceEvaluations[k] = { verdict: null, comment: '' }
        submittingStance[k] = false
        stanceSaveStatus[k] = null
      }
    }
    // Prefill existing stance evaluations from backend
    if (evaluator.value) {
      try {
        const existing = await getStanceEvaluations({
          contribution_id: contributionId,
          evaluator: evaluator.value,
        })
        for (const ev of existing) {
          const matchingKm = keyMessages.value.find(k => k.key_message === ev.key_message)
          if (!matchingKm) continue
          const k = stanceKey(matchingKm, { comment_text: ev.comment_text })
          if (stanceEvaluations[k] !== undefined) {
            stanceEvaluations[k].verdict = ev.verdict
            stanceEvaluations[k].comment = ev.comment || ''
          }
        }
      } catch { /* ignore prefill errors */ }
    }
  } catch {
    km.stancesError = true
    km.stances = []
  } finally {
    km.stancesLoading = false
  }
}

// --- Submit key message evaluation ---
async function submitKmEvaluation(km) {
  const key = km.key_message
  submittingKm[key] = true
  kmSaveStatus[key] = null
  try {
    await submitKeyMessageEvaluation({
      contribution_id: contributionId,
      key_message: km.key_message,
      verdict: kmEvaluations[key].verdict,
      comment: kmEvaluations[key].comment || null,
      evaluator: evaluator.value || null,
      suggested_key_message: kmEvaluations[key].suggested_key_message || null,
      suggested_sentence: kmEvaluations[key].suggested_sentence || null,
    })
    kmSaveStatus[key] = 'saved'
  } catch {
    kmSaveStatus[key] = 'error'
  } finally {
    submittingKm[key] = false
  }
}

// --- Submit stance evaluation ---
async function submitStanceEvaluation(km, stance) {
  const k = stanceKey(km, stance)
  submittingStance[k] = true
  stanceSaveStatus[k] = null
  try {
    await apiSubmitStance({
      contribution_id: contributionId,
      key_message: km.key_message,
      comment_text: stance.comment_text,
      verdict: stanceEvaluations[k].verdict,
      comment: stanceEvaluations[k].comment || null,
      evaluator: evaluator.value || null,
    })
    stanceSaveStatus[k] = 'saved'
  } catch {
    stanceSaveStatus[k] = 'error'
  } finally {
    submittingStance[k] = false
  }
}

// --- Submit evaluator-added key message ---
async function submitNewKmEvaluation() {
  submittingNewKm.value = true
  newKmSaveStatus.value = null
  try {
    const saved = await submitAddedKeyMessage({
      contribution_id: contributionId,
      key_message: newKm.key_message.trim(),
      key_message_type: newKm.key_message_type,
      key_message_sentence: newKm.key_message_sentence.trim() || null,
      evaluator: evaluator.value || null,
    })
    addedKeyMessages.value.push(saved)
    newKmSaveStatus.value = 'saved'
    // Reset form but keep it open so the evaluator can add another
    newKm.key_message = ''
    newKm.key_message_type = ''
    newKm.key_message_sentence = ''
  } catch {
    newKmSaveStatus.value = 'error'
  } finally {
    submittingNewKm.value = false
  }
}

// --- Bootstrap ---
onMounted(async () => {
  try {
    const [contrib, kms] = await Promise.all([
      getContribution(contributionId),
      getKeyMessages(contributionId),
    ])
    contribution.value = contrib

    // Attach reactive stances fields
    keyMessages.value = kms.map(km => ({
      ...km,
      stances: undefined,
      stancesLoading: false,
      stancesError: false,
    }))

    // Initialise key-message evaluation state
    for (const km of kms) {
      kmEvaluations[km.key_message] = {
        verdict: null,
        comment: '',
        suggested_key_message: '',
        suggested_sentence: '',
      }
      submittingKm[km.key_message] = false
      kmSaveStatus[km.key_message] = null
    }

    // Prefill existing key-message evaluations
    if (evaluator.value) {
      try {
        const existing = await getKeyMessageEvaluations({
          contribution_id: contributionId,
          evaluator: evaluator.value,
        })
        for (const ev of existing) {
          if (kmEvaluations[ev.key_message] !== undefined) {
            kmEvaluations[ev.key_message].verdict = ev.verdict
            kmEvaluations[ev.key_message].comment = ev.comment || ''
            kmEvaluations[ev.key_message].suggested_key_message = ev.suggested_key_message || ''
            kmEvaluations[ev.key_message].suggested_sentence = ev.suggested_sentence || ''
          }
        }
      } catch { /* ignore prefill errors */ }

      // Prefill evaluator-added key messages
      try {
        addedKeyMessages.value = await getAddedKeyMessages({
          contribution_id: contributionId,
          evaluator: evaluator.value,
        })
      } catch { /* ignore prefill errors */ }
    }
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* Contribution text */
.contribution-card { margin-bottom: var(--space-8); }
.contribution-text { margin: 0; line-height: var(--line-height-loose); }

/* Section header */
.section-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-2);
}
.section-hint {
  margin-bottom: var(--space-5);
}

/* Key message list */
.key-messages-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

/* Key message block */
.km-block {
  background: var(--color-surface);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: border-color var(--transition-fast);
}
.km-block--expanded {
  border-color: var(--color-accent);
}

.km-block__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  cursor: pointer;
  user-select: none;
  transition: background var(--transition-fast);
}
.km-block__header:hover { background: var(--color-hh-gray-50); }

.km-block__left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex: 1;
  min-width: 0;
}
.km-block__text { flex: 1; }

.km-block__right {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-shrink: 0;
}
.km-block__chevron { color: var(--color-text-secondary); }

/* Verdict pill */
.verdict-pill {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  padding: 3px 10px;
  border-radius: var(--radius-full);
  text-transform: capitalize;
}
.verdict-pill--correct {
  background: #E6F9F0;
  color: #1A7A4A;
}
.verdict-pill--incorrect {
  background: var(--color-accent-subtle);
  color: var(--color-accent);
}

/* Expanded body */
.km-block__body {
  border-top: 1px solid var(--color-border);
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

/* AI explanation */
.km-explanation__label {
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: var(--space-1);
}
.km-explanation__text { margin: 0; }

/* Eval form */
.eval-form__label { margin-bottom: var(--space-3); }
.eval-form__controls {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  align-items: flex-start;
}
.eval-form__textarea { align-self: stretch; }
.eval-form__status { margin-top: var(--space-1); }
.eval-form__footer {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-3);
}

/* Suggestion block */
.suggestion-block {
  margin-top: var(--space-4);
  padding: var(--space-4);
  background: var(--color-accent-subtle);
  border: 1.5px solid var(--color-accent);
  border-radius: var(--radius-md);
}
.suggestion-block__header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-1);
}
.suggestion-block__icon { color: var(--color-accent); }
.suggestion-block__hint { margin-bottom: var(--space-4); }
.suggestion-block__fields {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.suggestion-block__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.suggestion-block__field-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* Suggestion transition */
.suggestion-enter-active {
  transition: opacity var(--transition-fast), transform var(--transition-fast);
}
.suggestion-leave-active {
  transition: opacity var(--transition-fast), transform var(--transition-fast);
}
.suggestion-enter-from,
.suggestion-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* Stances section */
.stances-section {
  border-top: 1px solid var(--color-border);
  padding-top: var(--space-5);
}
.stances-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}
.stances-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* Stance card */
.stance-card {
  background: var(--color-surface-subtle);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.stance-card__comment {
  margin: 0;
  font-style: italic;
  color: var(--color-text-primary);
}
.stance-card__prediction {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.stance-card__details { }
.stance-card__summary {
  cursor: pointer;
  list-style: none;
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
}
.stance-card__explanation {
  margin-top: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-surface);
  border-left: 3px solid var(--color-border);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}

/* Inline eval form for stances */
.eval-form--inline {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: var(--space-3);
}
.eval-form--inline .eval-form__textarea {
  flex: 1;
  min-width: 200px;
}

/* Expand transition */
.expand-enter-active,
.expand-leave-active {
  transition: opacity var(--transition-fast);
}
.expand-enter-from,
.expand-leave-to { opacity: 0; }

/* States */
.state-message {
  padding: var(--space-8);
  text-align: center;
}
.state-message--error { color: var(--color-accent); }

/* Added key messages section */
.added-km-section-header {
  margin-top: var(--space-10);
}

.added-km-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.added-km-item {
  background: var(--color-surface);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.added-km-item__left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.added-km-item__sentence {
  margin: 0;
  font-style: italic;
  padding-left: var(--space-1);
}

/* Add key message toggle button */
.add-km-toggle {
  margin-bottom: var(--space-3);
}

/* Add key message form */
.add-km-form {
  padding: var(--space-4);
  background: var(--color-accent-subtle);
  border: 1.5px solid var(--color-accent);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-6);
}

.add-km-form__header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-1);
}

.add-km-form__icon { color: var(--color-accent); }

.add-km-form__hint {
  margin-bottom: var(--space-4);
}

.add-km-form__fields {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.add-km-form__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.add-km-form__field-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* Type picker */
.add-km-type-picker {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.add-km-type-btn {
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  border: 1.5px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: background var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast);
}

.add-km-type-btn:hover:not(:disabled) {
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.add-km-type-btn--active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #fff;
}

.add-km-type-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
