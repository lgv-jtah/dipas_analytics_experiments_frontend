// Tests for prefersReducedMotion: it must report the media-query result when
// matchMedia exists and degrade safely to false when it is missing or throws.
import { describe, it, expect, afterEach, vi } from 'vitest'
import { prefersReducedMotion } from '../motion.js'

const original = window.matchMedia

afterEach(() => {
  window.matchMedia = original
  vi.restoreAllMocks()
})

describe('prefersReducedMotion', () => {
  it('returns false when matchMedia is unavailable', () => {
    // jsdom provides no matchMedia by default.
    window.matchMedia = undefined
    expect(prefersReducedMotion()).toBe(false)
  })

  it('reflects the media query match when present', () => {
    window.matchMedia = vi.fn(() => ({ matches: true }))
    expect(prefersReducedMotion()).toBe(true)
    window.matchMedia = vi.fn(() => ({ matches: false }))
    expect(prefersReducedMotion()).toBe(false)
  })

  it('returns false when matchMedia throws', () => {
    window.matchMedia = vi.fn(() => {
      throw new Error('nope')
    })
    expect(prefersReducedMotion()).toBe(false)
  })
})
