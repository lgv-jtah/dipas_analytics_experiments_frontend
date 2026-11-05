// Extra user-facing strings for the "Votes vs. Stance" additions: the overall
// summary block, the shared-contributions block and the per-key-message views.
// Mirrors the pattern in votesStance.js: English (votesStanceExtraStrings) is the
// canonical set and German (votesStanceExtraStringsDe) is overlaid on top of it by
// getVotesStanceExtraStrings('de'), so any key missing from German falls back to
// the English value rather than appearing blank. Keep keys stable; translate values.

export const votesStanceExtraStrings = {
  // -- Overall summary block --
  summaryTitle: 'Thumbs vs. comment stance, overall',
  summaryIntro:
    'Across all ideas together, this compares how people voted with how the ' +
    'comments were labelled. These overall figures were planned in advance.',
  thumbsBarTitle: 'Thumbs',
  commentsBarTitle: 'Comment stances',
  thumbsUp: 'Thumbs up',
  thumbsDown: 'Thumbs down',
  inFavor: 'In favor',
  against: 'Against',
  neutral: 'Neutral',
  // {count} of {total} comments have no clear stance ({neutral} neutral, {mixed} mixed)
  noClearStance:
    '{count} of {total} comments have no clear stance ({neutral} neutral, {mixed} mixed).',
  gapLabel: 'Gap (comments minus thumbs)',
  rangeLabel: '90% range',
  // Plain statement that equivalence is not shown and a difference is not proven.
  equivalenceNote:
    'This does not show that the two sides are equivalent, and it does not ' +
    'prove that they differ either.',

  // -- Shared-contributions block (not pre-registered) --
  notPreRegistered: 'not pre-registered',
  sharedTitle: 'Only ideas that have both thumbs and clear comments',
  sharedIntro:
    'This narrower view keeps only the ideas that have both at least one ' +
    'thumbs vote and at least one comment with a clear stance. It was not ' +
    'planned in advance, so read it as extra context.',
  // {thumbs} ideas with thumbs, {comment} with a clear comment, {both} with both
  sharedCounts:
    '{thumbs} ideas have thumbs, {comment} have a clear comment, {both} have both.',
  pooledLabel: 'Pooled (bigger ideas count more)',
  unweightedLabel: 'Unweighted (every idea counts once)',

  // -- Key-message overview (two lists) --
  overviewTitle: 'Key messages people agreed or disagreed with most',
  mostAgreed: 'Most agreed with',
  mostRejected: 'Most disagreed with',
  overviewCounts: 'in favor / against / neutral',
  overviewMinNote:
    'Only key messages with at least 3 comments that take a clear stance are ' +
    'listed here.',
  overviewEmpty: 'No key messages have enough comments with a clear stance yet.',
  openContribution: 'Open idea #{id}',

  // -- Per-key-message panel on the contribution page --
  kmPanelTitle: 'Hand-labelled key messages',
  kmPanelIntro:
    'These are the key messages a person read and labelled by hand. What ' +
    'comments express agreement or disagreement with each one is shown below. ' +
    'This list is separate from the model key-message list on this page and may ' +
    'word the key messages differently.',
  kmTooFew: 'too few comments',
  kmInFavor: 'In favor',
  kmAgainst: 'Against',
  kmNeutral: 'Neutral',
  kmShowComments: 'Show the comments behind these counts',
  kmNoComments: 'No comments for this group.',
  kmPanelEmpty: 'No hand-labelled key messages for this idea.',

  // Shared states.
  loading: 'Loading…',
  error: 'Could not load this view.',
  na: 'n/a',
}

// German translation. descriptiveNote-style wording follows the stakeholder deck.
export const votesStanceExtraStringsDe = {
  summaryTitle: 'Daumen und Kommentar-Haltung insgesamt',
  summaryIntro:
    'Über alle Beiträge zusammen wird hier verglichen, wie abgestimmt wurde und ' +
    'wie die Kommentare markiert wurden. Diese Gesamtzahlen wurden vorab festgelegt.',
  thumbsBarTitle: 'Daumen',
  commentsBarTitle: 'Haltung der Kommentare',
  thumbsUp: 'Daumen hoch',
  thumbsDown: 'Daumen runter',
  inFavor: 'Zustimmend',
  against: 'Ablehnend',
  neutral: 'Neutral',
  noClearStance:
    '{count} von {total} Kommentaren ohne klare Haltung ({neutral} neutral, {mixed} gemischt).',
  gapLabel: 'Abstand (Kommentare minus Daumen)',
  rangeLabel: '90%-Bereich',
  equivalenceNote:
    'Das zeigt nicht, dass beide Seiten gleichwertig sind, und es beweist auch ' +
    'nicht, dass sie sich unterscheiden.',

  notPreRegistered: 'nicht vorab festgelegt',
  sharedTitle: 'Nur Beiträge mit Daumen und eindeutigen Kommentaren',
  sharedIntro:
    'Diese engere Ansicht behält nur die Beiträge, die sowohl mindestens einen ' +
    'Daumen als auch mindestens einen Kommentar mit klarer Haltung haben. Sie ' +
    'wurde nicht vorab festgelegt und ist daher nur als Zusatz zu lesen.',
  sharedCounts:
    '{thumbs} Beiträge haben Daumen, {comment} haben einen eindeutigen Kommentar, ' +
    '{both} haben beides.',
  pooledLabel: 'Gepoolt (größere Beiträge zählen mehr)',
  unweightedLabel: 'Ungewichtet (jeder Beitrag zählt einmal)',

  overviewTitle: 'Kernaussagen mit der meisten Zustimmung und Ablehnung',
  mostAgreed: 'Größte Zustimmung',
  mostRejected: 'Größte Ablehnung',
  overviewCounts: 'zustimmend / ablehnend / neutral',
  overviewMinNote:
    'Hier werden nur Kernaussagen mit mindestens 3 Kommentaren mit einer klaren ' +
    'Haltung aufgeführt.',
  overviewEmpty:
    'Noch keine Kernaussage hat genug Kommentare mit einer klaren Haltung.',
  openContribution: 'Beitrag #{id} öffnen',

  kmPanelTitle: 'Handmarkierte Kernaussagen',
  kmPanelIntro:
    'Dies sind die Kernaussagen, die ein Mensch gelesen und von Hand markiert ' +
    'hat. Darunter steht, welche Kommentare jeder Kernaussage zustimmen oder sie ' +
    'ablehnen. Diese Liste ist getrennt von der Modell-Kernaussagenliste auf ' +
    'dieser Seite und kann die Kernaussagen anders formulieren.',
  kmTooFew: 'zu wenige Kommentare',
  kmInFavor: 'Zustimmend',
  kmAgainst: 'Ablehnend',
  kmNeutral: 'Neutral',
  kmShowComments: 'Kommentare hinter diesen Zahlen anzeigen',
  kmNoComments: 'Keine Kommentare in dieser Gruppe.',
  kmPanelEmpty: 'Für diesen Beitrag gibt es keine handmarkierten Kernaussagen.',

  loading: 'Wird geladen…',
  error: 'Diese Ansicht konnte nicht geladen werden.',
  na: 'k. A.',
}

// True for a plain object (used to decide where to recurse in the deep merge).
function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

// Deeply overlay `overlay` onto `base`, returning a new object (same behaviour as
// the deepMerge in votesStance.js), so the German set can be a partial overlay.
function deepMerge(base, overlay) {
  const out = {}
  for (const key of Object.keys(base)) {
    const b = base[key]
    const o = overlay ? overlay[key] : undefined
    if (isPlainObject(b) && isPlainObject(o)) {
      out[key] = deepMerge(b, o)
    } else if (o !== undefined) {
      out[key] = o
    } else {
      out[key] = b
    }
  }
  if (overlay) {
    for (const key of Object.keys(overlay)) {
      if (!(key in out)) out[key] = overlay[key]
    }
  }
  return out
}

const cache = {}

/**
 * Return the resolved extra string set for `lang`: 'de' yields the German overlay
 * merged onto the English canon; any other value yields English unchanged.
 * Memoized per language.
 */
export function getVotesStanceExtraStrings(lang) {
  const key = lang === 'de' ? 'de' : 'en'
  if (cache[key]) return cache[key]
  cache[key] =
    key === 'de'
      ? deepMerge(votesStanceExtraStrings, votesStanceExtraStringsDe)
      : votesStanceExtraStrings
  return cache[key]
}

/**
 * Replace every `{key}` token in `template` with `String(vars[key])`. Tokens whose
 * key is not present in `vars` are left untouched.
 */
export function interpolate(template, vars) {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    vars != null && key in vars ? String(vars[key]) : match
  )
}

/**
 * Format a number for display in the given language. German uses a decimal comma
 * and the typographic minus sign (U+2212); English uses a dot and an ASCII hyphen.
 * `value` is a plain Number (e.g. a percent already on a 0..100 scale). Returns the
 * n/a marker for null/undefined/NaN.
 */
export function formatNumber(value, lang, { digits = 1 } = {}) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return lang === 'de' ? 'k. A.' : 'n/a'
  }
  const locale = lang === 'de' ? 'de-DE' : 'en-US'
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)
}

/**
 * Format a percentage value already on a 0..100 scale, appending the per-language
 * percent suffix (German puts a space before the %).
 */
export function formatPercent(value, lang, { digits = 1 } = {}) {
  const na = lang === 'de' ? 'k. A.' : 'n/a'
  if (value === null || value === undefined || Number.isNaN(value)) return na
  const suffix = lang === 'de' ? ' %' : '%'
  return `${formatNumber(value, lang, { digits })}${suffix}`
}

/**
 * Format a signed difference in percentage points, with an explicit plus or the
 * per-language minus sign, and the " pp" / " PP" suffix.
 */
export function formatSignedPp(value, lang, { digits = 1 } = {}) {
  const na = lang === 'de' ? 'k. A.' : 'n/a'
  if (value === null || value === undefined || Number.isNaN(value)) return na
  const suffix = lang === 'de' ? ' PP' : ' pp'
  // Format the magnitude, then prepend the right sign glyph (Intl would use the
  // ASCII hyphen for negatives, but German wants U+2212).
  const magnitude = formatNumber(Math.abs(value), lang, { digits })
  const minus = lang === 'de' ? '−' : '-'
  const sign = value < 0 ? minus : '+'
  return `${sign}${magnitude}${suffix}`
}
