// Tests for HighlightedContributionText: the contribution text with each gold
// key message's located source passages highlighted. The language composable is
// mocked to pin English so the real extra-string set (incl. the aria template)
// is exercised. The popover is a real child teleported to <body>, so it is
// queried via document rather than the wrapper.
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'

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

function popover() {
  return document.querySelector('.kmpop')
}

// Track mounted wrappers so their teleported popovers are cleaned from <body>.
let wrappers = []
function mountHct(props) {
  const wrapper = mount(HighlightedContributionText, { props })
  wrappers.push(wrapper)
  return wrapper
}

afterEach(() => {
  wrappers.forEach((w) => w.unmount())
  wrappers = []
  vi.useRealTimers()
})

describe('HighlightedContributionText rendering', () => {
  it('highlights the substring covered by a span', () => {
    const wrapper = mountHct({
      text: TEXT,
      keyMessages: [km(0, 'favor', [{ start: 2, end: 5 }])],
    })
    const m = marks(wrapper)
    expect(m).toHaveLength(1)
    expect(m[0].text()).toBe('CDE')
    expect(m[0].classes()).toContain('hct__mark--favor')
    expect(wrapper.text()).toBe(TEXT)
  })

  it('segments overlapping key messages and colours by precedence', () => {
    const wrapper = mountHct({
      text: TEXT,
      keyMessages: [
        km(0, 'favor', [{ start: 0, end: 5 }]),
        km(1, 'against', [{ start: 3, end: 8 }]),
      ],
    })
    const m = marks(wrapper)
    expect(m).toHaveLength(3)
    expect(m[1].text()).toBe('DE')
    expect(m[1].classes()).toContain('hct__mark--against')
  })

  it('renders HTML-looking text literally (never v-html)', () => {
    const html = '<b>bold</b>&amp;'
    const wrapper = mountHct({
      text: html,
      keyMessages: [km(0, 'favor', [{ start: 0, end: html.length }])],
    })
    expect(wrapper.text()).toContain('<b>bold</b>')
    expect(wrapper.find('b').exists()).toBe(false)
  })

  it('clamps out-of-range spans and drops empty/inverted ones', () => {
    const wrapper = mountHct({
      text: TEXT,
      keyMessages: [
        km(0, 'favor', [
          { start: 8, end: 100 },
          { start: 7, end: 3 },
          { start: 50, end: 60 },
        ]),
      ],
    })
    const m = marks(wrapper)
    expect(m).toHaveLength(1)
    expect(m[0].text()).toBe('IJ')
  })

  it('renders plain text with no marks when there are no key messages', () => {
    const wrapper = mountHct({ text: TEXT, keyMessages: [] })
    expect(marks(wrapper)).toHaveLength(0)
    expect(wrapper.text()).toBe(TEXT)
  })

  it('builds an aria label listing the key message and its counts', () => {
    const wrapper = mountHct({
      text: TEXT,
      keyMessages: [km(0, 'favor', [{ start: 0, end: 3 }], { favor: 2, against: 1 })],
    })
    const aria = marks(wrapper)[0].attributes('aria-label')
    expect(aria).toContain('km-0')
    expect(aria).toContain('2 in favor')
    expect(aria).toContain('1 against')
  })

  it('does not render a native title (avoids a double tooltip)', () => {
    const wrapper = mountHct({
      text: TEXT,
      keyMessages: [km(0, 'favor', [{ start: 0, end: 3 }])],
    })
    expect(marks(wrapper)[0].attributes('title')).toBeUndefined()
  })
})

describe('HighlightedContributionText hover popover', () => {
  it('does NOT emit activate on hover or focus (hover is local only)', async () => {
    const wrapper = mountHct({
      text: TEXT,
      keyMessages: [km(0, 'favor', [{ start: 2, end: 5 }])],
    })
    await marks(wrapper)[0].trigger('mouseenter')
    await marks(wrapper)[0].trigger('focus')
    await marks(wrapper)[0].trigger('mouseleave')
    expect(wrapper.emitted('activate')).toBeUndefined()
  })

  it('opens the popover on mouseenter and wires aria-describedby', async () => {
    const wrapper = mountHct({
      text: TEXT,
      keyMessages: [km(0, 'favor', [{ start: 2, end: 5 }], { favor: 1, neutral: 2 })],
    })
    await marks(wrapper)[0].trigger('mouseenter')
    await flushPromises()
    const pop = popover()
    expect(pop).not.toBeNull()
    expect(pop.textContent).toContain('km-0')
    // The hovered mark references the popover by id.
    expect(marks(wrapper)[0].attributes('aria-describedby')).toBe(pop.id)
  })

  it('opens the popover on focus too', async () => {
    const wrapper = mountHct({
      text: TEXT,
      keyMessages: [km(0, 'favor', [{ start: 2, end: 5 }])],
    })
    await marks(wrapper)[0].trigger('focus')
    await flushPromises()
    expect(popover()).not.toBeNull()
  })

  it('lists every key message covering an overlapping passage', async () => {
    const wrapper = mountHct({
      text: TEXT,
      keyMessages: [
        km(0, 'favor', [{ start: 0, end: 5 }]),
        km(1, 'against', [{ start: 3, end: 8 }]),
      ],
    })
    // Pieces: [0,3) km0, [3,5) overlap, [5,8) km1 -> hover the middle mark.
    await marks(wrapper)[1].trigger('mouseenter')
    await flushPromises()
    expect(document.querySelectorAll('.kmpop__item')).toHaveLength(2)
    expect(popover().textContent).toContain('km-0')
    expect(popover().textContent).toContain('km-1')
  })

  it('hides the popover on blur', async () => {
    const wrapper = mountHct({
      text: TEXT,
      keyMessages: [km(0, 'favor', [{ start: 2, end: 5 }])],
    })
    await marks(wrapper)[0].trigger('mouseenter')
    await flushPromises()
    expect(popover()).not.toBeNull()
    await marks(wrapper)[0].trigger('blur')
    await flushPromises()
    expect(popover()).toBeNull()
  })

  it('closes after the grace period on mouseleave', async () => {
    vi.useFakeTimers()
    const wrapper = mountHct({
      text: TEXT,
      keyMessages: [km(0, 'favor', [{ start: 2, end: 5 }])],
    })
    await marks(wrapper)[0].trigger('mouseenter')
    await nextTick()
    expect(popover()).not.toBeNull()
    await marks(wrapper)[0].trigger('mouseleave')
    // Still open within the grace window.
    vi.advanceTimersByTime(100)
    expect(popover()).not.toBeNull()
    vi.advanceTimersByTime(40)
    await nextTick()
    expect(popover()).toBeNull()
  })

  it('stays open when re-entering an adjacent mark within the grace window', async () => {
    vi.useFakeTimers()
    const wrapper = mountHct({
      text: TEXT,
      keyMessages: [
        km(0, 'favor', [{ start: 0, end: 3 }]),
        km(1, 'against', [{ start: 5, end: 8 }]),
      ],
    })
    const m = marks(wrapper)
    await m[0].trigger('mouseenter')
    await nextTick()
    await m[0].trigger('mouseleave')
    // Re-enter the second mark before the grace timer elapses.
    vi.advanceTimersByTime(80)
    await m[1].trigger('mouseenter')
    await nextTick()
    vi.advanceTimersByTime(120)
    await nextTick()
    expect(popover()).not.toBeNull()
  })

  it('closes on Escape and unpins (emits activate null)', async () => {
    const wrapper = mountHct({
      text: TEXT,
      keyMessages: [km(7, 'favor', [{ start: 2, end: 5 }])],
    })
    await marks(wrapper)[0].trigger('mouseenter')
    await flushPromises()
    expect(popover()).not.toBeNull()
    await marks(wrapper)[0].trigger('keydown.esc')
    await flushPromises()
    expect(popover()).toBeNull()
    expect(wrapper.emitted('activate').at(-1)).toEqual([null])
  })
})

describe('HighlightedContributionText pinning', () => {
  it('emits activate on click, Enter and Space', async () => {
    const wrapper = mountHct({
      text: TEXT,
      keyMessages: [km(7, 'favor', [{ start: 2, end: 5 }])],
    })
    const mark = marks(wrapper)[0]
    await mark.trigger('click')
    await mark.trigger('keydown.enter')
    await mark.trigger('keydown.space')
    expect(wrapper.emitted('activate').map((e) => e[0])).toEqual([7, 7, 7])
  })

  it('toggles the active key message off on a second activation', async () => {
    const wrapper = mountHct({
      text: TEXT,
      keyMessages: [km(7, 'favor', [{ start: 2, end: 5 }])],
      activeId: 7,
    })
    await marks(wrapper)[0].trigger('click')
    expect(wrapper.emitted('activate')[0]).toEqual([null])
  })

  it('emphasises the active key message without any hover', () => {
    const wrapper = mountHct({
      text: TEXT,
      keyMessages: [km(0, 'favor', [{ start: 2, end: 5 }])],
      activeId: 0,
    })
    const mark = marks(wrapper)[0]
    expect(mark.classes()).toContain('hct__mark--active')
    expect(mark.attributes('aria-pressed')).toBe('true')
  })
})

describe('HighlightedContributionText activeId scroll', () => {
  it('scrolls the covering mark into view smoothly for a panel-originated pin', async () => {
    const wrapper = mountHct({
      text: TEXT,
      keyMessages: [km(0, 'favor', [{ start: 2, end: 5 }])],
    })
    const el = marks(wrapper)[0].element
    el.scrollIntoView = vi.fn()
    await wrapper.setProps({ activeId: 0, pinOrigin: 'panel' })
    await nextTick()
    expect(el.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'center',
    })
  })

  it('uses auto scrolling when reduced motion is preferred', async () => {
    const original = window.matchMedia
    window.matchMedia = vi.fn(() => ({ matches: true }))
    try {
      const wrapper = mountHct({
        text: TEXT,
        keyMessages: [km(0, 'favor', [{ start: 2, end: 5 }])],
      })
      const el = marks(wrapper)[0].element
      el.scrollIntoView = vi.fn()
      await wrapper.setProps({ activeId: 0, pinOrigin: 'panel' })
      await nextTick()
      expect(el.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'auto',
        block: 'center',
      })
    } finally {
      window.matchMedia = original
    }
  })

  it('does NOT scroll the passage when the pin originated here (text)', async () => {
    const wrapper = mountHct({
      text: TEXT,
      keyMessages: [km(0, 'favor', [{ start: 2, end: 5 }])],
    })
    const el = marks(wrapper)[0].element
    el.scrollIntoView = vi.fn()
    await wrapper.setProps({ activeId: 0, pinOrigin: 'text' })
    await nextTick()
    expect(el.scrollIntoView).not.toHaveBeenCalled()
  })
})

describe('HighlightedContributionText touch dismissal', () => {
  it('closes the popover on an outside pointerdown', async () => {
    const wrapper = mountHct({
      text: TEXT,
      keyMessages: [km(0, 'favor', [{ start: 2, end: 5 }])],
    })
    await marks(wrapper)[0].trigger('mouseenter')
    await flushPromises()
    expect(popover()).not.toBeNull()
    // A pointerdown on the body (neither a mark nor the popover) dismisses it.
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    await nextTick()
    expect(popover()).toBeNull()
  })

  it('keeps the popover open on a pointerdown inside the popover', async () => {
    const wrapper = mountHct({
      text: TEXT,
      keyMessages: [km(0, 'favor', [{ start: 2, end: 5 }])],
    })
    await marks(wrapper)[0].trigger('mouseenter')
    await flushPromises()
    const pop = popover()
    expect(pop).not.toBeNull()
    pop.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    await nextTick()
    expect(popover()).not.toBeNull()
  })

  it('closes the popover when the pin toggles off (tap-to-unpin)', async () => {
    const wrapper = mountHct({
      text: TEXT,
      keyMessages: [km(0, 'favor', [{ start: 2, end: 5 }])],
      activeId: 0,
    })
    // Open the popover as a tap would (emulated mouseenter), then tap to unpin.
    await marks(wrapper)[0].trigger('mouseenter')
    await flushPromises()
    expect(popover()).not.toBeNull()
    await marks(wrapper)[0].trigger('click')
    await nextTick()
    expect(wrapper.emitted('activate').at(-1)).toEqual([null])
    expect(popover()).toBeNull()
  })
})

describe('HighlightedContributionText global Escape scope', () => {
  it('ignores Escape when nothing is open or pinned', async () => {
    const wrapper = mountHct({
      text: TEXT,
      keyMessages: [km(0, 'favor', [{ start: 2, end: 5 }])],
    })
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    expect(wrapper.emitted('activate')).toBeUndefined()
  })

  it('does not unpin when focus is inside an input', async () => {
    const wrapper = mountHct({
      text: TEXT,
      keyMessages: [km(0, 'favor', [{ start: 2, end: 5 }])],
      activeId: 0,
    })
    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    expect(wrapper.emitted('activate')).toBeUndefined()
    input.remove()
  })

  it('unpins on Escape when pinned and focus is not in a field', async () => {
    const wrapper = mountHct({
      text: TEXT,
      keyMessages: [km(0, 'favor', [{ start: 2, end: 5 }])],
      activeId: 0,
    })
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    expect(wrapper.emitted('activate').at(-1)).toEqual([null])
  })
})

describe('HighlightedContributionText cleanup', () => {
  it('removes viewport and document listeners on unmount', async () => {
    const winRemove = vi.spyOn(window, 'removeEventListener')
    const docRemove = vi.spyOn(document, 'removeEventListener')
    const wrapper = mount(HighlightedContributionText, {
      props: { text: TEXT, keyMessages: [km(0, 'favor', [{ start: 2, end: 5 }])] },
    })
    await wrapper.find('.hct__mark').trigger('mouseenter')
    await nextTick()
    wrapper.unmount()
    const winEvents = winRemove.mock.calls.map((c) => c[0])
    const docEvents = docRemove.mock.calls.map((c) => c[0])
    expect(winEvents).toContain('scroll')
    expect(winEvents).toContain('resize')
    expect(docEvents).toContain('keydown')
    winRemove.mockRestore()
    docRemove.mockRestore()
  })
})
