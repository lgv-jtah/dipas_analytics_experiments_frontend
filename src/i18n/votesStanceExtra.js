// Extra user-facing strings for the "Votes vs. Stance" additions: the headline
// summary block and the per-key-message views. The whole page runs on the shared
// contributions only (those with both a thumbs vote and a clearly agreeing or
// disagreeing comment).
// Mirrors the pattern in votesStance.js: English (votesStanceExtraStrings) is the
// canonical set and German (votesStanceExtraStringsDe) is overlaid on top of it by
// getVotesStanceExtraStrings('de'), so any key missing from German falls back to
// the English value rather than appearing blank. Keep keys stable; translate values.

export const votesStanceExtraStrings = {
  // -- Headline summary block (shared contributions, hand labels only) --
  summaryTitle: 'Thumbs vs. comment stance',
  summaryIntro:
    'A comparison of the thumbs with the stances of the comments, across all ' +
    'ideas that have at least one thumbs vote and at least one clearly agreeing ' +
    'or disagreeing comment.',
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
  // The secondary, every-idea-counts-once gap shown under the headline gap.
  unweightedGapLabel: 'Unweighted gap (every idea counts once)',
  // The three equivalence verdicts, keyed off equivalence.verdict from the API.
  // Each states the ±10 pp margin outcome; the undecided one also makes clear
  // that the result shows neither equivalence nor a difference.
  equivalenceEquivalent:
    'At an equivalence margin of ±10 percentage points the two sides are ' +
    'equivalent: the 90% range lies entirely within ±10 percentage points.',
  equivalenceNotEquivalent:
    'At an equivalence margin of ±10 percentage points the two sides are not ' +
    'equivalent: the 90% range lies entirely outside ±10 percentage points on ' +
    'one side.',
  equivalenceUndecided:
    'At an equivalence margin of ±10 percentage points the result is undecided: ' +
    'the 90% range does not lie entirely within ±10 percentage points. This ' +
    'shows neither that the two sides are equivalent nor that they differ.',

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
  // Accessible label / tooltip for the external link to a contribution's original
  // page on the public beteiligung.hamburg portal.
  openOriginal: 'Open the original contribution on beteiligung.hamburg',

  // -- Per-contribution cards section (single contributions, side by side) --
  cardsTitle: 'Single contributions, side by side',
  cardsIntro:
    "Each card shows one contribution's thumbs and comment stances. Single " +
    'contributions with few comments are illustrations, not evidence.',
  sortLabel: 'Sort by',
  sortGap: 'Gap (comments minus thumbs)',
  sortThumbs: 'Number of thumbs',
  sortId: 'Contribution ID',
  // {count} is filled in by the component (how many cards are shown).
  cardsCount: 'Showing {count} contributions.',
  cardsEmpty: 'No contributions to show.',

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
  // Shown in the highlight popover only when a key message has mixed-stance
  // comments (count > 0); the gold key-message rows usually omit it.
  kmMixed: 'mixed',
  kmShowComments: 'Show the comments behind these counts',
  kmNoComments: 'No comments for this group.',
  kmPanelEmpty: 'No hand-labelled key messages for this idea.',
  // Shown on a key-message row whose source passage could not be located in the
  // contribution text (so it has no highlight).
  kmNoPassage: 'Passage not found in the text',

  // -- Key-message highlights in the contribution text --
  legendTitle: 'What the colours mean',
  legendFavor: 'Mostly agreed with',
  legendAgainst: 'Mostly disagreed with',
  legendDisputed: 'Split for and against',
  legendNeutral: 'No clear stance',
  // Provenance note under the legend.
  highlightProvenanceNote:
    'The highlighted passages come from the extraction model, not from the hand ' +
    'labels, so they can be imprecise.',
  // Aria/tooltip for a highlighted passage. {km} is the key message text and
  // {favor}/{against}/{neutral} are its comment counts.
  highlightAria:
    'Key message: {km} ({favor} in favor, {against} against, {neutral} neutral)',

  // Shared states.
  loading: 'Loading…',
  error: 'Could not load this view.',
  na: 'n/a',
}

// German translation. descriptiveNote-style wording follows the stakeholder deck.
export const votesStanceExtraStringsDe = {
  summaryTitle: 'Daumen und Kommentar-Haltung',
  summaryIntro:
    'Vergleich der Daumen mit den Haltungen der Kommentare, über alle Beiträge, ' +
    'die mindestens einen Daumen und mindestens einen klar zustimmenden oder ' +
    'ablehnenden Kommentar haben.',
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
  unweightedGapLabel: 'Ungewichteter Abstand (jeder Beitrag zählt einmal)',
  equivalenceEquivalent:
    'Bei einer Äquivalenzgrenze von ±10 Prozentpunkten sind beide Seiten ' +
    'gleichwertig: Der 90%-Bereich liegt vollständig innerhalb von ±10 ' +
    'Prozentpunkten.',
  equivalenceNotEquivalent:
    'Bei einer Äquivalenzgrenze von ±10 Prozentpunkten sind beide Seiten nicht ' +
    'gleichwertig: Der 90%-Bereich liegt auf einer Seite vollständig außerhalb ' +
    'von ±10 Prozentpunkten.',
  equivalenceUndecided:
    'Bei einer Äquivalenzgrenze von ±10 Prozentpunkten ist das Ergebnis nicht ' +
    'entschieden: Der 90%-Bereich liegt nicht vollständig innerhalb von ±10 ' +
    'Prozentpunkten. Das zeigt weder, dass beide Seiten gleichwertig sind, noch ' +
    'dass sie sich unterscheiden.',

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
  openOriginal: 'Originalbeitrag auf beteiligung.hamburg öffnen',

  cardsTitle: 'Einzelne Beiträge im Vergleich',
  cardsIntro:
    'Jede Karte zeigt die Daumen und die Haltung der Kommentare eines ' +
    'Beitrags. Einzelne Beiträge mit wenigen Kommentaren sind nur ' +
    'Veranschaulichungen, kein Beleg.',
  sortLabel: 'Sortieren nach',
  sortGap: 'Abstand (Kommentare minus Daumen)',
  sortThumbs: 'Anzahl Daumen',
  sortId: 'Beitrags-Nr.',
  cardsCount: 'Angezeigt: {count} Beiträge.',
  cardsEmpty: 'Keine Beiträge vorhanden.',

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
  kmMixed: 'gemischt',
  kmShowComments: 'Kommentare hinter diesen Zahlen anzeigen',
  kmNoComments: 'Keine Kommentare in dieser Gruppe.',
  kmPanelEmpty: 'Für diesen Beitrag gibt es keine handmarkierten Kernaussagen.',
  kmNoPassage: 'Textstelle im Beitrag nicht gefunden',

  legendTitle: 'Was die Farben bedeuten',
  legendFavor: 'Überwiegend Zustimmung',
  legendAgainst: 'Überwiegend Ablehnung',
  legendDisputed: 'Geteilt, dafür und dagegen',
  legendNeutral: 'Keine klare Haltung',
  highlightProvenanceNote:
    'Die hervorgehobenen Textstellen stammen aus dem Extraktionsmodell, nicht ' +
    'aus den Handmarkierungen, und können daher ungenau sein.',
  highlightAria:
    'Kernaussage: {km} ({favor} zustimmend, {against} ablehnend, {neutral} neutral)',

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

/**
 * Build a short, single-line title from a contribution's raw content. Collapses
 * all runs of whitespace to single spaces and trims; if the result is at most
 * `maxLen` characters it is returned unchanged, otherwise it is cut to `maxLen`,
 * backtracked to the last word boundary when there is one, and suffixed with an
 * ellipsis. Returns '' for non-string input (e.g. null/undefined), so a missing
 * contribution content never renders as "null".
 */
export function makeTitle(content, maxLen = 90) {
  if (typeof content !== 'string') return ''
  const collapsed = content.replace(/\s+/g, ' ').trim()
  if (collapsed.length <= maxLen) return collapsed
  const cut = collapsed.slice(0, maxLen)
  const lastSpace = cut.lastIndexOf(' ')
  const base = lastSpace > 0 ? cut.slice(0, lastSpace) : cut
  return `${base}…`
}
