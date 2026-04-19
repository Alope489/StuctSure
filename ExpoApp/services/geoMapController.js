/**
 * Geo / map + Google Places integration for Search.
 * Uses Places Web Service (Autocomplete + Details) when EXPO_PUBLIC_GOOGLE_MAPS_API_KEY is set.
 * Restrict the key (HTTP referrer / Android package + SHA / iOS bundle) in Google Cloud Console.
 */

const apiKey = () => process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() || ''

export function isGooglePlacesConfigured() {
  return Boolean(apiKey())
}

export function safeLower(s) {
  return String(s ?? '').toLowerCase()
}

function postsTextBlobForBuilding(posts, buildingId) {
  return posts
    .filter((p) => p.buildingId === buildingId)
    .map((p) => [safeLower(p.title), safeLower(p.body)].join(' '))
    .join(' ')
}

/**
 * Local "database" search: building name, address, category tags, report title/body.
 * @param {Array<{ id: string, name?: string, address?: string }>} buildings
 * @param {Array<{ buildingId?: string, title?: string, body?: string }>} posts
 * @param {string} query
 * @param {(post: object) => string[]} getPostCategoryTags
 */
export function searchBuildingsLocal(buildings, posts, query, getPostCategoryTags) {
  const q = query.trim().toLowerCase()
  if (!q.length) return []

  return buildings
    .map((b) => {
      const tagMatches = posts
        .filter((p) => p.buildingId === b.id)
        .flatMap((p) => getPostCategoryTags(p))
        .filter((tag, idx, all) => all.indexOf(tag) === idx)
        .filter((tag) => safeLower(tag).includes(q))
      const postText = postsTextBlobForBuilding(posts, b.id)
      const name = safeLower(b.name)
      const address = safeLower(b.address)
      const matches =
        name.includes(q) || address.includes(q) || tagMatches.length > 0 || postText.includes(q)
      return { building: b, tagMatches, matches }
    })
    .filter((row) => row.matches)
    .map(({ building, tagMatches }) => ({ kind: 'building', building, tagMatches }))
}

/**
 * @param {string} input
 * @returns {Promise<Array<{ kind: 'place', placeId: string, primaryText: string, secondaryText: string, description: string }>>}
 */
export async function fetchPlacePredictions(input) {
  const key = apiKey()
  const q = input?.trim()
  if (!key || !q || q.length < 2) return []

  const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json')
  url.searchParams.set('input', q)
  url.searchParams.set('key', key)

  const res = await fetch(url.toString())
  const data = await res.json()
  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    if (__DEV__ && data.error_message) {
      console.warn('[geoMapController] autocomplete:', data.status, data.error_message)
    }
    return []
  }

  return (data.predictions || []).map((p) => ({
    kind: 'place',
    placeId: p.place_id,
    primaryText: p.structured_formatting?.main_text || p.description,
    secondaryText: p.structured_formatting?.secondary_text || '',
    description: p.description,
  }))
}

/**
 * @param {string} placeId
 * @returns {Promise<{ lat: number, lng: number, name?: string, formattedAddress?: string } | null>}
 */
export async function fetchPlaceDetailsLatLng(placeId) {
  const key = apiKey()
  if (!key || !placeId) return null

  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
  url.searchParams.set('place_id', placeId)
  url.searchParams.set('fields', 'geometry,name,formatted_address')
  url.searchParams.set('key', key)

  const res = await fetch(url.toString())
  const data = await res.json()
  if (data.status !== 'OK' || !data.result?.geometry?.location) return null

  const loc = data.result.geometry.location
  return {
    lat: loc.lat,
    lng: loc.lng,
    name: data.result.name,
    formattedAddress: data.result.formatted_address,
  }
}

/** @param {Array<{ latitude?: number|null, longitude?: number|null }>} buildings */
export function regionForBuildings(buildings, paddingRatio = 1.35) {
  const withCoords = buildings.filter(
    (b) => typeof b.latitude === 'number' && typeof b.longitude === 'number'
  )
  if (!withCoords.length) {
    return {
      latitude: 25.7617,
      longitude: -80.1918,
      latitudeDelta: 0.22,
      longitudeDelta: 0.22,
    }
  }
  let minLat = Infinity
  let maxLat = -Infinity
  let minLng = Infinity
  let maxLng = -Infinity
  for (const b of withCoords) {
    minLat = Math.min(minLat, b.latitude)
    maxLat = Math.max(maxLat, b.latitude)
    minLng = Math.min(minLng, b.longitude)
    maxLng = Math.max(maxLng, b.longitude)
  }
  const midLat = (minLat + maxLat) / 2
  const midLng = (minLng + maxLng) / 2
  let dLat = Math.max((maxLat - minLat) * paddingRatio, 0.04)
  let dLng = Math.max((maxLng - minLng) * paddingRatio, 0.04)
  return {
    latitude: midLat,
    longitude: midLng,
    latitudeDelta: dLat,
    longitudeDelta: dLng,
  }
}
