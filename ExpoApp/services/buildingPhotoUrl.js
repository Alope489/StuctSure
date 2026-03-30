/**
 * Resolve building photo URLs from OSM tags and Wikidata P18 (Wikimedia Commons).
 * See docs/nearby-public-buildings.md
 */

const WIKIDATA_API = 'https://www.wikidata.org/w/api.php'
/** Wikimedia requires a descriptive User-Agent for API use. */
export const WIKIMEDIA_USER_AGENT = 'StructSure-Expo/1.0 (building profile photos; contact via app maintainer)'

const WD_BATCH = 50

/**
 * @param {string} fileOrName Value like "File:Foo bar.jpg" or "Foo_bar.jpg"
 * @returns {string}
 */
export function commonsSpecialFilePathUrl(fileOrName) {
  const name = fileOrName
    .replace(/^File:/i, '')
    .trim()
    .replace(/ /g, '_')
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(name)}`
}

/**
 * @param {string} [tagVal] OSM wikidata tag (Q-id or URL)
 * @returns {string} First Q-id or ''
 */
export function parseWikidataIdFromOsm(tagVal) {
  if (!tagVal || typeof tagVal !== 'string') return ''
  const m = tagVal.match(/Q[1-9]\d*/i)
  return m ? m[0].toUpperCase() : ''
}

/**
 * @param {Record<string, string>} [tags] OSM element tags
 * @returns {{ photoUrl: string, wikidataId: string }}
 */
export function photoUrlFromOsmTags(tags) {
  if (!tags) return { photoUrl: '', wikidataId: '' }
  const wikidataId = parseWikidataIdFromOsm(tags.wikidata)
  const img = typeof tags.image === 'string' ? tags.image.trim() : ''
  if (img && /^https?:\/\//i.test(img)) return { photoUrl: img, wikidataId }

  const wc = typeof tags.wikimedia_commons === 'string' ? tags.wikimedia_commons.trim() : ''
  if (wc) {
    if (/^Category:/i.test(wc)) return { photoUrl: '', wikidataId }
    if (/^File:/i.test(wc)) return { photoUrl: commonsSpecialFilePathUrl(wc), wikidataId }
    return { photoUrl: commonsSpecialFilePathUrl(`File:${wc}`), wikidataId }
  }

  return { photoUrl: '', wikidataId }
}

/**
 * @param {string} p18Value Wikidata P18 mainsnak string (often "Photo.jpg" or "File:Photo.jpg")
 * @returns {string}
 */
export function commonsUrlFromWikidataP18(p18Value) {
  if (!p18Value || typeof p18Value !== 'string') return ''
  return commonsSpecialFilePathUrl(p18Value.startsWith('File:') ? p18Value : `File:${p18Value}`)
}

/**
 * @param {Array<{ photoUrl?: string, wikidataId?: string }>} rows Mutated in place: sets photoUrl from P18 when missing
 * @param {AbortSignal} [signal]
 */
export async function enrichPhotoUrlsFromWikidata(rows, signal) {
  const ids = []
  const seen = new Set()
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]
    if (r.photoUrl || !r.wikidataId) continue
    if (seen.has(r.wikidataId)) continue
    seen.add(r.wikidataId)
    ids.push(r.wikidataId)
  }
  for (let b = 0; b < ids.length; b += WD_BATCH) {
    const batch = ids.slice(b, b + WD_BATCH)
    const url = `${WIKIDATA_API}?action=wbgetentities&ids=${encodeURIComponent(batch.join('|'))}&props=claims&format=json`
    const res = await fetch(url, {
      headers: { 'User-Agent': WIKIMEDIA_USER_AGENT, Accept: 'application/json' },
      signal,
    })
    if (!res.ok) continue
    const data = await res.json()
    const entities = data.entities || {}
    for (let j = 0; j < batch.length; j++) {
      const qid = batch[j]
      const ent = entities[qid]
      const p18 = ent?.claims?.P18?.[0]?.mainsnak?.datavalue?.value
      if (typeof p18 !== 'string' || !p18) continue
      const photoUrl = commonsUrlFromWikidataP18(p18)
      if (!photoUrl) continue
      for (let k = 0; k < rows.length; k++) {
        if (rows[k].wikidataId === qid && !rows[k].photoUrl) rows[k].photoUrl = photoUrl
      }
    }
  }
}
