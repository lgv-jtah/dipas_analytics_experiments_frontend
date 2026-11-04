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
}

// Format a share in [0, 1] as a percentage string, or the n/a marker.
export function formatShare(value, strings = votesStanceStrings) {
  if (value === null || value === undefined) return strings.na
  return `${(value * 100).toFixed(0)}%`
}
