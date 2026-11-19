// Small helper for honouring the user's reduced-motion preference. Guarded so it
// is safe to call in environments without matchMedia (e.g. jsdom in tests, or an
// older browser): any absence or error simply reports "no preference", so callers
// animate normally rather than crashing.

/**
 * Whether the user has requested reduced motion via the OS/browser setting.
 * Returns false when the preference cannot be read.
 *
 * @returns {boolean}
 */
export function prefersReducedMotion() {
  try {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false
    }
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}
