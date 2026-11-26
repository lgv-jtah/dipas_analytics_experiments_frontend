// Tests for the ContributionLink atom. The URL resolver is mocked so the atom's
// own behaviour (render/no-render, attributes, icon, label, click isolation) is
// tested independent of the real id -> URL map.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'

import ContributionLink from '../ContributionLink.vue'
import HhIcon from '../HhIcon.vue'
import { getContributionLink } from '../../../utils/contributionLink.js'

vi.mock('../../../utils/contributionLink.js', () => ({
  getContributionLink: vi.fn(),
}))

const URL = 'https://proceeding.beteiligung.hamburg/#/contribution/5'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ContributionLink with a mapped id', () => {
  beforeEach(() => {
    getContributionLink.mockReturnValue(URL)
  })

  it('renders an anchor with the resolved href, new-tab target and safe rel', () => {
    const wrapper = mount(ContributionLink, { props: { contributionId: 5 } })
    const a = wrapper.find('a')
    expect(a.exists()).toBe(true)
    expect(a.attributes('href')).toBe(URL)
    expect(a.attributes('target')).toBe('_blank')
    expect(a.attributes('rel')).toBe('noopener noreferrer')
  })

  it('passes the contribution id straight to the resolver', () => {
    mount(ContributionLink, { props: { contributionId: 5 } })
    expect(getContributionLink).toHaveBeenCalledWith(5)
  })

  it('renders the external-link icon', () => {
    const wrapper = mount(ContributionLink, { props: { contributionId: 5 } })
    const icon = wrapper.findComponent(HhIcon)
    expect(icon.exists()).toBe(true)
    expect(icon.props('name')).toBe('external-link')
  })

  it('uses the default English label for title and aria-label', () => {
    const wrapper = mount(ContributionLink, { props: { contributionId: 5 } })
    const a = wrapper.find('a')
    const expected = 'Open the original contribution on beteiligung.hamburg'
    expect(a.attributes('aria-label')).toBe(expected)
    expect(a.attributes('title')).toBe(expected)
  })

  it('honours a label override', () => {
    const wrapper = mount(ContributionLink, {
      props: { contributionId: 5, label: 'Originalbeitrag öffnen' },
    })
    const a = wrapper.find('a')
    expect(a.attributes('aria-label')).toBe('Originalbeitrag öffnen')
    expect(a.attributes('title')).toBe('Originalbeitrag öffnen')
  })

  it('does not fire a parent click handler when the icon is clicked (@click.stop)', async () => {
    const onParentClick = vi.fn()
    const Parent = {
      components: { ContributionLink },
      setup() {
        return { onParentClick }
      },
      template:
        '<div @click="onParentClick"><ContributionLink :contribution-id="5" /></div>',
    }
    const wrapper = mount(Parent)
    await wrapper.find('a').trigger('click')
    expect(onParentClick).not.toHaveBeenCalled()
  })
})

describe('ContributionLink with an unmapped id', () => {
  it('renders nothing when the resolver returns null', () => {
    getContributionLink.mockReturnValue(null)
    const wrapper = mount(ContributionLink, { props: { contributionId: 999 } })
    expect(wrapper.find('a').exists()).toBe(false)
    expect(wrapper.findComponent(HhIcon).exists()).toBe(false)
  })
})
