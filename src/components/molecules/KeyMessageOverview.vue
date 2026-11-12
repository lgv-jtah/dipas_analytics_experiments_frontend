<!--
  KeyMessageOverview: two short lists on the Votes vs. Stance page - the key
  messages that the most comments agreed with, and the ones the most comments
  disagreed with. Gold (hand) labels only; counts only, never percentages. Each
  item links to its contribution. All data comes from the backend
  (/votes-stance/key-messages/overview); nothing is hard-coded.
-->
<template>
  <HhCard :title="x.overviewTitle" class="kmo">
    <HhText tag="p" variant="caption" color="secondary" class="kmo__note">
      {{ x.overviewMinNote }}
    </HhText>

    <div v-if="loading" class="kmo__state">
      <HhText variant="caption" color="secondary">{{ x.loading }}</HhText>
    </div>
    <div v-else-if="error" class="kmo__state">
      <HhText variant="caption" color="accent">{{ x.error }}</HhText>
    </div>

    <div v-else class="kmo__cols">
      <section class="kmo__col">
        <HhText tag="h3" variant="label" class="kmo__col-title">{{ x.mostAgreed }}</HhText>
        <p v-if="!mostAgreed.length" class="kmo__empty">
          <HhText tag="span" variant="caption" color="secondary">{{ x.overviewEmpty }}</HhText>
        </p>
        <ol v-else class="kmo__list">
          <li v-for="item in mostAgreed" :key="`a-${item.contribution_id}-${item.key_message}`" class="kmo__item">
            <RouterLink class="kmo__link" :to="`/evaluation/contributions/${item.contribution_id}`"
                        :title="interpolate(x.openContribution, { id: item.contribution_id })">
              #{{ item.contribution_id }}
            </RouterLink>
            <span class="kmo__km">{{ item.key_message }}</span>
            <span class="kmo__counts">{{ counts(item) }}</span>
          </li>
        </ol>
      </section>

      <section class="kmo__col">
        <HhText tag="h3" variant="label" class="kmo__col-title">{{ x.mostRejected }}</HhText>
        <p v-if="!mostRejected.length" class="kmo__empty">
          <HhText tag="span" variant="caption" color="secondary">{{ x.overviewEmpty }}</HhText>
        </p>
        <ol v-else class="kmo__list">
          <li v-for="item in mostRejected" :key="`r-${item.contribution_id}-${item.key_message}`" class="kmo__item">
            <RouterLink class="kmo__link" :to="`/evaluation/contributions/${item.contribution_id}`"
                        :title="interpolate(x.openContribution, { id: item.contribution_id })">
              #{{ item.contribution_id }}
            </RouterLink>
            <span class="kmo__km">{{ item.key_message }}</span>
            <span class="kmo__counts">{{ counts(item) }}</span>
          </li>
        </ol>
      </section>
    </div>

    <HhText tag="p" variant="caption" color="secondary" class="kmo__legend">
      {{ x.overviewCounts }}
    </HhText>
  </HhCard>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import HhCard from './HhCard.vue'
import HhText from '../atoms/HhText.vue'
import { getKeyMessageOverview } from '../../services/api.js'
import { useVotesStanceStrings } from '../../composables/useVotesStanceLang.js'
import { getVotesStanceExtraStrings, interpolate } from '../../i18n/votesStanceExtra.js'

const { lang } = useVotesStanceStrings()
const x = computed(() => getVotesStanceExtraStrings(lang.value))

const loading = ref(true)
const error = ref(false)
const mostAgreed = ref([])
const mostRejected = ref([])

// Counts only, never percentages: "favor / against / neutral".
function counts(item) {
  return `${item.favor} / ${item.against} / ${item.neutral}`
}

onMounted(async () => {
  try {
    const data = await getKeyMessageOverview({ limit: 20 })
    mostAgreed.value = data.most_agreed || []
    mostRejected.value = data.most_rejected || []
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.kmo { margin-bottom: var(--space-6); }
.kmo__note { margin: 0 0 var(--space-4); }
.kmo__state { padding: var(--space-4) 0; }
.kmo__cols {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-6);
}
.kmo__col {
  flex: 1 1 280px;
  min-width: 0;
}
.kmo__col-title { margin-bottom: var(--space-3); }
.kmo__list {
  margin: 0;
  padding-left: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.kmo__item {
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
}
.kmo__link {
  font-weight: var(--font-weight-semibold);
  color: var(--color-accent);
  text-decoration: none;
  margin-right: var(--space-2);
}
.kmo__link:hover { text-decoration: underline; }
.kmo__km { color: var(--color-text-primary); }
.kmo__counts {
  margin-left: var(--space-2);
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.kmo__empty { margin: 0; }
.kmo__legend { margin: var(--space-4) 0 0; font-style: italic; }
</style>
