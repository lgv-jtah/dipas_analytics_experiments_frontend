// Tests for VotesStanceSummary: the shared-contributions block now draws its own
// two stacked bars from the backend's derived counts, while the pre-registered
// headline is untouched. The API and the language composable are mocked; the
// real i18n strings are used so the German share formatting is exercised. HhCard
// and HhText are stubbed to pass their slots through so text assertions work.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

import VotesStanceSummary from '../VotesStanceSummary.vue'
import { getVotesStanceSummary } from '../../../services/api.js'

vi.mock('../../../services/api.js', () => ({
  getVotesStanceSummary: vi.fn(),
}))

// Pin the feature language to German so the per-language share formatting runs.
vi.mock('../../../composables/useVotesStanceLang.js', () => ({
  useVotesStanceStrings: () => ({ lang: { value: 'de' } }),
}))

// Slot-passing stubs so the rendered text is assertable.
const stubs = {
  HhCard: { template: '<div class="hhcard"><slot /></div>' },
  HhText: { template: '<span class="hhtext"><slot /></span>' },
}

// A realistic overall headline block (NOT the shared set).
const overall = {
  primary: {
    vote_pro: 780,
    vote_contra: 97,
    vote_share: 88.9,
    favor: 130,
    against: 31,
    favor_share: 80.7,
    difference_pp: -8.2,
    ci90: { low: -14.0, high: -2.0, equivalent: false },
  },
  n_comments: 246,
  no_clear_stance: { total: 85, neutral: 74, mixed: 11 },
  n_contributions_with_votes: 107,
  interpretation_rules: 'synthetic',
}

// The shared block, including the derived pooled counts the bars read.
function sharedBlock({ withCounts = true } = {}) {
  const block = {
    pre_registered: false,
    note: 'synthetic not-pre-registered note',
    thumbs_side_contributions: 107,
    comment_side_contributions: 85,
    both_sides_contributions: 80,
    pooled: { difference_pp: -4.9, ci90: { low: -11.5, high: 3.5 } },
    unweighted: { difference_pp: -4.0, ci90: { low: -10.2, high: 2.0 } },
  }
  if (withCounts) {
    block.counts = {
      vote_pro: 654,
      vote_contra: 93,
      vote_share: 87.55,
      favor: 129,
      against: 27,
      neutral: 44,
      mixed: 8,
      favor_share: 82.69,
      n_contributions: 80,
    }
  }
  return block
}

async function mountSummary() {
  const wrapper = mount(VotesStanceSummary, { global: { stubs } })
  await flushPromises()
  await wrapper.vm.$nextTick()
  return wrapper
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('VotesStanceSummary shared bars', () => {
  it('draws the two shared bars from the derived counts', async () => {
    getVotesStanceSummary.mockResolvedValue({ overall, shared: sharedBlock() })
    const wrapper = await mountSummary()

    const bars = wrapper.findAll('[role="img"]')
    // Two headline bars plus two shared bars.
    expect(bars).toHaveLength(4)
    const labels = bars.map((b) => b.attributes('aria-label'))
    // Headline is untouched (780 / 97 and 130 / 31).
    expect(labels).toContain('Daumen hoch 780, Daumen runter 97')
    expect(labels).toContain('Zustimmend 130, Ablehnend 31')
    // Shared bars carry the shared-set counts (654 / 93 and 129 / 27).
    expect(labels).toContain('Daumen hoch 654, Daumen runter 93')
    expect(labels).toContain('Zustimmend 129, Ablehnend 27')
  })

  it('shows the shared totals, German shares and the neutral/mixed caption', async () => {
    getVotesStanceSummary.mockResolvedValue({ overall, shared: sharedBlock() })
    const wrapper = await mountSummary()
    const text = wrapper.text()

    // Shared bar totals: thumbs 654 + 93 = 747, directional 129 + 27 = 156.
    expect(text).toContain('n = 747')
    expect(text).toContain('n = 156')
    // Headline totals are still present (877 and 161).
    expect(text).toContain('n = 877')
    expect(text).toContain('n = 161')
    // German-formatted shared shares.
    expect(text).toContain('87,6 %')
    expect(text).toContain('82,7 %')
    // Neutral/mixed caption (44 neutral, 8 mixed), German.
    expect(text).toContain(
      '44 neutrale und 8 gemischte Kommentare zählen nicht in den Anteil.'
    )
    // The pooled/unweighted gap list is still present.
    expect(text).toContain('Gepoolt (größere Beiträge zählen mehr)')
    expect(text).toContain('Ungewichtet (jeder Beitrag zählt einmal)')
  })

  it('degrades to no shared bars when counts are absent', async () => {
    getVotesStanceSummary.mockResolvedValue({
      overall,
      shared: sharedBlock({ withCounts: false }),
    })
    const wrapper = await mountSummary()

    // Only the two headline bars remain.
    const bars = wrapper.findAll('[role="img"]')
    expect(bars).toHaveLength(2)
    const text = wrapper.text()
    expect(text).not.toContain('zählen nicht in den Anteil')
    // The shared block itself (its pooled list) is still shown.
    expect(text).toContain('Gepoolt (größere Beiträge zählen mehr)')
  })
})
