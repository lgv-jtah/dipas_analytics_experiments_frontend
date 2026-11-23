// Integration test for the pin-origin cross-scroll: the highlighted text and the
// stance panel share one activeId + pinOrigin (as ContributionDetail wires them).
// A pin from the panel row must scroll the passage into view and NOT the row; a
// pin from the text passage must scroll the row and NOT the passage. This guards
// the defect where both watchers fired on every activeId change and the panel
// (mounted second) always won, so a panel-row click never reached the passage.
import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'

vi.mock('../../../composables/useVotesStanceLang.js', async () => {
  const { ref: r } = await vi.importActual('vue')
  const lang = r('en')
  return { useVotesStanceStrings: () => ({ lang }) }
})

// The panel imports this; parent-driven mode never calls it, but the module must
// resolve.
vi.mock('../../../services/api.js', () => ({ getContributionKeyMessages: vi.fn() }))

import HighlightedContributionText from '../HighlightedContributionText.vue'
import KeyMessageStancePanel from '../KeyMessageStancePanel.vue'

const KM = {
  id: 0,
  key_message: 'Km zero',
  highlight_stance: 'favor',
  spans: [{ start: 2, end: 5 }],
  favor: 1,
  against: 0,
  neutral: 3,
  too_few: false,
  comments: { favor: [], against: [], neutral: [] },
  spans_source: 'extraction_model:mistral-nemo',
}

const stubs = {
  HhCard: { props: ['title'], template: '<section class="hhcard"><slot /></section>' },
  HhText: { template: '<span class="hhtext"><slot /></span>' },
}

// Mirrors ContributionDetail's wiring: one shared activeId + pinOrigin, tagged by
// which child emitted the activate.
const Harness = {
  components: { HighlightedContributionText, KeyMessageStancePanel },
  setup() {
    const activeId = ref(null)
    const pinOrigin = ref(null)
    const onText = (id) => {
      activeId.value = id
      pinOrigin.value = id === null || id === undefined ? null : 'text'
    }
    const onPanel = (id) => {
      activeId.value = id
      pinOrigin.value = id === null || id === undefined ? null : 'panel'
    }
    return { activeId, pinOrigin, kms: [KM], text: 'ABCDEFGHIJ', onText, onPanel }
  },
  template: `
    <div>
      <HighlightedContributionText
        :text="text" :key-messages="kms"
        :active-id="activeId" :pin-origin="pinOrigin" @activate="onText" />
      <KeyMessageStancePanel
        :contribution-id="1" :key-messages="kms"
        :active-id="activeId" :pin-origin="pinOrigin" @activate="onPanel" />
    </div>
  `,
}

let wrapper
afterEach(() => {
  if (wrapper) wrapper.unmount()
  wrapper = undefined
})

async function mountHarness() {
  wrapper = mount(Harness, { global: { stubs } })
  await flushPromises()
  const mark = wrapper.find('.hct__mark').element
  const row = wrapper.find('.kmsp__item').element
  mark.scrollIntoView = vi.fn()
  row.scrollIntoView = vi.fn()
  return { mark, row }
}

describe('pin-origin cross-scroll', () => {
  it('scrolls the passage (not the row) when a panel row is clicked', async () => {
    const { mark, row } = await mountHarness()
    await wrapper.find('.kmsp__item').trigger('click')
    await flushPromises()
    expect(mark.scrollIntoView).toHaveBeenCalledTimes(1)
    expect(row.scrollIntoView).not.toHaveBeenCalled()
  })

  it('scrolls the row (not the passage) when a text passage is clicked', async () => {
    const { mark, row } = await mountHarness()
    await wrapper.find('.hct__mark').trigger('click')
    await flushPromises()
    expect(row.scrollIntoView).toHaveBeenCalledTimes(1)
    expect(mark.scrollIntoView).not.toHaveBeenCalled()
  })
})
