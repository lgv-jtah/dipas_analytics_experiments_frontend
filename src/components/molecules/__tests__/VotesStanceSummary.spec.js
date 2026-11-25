// Tests for VotesStanceSummary: the headline block now runs on the shared
// contributions only. It draws two bars from headline.primary, a no-clear-stance
// line, the gap with its 90% range, a secondary unweighted line and a
// verdict-driven equivalence sentence. There is no pre-registered headline and no
// shared-contributions sub-block any more. The API and the language composable are
// mocked; the real i18n strings are used so German formatting is exercised. HhCard
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

// The shared-contributions headline block, with the real figures the plan pins.
function headlineBlock() {
  return {
    pre_registered: false,
    primary: {
      favor: 129,
      against: 27,
      neutral: 44,
      mixed: 8,
      favor_share: 82.69,
      vote_pro: 654,
      vote_contra: 93,
      vote_share: 87.55,
      difference_pp: -4.9,
      ci90: { low: -11.5, high: 3.5 },
    },
    unweighted: { difference_pp: -4.0, ci90: { low: -10.2, high: 2.0 } },
    n_comments: 208,
    no_clear_stance: { total: 52, neutral: 44, mixed: 8 },
    n_contributions: 80,
    equivalence: { margin_pp: 10.0, inside_90: false, verdict: 'undecided' },
    bootstrap: { n: 10000, seed: 20261026 },
  }
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

describe('VotesStanceSummary headline', () => {
  it('draws exactly two bars from the shared-set counts', async () => {
    getVotesStanceSummary.mockResolvedValue({ headline: headlineBlock() })
    const wrapper = await mountSummary()

    const bars = wrapper.findAll('[role="img"]')
    expect(bars).toHaveLength(2)
    const labels = bars.map((b) => b.attributes('aria-label'))
    expect(labels).toContain('Daumen hoch 654, Daumen runter 93')
    expect(labels).toContain('Zustimmend 129, Ablehnend 27')
  })

  it('shows the totals, German shares and the no-clear-stance line', async () => {
    getVotesStanceSummary.mockResolvedValue({ headline: headlineBlock() })
    const wrapper = await mountSummary()
    const text = wrapper.text()

    // Bar totals: thumbs 654 + 93 = 747, directional 129 + 27 = 156.
    expect(text).toContain('n = 747')
    expect(text).toContain('n = 156')
    // German-formatted shares.
    expect(text).toContain('87,6 %')
    expect(text).toContain('82,7 %')
    // No-clear-stance line: 52 of 208, (44 neutral, 8 mixed), German.
    expect(text).toContain(
      '52 von 208 Kommentaren ohne klare Haltung (44 neutral, 8 gemischt).'
    )
  })

  it('shows the gap, its range and the secondary unweighted gap', async () => {
    getVotesStanceSummary.mockResolvedValue({ headline: headlineBlock() })
    const wrapper = await mountSummary()
    const text = wrapper.text()

    // Headline gap -4.9 with the 90% range -11.5 … +3.5 (German glyphs).
    expect(text).toContain('−4,9')
    expect(text).toContain('−11,5')
    expect(text).toContain('+3,5')
    // Secondary, every-idea-counts-once gap.
    expect(text).toContain('Ungewichteter Abstand (jeder Beitrag zählt einmal)')
    expect(text).toContain('−4,0')
  })

  it('shows the undecided verdict sentence', async () => {
    getVotesStanceSummary.mockResolvedValue({ headline: headlineBlock() })
    const wrapper = await mountSummary()
    expect(wrapper.text()).toContain(
      'Bei einer Äquivalenzgrenze von ±10 Prozentpunkten ist das Ergebnis nicht entschieden'
    )
  })

  it('shows no pre-registered headline, badge or 107/85/80 shared line', async () => {
    getVotesStanceSummary.mockResolvedValue({ headline: headlineBlock() })
    const wrapper = await mountSummary()
    const text = wrapper.text()
    // No not-pre-registered badge and no reference to the earlier 115/107/85 figures.
    expect(text).not.toContain('vorab festgelegt')
    expect(text).not.toContain('107')
    expect(text).not.toContain('115')
    // The old shared-contributions "thumbs/comment/both" counts line is gone.
    expect(text).not.toContain('haben beides')
    // Only the two headline bars, nothing from a second (shared) sub-block.
    expect(wrapper.findAll('[role="img"]')).toHaveLength(2)
  })

  it('renders nothing but the card when the headline is null', async () => {
    getVotesStanceSummary.mockResolvedValue({ headline: null })
    const wrapper = await mountSummary()
    expect(wrapper.findAll('[role="img"]')).toHaveLength(0)
    // It did not fall into the error state.
    expect(wrapper.text()).not.toContain('konnte nicht geladen werden')
  })

  it('picks the equivalent sentence for an equivalent verdict', async () => {
    const block = headlineBlock()
    block.equivalence = { margin_pp: 10.0, inside_90: true, verdict: 'equivalent' }
    getVotesStanceSummary.mockResolvedValue({ headline: block })
    const wrapper = await mountSummary()
    expect(wrapper.text()).toContain('sind beide Seiten gleichwertig')
  })
})
