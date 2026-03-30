/** Overpass API: nearby public / non-residential features (OSM). See docs/nearby-public-buildings.md */

/** Prefer lz4/z before main api — same project, often less saturated; kumi is a common public mirror. */
const OVERPASS_ENDPOINTS = [
  'https://lz4.overpass-api.de/api/interpreter',
  'https://z.overpass-api.de/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
]

const DEFAULT_RADIUS_M = 200
const MAX_RESULTS = 22

const RETRYABLE_HTTP = new Set([502, 503, 504])

const AMENITY_REGEX =
  '^(school|university|library|hospital|townhall|courthouse|police|fire_station|community_centre|public_building|parking|bus_station|ferry_terminal|college|kindergarten|clinic|doctors|government|embassy|post_office|monastery)$'

const BUILDING_REGEX =
  '^(commercial|office|public|civic|school|university|hospital|retail|supermarket|warehouse|industrial|parking|train_station|station|pavilion)$'

const RESIDENTIAL_BUILDING =
  /^(house|detached|semidetached_house|apartments|residential|terrace|bungalow|dormitory|static_caravan|cabin)$/i

function haversineM(lat1, lon1, lat2, lon2) {
  const R = 6371000
  const p1 = (lat1 * Math.PI) / 180
  const p2 = (lat2 * Math.PI) / 180
  const dp = ((lat2 - lat1) * Math.PI) / 180
  const dl = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dp / 2) * Math.sin(dp / 2) +
    Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2)
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function elementCenter(el) {
  if (el.lat != null && el.lon != null) return { lat: el.lat, lon: el.lon }
  if (el.center) return { lat: el.center.lat, lon: el.center.lon }
  return null
}

function displayName(tags) {
  if (!tags) return 'Unnamed place'
  return (
    tags.name ||
    tags['name:en'] ||
    tags.operator ||
    tags.brand ||
    tags.ref ||
    tags.office ||
    tags.amenity ||
    tags.building ||
    'Unnamed place'
  )
}

function addressLine(tags) {
  if (!tags) return ''
  const parts = [
    [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' '),
    tags['addr:city'] || tags['addr:place'],
    tags['addr:state'],
  ].filter(Boolean)
  return parts.join(', ')
}

function rawTypeLabel(tags) {
  if (!tags) return ''
  if (tags.amenity) return tags.amenity
  if (tags.building) return tags.building
  return ''
}

function shouldSkip(tags) {
  if (!tags) return true
  const b = tags.building
  if (b && RESIDENTIAL_BUILDING.test(b)) return true
  return false
}

function buildQuery(lat, lon, radiusM) {
  const r = Math.round(radiusM)
  // Shorter server timeout + ways-only for building=* (fewer scanned objects than node+way building).
  return `[out:json][timeout:12];
(
  node["amenity"~"${AMENITY_REGEX}"](around:${r},${lat},${lon});
  way["amenity"~"${AMENITY_REGEX}"](around:${r},${lat},${lon});
  way["building"~"${BUILDING_REGEX}"](around:${r},${lat},${lon});
);
out center;`
}

function isOverpassOverloadRemark(remark) {
  if (!remark || typeof remark !== 'string') return false
  const s = remark.toLowerCase()
  return s.includes('timeout') || s.includes('too many') || s.includes('busy') || s.includes('rate_limited')
}

/**
 * @param {string} query
 * @param {AbortSignal} [signal]
 * @returns {Promise<{ elements?: unknown[] }>}
 */
async function fetchOverpassWithFallback(query, signal) {
  let lastMessage = 'Overpass unavailable'
  for (let u = 0; u < OVERPASS_ENDPOINTS.length; u++) {
    const url = OVERPASS_ENDPOINTS[u]
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: new URLSearchParams({ data: query }).toString(),
        signal,
      })
      if (!res.ok) {
        if (RETRYABLE_HTTP.has(res.status)) {
          lastMessage = `Overpass HTTP ${res.status} (server busy)`
          continue
        }
        throw new Error(`Overpass HTTP ${res.status}`)
      }
      const json = await res.json()
      if (json.error) {
        lastMessage = typeof json.error === 'string' ? json.error : 'Overpass error'
        continue
      }
      const els = json.elements || []
      if (els.length === 0 && json.remark && isOverpassOverloadRemark(json.remark)) {
        lastMessage = 'Overpass timed out or was busy'
        continue
      }
      return json
    } catch (err) {
      if (err && err.name === 'AbortError') throw err
      lastMessage = err && err.message ? err.message : 'Network error'
      continue
    }
  }
  throw new Error(
    `${lastMessage}. Public OSM servers are often overloaded — try again in a minute or move slightly and retake the photo.`
  )
}

/**
 * @param {number} lat
 * @param {number} lon
 * @param {{ radiusM?: number, signal?: AbortSignal }} [opts]
 * @returns {Promise<Array<{ id: string, name: string, addressLine: string, lat: number, lon: number, rawType: string }>>}
 */
export async function fetchNearbyPublicBuildings(lat, lon, opts = {}) {
  const radiusM = opts.radiusM ?? DEFAULT_RADIUS_M
  const query = buildQuery(lat, lon, radiusM)
  const json = await fetchOverpassWithFallback(query, opts.signal)
  const elements = json.elements || []
  const seen = new Map()
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i]
    if (!el || !el.tags) continue
    if (shouldSkip(el.tags)) continue
    const c = elementCenter(el)
    if (!c) continue
    const key = `${el.type}-${el.id}`
    if (seen.has(key)) continue
    const name = displayName(el.tags)
    const addr = addressLine(el.tags)
    const dist = haversineM(lat, lon, c.lat, c.lon)
    seen.set(key, {
      id: `osm-${el.type}-${el.id}`,
      name,
      addressLine: addr,
      lat: c.lat,
      lon: c.lon,
      rawType: rawTypeLabel(el.tags),
      _dist: dist,
    })
  }
  return Array.from(seen.values())
    .sort((a, b) => a._dist - b._dist)
    .slice(0, MAX_RESULTS)
    .map((row) => ({
      id: row.id,
      name: row.name,
      addressLine: row.addressLine,
      lat: row.lat,
      lon: row.lon,
      rawType: row.rawType,
    }))
}

export { DEFAULT_RADIUS_M, MAX_RESULTS, OVERPASS_ENDPOINTS }
