const DEFAULT_URL = 'http://localhost:8000/api/v1'
const STORAGE_KEY = 'dipas_backend_url'

function getBaseUrl() {
  return (localStorage.getItem(STORAGE_KEY) || DEFAULT_URL).replace(/\/$/, '')
}

async function request(path, options = {}) {
  const response = await fetch(`${getBaseUrl()}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!response.ok) {
    const error = new Error(`API error ${response.status}`)
    error.status = response.status
    throw error
  }
  return response.json()
}

// Contributions
export const getContributions = () =>
  request('/contributions')

export const getContribution = (id) =>
  request(`/contributions/${id}`)

// Key messages
export const getKeyMessages = (contributionId) =>
  request(`/contributions/${contributionId}/key-messages`)

// Stances
export const getStances = (contributionId, keyMessage) =>
  request(`/contributions/${contributionId}/stances?key_message=${encodeURIComponent(keyMessage)}`)

// Evaluations – key messages
export const submitKeyMessageEvaluation = (payload) =>
  request('/evaluations/key-messages', { method: 'POST', body: JSON.stringify(payload) })

export const getKeyMessageEvaluations = (params = {}) => {
  const qs = new URLSearchParams(params).toString()
  return request(`/evaluations/key-messages${qs ? `?${qs}` : ''}`)
}

// Evaluations – evaluator-added key messages
export const submitAddedKeyMessage = (payload) =>
  request('/evaluations/key-messages/added', { method: 'POST', body: JSON.stringify(payload) })

export const getAddedKeyMessages = (params = {}) => {
  const qs = new URLSearchParams(params).toString()
  return request(`/evaluations/key-messages/added${qs ? `?${qs}` : ''}`)
}

// Evaluations – stances
export const submitStanceEvaluation = (payload) =>
  request('/evaluations/stances', { method: 'POST', body: JSON.stringify(payload) })

export const getStanceEvaluations = (params = {}) => {
  const qs = new URLSearchParams(params).toString()
  return request(`/evaluations/stances${qs ? `?${qs}` : ''}`)
}

// Dataset
export const getCurrentModel = () =>
  request('/dataset/model')

export const resetEvaluations = () =>
  request('/evaluations/reset?confirm=true', { method: 'DELETE' })

// Stats
export const getEvaluationStats = () =>
  request('/evaluations/stats')

export const getTesterStats = (tester) =>
  request(`/evaluations/stats/${encodeURIComponent(tester)}`)

export const getContributionsStats = (params = {}) => {
  const qs = new URLSearchParams(params).toString()
  return request(`/evaluations/contributions-stats${qs ? `?${qs}` : ''}`)
}
