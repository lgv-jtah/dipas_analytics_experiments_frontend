// Tests for the VotesStance page wiring added for the per-contribution cards:
// on mount it loads the overview AND the contribution titles in parallel, builds
// a makeTitle map keyed by String(id), routes to a contribution on @select, and
// keeps working when the contributions request fails (titles just stay empty).
// The API, the router and the language composable are mocked; the heavy children
// (summary, scatter, overview, the cards section itself) are stubbed.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

import VotesStance from '../VotesStance.vue'
import {
  getVotesStanceSnapshotInfo,
  getVotesStanceOverview,
  getContributions,
} from '../../services/api.js'
import { makeTitle } from '../../i18n/votesStanceExtra.js'

// Router push spy, hoisted so the vi.mock factory can close over it.
const { push } = vi.hoisted(() => ({ push: vi.fn() }))
vi.mock('vue-router', () => ({ useRouter: () => ({ push }) }))

vi.mock('../../services/api.js', () => ({
  getVotesStanceSnapshotInfo: vi.fn(),
  getVotesStanceOverview: vi.fn(),
  getContributions: vi.fn(),
}))

// Resolve every id to a valid URL so the table's external-link atom renders
// deterministically, independent of the shipped id -> URL map.
vi.mock('../../utils/contributionLink.js', () => ({
  getContributionLink: (id) => `https://sub.beteiligung.hamburg/#/contribution/${id}`,
}))

// Pin English and hand the page the real string set so its template renders. The
// refs must be real so the template auto-unwraps `t.tableHelp.title` etc.
vi.mock('../../composables/useVotesStanceLang.js', async () => {
  const { ref, computed } = await vi.importActual('vue')
  const actual = await vi.importActual('../../i18n/votesStance.js')
  const lang = ref('en')
  const strings = computed(() => actual.getVotesStanceStrings('en'))
  return { useVotesStanceStrings: () => ({ lang, strings }) }
})

// A functional stub for the cards section: it exposes rows/titles and emits a
// select with the first row's id so the page's routing can be exercised.
const CardsStub = {
  name: 'ContributionCardsSection',
  props: ['rows', 'titles'],
  emits: ['select'],
  template:
    '<button class="cards" @click="$emit(\'select\', rows[0].contribution_id)"></button>',
}

const stubs = {
  AppShell: { template: '<div><slot /></div>' },
  HhCard: { template: '<div><slot /></div>' },
  HhText: { template: '<span><slot /></span>' },
  PageHeader: true,
  LanguageToggle: true,
  StanceScatter: true,
  VotesStanceSummary: true,
  KeyMessageOverview: true,
  ContributionCardsSection: CardsStub,
}

const overviewRows = [
  {
    contribution_id: 22159,
    thumbs_up_share: 0.9264,
    comment_favor_share: 0.3333,
    n_comments: 4,
    votes_pro: 63,
    votes_contra: 5,
    counts: { favor: 1, against: 2, neutral: 1, mixed: 0 },
  },
  {
    contribution_id: 83,
    thumbs_up_share: 0.7777,
    comment_favor_share: 1.0,
    n_comments: 7,
    votes_pro: 7,
    votes_contra: 2,
    counts: { favor: 7, against: 0, neutral: 0, mixed: 0 },
  },
]

const contributionList = [
  { contribution_id: 83, contribution_content: '  Ein neuer   Spielplatz\nfür alle  ' },
  { contribution_id: 22159, contribution_content: 'Mehr Sitzbänke entlang des Weges' },
]

async function mountPage() {
  const wrapper = mount(VotesStance, { global: { stubs } })
  await flushPromises()
  await wrapper.vm.$nextTick()
  return wrapper
}

beforeEach(() => {
  vi.clearAllMocks()
  getVotesStanceSnapshotInfo.mockResolvedValue({ snapshot_utc: '2024-01-01', note: '' })
  getVotesStanceOverview.mockResolvedValue(overviewRows)
  getContributions.mockResolvedValue(contributionList)
})

describe('VotesStance per-contribution cards wiring', () => {
  it('loads the overview and the contribution titles on mount', async () => {
    await mountPage()
    expect(getVotesStanceOverview).toHaveBeenCalledTimes(1)
    expect(getContributions).toHaveBeenCalledTimes(1)
  })

  it('builds the title map keyed by String(id) via makeTitle', async () => {
    const wrapper = await mountPage()
    const cards = wrapper.findComponent(CardsStub)
    const titles = cards.props('titles')
    // Whitespace is collapsed by makeTitle, and keys are strings.
    expect(titles['83']).toBe(makeTitle('  Ein neuer   Spielplatz\nfür alle  '))
    expect(titles['83']).toBe('Ein neuer Spielplatz für alle')
    expect(titles['22159']).toBe('Mehr Sitzbänke entlang des Weges')
    // The cards receive the full overview row set.
    expect(cards.props('rows')).toHaveLength(2)
  })

  it('routes to the contribution detail page on select', async () => {
    const wrapper = await mountPage()
    await wrapper.find('.cards').trigger('click')
    expect(push).toHaveBeenCalledWith('/evaluation/contributions/22159')
  })

  it('keeps working when the contributions request fails (empty titles)', async () => {
    getContributions.mockRejectedValue(new Error('boom'))
    const wrapper = await mountPage()
    const cards = wrapper.findComponent(CardsStub)
    // Page did not error out: the cards still render.
    expect(cards.exists()).toBe(true)
    expect(cards.props('titles')).toEqual({})
    expect(cards.props('rows')).toHaveLength(2)
  })

  it('renders an original-contribution link in each table id cell', async () => {
    const wrapper = await mountPage()
    const links = wrapper.findAll('.vs-id-cell a.contribution-link')
    // One row per overview entry.
    expect(links).toHaveLength(overviewRows.length)
    // English default label (the page passes t.openOriginal in English).
    expect(links[0].attributes('aria-label')).toBe(
      'Open the original contribution on beteiligung.hamburg'
    )
    const hrefs = links.map((l) => l.attributes('href'))
    expect(hrefs.some((h) => h.includes('/contribution/22159'))).toBe(true)
    expect(hrefs.some((h) => h.includes('/contribution/83'))).toBe(true)
  })
})
