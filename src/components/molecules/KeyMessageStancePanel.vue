<!--
  KeyMessageStancePanel: on a contribution page, shows the HAND-LABELLED (gold)
  key messages for that contribution and, for each, how many comments are in
  favor / against / neutral. Each count expands (<details>) to the comments
  behind it. A "too few comments" badge marks key messages with fewer than three
  comments that take a clear stance.

  This is deliberately separate from the model key-message evaluation list on the
  same page: the two lists can word key messages differently and have different
  counts, so they are never merged. Citizen comment text is rendered with text
  interpolation only (never v-html). Data comes from the backend
  (/contributions/{id}/votes-stance/key-messages); the panel hides itself when
  there is nothing gold to show.
-->
<template>
  <HhCard v-if="visible" :title="x.kmPanelTitle" class="kmsp">
    <HhText tag="p" variant="caption" color="secondary" class="kmsp__intro">
      {{ x.kmPanelIntro }}
    </HhText>

    <div v-if="loading" class="kmsp__state">
      <HhText variant="caption" color="secondary">{{ x.loading }}</HhText>
    </div>

    <ul v-else class="kmsp__list">
      <li v-for="(km, i) in rows" :key="i" class="kmsp__item">
        <div class="kmsp__head">
          <HhText tag="span" variant="body" class="kmsp__km">{{ km.key_message }}</HhText>
          <span v-if="km.too_few" class="kmsp__badge">{{ x.kmTooFew }}</span>
        </div>

        <div class="kmsp__groups">
          <details v-for="group in groupsFor(km)" :key="group.key" class="kmsp__group">
            <summary class="kmsp__summary" :class="`kmsp__summary--${group.key}`">
              {{ group.label }}: {{ group.items.length }}
            </summary>
            <ul v-if="group.items.length" class="kmsp__comments">
              <!-- Text interpolation only; never v-html for citizen comments. -->
              <li v-for="(c, ci) in group.items" :key="ci" class="kmsp__comment">
                {{ c.comment_text }}
              </li>
            </ul>
            <p v-else class="kmsp__comment kmsp__comment--empty">
              <HhText tag="span" variant="caption" color="secondary">{{ x.kmNoComments }}</HhText>
            </p>
          </details>
        </div>
      </li>
    </ul>
  </HhCard>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import HhCard from './HhCard.vue'
import HhText from '../atoms/HhText.vue'
import { getContributionKeyMessages } from '../../services/api.js'
import { useVotesStanceStrings } from '../../composables/useVotesStanceLang.js'
import { getVotesStanceExtraStrings } from '../../i18n/votesStanceExtra.js'

const props = defineProps({
  contributionId: { type: Number, required: true },
})

const { lang } = useVotesStanceStrings()
const x = computed(() => getVotesStanceExtraStrings(lang.value))

const loading = ref(true)
const rows = ref([])

// Hide the whole panel for non-gold contributions (no rows) or on error, so the
// contribution page stays clean; show it while loading and once rows exist.
const visible = computed(() => loading.value || rows.value.length > 0)

// Build the three expandable groups (favor / against / neutral) for one key
// message, each with its comment list.
function groupsFor(km) {
  return [
    { key: 'favor', label: x.value.kmInFavor, items: km.comments.favor },
    { key: 'against', label: x.value.kmAgainst, items: km.comments.against },
    { key: 'neutral', label: x.value.kmNeutral, items: km.comments.neutral },
  ]
}

onMounted(async () => {
  try {
    rows.value = await getContributionKeyMessages(props.contributionId)
  } catch {
    // A non-gold contribution (404) or a backend without the artifact: hide.
    rows.value = []
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.kmsp { margin-bottom: var(--space-8); }
.kmsp__intro { margin: 0 0 var(--space-4); }
.kmsp__state { padding: var(--space-4) 0; }
.kmsp__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.kmsp__item {
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}
.kmsp__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}
.kmsp__km { font-weight: var(--font-weight-semibold); }
.kmsp__badge {
  flex: none;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  background: var(--color-hh-gray-300);
  color: var(--color-text-primary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  white-space: nowrap;
}
.kmsp__groups {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}
.kmsp__group {
  flex: 1 1 200px;
  min-width: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-3);
}
.kmsp__summary {
  cursor: pointer;
  user-select: none;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  position: relative;
  padding-left: 16px;
}
.kmsp__summary::marker { content: ''; }
.kmsp__summary::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 10px;
  height: 10px;
  border-radius: 2px;
}
.kmsp__summary--favor::before { background: #1A7A4A; }
.kmsp__summary--against::before { background: var(--color-accent); }
.kmsp__summary--neutral::before { background: var(--color-hh-gray-300); }
.kmsp__comments {
  margin: var(--space-2) 0 0;
  padding-left: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}
.kmsp__comment {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  line-height: var(--line-height-normal);
}
.kmsp__comment--empty { margin: var(--space-2) 0 0; }
</style>
