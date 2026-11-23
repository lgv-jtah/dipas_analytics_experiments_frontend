// Tests for KeyMessageHighlightLegend: the four-colour legend and provenance
// note above the highlighted contribution text. The language composable is
// mocked per test so both the English and German string sets are exercised.
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'

const lang = { value: 'en' }

vi.mock('../../../composables/useVotesStanceLang.js', async () => {
  const { ref } = await vi.importActual('vue')
  const langRef = ref('en')
  // Keep the exported ref in sync with the module-level `lang` each test sets.
  return {
    useVotesStanceStrings: () => {
      langRef.value = lang.value
      return { lang: langRef }
    },
  }
})

import KeyMessageHighlightLegend from '../KeyMessageHighlightLegend.vue'

describe('KeyMessageHighlightLegend', () => {
  it('renders four colour swatches and the English labels', () => {
    lang.value = 'en'
    const wrapper = mount(KeyMessageHighlightLegend)
    expect(wrapper.findAll('.kmhl__swatch')).toHaveLength(4)
    const text = wrapper.text()
    expect(text).toContain('Mostly agreed with')
    expect(text).toContain('Mostly disagreed with')
    expect(text).toContain('Split for and against')
    expect(text).toContain('No clear stance')
    // The provenance note names the extraction model as the source.
    expect(text).toContain('extraction model')
  })

  it('renders the German labels and note', () => {
    lang.value = 'de'
    const wrapper = mount(KeyMessageHighlightLegend)
    const text = wrapper.text()
    expect(text).toContain('Überwiegend Zustimmung')
    expect(text).toContain('Überwiegend Ablehnung')
    expect(text).toContain('Geteilt, dafür und dagegen')
    expect(text).toContain('Keine klare Haltung')
    expect(text).toContain('Extraktionsmodell')
  })
})
