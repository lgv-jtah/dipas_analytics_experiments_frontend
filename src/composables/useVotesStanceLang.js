import { ref, computed } from 'vue'
import { getVotesStanceStrings } from '../i18n/votesStance.js'

// Language preference for the "Votes vs. Stance" feature (the dedicated page and
// the contribution-detail panel). English is the default.
//
// `lang` is declared once at module scope, so it is a shared singleton: every
// caller of useVotesStanceStrings() reads and writes the same reactive ref. That
// is deliberate — switching the language on the page also flips the panel (and
// vice versa) without any prop plumbing between them.
//
// The choice is remembered in localStorage across visits. Every localStorage
// access is wrapped in try/catch because it can throw or be unavailable (private
// mode, blocked storage), and only the allowlisted values 'en' and 'de' are
// accepted, so a stale or hand-edited entry can never push the UI into an unknown
// language.

const STORAGE_KEY = 'vs-lang'

// Read the saved language, accepting only 'en' or 'de'; anything else (including
// an unavailable localStorage) falls back to English.
function readInitialLang() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'en' || stored === 'de') return stored
  } catch {
    // localStorage unavailable (e.g. private mode); use the default.
  }
  return 'en'
}

const lang = ref(readInitialLang())

/**
 * Shared language state for the Votes-vs-Stance feature. Returns the singleton
 * `lang` ref, a `setLang` setter, and `strings`, a computed of the active-language
 * string set. All callers share the same `lang`, so they stay in sync.
 */
export function useVotesStanceStrings() {
  /**
   * Switch the active language. Ignores anything outside the 'en'/'de' allowlist,
   * then persists the choice; a write failure is swallowed because the in-memory
   * preference still takes effect for this session.
   */
  function setLang(next) {
    if (next !== 'en' && next !== 'de') return
    lang.value = next
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Ignore write failures; the in-memory preference still applies.
    }
  }

  const strings = computed(() => getVotesStanceStrings(lang.value))

  return { lang, setLang, strings }
}
