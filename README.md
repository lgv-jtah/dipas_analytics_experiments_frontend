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

Coverage is scoped to the files behind the votes-stance "shared ideas" bars (`src/components/molecules/VotesStanceSummary.vue` and `src/i18n/votesStanceExtra.js`); the specs live under the `__tests__/` folders beside them.
