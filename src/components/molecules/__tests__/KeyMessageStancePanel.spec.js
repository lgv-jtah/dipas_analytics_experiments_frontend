// Tests for KeyMessageStancePanel: the hand-labelled key-message list on a
// contribution page. Exercises both the parent-driven mode (keyMessages/activeId
// props + activate emit) and the self-fetch fallback. The language composable is
// pinned to English; HhCard/HhText are slot-passing stubs; the api module is
// mocked so the self-fetch path can be asserted without a real request.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

vi.mock('../../../composables/useVotesStanceLang.js', async () => {
  const { ref } = await vi.importActual('vue')
  const lang = ref('en')
  return { useVotesStanceStrings: () => ({ lang }) }
})

const { getContributionKeyMessages } = vi.hoisted(() => ({
  getContributionKeyMessages: vi.fn(),
}))
vi.mock('../../../services/api.js', () => ({ getContributionKeyMessages }))

import KeyMessageStancePanel from '../KeyMessageStancePanel.vue'

const stubs = {
  HhCard: {
    props: ['title'],
    template: '<section class="hhcard"><h2>{{ title }}</h2><slot /></section>',
  },
  HhText: { template: '<span class="hhtext"><slot /></span>' },
}

function row(overrides = {}) {
  return {
    key_message: 'Km one',
    favor: 2,
    against: 1,
    neutral: 0,
    n_with_stance: 3,
    too_few: false,
    comments: { favor: [{ comment_text: 'a' }], against: [{ comment_text: 'b' }], neutral: [] },
    spans: [{ start: 0, end: 4 }],
    highlight_stance: 'favor',
    spans_source: 'extraction_model:mistral-nemo',
    ...overrides,
  }
}

function mountPanel(props) {
  return mount(KeyMessageStancePanel, {
    props: { contributionId: 10, ...props },
    global: { stubs },
  })
}

beforeEach(() => {
  getContributionKeyMessages.mockReset()
})

describe('KeyMessageStancePanel (parent-driven)', () => {
  it('renders rows from the keyMessages prop without fetching', async () => {
    const wrapper = mountPanel({ keyMessages: [row({ id: 0 })] })
    await flushPromises()
    expect(getContributionKeyMessages).not.toHaveBeenCalled()
    expect(wrapper.findAll('.kmsp__item')).toHaveLength(1)
    expect(wrapper.text()).toContain('Km one')
    // A stance swatch is shown because highlights are available.
    expect(wrapper.find('.kmsp__swatch--favor').exists()).toBe(true)
  })

  it('exposes each row as a button with aria-pressed reflecting the active id', () => {
    const wrapper = mountPanel({ keyMessages: [row({ id: 5 })], activeId: 5 })
    const item = wrapper.find('.kmsp__item')
    expect(item.attributes('role')).toBe('button')
    expect(item.attributes('aria-pressed')).toBe('true')
    const inactive = mountPanel({ keyMessages: [row({ id: 5 })], activeId: null })
    expect(inactive.find('.kmsp__item').attributes('aria-pressed')).toBe('false')
  })

  it('does NOT emit activate on hover or focus (pin is click/keys only)', async () => {
    const wrapper = mountPanel({ keyMessages: [row({ id: 3 })], activeId: null })
    const item = wrapper.find('.kmsp__item')
    await item.trigger('mouseenter')
    await item.trigger('mouseleave')
    await item.trigger('focus')
    await item.trigger('blur')
    expect(wrapper.emitted('activate')).toBeUndefined()
  })

  it('emits activate on click, Enter and Space (toggle)', async () => {
    const wrapper = mountPanel({ keyMessages: [row({ id: 3 })], activeId: null })
    const item = wrapper.find('.kmsp__item')
    await item.trigger('click')
    await item.trigger('keydown.enter')
    await item.trigger('keydown.space')
    expect(wrapper.emitted('activate').map((e) => e[0])).toEqual([3, 3, 3])
  })

  it('clears the active key message when clicking it again', async () => {
    const wrapper = mountPanel({ keyMessages: [row({ id: 3 })], activeId: 3 })
    await wrapper.find('.kmsp__item').trigger('click')
    expect(wrapper.emitted('activate')[0]).toEqual([null])
  })

  it('marks the active row', () => {
    const wrapper = mountPanel({ keyMessages: [row({ id: 5 })], activeId: 5 })
    expect(wrapper.find('.kmsp__item').classes()).toContain('kmsp__item--active')
  })

  it('scrolls the active row into view with auto behaviour under reduced motion', async () => {
    const original = window.matchMedia
    window.matchMedia = vi.fn(() => ({ matches: true }))
    try {
      const wrapper = mountPanel({ keyMessages: [row({ id: 5 })], activeId: null })
      const el = wrapper.find('.kmsp__item').element
      el.scrollIntoView = vi.fn()
      // Only a text-originated pin scrolls the row.
      await wrapper.setProps({ activeId: 5, pinOrigin: 'text' })
      expect(el.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'auto',
        block: 'nearest',
      })
    } finally {
      window.matchMedia = original
    }
  })

  it('does NOT scroll the row when the pin originated here (panel)', async () => {
    const wrapper = mountPanel({ keyMessages: [row({ id: 5 })], activeId: null })
    const el = wrapper.find('.kmsp__item').element
    el.scrollIntoView = vi.fn()
    await wrapper.setProps({ activeId: 5, pinOrigin: 'panel' })
    expect(el.scrollIntoView).not.toHaveBeenCalled()
  })

  it('shows the "passage not found" note when a key message has no span', () => {
    const wrapper = mountPanel({
      keyMessages: [row({ id: 0, spans: [] })],
    })
    expect(wrapper.find('.kmsp__no-passage').exists()).toBe(true)
    expect(wrapper.text()).toContain('Passage not found')
    // No swatch is drawn when there is no located passage colour to key on.
    expect(wrapper.find('.kmsp__swatch').exists()).toBe(true) // still coloured by stance
  })

  it('hides the panel when the parent passes an empty list', async () => {
    const wrapper = mountPanel({ keyMessages: [] })
    await flushPromises()
    expect(wrapper.find('.kmsp__item').exists()).toBe(false)
    expect(wrapper.find('.hhcard').exists()).toBe(false)
  })
})

describe('KeyMessageStancePanel (self-fetch fallback)', () => {
  it('fetches its own rows when no keyMessages prop is given', async () => {
    getContributionKeyMessages.mockResolvedValue([row()])
    const wrapper = mountPanel({})
    await flushPromises()
    expect(getContributionKeyMessages).toHaveBeenCalledWith(10)
    expect(wrapper.findAll('.kmsp__item')).toHaveLength(1)
    expect(wrapper.text()).toContain('Km one')
  })

  it('hides itself when the fetch fails (non-gold contribution)', async () => {
    getContributionKeyMessages.mockRejectedValue(new Error('404'))
    const wrapper = mountPanel({})
    await flushPromises()
    expect(wrapper.find('.hhcard').exists()).toBe(false)
  })
})
