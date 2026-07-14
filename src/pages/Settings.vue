<template>
  <AppShell>
    <PageHeader
      title="Settings"
      description="Configure the connection to the backend API."
      icon="settings"
    />

    <div class="settings-section">
      <HhText tag="h2" variant="subheading" class="settings-section__title">Backend URL</HhText>
      <HhText tag="p" variant="body" color="secondary" class="settings-section__desc">
        The base URL of the backend API, including the path prefix (e.g.
        <code class="settings-section__code">http://192.168.1.10:8000/api/v1</code>).
        The value is stored in your browser and used for all API requests.
      </HhText>

      <div class="url-field">
        <input
          v-model="urlInput"
          class="url-field__input"
          :class="{ 'url-field__input--error': validationError }"
          placeholder="http://localhost:8000/api/v1"
          spellcheck="false"
          autocomplete="off"
          @keydown.enter="save"
        />
        <HhButton variant="primary" size="md" :disabled="!isDirty || !!validationError" @click="save">
          Save
        </HhButton>
      </div>

      <p v-if="validationError" class="url-field__error">{{ validationError }}</p>

      <div class="url-meta">
        <HhText tag="span" variant="caption" color="secondary">
          Current: <code class="settings-section__code">{{ backendUrl }}</code>
        </HhText>
        <HhButton
          v-if="backendUrl !== defaultUrl"
          variant="ghost"
          size="sm"
          class="url-meta__reset"
          @click="reset"
        >
          Reset to default
        </HhButton>
      </div>
    </div>

    <!-- Connection test -->
    <div class="settings-section">
      <HhText tag="h2" variant="subheading" class="settings-section__title">Connection Test</HhText>
      <HhText tag="p" variant="body" color="secondary" class="settings-section__desc">
        Send a request to the backend to verify the URL is reachable.
      </HhText>

      <div class="test-row">
        <HhButton variant="secondary" size="md" :disabled="testing" @click="testConnection">
          {{ testing ? 'Testing…' : 'Test connection' }}
        </HhButton>
        <span v-if="testResult" class="test-result" :class="`test-result--${testResult.type}`">
          {{ testResult.message }}
        </span>
      </div>
    </div>

    <!-- Current model -->
    <div class="settings-section">
      <HhText tag="h2" variant="subheading" class="settings-section__title">Current Model</HhText>
      <HhText tag="p" variant="body" color="secondary" class="settings-section__desc">
        The model currently used by the backend for evaluation.
      </HhText>

      <div class="test-row">
        <HhButton variant="secondary" size="md" :disabled="modelLoading" @click="fetchModel">
          {{ modelLoading ? 'Loading…' : 'Fetch model' }}
        </HhButton>
        <span v-if="modelResult" class="test-result" :class="`test-result--${modelResult.type}`">
          {{ modelResult.message }}
        </span>
      </div>
    </div>

    <!-- Reset evaluations -->
    <div class="settings-section">
      <HhText tag="h2" variant="subheading" class="settings-section__title">Reset Evaluations</HhText>
      <HhText tag="p" variant="body" color="secondary" class="settings-section__desc">
        Permanently delete all evaluation results. This action cannot be undone.
      </HhText>

      <div v-if="!resetConfirming" class="test-row">
        <HhButton variant="secondary" size="md" @click="resetConfirming = true">
          Reset all data
        </HhButton>
      </div>

      <div v-else class="reset-confirm">
        <HhText tag="p" variant="body" color="secondary">
          Are you sure? All evaluation data will be permanently deleted.
        </HhText>
        <div class="test-row">
          <HhButton variant="primary" size="md" :disabled="resetLoading" class="reset-confirm__danger" @click="confirmReset">
            {{ resetLoading ? 'Resetting…' : 'Yes, delete all data' }}
          </HhButton>
          <HhButton variant="ghost" size="md" :disabled="resetLoading" @click="resetConfirming = false">
            Cancel
          </HhButton>
          <span v-if="resetResult" class="test-result" :class="`test-result--${resetResult.type}`">
            {{ resetResult.message }}
          </span>
        </div>
      </div>
    </div>

    <!-- Saved confirmation toast -->
    <Teleport to="body">
      <Transition name="toast">
        <div v-if="showSavedToast" class="toast">
          URL saved.
        </div>
      </Transition>
    </Teleport>
  </AppShell>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import AppShell from '../components/templates/AppShell.vue'
import PageHeader from '../components/molecules/PageHeader.vue'
import HhText from '../components/atoms/HhText.vue'
import HhButton from '../components/atoms/HhButton.vue'
import { useBackendUrl } from '../composables/useBackendUrl.js'
import { getCurrentModel, resetEvaluations } from '../services/api.js'

const { backendUrl, defaultUrl, setBackendUrl, resetBackendUrl } = useBackendUrl()

const urlInput = ref(backendUrl.value)
const showSavedToast = ref(false)
const testing = ref(false)
const testResult = ref(null)

const isDirty = computed(() => urlInput.value.trim().replace(/\/$/, '') !== backendUrl.value)

const validationError = computed(() => {
  const v = urlInput.value.trim()
  if (!v) return 'URL must not be empty.'
  try {
    const parsed = new URL(v)
    if (!['http:', 'https:'].includes(parsed.protocol)) return 'URL must start with http:// or https://'
  } catch {
    return 'Enter a valid URL (e.g. http://192.168.1.10:8000/api/v1).'
  }
  return null
})

// Reset test result whenever the input changes
watch(urlInput, () => { testResult.value = null })

function save() {
  if (validationError.value || !isDirty.value) return
  setBackendUrl(urlInput.value)
  testResult.value = null
  showSavedToast.value = true
  setTimeout(() => { showSavedToast.value = false }, 2500)
}

function reset() {
  resetBackendUrl()
  urlInput.value = defaultUrl
  testResult.value = null
}

const modelLoading = ref(false)
const modelResult = ref(null)

async function fetchModel() {
  modelLoading.value = true
  modelResult.value = null
  try {
    const data = await getCurrentModel()
    modelResult.value = { type: 'success', message: data.model_name ?? JSON.stringify(data) }
  } catch (err) {
    modelResult.value = { type: 'error', message: err.message }
  } finally {
    modelLoading.value = false
  }
}

const resetConfirming = ref(false)
const resetLoading = ref(false)
const resetResult = ref(null)

async function confirmReset() {
  resetLoading.value = true
  resetResult.value = null
  try {
    await resetEvaluations()
    resetResult.value = { type: 'success', message: 'All evaluation data has been deleted.' }
    resetConfirming.value = false
  } catch (err) {
    resetResult.value = { type: 'error', message: err.message }
  } finally {
    resetLoading.value = false
  }
}

async function testConnection() {
  testing.value = true
  testResult.value = null
  const url = backendUrl.value
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
    if (res.ok || res.status < 500) {
      testResult.value = { type: 'success', message: `Reachable (HTTP ${res.status})` }
    } else {
      testResult.value = { type: 'warn', message: `Responded with HTTP ${res.status}` }
    }
  } catch (err) {
    testResult.value = { type: 'error', message: `Unreachable — ${err.message}` }
  } finally {
    testing.value = false
  }
}
</script>

<style scoped>
.settings-section {
  max-width: 640px;
  margin-bottom: var(--space-10);
}
.settings-section__title {
  margin-bottom: var(--space-2);
}
.settings-section__desc {
  margin-bottom: var(--space-5);
}
.settings-section__code {
  font-family: monospace;
  background: var(--color-hh-gray-100);
  padding: 1px 5px;
  border-radius: var(--radius-sm);
  font-size: 0.9em;
}

/* URL input row */
.url-field {
  display: flex;
  gap: var(--space-3);
  align-items: center;
}
.url-field__input {
  flex: 1;
  padding: var(--space-3) var(--space-4);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-family: monospace;
  background: var(--color-surface);
  color: var(--color-text-primary);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  outline: none;
}
.url-field__input:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-subtle);
}
.url-field__input--error {
  border-color: var(--color-error, #d93025);
}
.url-field__error {
  margin-top: var(--space-2);
  font-size: var(--font-size-xs);
  color: var(--color-error, #d93025);
}

/* Meta row below input */
.url-meta {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-top: var(--space-3);
}
.url-meta__reset {
  flex-shrink: 0;
}

/* Test row */
.test-row {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}
.test-result {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}
.test-result--success { color: var(--color-success, #1e8c45); }
.test-result--warn    { color: var(--color-warning, #b45309); }
.test-result--error   { color: var(--color-error,   #d93025); }

/* Reset confirm block */
.reset-confirm {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.reset-confirm__danger {
  background: var(--color-error, #d93025);
  border-color: var(--color-error, #d93025);
}
.reset-confirm__danger:hover:not(:disabled) {
  filter: brightness(0.9);
}

/* Toast */
.toast {
  position: fixed;
  bottom: var(--space-8);
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-text-primary);
  color: var(--color-hh-white);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  pointer-events: none;
  z-index: 9999;
  box-shadow: var(--shadow-lg, 0 4px 16px rgba(0,0,0,.18));
}
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.25s, transform 0.25s;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(12px);
}
</style>
