// Tests for HighlightedContributionText: the contribution text with each gold
// key message's located source passages highlighted. The language composable is
// mocked to pin English so the real extra-string set (incl. the aria template)
// is exercised; the component uses no Hh* wrappers so nothing else is stubbed.
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import HighlightedContributionText from '../HighlightedContributionText.vue'

vi.mock('../../../composables/useVotesStanceLang.js', async () => {
  const { ref } = await vi.importActual('vue')
  const lang = ref('en')
  return { useVotesStanceStrings: () => ({ lang }) }
})

// text indices: A0 B1 C2 D3 E4 F5 G6 H7 I8 J9  (length 10)
const TEXT = 'ABCDEFGHIJ'

function km(id, stance, spans, counts = {}) {
  return {
    id,
    key_message: `km-${id}`,
    highlight_stance: stance,
    spans,
    favor: counts.favor ?? 0,
    against: counts.against ?? 0,
    neutral: counts.neutral ?? 0,
  }
}

function marks(wrapper) {
  return wrapper.findAll('.hct__mark')
}

describe('HighlightedContributionText', () => {
  it('highlights the substring covered by a span', () => {
    const wrapper = mount(HighlightedContributionText, {
      props: {
        text: TEXT,
        keyMessages: [km(0, 'favor', [{ start: 2, end: 5 }])],
      },
    })
    const m = marks(wrapper)
    expect(m).toHaveLength(1)
    expect(m[0].text()).toBe('CDE')
    expect(m[0].classes()).toContain('hct__mark--favor')
    // The full text is still present (plain pieces around the mark).
    expect(wrapper.text()).toBe(TEXT)
  })

  it('segments overlapping key messages and colours by precedence', () => {
    const wrapper = mount(HighlightedContributionText, {
      props: {
        text: TEXT,
        keyMessages: [
          km(0, 'favor', [{ start: 0, end: 5 }]),
          km(1, 'against', [{ start: 3, end: 8 }]),
        ],
      },
    })
    const m = marks(wrapper)
    // Pieces: [0,3) favor, [3,5) overlap, [5,8) against.
    expect(m).toHaveLength(3)
    expect(m[0].text()).toBe('ABC')
    expect(m[0].classes()).toContain('hct__mark--favor')
    // The overlap is painted by precedence: against beats favor.
    expect(m[1].text()).toBe('DE')
    expect(m[1].classes()).toContain('hct__mark--against')
    expect(m[2].text()).toBe('FGH')
    expect(m[2].classes()).toContain('hct__mark--against')
  })

  it('emits activate on click, Enter and Space', async () => {
    const wrapper = mount(HighlightedContributionText, {
      props: {
        text: TEXT,
        keyMessages: [km(7, 'favor', [{ start: 2, end: 5 }])],
      },
    })
    const mark = marks(wrapper)[0]
    await mark.trigger('click')
    await mark.trigger('keydown.enter')
    await mark.trigger('keydown.space')
    const events = wrapper.emitted('activate')
    // Each of the three interactions toggles the key message on (activeId null).
    expect(events.map((e) => e[0])).toEqual([7, 7, 7])
  })

  it('toggles the active key message off on a second activation', async () => {
    const wrapper = mount(HighlightedContributionText, {
      props: {
        text: TEXT,
        keyMessages: [km(7, 'favor', [{ start: 2, end: 5 }])],
        activeId: 7,
      },
    })
    await marks(wrapper)[0].trigger('click')
    // Already active -> clicking clears the selection.
    expect(wrapper.emitted('activate')[0]).toEqual([null])
  })

  it('emphasises the active key message and emits on hover/focus', async () => {
    const wrapper = mount(HighlightedContributionText, {
      props: {
        text: TEXT,
        keyMessages: [km(0, 'favor', [{ start: 2, end: 5 }])],
        activeId: 0,
      },
    })
    const mark = marks(wrapper)[0]
    expect(mark.classes()).toContain('hct__mark--active')
    expect(mark.attributes('aria-pressed')).toBe('true')
    await mark.trigger('mouseenter')
    expect(wrapper.emitted('activate')[0]).toEqual([0])
    await mark.trigger('mouseleave')
    expect(wrapper.emitted('activate')[1]).toEqual([null])
  })

  it('renders HTML-looking text literally (never v-html)', () => {
    const html = '<b>bold</b>&amp;'
    const wrapper = mount(HighlightedContributionText, {
      props: {
        text: html,
        keyMessages: [km(0, 'favor', [{ start: 0, end: html.length }])],
      },
    })
    // The literal angle brackets survive and no real <b> element is created.
    expect(wrapper.text()).toContain('<b>bold</b>')
    expect(wrapper.find('b').exists()).toBe(false)
  })

  it('clamps out-of-range spans and drops empty/inverted ones', () => {
    const wrapper = mount(HighlightedContributionText, {
      props: {
        text: TEXT,
        keyMessages: [
          km(0, 'favor', [
            { start: 8, end: 100 },  // clamps to [8,10)
            { start: 7, end: 3 },    // inverted -> dropped
            { start: 50, end: 60 },  // out of range -> empty -> dropped
          ]),
        ],
      },
    })
    const m = marks(wrapper)
    expect(m).toHaveLength(1)
    expect(m[0].text()).toBe('IJ')
  })

  it('renders plain text with no marks when there are no key messages', () => {
    const wrapper = mount(HighlightedContributionText, {
      props: { text: TEXT, keyMessages: [] },
    })
    expect(marks(wrapper)).toHaveLength(0)
    expect(wrapper.text()).toBe(TEXT)
  })

  it('builds an aria label listing the key message and its counts', () => {
    const wrapper = mount(HighlightedContributionText, {
      props: {
        text: TEXT,
        keyMessages: [km(0, 'favor', [{ start: 0, end: 3 }], { favor: 2, against: 1, neutral: 0 })],
      },
    })
    const aria = marks(wrapper)[0].attributes('aria-label')
    expect(aria).toContain('km-0')
    expect(aria).toContain('2 in favor')
    expect(aria).toContain('1 against')
  })
})
