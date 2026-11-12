<!--
  LanguageToggle: a small accessible DE/EN switch for the "Votes vs. Stance"
  feature. Two buttons (EN / DE); the active language uses the primary variant and
  the other the ghost variant. The choice is shared (and remembered) through the
  useVotesStanceStrings composable, so the page and the contribution panel stay in
  sync. Design tokens only, no dependencies.
-->
<template>
  <div class="lang-toggle" role="group" :aria-label="strings.languageLabel">
    <HhButton
      size="sm"
      :variant="lang === 'en' ? 'primary' : 'ghost'"
      :aria-pressed="lang === 'en'"
      :aria-label="strings.langEnglish"
      @click="setLang('en')"
    >
      EN
    </HhButton>
    <HhButton
      size="sm"
      :variant="lang === 'de' ? 'primary' : 'ghost'"
      :aria-pressed="lang === 'de'"
      :aria-label="strings.langGerman"
      @click="setLang('de')"
    >
      DE
    </HhButton>
  </div>
</template>

<script setup>
import HhButton from '../atoms/HhButton.vue'
import { useVotesStanceStrings } from '../../composables/useVotesStanceLang.js'

const { lang, setLang, strings } = useVotesStanceStrings()
</script>

<style scoped>
.lang-toggle {
  display: inline-flex;
  gap: var(--space-2);
}
</style>
