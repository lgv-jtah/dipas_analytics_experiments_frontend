// Tests for KeyMessageOverview, focused on the original-contribution link added
// next to each RouterLink. The API, the router link, the language composable and
// the id -> URL resolver are mocked; the real extra-string set (German) is used
// so the localized label is exercised.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

vi.mock('vue-router', () => ({
  RouterLink: {
    name: 'RouterLink',
    props: ['to', 'title'],
    template: '<a class="router-link" :href="to"><slot /></a>',
  },
}))

// Map id 83, leave id 7 unmapped so the id-only (no link) branch is covered too.
vi.mock('../../../utils/contributionLink.js', () => ({
  getContributionLink: (id) =>
    id === 83 ? 'https://sub.beteiligung.hamburg/#/contribution/83' : null,
}))

vi.mock('../../../services/api.js', () => ({
  getKeyMessageOverview: vi.fn(),
}))

// Pin German so x.openOriginal resolves to the German label.
vi.mock('../../../composables/useVotesStanceLang.js', async () => {
  const { ref } = await vi.importActual('vue')
  const lang = ref('de')
  return { useVotesStanceStrings: () => ({ lang }) }
})

import KeyMessageOverview from '../KeyMessageOverview.vue'
import { getKeyMessageOverview } from '../../../services/api.js'

const stubs = {
  HhCard: {
    props: ['title'],
    template: '<div><span class="hhcard-title">{{ title }}</span><slot /></div>',
  },
  HhText: { template: '<span><slot /></span>' },
}

beforeEach(() => {
  vi.clearAllMocks()
  getKeyMessageOverview.mockResolvedValue({
    most_agreed: [
      { contribution_id: 83, key_message: 'KM A', favor: 5, against: 1, neutral: 0 },
    ],
    most_rejected: [
      { contribution_id: 7, key_message: 'KM B', favor: 0, against: 4, neutral: 1 },
    ],
  })
})

async function mountOverview() {
  const wrapper = mount(KeyMessageOverview, { global: { stubs } })
  await flushPromises()
  return wrapper
}

describe('KeyMessageOverview original-contribution links', () => {
  it('renders a link next to a mapped contribution with the German label', async () => {
    const wrapper = await mountOverview()
    const link = wrapper.find('a.contribution-link')
    expect(link.exists()).toBe(true)
    expect(link.attributes('aria-label')).toBe('Originalbeitrag auf beteiligung.hamburg öffnen')
    expect(link.attributes('href')).toContain('/contribution/83')
  })

  it('renders no link for an unmapped contribution id', async () => {
    const wrapper = await mountOverview()
    // Only the mapped id (83) gets a link; the unmapped one (7) gets none.
    expect(wrapper.findAll('a.contribution-link')).toHaveLength(1)
  })

  it('still renders the RouterLink id and the counts', async () => {
    const wrapper = await mountOverview()
    expect(wrapper.text()).toContain('#83')
    expect(wrapper.text()).toContain('5 / 1 / 0')
    expect(wrapper.text()).toContain('0 / 4 / 1')
  })
})
