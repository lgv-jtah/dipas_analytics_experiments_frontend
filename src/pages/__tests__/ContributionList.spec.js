// Tests for ContributionList, focused on the original-contribution link added to
// each row's meta area. The router, evaluator composable, API and id -> URL
// resolver are mocked; layout wrappers are stubbed while the small atoms
// (HhBadge, HhIcon, ContributionLink) stay real.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))
vi.mock('vue-router', () => ({ useRouter: () => ({ push }) }))

// An evaluator is set so the "set your name" banner (and its router-link) is hidden.
vi.mock('../../composables/useEvaluator.js', async () => {
  const { ref } = await vi.importActual('vue')
  return { useEvaluator: () => ({ evaluator: ref('alice') }) }
})

vi.mock('../../services/api.js', () => ({
  getContributions: vi.fn(),
  getContributionsStats: vi.fn(),
}))

// Map id 83, leave 999 unmapped so both the link and id-only branches are covered.
vi.mock('../../utils/contributionLink.js', () => ({
  getContributionLink: (id) =>
    id === 83 ? 'https://sub.beteiligung.hamburg/#/contribution/83' : null,
}))

import ContributionList from '../ContributionList.vue'
import { getContributions, getContributionsStats } from '../../services/api.js'

const stubs = {
  AppShell: { template: '<div><slot /></div>' },
  PageHeader: { template: '<div><slot /><slot name="actions" /></div>' },
  HhText: { template: '<span><slot /></span>' },
}

beforeEach(() => {
  vi.clearAllMocks()
  getContributions.mockResolvedValue([
    { contribution_id: 83, contribution_content: 'Ein erster Beitrag' },
    { contribution_id: 999, contribution_content: 'Noch ein Beitrag' },
  ])
  getContributionsStats.mockResolvedValue([])
})

async function mountList() {
  const wrapper = mount(ContributionList, { global: { stubs } })
  await flushPromises()
  return wrapper
}

describe('ContributionList original-contribution links', () => {
  it('renders both contribution rows', async () => {
    const wrapper = await mountList()
    expect(wrapper.findAll('.contribution-item')).toHaveLength(2)
  })

  it('renders a link only for the mapped contribution, with the default English label', async () => {
    const wrapper = await mountList()
    const links = wrapper.findAll('a.contribution-link')
    expect(links).toHaveLength(1)
    expect(links[0].attributes('aria-label')).toBe(
      'Open the original contribution on beteiligung.hamburg'
    )
    expect(links[0].attributes('href')).toContain('/contribution/83')
  })

  it('does not navigate the row when the external link is clicked', async () => {
    const wrapper = await mountList()
    await wrapper.find('a.contribution-link').trigger('click')
    expect(push).not.toHaveBeenCalled()
  })

  it('navigates when the row itself is clicked', async () => {
    const wrapper = await mountList()
    await wrapper.find('.contribution-item').trigger('click')
    expect(push).toHaveBeenCalledWith(expect.stringContaining('/evaluation/contributions/'))
  })
})
