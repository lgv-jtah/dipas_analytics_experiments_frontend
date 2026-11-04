// All user-facing strings for the "Votes vs. Stance" feature in one place.
// English (votesStanceStrings) is the canonical set; German (votesStanceStringsDe)
// is overlaid on top of it by getVotesStanceStrings('de'), so any key missing from
// German falls back to the English value rather than appearing blank.
//
// The German terms follow the stakeholder deck. In particular, descriptiveNote in
// German is a translation of the verbatim English caveat below (which the backend
// also returns), so the two descriptiveNote values must be kept in sync whenever
// either one changes.
// Keep keys stable; only translate the values.

export const votesStanceStrings = {
  // Navigation / titles
  navLabel: 'Votes vs. Stance',
  pageTitle: 'Votes vs. Comment Stance',
  pageDescription:
    'Per-contribution comparison of the thumbs-up share among votes and the ' +
    'favor share among comment stances.',

  // Plain-language introduction shown at the top of the page.
  pageIntro:
    'This page compares two things people can do with a citizen\'s idea (we ' +
    'call each idea a "contribution"). They can give the idea a thumbs up or a ' +
    'thumbs down. They can also write a comment, and each comment gets a label ' +
    'that says whether it agrees or disagrees. Here you can see whether the ' +
    'thumbs and the comments tell the same story.',

  // The verbatim descriptive-only caveat. This exact wording is shared with the
  // backend (the API returns the same string), so it must stay separate from the
  // descriptiveNotePlain restatement below and must not be reworded on its own.
  // The German descriptiveNote is a translation of this exact wording; keep both in sync.
  descriptiveNote:
    'These per-contribution figures are descriptive only and are not part of ' +
    'the pre-registered vote-ratio test.',
  // A plain-language restatement of the descriptive-only caveat.
  descriptiveNotePlain:
    'In plain words: this page only shows the numbers side by side. It cannot ' +
    'prove whether thumbs and comments really match. That question was looked ' +
    'at separately, in a carefully planned test across all ideas together.',
  snapshotPrefix: 'Vote snapshot taken at',

  // Source selector
  sourceLabel: 'Comment labels',
  sourceGold: 'Gold labels',
  sourceLive: 'Live (human verdicts)',
  sourceModel: 'Model predictions',
  // Plain-language help for the comment-labels source selector.
  sourceHelp:
    '"Comment labels" lets you choose who decided whether each comment agrees ' +
    'or disagrees. Gold labels: a person read and labelled the comments. These ' +
    'are the ones we trust most. Live: people are checking the computer\'s ' +
    'labels right now, so this may cover only part of a comment. Model: a ' +
    'computer program decided, and it can make mistakes.',
  modelLabel: 'Model',
  evaluatorLabel: 'Evaluator',
  evaluatorAll: 'All evaluators',
  liveHint:
    'Live labels are human verdicts resolved against the loaded model. A ' +
    "comment's live category is based only on its verified pairs and may not " +
    'represent the whole comment.',
  liveContributionsWithData: 'contributions with live data',
  pairsVerified: 'Pairs verified',
  partiallyVerifiedComments: 'partially verified comments',

  // Vote / stance bar blocks
  votesBarTitle: 'Votes',
  commentsBarTitle: 'Comment stances',
  votesPro: 'Thumbs up',
  votesContra: 'Thumbs down',
  catFavor: 'In favor',
  catAgainst: 'Against',
  catNeutral: 'Neutral',
  catMixed: 'Mixed',
  noVotes: 'No vote data for this contribution.',
  noComments: 'No comment labels for this contribution under this source.',
  // Plain-language introduction for the per-contribution two-bar panel.
  panelIntro:
    'These two bars show how people reacted to this idea. One bar shows the ' +
    'thumbs up and thumbs down. The other shows the comments: how many are in ' +
    'favor, against, neutral or mixed. The percentage next to the comments ' +
    'counts only the clear ones (in favor and against). With only a few ' +
    'comments, this percentage can jump a lot, so don\'t read too much into it.',

  // Scatter
  scatterTitle: 'Thumbs-up share vs. comment favor share',
  axisX: 'Thumbs-up share (%)',
  axisY: 'Comment favor share (%)',
  scatterHint:
    'Every dot is one idea. The further right a dot sits, the more of its ' +
    'thumbs were thumbs up. The higher it sits, the more of its clear comments ' +
    'agreed. A bigger dot means the idea has more labelled comments. If a dot ' +
    'is on the dashed diagonal line, the thumbs and the comments tell the same ' +
    'story. But be careful: many ideas have only one clear comment, so that ' +
    'dot can only sit at 0% or 100%, and one dot on its own does not tell you ' +
    'much. Ideas without any thumbs or without any clear comment are not shown ' +
    'here.',
  scatterEmpty: 'No contributions have both a vote share and a favor share here.',
  // Plain-language definition of a "clear" comment, shown as a caption. This must
  // describe exactly the comments counted in the favor share (the favor-or-against
  // group), so if that roll-up changes, this wording has to change with it.
  clearComment:
    'A clear comment takes one side. It agrees with at least one main point of ' +
    'the idea and disagrees with none, or it disagrees with at least one and ' +
    'agrees with none. It does not have to say anything about the other main ' +
    'points. Comments that take no side (neutral) or both sides (mixed) are not ' +
    'clear.',
  // Parts of the "how many dots are shown" caption. Assembled by formatDotCount.
  dotCount: {
    shown: 'Showing {shown} of {total} {unit} as dots.',
    missingOne:
      'The other one has no thumbs or no clear comment, so it cannot be placed.',
    missingMany:
      'The other {missing} have no thumbs or no clear comment, so they cannot ' +
      'be placed.',
    overlap:
      'Dots can lie on top of each other, so fewer dots may be visible than ' +
      'this number.',
    unitOne: 'contribution',
    unitOther: 'contributions',
  },

  // Table
  table: {
    contribution: 'Contribution',
    thumbsUpShare: 'Thumbs-up share',
    favorShare: 'Favor share',
    difference: 'Difference',
    nComments: 'Comments',
    counts: 'Counts (favor / against / neutral / mixed)',
  },

  // Plain-language help explaining what each table column means, written at about
  // a 12-year-old reading level so any reader can follow it. The wording was
  // checked against the actual calculations in VotesStance.vue (for example,
  // difference = favor share minus thumbs-up share, and favor share =
  // favor / (favor + against)), so if those formulas change, update these
  // explanations to match.
  tableHelp: {
    title: 'What the columns mean',
    contribution:
      'Contribution: one idea sent in by a citizen. Each idea has its own row. ' +
      'Click a row to open the idea.',
    thumbsUpShare:
      'Thumbs-up share: out of all the thumbs on this idea, the percentage ' +
      'that were thumbs up. 100% means every vote was a thumbs up.',
    favorShare:
      'Favor share: out of the comments that clearly agreed or disagreed, the ' +
      'percentage that agreed. Neutral and mixed comments are left out, so it ' +
      'is favor ÷ (favor + against). Example: 3 in favor and 1 against makes ' +
      '75%.',
    difference:
      'Difference: the favor share minus the thumbs-up share. It is shown in ' +
      '"pp" (percentage points), which simply means the gap between two ' +
      'percentages. Example: 70% minus 90% is -20 pp. A minus means the ' +
      'comments look less positive than the thumbs. A plus means the comments ' +
      'look more positive than the thumbs.',
    nComments:
      'Comments: how many comments on this idea have a label, including ' +
      'neutral and mixed ones.',
    counts:
      'Counts: how many comments are in each group. An idea is made up of ' +
      'several main points. Favor: agrees with at least one point and ' +
      'disagrees with none. Against: disagrees with at least one point and ' +
      'agrees with none. Neutral: takes no side on any point, like a question ' +
      'or a side note. Mixed: agrees with one point and disagrees with another.',
    na:
      'n/a means "not available": there is nothing to calculate yet, for ' +
      'example when an idea has no votes or no clear comments.',
  },

  // States
  loading: 'Loading…',
  error: 'Could not load data. Is the backend running and the export present?',
  na: 'n/a',

  // Inline lower-case variants used mid-sentence next to a percentage.
  votesProInline: 'thumbs up',
  catFavorInline: 'in favor',

  // Language switch
  languageLabel: 'Language',
  langEnglish: 'English',
  langGerman: 'German',

  // Formatting tokens
  pctSuffix: '%',
  diffPlus: '+',
  diffMinus: '-',
  diffSuffix: ' pp',
}

// German translation. The terms follow the stakeholder deck. descriptiveNote here
// is a translation of the verbatim English caveat above, so keep the two in sync.
export const votesStanceStringsDe = {
  navLabel: 'Daumen und Kommentare',
  pageTitle: 'Daumen und Kommentare im Vergleich',
  pageDescription:
    'Vergleich je Beitrag: Anteil der Daumen hoch bei den Abstimmungen und ' +
    'Zustimmungsanteil bei den Kommentaren.',

  pageIntro:
    'Diese Seite vergleicht zwei Dinge, die Menschen mit dem Vorschlag einer ' +
    'Bürgerin oder eines Bürgers tun können. Jeder Vorschlag heißt hier „Beitrag“. ' +
    'Menschen können einem Beitrag einen Daumen hoch oder einen Daumen runter ' +
    'geben. Sie können auch einen Kommentar schreiben. Jeder Kommentar bekommt ' +
    'eine Markierung, die sagt, ob er zustimmt oder ablehnt. Hier ist zu sehen, ' +
    'ob die Daumen und die Kommentare dasselbe aussagen.',

  descriptiveNote:
    'Diese Zahlen je Beitrag sind nur beschreibend und gehören nicht zur vorab ' +
    'festgelegten Prüfung des Verhältnisses von Daumen und Kommentaren.',
  descriptiveNotePlain:
    'Einfach gesagt: Diese Seite stellt die Zahlen nur nebeneinander. Sie kann ' +
    'nicht beweisen, ob Daumen und Kommentare wirklich zusammenpassen. Diese ' +
    'Frage wurde getrennt untersucht, in einem sorgfältig geplanten Test über ' +
    'alle Beiträge zusammen.',
  snapshotPrefix: 'Stand der Daumen',

  sourceLabel: 'Markierungen der Kommentare',
  sourceGold: 'Handbewertung',
  sourceLive: 'Live (menschliche Urteile)',
  sourceModel: 'Computer-Vorhersagen',
  sourceHelp:
    '„Markierungen der Kommentare“ legt fest, wer entschieden hat, ob ein ' +
    'Kommentar zustimmt oder ablehnt. Handbewertung: Ein Mensch hat die ' +
    'Kommentare gelesen und markiert. Diesen Markierungen vertrauen wir am ' +
    'meisten. Live: Menschen prüfen gerade die Markierungen des Computers. ' +
    'Deshalb gilt das vielleicht nur für einen Teil eines Kommentars. ' +
    'Computer-Vorhersagen: Ein Computerprogramm hat entschieden, und es kann ' +
    'Fehler machen.',
  modelLabel: 'Modell',
  evaluatorLabel: 'Prüfende Person',
  evaluatorAll: 'Alle prüfenden Personen',
  liveHint:
    'Live-Markierungen sind menschliche Urteile, abgeglichen mit dem geladenen ' +
    'Modell. Die Live-Einordnung eines Kommentars beruht nur auf seinen ' +
    'geprüften Bewertungspaaren und gibt vielleicht nicht den ganzen Kommentar ' +
    'wieder.',
  liveContributionsWithData: 'Beiträge mit Live-Daten',
  pairsVerified: 'Geprüfte Paare',
  partiallyVerifiedComments: 'teilweise geprüfte Kommentare',

  votesBarTitle: 'Daumen',
  commentsBarTitle: 'Haltung der Kommentare',
  votesPro: 'Daumen hoch',
  votesContra: 'Daumen runter',
  catFavor: 'Zustimmend',
  catAgainst: 'Ablehnend',
  catNeutral: 'Neutral',
  catMixed: 'Gemischt',
  noVotes: 'Für diesen Beitrag gibt es keine Daumen-Daten.',
  noComments:
    'Für diesen Beitrag gibt es bei dieser Auswahl keine markierten Kommentare.',
  panelIntro:
    'Diese zwei Balken zeigen, wie Menschen auf diesen Beitrag reagiert haben. ' +
    'Ein Balken zeigt die Daumen hoch und Daumen runter. Der andere zeigt die ' +
    'Kommentare: wie viele zustimmend, ablehnend, neutral oder gemischt sind. ' +
    'Der Prozentwert neben den Kommentaren zählt nur die eindeutigen ' +
    '(zustimmend und ablehnend). Bei wenigen Kommentaren kann dieser Wert stark ' +
    'springen. Dann sagt er nicht viel aus.',

  scatterTitle: 'Anteil Daumen hoch und Zustimmungsanteil der Kommentare',
  axisX: 'Anteil Daumen hoch (%)',
  axisY: 'Zustimmungsanteil der Kommentare (%)',
  scatterHint:
    'Jeder Punkt ist ein Beitrag. Je weiter rechts ein Punkt liegt, desto mehr ' +
    'seiner Daumen zeigen nach oben. Je höher er liegt, desto mehr seiner ' +
    'eindeutigen Kommentare stimmen zu. Ein größerer Punkt bedeutet, dass der ' +
    'Beitrag mehr markierte Kommentare hat. Liegt ein Punkt auf der ' +
    'gestrichelten Diagonale, sagen die Daumen und die Kommentare dasselbe aus. ' +
    'Aber Vorsicht: Viele Beiträge haben nur einen eindeutigen Kommentar. So ein ' +
    'Punkt kann nur bei 0 % oder 100 % liegen, und ein einzelner Punkt sagt ' +
    'wenig aus. Beiträge ohne Daumen oder ohne eindeutigen Kommentar sind hier ' +
    'nicht zu sehen.',
  scatterEmpty:
    'Hier gibt es keine Beiträge, die sowohl einen Anteil Daumen hoch als auch ' +
    'einen Zustimmungsanteil haben.',
  clearComment:
    'Ein eindeutiger Kommentar entscheidet sich für eine Seite. Er stimmt ' +
    'mindestens einer Kernaussage des Beitrags zu und lehnt keine ab, oder er ' +
    'lehnt mindestens eine ab und stimmt keiner zu. Zu den anderen Kernaussagen ' +
    'muss er nichts sagen. Kommentare, die sich für keine Seite entscheiden ' +
    '(neutral) oder für beide (gemischt), sind nicht eindeutig.',
  dotCount: {
    shown: 'Als Punkte dargestellt: {shown} von {total} {unit}.',
    missingOne:
      'Der übrige Beitrag hat keine Daumen oder keinen eindeutigen Kommentar ' +
      'und kann nicht dargestellt werden.',
    missingMany:
      'Die übrigen {missing} Beiträge haben keine Daumen oder keinen ' +
      'eindeutigen Kommentar und können nicht dargestellt werden.',
    overlap:
      'Punkte können aufeinanderliegen. Dann sind vielleicht weniger Punkte zu ' +
      'sehen, als die Zahl angibt.',
    unitOne: 'Beitrag',
    unitOther: 'Beiträgen',
  },

  table: {
    contribution: 'Beitrag',
    thumbsUpShare: 'Anteil Daumen hoch',
    favorShare: 'Zustimmungsanteil',
    difference: 'Abstand',
    nComments: 'Kommentare',
    counts: 'Anzahl (zustimmend / ablehnend / neutral / gemischt)',
  },

  tableHelp: {
    title: 'Was die Spalten bedeuten',
    contribution:
      'Beitrag: ein Vorschlag, den eine Bürgerin oder ein Bürger eingereicht ' +
      'hat. Jeder Beitrag hat eine eigene Zeile. Ein Klick auf die Zeile öffnet ' +
      'den Beitrag.',
    thumbsUpShare:
      'Anteil Daumen hoch: wie viel Prozent aller Daumen bei diesem Beitrag ' +
      'nach oben zeigen. 100 % bedeutet: Alle Daumen zeigen nach oben.',
    favorShare:
      'Zustimmungsanteil: Von den Kommentaren, die eindeutig zustimmen oder ablehnen, ' +
      'wie viel Prozent zustimmen. Neutrale und gemischte Kommentare zählen ' +
      'nicht mit. Die Rechnung ist also: zustimmend ÷ (zustimmend + ablehnend). ' +
      'Beispiel: 3 zustimmend und 1 ablehnend ergeben 75 %.',
    difference:
      'Abstand: Zustimmungsanteil minus Anteil Daumen hoch. Er wird in „PP“ ' +
      '(Prozentpunkten) angezeigt. Das ist einfach der Abstand zwischen zwei ' +
      'Prozentwerten. Beispiel: 70 % minus 90 % sind −20 PP. Ein Minus bedeutet, ' +
      'dass die Kommentare weniger positiv wirken als die Daumen. Ein Plus ' +
      'bedeutet, dass die Kommentare positiver wirken als die Daumen.',
    nComments:
      'Kommentare: wie viele Kommentare bei diesem Beitrag eine Markierung ' +
      'haben, auch neutrale und gemischte.',
    counts:
      'Anzahl: wie viele Kommentare in jeder Gruppe sind. Ein Beitrag besteht ' +
      'aus mehreren Kernaussagen, also seinen wichtigsten Punkten. Zustimmend: ' +
      'stimmt mindestens einer Kernaussage zu und lehnt keine ab. Ablehnend: ' +
      'lehnt mindestens eine Kernaussage ab und stimmt keiner zu. Neutral: nimmt ' +
      'zu keiner Kernaussage Stellung, zum Beispiel eine Frage oder ein Hinweis. ' +
      'Gemischt: stimmt einer Kernaussage zu und lehnt eine andere ab.',
    na:
      'k. A. bedeutet „keine Angabe“: Es gibt noch nichts zu berechnen, zum ' +
      'Beispiel wenn ein Beitrag keine Daumen oder keine eindeutigen Kommentare ' +
      'hat.',
  },

  loading: 'Wird geladen…',
  error:
    'Daten konnten nicht geladen werden. Läuft das Backend und ist der Export ' +
    'vorhanden?',
  na: 'k. A.',

  votesProInline: 'Daumen hoch',
  catFavorInline: 'zustimmend',

  languageLabel: 'Sprache',
  langEnglish: 'Englisch',
  langGerman: 'Deutsch',

  pctSuffix: ' %',
  diffPlus: '+',
  diffMinus: '−',
  diffSuffix: ' PP',
}

// True for a plain object (used to decide where to recurse in the deep merge).
function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/**
 * Deeply overlay `overlay` onto `base`, returning a new object. Nested plain
 * objects (table, tableHelp) are merged recursively, so a key present only in
 * `base` is preserved and a key present only in `overlay` is added. This is what
 * lets the German set be a partial overlay on the English canon: any key missing
 * from German falls through to its English value instead of going blank.
 */
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

// Memoized per-language string sets: English as-is, German overlaid on English.
const cache = {}

/**
 * Return the resolved string set for `lang`: 'de' yields the German overlay
 * merged onto the English canon, and any other value yields English unchanged.
 * Results are memoized per language in `cache` so the merge runs at most once.
 */
export function getVotesStanceStrings(lang) {
  const key = lang === 'de' ? 'de' : 'en'
  if (cache[key]) return cache[key]
  cache[key] =
    key === 'de' ? deepMerge(votesStanceStrings, votesStanceStringsDe) : votesStanceStrings
  return cache[key]
}

/**
 * Format a share in [0, 1] as a whole-number percentage string, or the n/a
 * marker when the value is null/undefined. `strings` supplies the locale's
 * percent suffix and n/a text, and defaults to the English set.
 */
export function formatShare(value, strings = votesStanceStrings) {
  if (value === null || value === undefined) return strings.na
  return `${(value * 100).toFixed(0)}${strings.pctSuffix}`
}

/**
 * Replace every `{key}` token in `template` with `String(vars[key])`. Tokens
 * whose key is not present in `vars` are left untouched, so a template can carry
 * literal braces for keys it does not fill.
 */
export function interpolate(template, vars) {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    vars != null && key in vars ? String(vars[key]) : match
  )
}

/**
 * Build the "how many dots are shown" caption from a locale's `dotCount` block.
 * `shown` of `total` contributions are plotted and `missing` could not be.
 * Picks the singular unit when `total === 1`, states how many are missing (one,
 * many, or omits the clause when none), and always appends the overlap caveat.
 * The parts are joined with single spaces into one sentence group.
 */
export function formatDotCount(strings, { shown, total, missing }) {
  const dc = strings.dotCount
  const unit = total === 1 ? dc.unitOne : dc.unitOther
  const parts = [interpolate(dc.shown, { shown, total, unit })]
  if (missing === 1) parts.push(dc.missingOne)
  else if (missing > 1) parts.push(interpolate(dc.missingMany, { missing }))
  parts.push(dc.overlap)
  return parts.join(' ')
}
