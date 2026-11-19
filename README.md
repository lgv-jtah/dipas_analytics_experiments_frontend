# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Testing

Unit tests run on [Vitest](https://vitest.dev/) in a jsdom environment (configured in `vite.config.js`).

```bash
npm run test       # run the suite once
npm run test:cov   # run with a v8 coverage report
```

Coverage is scoped to the files behind the votes-stance views: the "shared ideas" summary bars (`src/components/molecules/VotesStanceSummary.vue` and `src/i18n/votesStanceExtra.js`), the per-contribution cards (`src/components/molecules/ContributionCardsSection.vue` and `src/pages/VotesStance.vue`), and the contribution-page key-message highlights (`src/components/molecules/HighlightedContributionText.vue`, `KeyMessageHighlightLegend.vue`, `KeyMessageStancePanel.vue` and `src/pages/ContributionDetail.vue`); the specs live under the `__tests__/` folders beside them.

## Votes vs. Stance — contribution cards

Below the overall summary, the Votes vs. Stance page lists one card per contribution. Each card reuses `VoteStanceBars` to draw that contribution's thumbs bar and comment-stance bar under a header (`#id` + truncated contribution text) that links to the contribution's detail page. By default the list shows only contributions that have at least one thumbs vote and at least one clear comment; a checkbox reveals all of them. Cards sort by the comments-minus-thumbs gap (default, most negative first, missing values last), by number of thumbs, or by id. This section is exploratory context and is marked "not pre-registered". Titles are fetched from `GET /contributions` in one parallel request and fail soft (cards fall back to the id alone).

## Contribution page — key-message highlights

On a gold contribution's detail page, the contribution text highlights each hand-labelled key message's located source passage(s), coloured by how the comments on that key message lean. `ContributionDetail.vue` fetches the gold key messages (`GET /contributions/{id}/votes-stance/key-messages`), gives each one a stable id, and passes them to both `HighlightedContributionText.vue` (the coloured text) and `KeyMessageStancePanel.vue` (the list of key messages with their comment counts). Hovering, focusing or clicking a passage or a panel row activates that key message in both places (two-way linking); clicking again clears it.

- **Colours** follow the backend's `highlight_stance`: green = mostly agreed with (`favor`), red = mostly disagreed with (`against`), amber = split for and against (`disputed`), grey = no clear stance (`neutral`). A small legend (`KeyMessageHighlightLegend.vue`) names them and notes that the highlighted passages come from the extraction model — not the hand labels — so they can be imprecise.
- **Overlaps and precedence.** `HighlightedContributionText` segments the text at every span boundary into non-overlapping pieces, so a stretch covered by several key messages is still one piece. Its colour is the active key message's when one covers the piece, otherwise the precedence winner among the covering key messages (`against` > `disputed` > `favor` > `neutral`). Span offsets are clamped to the text bounds and empty/inverted spans dropped, so a stale offset can never slice outside the string. The text is rendered with interpolation only (never `v-html`).
- **No highlight.** A key message whose source passage could not be located has empty `spans`; its panel row shows a short "passage not found" note and nothing is highlighted in the text. When the export carries no span artifact at all (`spans_source` is `null`), the page falls back to plain contribution text.
