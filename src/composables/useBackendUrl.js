import { ref, readonly } from 'vue'

const STORAGE_KEY = 'dipas_backend_url'
const DEFAULT_URL = 'http://localhost:8000/api/v1'

const backendUrl = ref(localStorage.getItem(STORAGE_KEY) || DEFAULT_URL)

export function useBackendUrl() {
  function setBackendUrl(url) {
    const trimmed = url.trim().replace(/\/$/, '') // strip trailing slash
    backendUrl.value = trimmed
    localStorage.setItem(STORAGE_KEY, trimmed)
  }

  function resetBackendUrl() {
    backendUrl.value = DEFAULT_URL
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    backendUrl: readonly(backendUrl),
    defaultUrl: DEFAULT_URL,
    setBackendUrl,
    resetBackendUrl,
  }
}
