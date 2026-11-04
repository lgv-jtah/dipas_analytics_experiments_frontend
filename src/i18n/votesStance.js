// All user-facing strings for the "Votes vs. Stance" feature in one place, so
// a later German pass only has to translate this file (and swap the import).
// Keep keys stable; only translate the values.

export const votesStanceStrings = {
  // Navigation / titles
  navLabel: 'Votes vs. Stance',
  pageTitle: 'Votes vs. Comment Stance',
  pageDescription:
    'Per-contribution comparison of the thumbs-up share among votes and the ' +
    'favor share among comment stances.',

  // The verbatim descriptive-only caveat (also returned by the backend).
  descriptiveNote:
    'These per-contribution figures are descriptive only and are not part of ' +
    'the pre-registered vote-ratio test.',
  snapshotPrefix: 'Vote snapshot taken at',

  // Source selector
  sourceLabel: 'Comment labels',
  sourceGold: 'Gold labels',
  sourceLive: 'Live (human verdicts)',
  sourceModel: 'Model predictions',
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

  // Scatter
  scatterTitle: 'Thumbs-up share vs. comment favor share',
  axisX: 'Thumbs-up share (%)',
  axisY: 'Comment favor share (%)',
  scatterHint:
    'Each point is one contribution; circle size reflects the number of ' +
    'labelled comments. The diagonal marks perfect agreement.',
  scatterEmpty: 'No contributions have both a vote share and a favor share here.',

  // Table
  table: {
    contribution: 'Contribution',
    thumbsUpShare: 'Thumbs-up share',
    favorShare: 'Favor share',
    difference: 'Difference',
    nComments: 'Comments',
    counts: 'Counts (favor / against / neutral / mixed)',
  },

  // States
  loading: 'Loading…',
  error: 'Could not load data. Is the backend running and the export present?',
  na: 'n/a',
}

// Format a share in [0, 1] as a percentage string, or the n/a marker.
export function formatShare(value, strings = votesStanceStrings) {
  if (value === null || value === undefined) return strings.na
  return `${(value * 100).toFixed(0)}%`
}
