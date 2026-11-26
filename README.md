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

Coverage is scoped to the files behind the votes-stance views: the headline summary bars (`src/components/molecules/VotesStanceSummary.vue` and `src/i18n/votesStanceExtra.js`), the per-contribution cards (`src/components/molecules/ContributionCardsSection.vue` and `src/pages/VotesStance.vue`), and the contribution-page key-message highlights (`src/components/molecules/HighlightedContributionText.vue`, `KeyMessageHighlightLegend.vue`, `KeyMessageStancePanel.vue` and `src/pages/ContributionDetail.vue`); the specs live under the `__tests__/` folders beside them.

## Votes vs. Stance — contribution cards

Below the headline summary, the Votes vs. Stance page lists one card per contribution. The whole page runs on the shared contributions only — those with both a thumbs vote and a comment carrying a clear stance — which the backend already restricts the overview rows to, so the page simply shows every row it receives (no "show all" toggle and no separate shared block). Each card reuses `VoteStanceBars` to draw that contribution's thumbs bar and comment-stance bar under a header (`#id` + truncated contribution text) that links to the contribution's detail page. Cards sort by the comments-minus-thumbs gap (default, most negative first, missing values last), by number of thumbs, or by id. Titles are fetched from `GET /contributions` in one parallel request and fail soft (cards fall back to the id alone).

## Contribution page — key-message highlights

On a gold contribution's detail page, the contribution text highlights each hand-labelled key message's located source passage(s), coloured by how the comments on that key message lean. `ContributionDetail.vue` fetches the gold key messages (`GET /contributions/{id}/votes-stance/key-messages`), gives each one a stable id, and passes them to both `HighlightedContributionText.vue` (the coloured text) and `KeyMessageStancePanel.vue` (the list of key messages with their comment counts).

Hover and pin are separate interactions:

- **Hover (or keyboard focus) a highlighted passage** shows a small popover at that passage listing the covering key message(s) and their comment counts. This is purely local — it does not change which key message is active, so the panel's emphasis stays put. A short grace period keeps the popover open while the pointer travels from the passage onto it.
- **Click a passage or a panel row pins** that key message as the page-level active one, emphasises its passages/row in both places, and scrolls the *other* side into view: pinning from the text scrolls the panel row, pinning from the panel scrolls the passage (neither scrolls its own element). On touch, a tap both opens the popover and pins.
- **Unpin / dismiss:** pressing `Esc`, clicking the pinned passage/row again, or (on touch) tapping outside the passage and popover clears the pin and closes the popover.

- **Colours** follow the backend's `highlight_stance`: green = mostly agreed with (`favor`), red = mostly disagreed with (`against`), amber = split for and against (`disputed`), grey = no clear stance (`neutral`). A small legend (`KeyMessageHighlightLegend.vue`) names them and notes that the highlighted passages come from the extraction model — not the hand labels — so they can be imprecise.
- **Overlaps and precedence.** `HighlightedContributionText` segments the text at every span boundary into non-overlapping pieces, so a stretch covered by several key messages is still one piece. Its colour is the active key message's when one covers the piece, otherwise the precedence winner among the covering key messages (`against` > `disputed` > `favor` > `neutral`). Span offsets are clamped to the text bounds and empty/inverted spans dropped, so a stale offset can never slice outside the string. The text is rendered with interpolation only (never `v-html`).
- **No highlight.** A key message whose source passage could not be located has empty `spans`; its panel row shows a short "passage not found" note and nothing is highlighted in the text. When the export carries no span artifact at all (`spans_source` is `null`), the page falls back to plain contribution text.

## Link to the original contribution

Several views show a small external-link icon (↗) next to a contribution id: the `ContributionLink` atom (`src/components/atoms/ContributionLink.vue`). Clicking it opens that contribution's original page on the public [beteiligung.hamburg](https://beteiligung.hamburg) participation portal in a new tab. It appears on the contribution list and detail pages, on the Votes vs. Stance table and cards, and in the key-message overview. The icon renders **only** when a public URL is known for the id — otherwise nothing is shown — so it can be dropped in next to any id unconditionally.

Because it sits inside clickable rows and cards, the link is always a **sibling** of the row's clickable element (never nested inside the `role="button"` card header — an interactive element inside another interactive element is an accessibility violation), and it stops click/keydown propagation (`@click.stop` / `@keydown.stop`) so activating the icon does not also trigger the row's navigation.

### Where the URLs come from

Our backend stores no proceeding id, and each DIPAS proceeding lives on its own subdomain (e.g. `jenfelder-au.beteiligung.hamburg`), so the public URL cannot be derived from a contribution id alone. Instead the id → URL pairs are kept in a static snapshot, `src/data/contributionLinks.json`, collected once from the official `link` field of the public DIPAS PDS API. Because these proceedings are closed, their links are stable and the snapshot does not need to be refreshed at runtime. `src/utils/contributionLink.js` looks an id up in that file and re-validates the URL before it is rendered, allowing only `https` links whose host is `beteiligung.hamburg` or a `*.beteiligung.hamburg` subdomain (any other scheme or host resolves to `null`).

### Regenerating `src/data/contributionLinks.json`

The file is a flat JSON object mapping each contribution id (as a string key) to its original URL:

```json
{ "83": "https://jenfelder-au.beteiligung.hamburg/#/contribution/83" }
```

To rebuild it, fetch each proceeding's contributions from the PDS API and map every contribution's `id` to its `link` field:

```
https://beteiligung.hamburg/drupal/dipas-pds/projects/<project>/contributions/
```

For each `<project>` (proceeding) whose contributions appear in the app, request that endpoint, then for every returned contribution add an entry `"<id>": "<link>"`. Merge the entries from all proceedings into the single JSON object and write it back to `src/data/contributionLinks.json`. Only ids actually shown in the app need to be present; unknown ids simply render no icon. (The current snapshot was taken on 2026-11-26.)
