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

Coverage is scoped to the files behind the votes-stance views: the "shared ideas" summary bars (`src/components/molecules/VotesStanceSummary.vue` and `src/i18n/votesStanceExtra.js`) and the per-contribution cards (`src/components/molecules/ContributionCardsSection.vue` and `src/pages/VotesStance.vue`); the specs live under the `__tests__/` folders beside them.

## Votes vs. Stance — contribution cards

Below the overall summary, the Votes vs. Stance page lists one card per contribution. Each card reuses `VoteStanceBars` to draw that contribution's thumbs bar and comment-stance bar under a header (`#id` + truncated contribution text) that links to the contribution's detail page. By default the list shows only contributions that have at least one thumbs vote and at least one clear comment; a checkbox reveals all of them. Cards sort by the comments-minus-thumbs gap (default, most negative first, missing values last), by number of thumbs, or by id. This section is exploratory context and is marked "not pre-registered". Titles are fetched from `GET /contributions` in one parallel request and fail soft (cards fall back to the id alone).
