<!--
  KeyMessageHighlightLegend: the small legend shown above the highlighted
  contribution text. It names the four highlight colours (favor / against /
  disputed / neutral) and carries the provenance note that the highlighted
  positions come from the extraction model, not from the hand labels.
-->
<template>
  <div class="kmhl">
    <ul class="kmhl__items">
      <li class="kmhl__item">
        <span class="kmhl__swatch kmhl__swatch--favor" aria-hidden="true"></span>
        <span class="kmhl__label">{{ x.legendFavor }}</span>
      </li>
      <li class="kmhl__item">
        <span class="kmhl__swatch kmhl__swatch--against" aria-hidden="true"></span>
        <span class="kmhl__label">{{ x.legendAgainst }}</span>
      </li>
      <li class="kmhl__item">
        <span class="kmhl__swatch kmhl__swatch--disputed" aria-hidden="true"></span>
        <span class="kmhl__label">{{ x.legendDisputed }}</span>
      </li>
      <li class="kmhl__item">
        <span class="kmhl__swatch kmhl__swatch--neutral" aria-hidden="true"></span>
        <span class="kmhl__label">{{ x.legendNeutral }}</span>
      </li>
    </ul>
    <p class="kmhl__note">{{ x.highlightProvenanceNote }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useVotesStanceStrings } from '../../composables/useVotesStanceLang.js'
import { getVotesStanceExtraStrings } from '../../i18n/votesStanceExtra.js'

const { lang } = useVotesStanceStrings()
const x = computed(() => getVotesStanceExtraStrings(lang.value))
</script>

<style scoped>
.kmhl {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3) var(--space-4);
  margin-bottom: var(--space-3);
}
.kmhl__items {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3) var(--space-4);
  margin: 0;
  padding: 0;
  list-style: none;
}
.kmhl__item {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}
.kmhl__swatch {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  flex: none;
}
.kmhl__swatch--favor { background: #1A7A4A; }
.kmhl__swatch--against { background: var(--color-accent); }
.kmhl__swatch--disputed { background: #C77700; }
.kmhl__swatch--neutral { background: var(--color-hh-gray-300); }
.kmhl__label {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}
.kmhl__note {
  margin: 0;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  flex: 1 1 240px;
  min-width: 0;
}
</style>
