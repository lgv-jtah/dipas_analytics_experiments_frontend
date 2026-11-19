// Tests for the shared-bar i18n additions: the new EN/DE keys, interpolation of
// the neutral/mixed caption, and the per-language percent formatter output. The
// formatter assertions pin the ACTUAL Intl output (German decimal comma and a
// space before %) rather than assuming the spacing.
import { describe, it, expect } from 'vitest'
import {
  getVotesStanceExtraStrings,
  interpolate,
  formatPercent,
} from '../votesStanceExtra.js'

describe('shared-bar i18n keys', () => {
  it('defines the three new keys in English', () => {
    const en = getVotesStanceExtraStrings('en')
    expect(en.sharedThumbsBarTitle).toBe('Thumbs (shared ideas)')
    expect(en.sharedCommentsBarTitle).toBe('Comment stances (shared ideas)')
    expect(en.sharedNeutralMixed).toContain('{neutral}')
    expect(en.sharedNeutralMixed).toContain('{mixed}')
  })

  it('translates the three new keys in German', () => {
    const de = getVotesStanceExtraStrings('de')
    expect(de.sharedThumbsBarTitle).toBe('Daumen (gemeinsame Beiträge)')
    expect(de.sharedCommentsBarTitle).toBe(
      'Haltung der Kommentare (gemeinsame Beiträge)'
    )
    // German is a real translation, not the English fallback.
    expect(de.sharedNeutralMixed).not.toBe(
      getVotesStanceExtraStrings('en').sharedNeutralMixed
    )
    expect(de.sharedNeutralMixed).toContain('zählen nicht in den Anteil')
  })
})

describe('interpolate on sharedNeutralMixed', () => {
  it('fills neutral and mixed in English', () => {
    const en = getVotesStanceExtraStrings('en')
    expect(interpolate(en.sharedNeutralMixed, { neutral: 44, mixed: 8 })).toBe(
      '44 neutral and 8 mixed comments are not counted in the share.'
    )
  })

  it('fills neutral and mixed in German', () => {
    const de = getVotesStanceExtraStrings('de')
    expect(interpolate(de.sharedNeutralMixed, { neutral: 44, mixed: 8 })).toBe(
      '44 neutrale und 8 gemischte Kommentare zählen nicht in den Anteil.'
    )
  })
})

describe('formatPercent per language', () => {
  it('uses a dot and no space in English', () => {
    expect(formatPercent(87.55, 'en')).toBe('87.6%')
    expect(formatPercent(82.69, 'en')).toBe('82.7%')
  })

  it('uses a decimal comma and a leading space in German', () => {
    expect(formatPercent(87.55, 'de')).toBe('87,6 %')
    expect(formatPercent(82.69, 'de')).toBe('82,7 %')
  })

  it('returns the n/a marker for a null share', () => {
    expect(formatPercent(null, 'en')).toBe('n/a')
    expect(formatPercent(null, 'de')).toBe('k. A.')
  })
})
