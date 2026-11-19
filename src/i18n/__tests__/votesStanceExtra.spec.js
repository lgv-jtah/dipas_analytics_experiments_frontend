// Tests for the shared-bar i18n additions: the new EN/DE keys, interpolation of
// the neutral/mixed caption, and the per-language percent formatter output. The
// formatter assertions pin the ACTUAL Intl output (German decimal comma and a
// space before %) rather than assuming the spacing.
import { describe, it, expect } from 'vitest'
import {
  getVotesStanceExtraStrings,
  interpolate,
  formatPercent,
  makeTitle,
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

describe('per-contribution cards i18n keys', () => {
  it('defines the new chrome keys in English', () => {
    const en = getVotesStanceExtraStrings('en')
    expect(en.cardsTitle).toBe('Single contributions, side by side')
    expect(en.sortGap).toBe('Gap (comments minus thumbs)')
    expect(en.sortThumbs).toBe('Number of thumbs')
    expect(en.sortId).toBe('Contribution ID')
    expect(en.cardsShowing).toContain('{shown}')
    expect(en.cardsShowing).toContain('{total}')
    expect(en.cardsEmpty).toBe('No contributions to show.')
  })

  it('translates the new chrome keys in German', () => {
    const de = getVotesStanceExtraStrings('de')
    expect(de.cardsTitle).toBe('Einzelne Beiträge im Vergleich')
    expect(de.sortLabel).toBe('Sortieren nach')
    expect(de.sortId).toBe('Beitrags-Nr.')
    // German is a real translation, not the English fallback.
    expect(de.cardsEmpty).not.toBe(getVotesStanceExtraStrings('en').cardsEmpty)
    expect(de.cardsEmpty).toBe('Keine Beiträge vorhanden.')
  })

  it('fills cardsShowing with shown and total', () => {
    const en = getVotesStanceExtraStrings('en')
    expect(interpolate(en.cardsShowing, { shown: 80, total: 115 })).toBe(
      'Showing 80 of 115 contributions.'
    )
  })
})

describe('makeTitle', () => {
  it('returns an empty string for non-string input', () => {
    expect(makeTitle(null)).toBe('')
    expect(makeTitle(undefined)).toBe('')
    expect(makeTitle(42)).toBe('')
    expect(makeTitle({})).toBe('')
  })

  it('collapses whitespace and trims', () => {
    expect(makeTitle('  a   b\n\tc  ')).toBe('a b c')
  })

  it('returns the whole string when at or under the limit', () => {
    const s = 'A short idea title'
    expect(makeTitle(s)).toBe(s)
    expect(makeTitle('abcde', 5)).toBe('abcde')
  })

  it('cuts to the last word boundary and appends an ellipsis', () => {
    // 10-char limit: "hello worl" backtracks to the space after "hello".
    expect(makeTitle('hello world and more', 10)).toBe('hello…')
  })

  it('cuts mid-word when there is no space to backtrack to', () => {
    expect(makeTitle('abcdefghijklmnop', 5)).toBe('abcde…')
  })
})
