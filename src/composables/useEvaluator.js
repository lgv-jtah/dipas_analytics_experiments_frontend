import { ref, readonly } from 'vue'

const STORAGE_KEY = 'dipas_evaluator'

const evaluator = ref(localStorage.getItem(STORAGE_KEY) || '')

export function useEvaluator() {
  function setEvaluator(name) {
    evaluator.value = name.trim()
    localStorage.setItem(STORAGE_KEY, evaluator.value)
  }

  function clearEvaluator() {
    evaluator.value = ''
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    evaluator: readonly(evaluator),
    setEvaluator,
    clearEvaluator,
  }
}
