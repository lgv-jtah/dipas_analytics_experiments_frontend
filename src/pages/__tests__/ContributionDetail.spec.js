// Wiring tests for ContributionDetail: it lifts the gold key-message fetch and
// passes those key messages (with stable ids) plus the active id into both the
// highlighted contribution text and the stance panel, and relays their activate
// events. Router, composables and the api module are mocked; child components are
// shallow-stubbed so the props handed to them can be asserted directly.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount, flushPromises } from '@vue/test-utils'

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { id: '10' } }),
  useRouter: () => ({ push: vi.fn() }),
}))

const { evaluatorRef } = vi.hoisted(() => ({ evaluatorRef: { value: null } }))
vi.mock('../../composables/useEvaluator.js', async () => {
  const { ref } = await vi.importActual('vue')
  const evaluator = ref(null)
  // Keep the exported evaluator ref in sync with what each test sets.
  return {
    useEvaluator: () => {
      evaluator.value = evaluatorRef.value
      return { evaluator }
    },
  }
})

vi.mock('../../composables/useVotesStanceLang.js', async () => {
  const { ref } = await vi.importActual('vue')
  return { useVotesStanceStrings: () => ({ strings: ref({}), lang: ref('en') }) }
})

const api = vi.hoisted(() => ({
  getContribution: vi.fn(),
  getKeyMessages: vi.fn(),
  getContributionKeyMessages: vi.fn(),
  getStances: vi.fn(),
  submitKeyMessageEvaluation: vi.fn(),
  submitStanceEvaluation: vi.fn(),
  getKeyMessageEvaluations: vi.fn(),
  getStanceEvaluations: vi.fn(),
  submitAddedKeyMessage: vi.fn(),
  getAddedKeyMessages: vi.fn(),
  getContributionsStats: vi.fn(),
  getVotesStanceSnapshotInfo: vi.fn(),
  getContributionVotesStance: vi.fn(),
}))
vi.mock('../../services/api.js', () => api)

import ContributionDetail from '../ContributionDetail.vue'
import HighlightedContributionText from '../../components/molecules/HighlightedContributionText.vue'
import KeyMessageStancePanel from '../../components/molecules/KeyMessageStancePanel.vue'

const GOLD = [
  {
    key_message: 'Km A',
    favor: 3,
    against: 1,
    neutral: 0,
    n_with_stance: 4,
    too_few: false,
    comments: { favor: [], against: [], neutral: [] },
    spans: [{ start: 0, end: 3 }],
    highlight_stance: 'favor',
    spans_source: 'extraction_model:mistral-nemo',
  },
]

beforeEach(() => {
  evaluatorRef.value = null
  Object.values(api).forEach((fn) => fn.mockReset())
  api.getContribution.mockResolvedValue({ contribution_content: 'ABCDEFGHIJ' })
  api.getKeyMessages.mockResolvedValue([])
  api.getContributionKeyMessages.mockResolvedValue(GOLD)
  // Snapshot discovery rejects -> the votes-stance panel stays hidden, keeping
  // this test focused on the highlight wiring.
  api.getVotesStanceSnapshotInfo.mockRejectedValue(new Error('no export'))
})

async function mountDetail() {
  // renderStubDefaultSlot so the stubbed layout wrappers (AppShell, HhCard …)
  // still render their slot content, exposing the child components we assert on.
  const wrapper = shallowMount(ContributionDetail, {
    global: { renderStubDefaultSlot: true },
  })
  await flushPromises()
  return wrapper
}

describe('ContributionDetail highlight wiring', () => {
  it('passes gold key messages with stable ids into the highlighted text', async () => {
    const wrapper = await mountDetail()
    const text = wrapper.findComponent(HighlightedContributionText)
    expect(text.exists()).toBe(true)
    const kms = text.props('keyMessages')
    expect(kms).toHaveLength(1)
    expect(kms[0].id).toBe(0)
    expect(kms[0].key_message).toBe('Km A')
    expect(text.props('text')).toBe('ABCDEFGHIJ')
  })

  it('drives the stance panel with the same key messages and active id', async () => {
    const wrapper = await mountDetail()
    const panel = wrapper.findComponent(KeyMessageStancePanel)
    expect(panel.props('keyMessages')).toHaveLength(1)
    // Activating from the highlighted text updates the id handed to the panel.
    wrapper.findComponent(HighlightedContributionText).vm.$emit('activate', 0)
    await flushPromises()
    expect(panel.props('activeId')).toBe(0)
  })

  it('relays an activate from the panel back to the text', async () => {
    const wrapper = await mountDetail()
    wrapper.findComponent(KeyMessageStancePanel).vm.$emit('activate', 0)
    await flushPromises()
    expect(wrapper.findComponent(HighlightedContributionText).props('activeId')).toBe(0)
  })

  it('falls back to plain text when there are no gold key messages', async () => {
    api.getContributionKeyMessages.mockRejectedValue(new Error('404'))
    const wrapper = await mountDetail()
    expect(wrapper.findComponent(HighlightedContributionText).exists()).toBe(false)
    // The plain contribution text is still shown.
    expect(wrapper.text()).toContain('ABCDEFGHIJ')
  })
})

describe('ContributionDetail with evaluator + model key messages', () => {
  beforeEach(() => {
    evaluatorRef.value = 'alice'
    api.getKeyMessages.mockResolvedValue([
      { key_message: 'Model KM', key_message_type: 'Problem', key_message_explanation: 'why' },
    ])
    api.getKeyMessageEvaluations.mockResolvedValue([
      { key_message: 'Model KM', verdict: 'correct', comment: 'ok',
        suggested_key_message: '', suggested_sentence: '' },
    ])
    api.getStanceEvaluations.mockResolvedValue([])
    api.getAddedKeyMessages.mockResolvedValue([
      { id: 1, key_message: 'Added KM', key_message_type: 'Wunsch',
        key_message_sentence: 'a sentence', stances: [] },
    ])
    api.getContributionsStats.mockResolvedValue([
      {
        contribution_id: 10, key_messages_count: 1, stances_count: 1,
        added_key_messages_count: 1, evaluated_key_messages_count: 1,
        evaluated_stances_count: 0, added_key_messages_missing_stances_count: 1,
      },
      {
        contribution_id: 11, key_messages_count: 2, stances_count: 2,
        added_key_messages_count: 0, evaluated_key_messages_count: 0,
        evaluated_stances_count: 0, added_key_messages_missing_stances_count: 0,
      },
    ])
    api.getStances.mockResolvedValue([
      { comment_text: 'a comment', stance: 'in favor', explanation: 'because' },
    ])
    // Votes-stance panel available this time, exercising its load path.
    api.getVotesStanceSnapshotInfo.mockResolvedValue({ available_models: ['m'] })
    api.getContributionVotesStance.mockResolvedValue({
      votes: {}, comments: {}, snapshot_utc: 'x',
    })
  })

  it('renders model + added key messages and loads stances on expand', async () => {
    const wrapper = await mountDetail()
    // Both the model key message and the added one are rendered.
    expect(wrapper.text()).toContain('Model KM')
    expect(wrapper.text()).toContain('Added KM')
    // Expanding the model key message loads its stances.
    await wrapper.find('.km-block__header').trigger('click')
    await flushPromises()
    expect(api.getStances).toHaveBeenCalledWith(10, 'Model KM')
    // The gold highlight wiring still works alongside the model list.
    expect(wrapper.findComponent(HighlightedContributionText).exists()).toBe(true)
  })

  it('loads the votes-stance panel when the export is present', async () => {
    await mountDetail()
    expect(api.getContributionVotesStance).toHaveBeenCalled()
  })
})
