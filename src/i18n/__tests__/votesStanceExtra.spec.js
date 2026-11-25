// Tests for the votes-vs-stance extra i18n strings. The page now runs on the
// shared contributions only, so the headline keys here are the reworded intro,
// the unweighted-gap label and the three equivalence verdict sentences. The old
// pre-registered/shared-block keys are gone. Also covers the per-contribution
// cards chrome, the per-language percent formatter and makeTitle.
import { describe, it, expect } from 'vitest'
import {
  getVotesStanceExtraStrings,
  interpolate,
  formatPercent,
  makeTitle,
} from '../votesStanceExtra.js'

describe('headline summary i18n keys', () => {
  it('rewords the intro with no "planned in advance" wording (EN)', () => {
    const en = getVotesStanceExtraStrings('en')
    expect(en.summaryIntro).not.toContain('planned in advance')
    expect(en.summaryIntro).toContain('at least one thumbs vote')
    expect(en.summaryIntro).toContain('agreeing or disagreeing comment')
  })

  it('rewords the intro with no "vorab festgelegt" wording (DE)', () => {
    const de = getVotesStanceExtraStrings('de')
    expect(de.summaryIntro).not.toContain('vorab festgelegt')
    expect(de.summaryIntro).toContain('über alle Beiträge')
    // German is a real translation, not the English fallback.
    expect(de.summaryIntro).not.toBe(getVotesStanceExtraStrings('en').summaryIntro)
  })

  it('defines the unweighted-gap label in both languages', () => {
    expect(getVotesStanceExtraStrings('en').unweightedGapLabel).toBe(
      'Unweighted gap (every idea counts once)'
    )
    expect(getVotesStanceExtraStrings('de').unweightedGapLabel).toBe(
      'Ungewichteter Abstand (jeder Beitrag zählt einmal)'
    )
  })

  it('defines the three equivalence verdict sentences (EN)', () => {
    const en = getVotesStanceExtraStrings('en')
    expect(en.equivalenceEquivalent).toContain('equivalent')
    expect(en.equivalenceNotEquivalent).toContain('not')
    expect(en.equivalenceUndecided).toContain('undecided')
    // The undecided one also says it shows neither equivalence nor a difference.
    expect(en.equivalenceUndecided).toContain('neither')
  })

  it('translates the three equivalence verdict sentences (DE)', () => {
    const de = getVotesStanceExtraStrings('de')
    expect(de.equivalenceUndecided).toContain(
      'Bei einer Äquivalenzgrenze von ±10 Prozentpunkten ist das Ergebnis nicht entschieden'
    )
    expect(de.equivalenceUndecided).toContain('weder')
    expect(de.equivalenceEquivalent).toContain('gleichwertig')
    expect(de.equivalenceNotEquivalent).toContain('nicht gleichwertig')
  })

  it('no longer defines the removed pre-registered / shared-block keys', () => {
    const en = getVotesStanceExtraStrings('en')
    expect(en.notPreRegistered).toBeUndefined()
    expect(en.sharedTitle).toBeUndefined()
    expect(en.sharedNeutralMixed).toBeUndefined()
    expect(en.pooledLabel).toBeUndefined()
    expect(en.showAllLabel).toBeUndefined()
    expect(en.cardsShowing).toBeUndefined()
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
    expect(en.cardsCount).toContain('{count}')
    expect(en.cardsEmpty).toBe('No contributions to show.')
  })

  it('translates the new chrome keys in German', () => {
    const de = getVotesStanceExtraStrings('de')
    expect(de.cardsTitle).toBe('Einzelne Beiträge im Vergleich')
    expect(de.sortLabel).toBe('Sortieren nach')
    expect(de.sortId).toBe('Beitrags-Nr.')
    expect(de.cardsCount).toBe('Angezeigt: {count} Beiträge.')
    expect(de.cardsEmpty).toBe('Keine Beiträge vorhanden.')
  })

  it('fills cardsCount with the count', () => {
    const en = getVotesStanceExtraStrings('en')
    expect(interpolate(en.cardsCount, { count: 80 })).toBe('Showing 80 contributions.')
    const de = getVotesStanceExtraStrings('de')
    expect(interpolate(de.cardsCount, { count: 80 })).toBe('Angezeigt: 80 Beiträge.')
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
