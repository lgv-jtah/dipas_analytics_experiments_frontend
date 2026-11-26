// Resolve a contribution id to its canonical "original contribution" URL on the
// public beteiligung.hamburg participation portal.
//
// Why a STATIC map (src/data/contributionLinks.json) rather than building the URL
// from the id? Our backend stores no proceeding id, and each proceeding lives on
// its own subdomain (e.g. jenfelder-au.beteiligung.hamburg), so the id alone does
// not tell us which host to use. The URLs were therefore collected once, by hand,
// from the official `link` field of the public DIPAS PDS API
//   https://beteiligung.hamburg/drupal/dipas-pds/projects/<project>/contributions/
// on 2026-11-26. These proceedings are closed, so their links are stable and the
// snapshot does not need to be refreshed at runtime. Only the small, known set of
// contributions in the file have a public page, so an unknown id is normal and
// yields null (the caller then renders nothing). See README.md for how to
// regenerate the file.
//
// Every returned URL is re-validated here even though the map is trusted at build
// time: the value is interpolated into an <a href>, so this is the single choke
// point that guarantees only https links to beteiligung.hamburg (or a subdomain of
// it) can ever reach the DOM. The allowlist is deliberately strict -- the scheme
// must be https (blocks javascript:/data:/http:) and the host must be
// beteiligung.hamburg or a *.beteiligung.hamburg subdomain (blocks look-alike
// hosts such as beteiligung.hamburg.evil.com). Anything else resolves to null.
import links from '../data/contributionLinks.json'

/**
 * Return the validated original-contribution URL for a contribution id, or null.
 *
 * @param {number|string|null|undefined} id - The contribution id to look up. It is
 *   coerced to a string for the lookup, so a numeric id and its string form resolve
 *   to the same entry. null/undefined return null without a lookup.
 * @returns {string|null} The https beteiligung.hamburg URL, or null when the id is
 *   absent, not mapped, or mapped to a value that fails the security check.
 */
export function getContributionLink(id) {
  if (id === null || id === undefined) return null

  const raw = links[String(id)]
  if (!raw || typeof raw !== 'string') return null

  let url
  try {
    url = new URL(raw)
  } catch {
    // Not a parseable absolute URL (covers 'javascript:alert(1)' and friends,
    // which either throw or carry no https host).
    return null
  }

  if (url.protocol !== 'https:') return null

  const host = url.hostname
  const isHamburgHost =
    host === 'beteiligung.hamburg' || host.endsWith('.beteiligung.hamburg')
  if (!isHamburgHost) return null

  return raw
}
