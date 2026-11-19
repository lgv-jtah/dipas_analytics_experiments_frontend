// Tests for ContributionCardsSection: the per-contribution cards on the Votes vs.
// Stance page. The language composable is mocked to pin German (so the real
// German strings and VoteStanceBars aria-labels are exercised); HhCard and HhText
// are stubbed to pass their slots through, while the REAL VoteStanceBars is
// mounted so each card's bars and aria-labels are asserted end to end.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'

import ContributionCardsSection from '../ContributionCardsSection.vue'

// Pin the feature language to German and hand the component the real string sets.
// Real refs so computed(() => ...lang.value) and barStrings track them correctly.
vi.mock('../../../composables/useVotesStanceLang.js', async () => {
  const { ref, computed } = await vi.importActual('vue')
  const actual = await vi.importActual('../../../i18n/votesStance.js')
  const lang = ref('de')
  const strings = computed(() => actual.getVotesStanceStrings('de'))
  return { useVotesStanceStrings: () => ({ lang, strings }) }
})

// Slot-passing stubs so rendered text is assertable; VoteStanceBars stays real.
const stubs = {
  HhCard: {
    props: ['title'],
    template: '<div class="hhcard"><span class="hhcard-title">{{ title }}</span><slot /></div>',
  },
  HhText: { template: '<span class="hhtext"><slot /></span>' },
}

// Rows cover: a 22159-like strong negative gap, a positive gap, a milder negative
// gap, a non-shared row with no votes (null thumbs share), and a non-shared row
// with votes but no clear comment (null favor share).
function makeRows() {
  return [
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
      contribution_id: 100,
      thumbs_up_share: 0.5,
      comment_favor_share: 1.0,
      n_comments: 3,
      votes_pro: 5,
      votes_contra: 5,
      counts: { favor: 3, against: 0, neutral: 0, mixed: 0 },
    },
    {
      contribution_id: 7,
      thumbs_up_share: 0.8,
      comment_favor_share: 0.6,
      n_comments: 5,
      votes_pro: 4,
      votes_contra: 1,
      counts: { favor: 3, against: 2, neutral: 0, mixed: 0 },
    },
    {
      // Non-shared: no votes at all, so thumbs_up_share is null.
      contribution_id: 200,
      thumbs_up_share: null,
      comment_favor_share: 1.0,
      n_comments: 2,
      votes_pro: 0,
      votes_contra: 0,
      counts: { favor: 2, against: 0, neutral: 0, mixed: 0 },
    },
    {
      // Non-shared: has votes but no clear comment, so comment_favor_share is null.
      contribution_id: 300,
      thumbs_up_share: 1.0,
      comment_favor_share: null,
      n_comments: 2,
      votes_pro: 10,
      votes_contra: 0,
      counts: { favor: 0, against: 0, neutral: 2, mixed: 0 },
    },
  ]
}

const titles = {
  22159: 'Mehr Sitzbänke entlang des Weges',
  100: 'Ein neuer Spielplatz',
  // 7 intentionally missing to test the id-only fallback.
}

function mountSection(props = {}) {
  return mount(ContributionCardsSection, {
    props: { rows: makeRows(), titles, ...props },
    global: { stubs },
  })
}

// Read the ordered list of contribution ids as shown in the card headers.
function cardIds(wrapper) {
  return wrapper.findAll('.cc__card-id').map((n) => n.text())
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ContributionCardsSection chrome', () => {
  it('shows the German title, the not-pre-registered badge and the intro', () => {
    const wrapper = mountSection()
    const text = wrapper.text()
    expect(text).toContain('Einzelne Beiträge im Vergleich')
    expect(text).toContain('nicht vorab festgelegt')
    expect(text).toContain('Jede Karte zeigt die Daumen')
  })
})

describe('default shared-only view', () => {
  it('shows only the shared contributions with a count', () => {
    const wrapper = mountSection()
    // 3 shared rows (22159, 100, 7); 200 and 300 are filtered out.
    expect(wrapper.findAll('.cc__card')).toHaveLength(3)
    expect(wrapper.text()).toContain('Angezeigt: 3 von 5 Beiträgen.')
    const ids = cardIds(wrapper)
    expect(ids).not.toContain('#200')
    expect(ids).not.toContain('#300')
  })

  it('sorts by gap ascending (most negative first)', () => {
    const wrapper = mountSection()
    // gaps: 22159 ≈ -0.59, 7 = -0.20, 100 = +0.50
    expect(cardIds(wrapper)).toEqual(['#22159', '#7', '#100'])
  })
})

describe('show-all toggle', () => {
  it('reveals the non-shared contributions and keeps nulls last', async () => {
    const wrapper = mountSection()
    await wrapper.find('input[type="checkbox"]').setValue(true)
    expect(wrapper.findAll('.cc__card')).toHaveLength(5)
    expect(wrapper.text()).toContain('Angezeigt: 5 von 5 Beiträgen.')
    // Shared rows keep gap order, the two null-gap rows come last.
    const ids = cardIds(wrapper)
    expect(ids.slice(0, 3)).toEqual(['#22159', '#7', '#100'])
    expect(ids.slice(3).sort()).toEqual(['#200', '#300'])
  })
})

describe('other sort keys', () => {
  it('sorts by number of thumbs descending', async () => {
    const wrapper = mountSection()
    await wrapper.find('select').setValue('thumbs')
    // thumbs totals: 22159 = 68, 100 = 10, 7 = 5
    expect(cardIds(wrapper)).toEqual(['#22159', '#100', '#7'])
  })

  it('sorts by contribution id ascending', async () => {
    const wrapper = mountSection()
    await wrapper.find('select').setValue('id')
    expect(cardIds(wrapper)).toEqual(['#7', '#100', '#22159'])
  })
})

describe('card header', () => {
  it('shows the id and title, and falls back to id only when no title', () => {
    const wrapper = mountSection()
    const cards = wrapper.findAll('.cc__card')
    // First card (22159) has a title.
    expect(cards[0].text()).toContain('#22159')
    expect(cards[0].find('.cc__card-title').exists()).toBe(true)
    expect(cards[0].text()).toContain('Mehr Sitzbänke entlang des Weges')
    // Card for #7 has no title in the map -> no title element.
    const seven = cards.find((c) => c.find('.cc__card-id').text() === '#7')
    expect(seven.find('.cc__card-title').exists()).toBe(false)
  })

  it('exposes an accessible open label per card', () => {
    const wrapper = mountSection()
    const head = wrapper.find('.cc__card-head')
    expect(head.attributes('role')).toBe('button')
    expect(head.attributes('aria-label')).toBe('Beitrag #22159 öffnen')
  })
})

describe('selection', () => {
  it('emits a numeric id on click', async () => {
    const wrapper = mountSection()
    await wrapper.find('.cc__card-head').trigger('click')
    const events = wrapper.emitted('select')
    expect(events).toHaveLength(1)
    expect(events[0]).toEqual([22159])
    expect(typeof events[0][0]).toBe('number')
  })

  it('emits on Enter', async () => {
    const wrapper = mountSection()
    await wrapper.find('.cc__card-head').trigger('keydown.enter')
    expect(wrapper.emitted('select')[0]).toEqual([22159])
  })
})

describe('bars and footer', () => {
  it('renders the vote bar aria-label from the real VoteStanceBars', () => {
    const wrapper = mountSection()
    const labels = wrapper
      .findAll('[role="img"]')
      .map((b) => b.attributes('aria-label'))
    expect(labels).toContain('Daumen hoch 63, Daumen runter 5')
  })

  it('does not stamp each card with the descriptive-only footer', () => {
    const wrapper = mountSection()
    // The per-contribution descriptive-note wording must not appear on the cards.
    expect(wrapper.text()).not.toContain('nur beschreibend')
  })
})

describe('empty state', () => {
  it('shows the empty message when there is nothing to show', () => {
    const wrapper = mountSection({ rows: [] })
    expect(wrapper.findAll('.cc__card')).toHaveLength(0)
    expect(wrapper.text()).toContain('Keine Beiträge vorhanden.')
    expect(wrapper.text()).toContain('Angezeigt: 0 von 0 Beiträgen.')
  })

  it('is empty by default when no row is shared', () => {
    const nonShared = makeRows().filter((r) => [200, 300].includes(r.contribution_id))
    const wrapper = mountSection({ rows: nonShared })
    expect(wrapper.findAll('.cc__card')).toHaveLength(0)
    expect(wrapper.text()).toContain('Keine Beiträge vorhanden.')
  })
})
