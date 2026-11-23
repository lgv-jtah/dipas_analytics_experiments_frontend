/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/dipas-analytics-evaluation/',
  test: {
    // jsdom so mounted components have a DOM; globals so describe/it/expect need
    // no per-file import.
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary'],
      // Scope coverage to the two files this feature touches.
      include: [
        'src/i18n/votesStanceExtra.js',
        'src/components/molecules/VotesStanceSummary.vue',
        'src/components/molecules/ContributionCardsSection.vue',
        'src/components/molecules/HighlightedContributionText.vue',
        'src/components/molecules/KeyMessageHighlightLegend.vue',
        'src/components/molecules/KeyMessageStancePanel.vue',
        'src/components/molecules/KeyMessagePopover.vue',
        'src/utils/popoverPosition.js',
        'src/utils/motion.js',
        'src/pages/VotesStance.vue',
        'src/pages/ContributionDetail.vue',
      ],
    },
  },
})
