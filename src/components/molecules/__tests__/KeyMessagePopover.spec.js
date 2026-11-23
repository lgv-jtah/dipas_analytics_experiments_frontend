// Tests for KeyMessagePopover: the hover/focus tooltip over a highlighted
// passage. The language composable is pinned to English so the real extra-string
// set (legend labels + count words) is exercised.
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import KeyMessagePopover from '../KeyMessagePopover.vue'

vi.mock('../../../composables/useVotesStanceLang.js', async () => {
  const { ref } = await vi.importActual('vue')
  const lang = ref('en')
  return { useVotesStanceStrings: () => ({ lang }) }
})

function item(overrides = {}) {
  return {
    id: 0,
    key_message: 'Km zero',
    highlight_stance: 'favor',
    favor: 1,
    against: 0,
    neutral: 3,
    ...overrides,
  }
}

function mountPopover(props = {}) {
  return mount(KeyMessagePopover, {
    props: { items: [item()], popoverId: 'kmpop-1', ...props },
  })
}

describe('KeyMessagePopover', () => {
  it('renders the key message text and the legend label for its stance', () => {
    const wrapper = mountPopover()
    expect(wrapper.text()).toContain('Km zero')
    // legendFavor
    expect(wrapper.text()).toContain('Mostly agreed with')
  })

  it('draws the stance swatch with the matching class', () => {
    const wrapper = mountPopover({ items: [item({ highlight_stance: 'against' })] })
    expect(wrapper.find('.kmpop__swatch--against').exists()).toBe(true)
  })

  it('shows the count line with favor / against / neutral words', () => {
    const wrapper = mountPopover()
    const counts = wrapper.find('.kmpop__counts').text()
    expect(counts).toBe('1 In favor · 0 Against · 3 Neutral')
  })

  it('appends the mixed group only when mixed > 0', () => {
    const withMixed = mountPopover({ items: [item({ mixed: 2 })] })
    expect(withMixed.find('.kmpop__counts').text()).toContain('2 mixed')
    const noMixed = mountPopover({ items: [item({ mixed: 0 })] })
    expect(noMixed.find('.kmpop__counts').text()).not.toContain('mixed')
  })

  it('lists one block per covering key message', () => {
    const wrapper = mountPopover({
      items: [item({ id: 0 }), item({ id: 1, key_message: 'Km one' })],
    })
    expect(wrapper.findAll('.kmpop__item')).toHaveLength(2)
    expect(wrapper.text()).toContain('Km zero')
    expect(wrapper.text()).toContain('Km one')
  })

  it('carries role=tooltip and the given id', () => {
    const wrapper = mountPopover({ popoverId: 'kmpop-42' })
    const root = wrapper.find('.kmpop')
    expect(root.attributes('role')).toBe('tooltip')
    expect(root.attributes('id')).toBe('kmpop-42')
  })

  it('applies the position as fixed coordinates', () => {
    const wrapper = mountPopover({ position: { top: 120, left: 40, placement: 'above' } })
    const style = wrapper.find('.kmpop').attributes('style')
    expect(style).toContain('position: fixed')
    expect(style).toContain('top: 120px')
    expect(style).toContain('left: 40px')
  })

  it('marks itself aria-hidden when not visible', () => {
    const wrapper = mountPopover({ visible: false })
    expect(wrapper.find('.kmpop').attributes('aria-hidden')).toBe('true')
  })

  it('renders HTML-looking key-message text literally (never v-html)', () => {
    const wrapper = mountPopover({
      items: [item({ key_message: '<b>bold</b>' })],
    })
    expect(wrapper.text()).toContain('<b>bold</b>')
    expect(wrapper.find('b').exists()).toBe(false)
  })

  it('forwards pointerenter and pointerleave for grace handling', async () => {
    const wrapper = mountPopover()
    await wrapper.find('.kmpop').trigger('pointerenter')
    await wrapper.find('.kmpop').trigger('pointerleave')
    expect(wrapper.emitted('pointerenter')).toHaveLength(1)
    expect(wrapper.emitted('pointerleave')).toHaveLength(1)
  })
})
