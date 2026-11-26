// Tests for getContributionLink: the id -> URL resolver and its security filter.
//
// Two groups:
//  1. Against the REAL src/data/contributionLinks.json (happy path + absent/null).
//  2. Against a doMock'd map, to drive the host/scheme validation branches with
//     controlled values (valid subdomain + apex, http, look-alike host, javascript:).
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import realLinks from '../../data/contributionLinks.json'

// A real id known to be in the shipped map (see contributionLinks.json).
const REAL_ID = 83

beforeEach(() => {
  vi.resetModules()
})

afterEach(() => {
  vi.doUnmock('../../data/contributionLinks.json')
  vi.resetModules()
})

async function loadReal() {
  const mod = await import('../contributionLink.js')
  return mod.getContributionLink
}

async function loadWithMap(map) {
  vi.doMock('../../data/contributionLinks.json', () => ({ default: map }))
  const mod = await import('../contributionLink.js')
  return mod.getContributionLink
}

describe('getContributionLink against the real map', () => {
  it('resolves a known numeric id to its URL', async () => {
    const getContributionLink = await loadReal()
    expect(getContributionLink(REAL_ID)).toBe(realLinks[String(REAL_ID)])
  })

  it('resolves the string form of the same id identically', async () => {
    const getContributionLink = await loadReal()
    expect(getContributionLink(String(REAL_ID))).toBe(realLinks[String(REAL_ID)])
  })

  it('returns null for an id that is not in the map', async () => {
    const getContributionLink = await loadReal()
    expect(getContributionLink(999999999)).toBeNull()
  })

  it('returns null for null and undefined', async () => {
    const getContributionLink = await loadReal()
    expect(getContributionLink(null)).toBeNull()
    expect(getContributionLink(undefined)).toBeNull()
  })
})

describe('getContributionLink security filter', () => {
  const MAP = {
    1: 'https://proceeding.beteiligung.hamburg/#/contribution/1', // valid subdomain
    2: 'http://proceeding.beteiligung.hamburg/#/contribution/2', // http -> rejected
    3: 'https://beteiligung.hamburg.evil.com/#/contribution/3', // look-alike -> rejected
    4: 'javascript:alert(1)', // non-http(s) scheme -> rejected
    5: 'https://beteiligung.hamburg/#/contribution/5', // apex host -> valid
    6: 'https://beteiligunghamburg.de/#/contribution/6', // unrelated host -> rejected
    7: 'not a parseable url', // new URL throws -> rejected
  }

  it('accepts an https subdomain of beteiligung.hamburg', async () => {
    const getContributionLink = await loadWithMap(MAP)
    expect(getContributionLink(1)).toBe(MAP[1])
    expect(getContributionLink('1')).toBe(MAP[1])
  })

  it('accepts the https apex beteiligung.hamburg host', async () => {
    const getContributionLink = await loadWithMap(MAP)
    expect(getContributionLink(5)).toBe(MAP[5])
  })

  it('rejects a http (non-https) URL', async () => {
    const getContributionLink = await loadWithMap(MAP)
    expect(getContributionLink(2)).toBeNull()
  })

  it('rejects a look-alike host that only ends with the domain as a label', async () => {
    const getContributionLink = await loadWithMap(MAP)
    expect(getContributionLink(3)).toBeNull()
  })

  it('rejects a javascript: pseudo-URL', async () => {
    const getContributionLink = await loadWithMap(MAP)
    expect(getContributionLink(4)).toBeNull()
  })

  it('rejects an unrelated host', async () => {
    const getContributionLink = await loadWithMap(MAP)
    expect(getContributionLink(6)).toBeNull()
  })

  it('rejects a value that is not a parseable URL (new URL throws)', async () => {
    const getContributionLink = await loadWithMap(MAP)
    expect(getContributionLink(7)).toBeNull()
  })

  it('returns null when the mapped value is not a string', async () => {
    const getContributionLink = await loadWithMap({ 9: 12345 })
    expect(getContributionLink(9)).toBeNull()
  })
})
