# Nearby public buildings (OpenStreetMap / Overpass)

## Purpose

The Expo **New post** flow uses [`ExpoApp/services/nearbyPublicBuildings.js`](../ExpoApp/services/nearbyPublicBuildings.js) to suggest **non-residential / public** places near the user’s capture-time GPS so each post can store a stable `buildingId` and appear on that building’s profile in **Search**.

## API

- **Endpoints:** The app tries several public interpreters in order (see `OVERPASS_ENDPOINTS` in the service): `lz4.overpass-api.de`, `z.overpass-api.de`, `overpass-api.de`, then `overpass.kumi.systems`. **HTTP 502/503/504** or an empty result with a timeout/busy **remark** triggers the next mirror.
- **Method:** `POST`, `Content-Type: application/x-www-form-urlencoded`, body `data=<Overpass QL query>`.
- **Server timeout:** Query uses `[timeout:12]` so overloaded instances fail faster instead of hitting gateway **504** as often.
- **Radius:** default **200 m** around `(lat, lon)` (see `DEFAULT_RADIUS_M` in the module).
- **Result cap:** **22** items after sort by distance (`MAX_RESULTS`).

## Query philosophy

We **include** OSM elements that look like public or commercial infrastructure:

- **`amenity`** matching (regex): e.g. `school`, `university`, `library`, `hospital`, `townhall`, `police`, `fire_station`, `parking`, `bus_station`, etc.
- **`building`** matching (regex): e.g. `commercial`, `office`, `public`, `civic`, `school`, `hospital`, `retail`, `parking`, `train_station`, etc.

We **exclude** rows where `building=*` matches common **residential** values (e.g. `house`, `apartments`, `residential`, `dormitory`, `terrace`, …) so the list skews toward public/commercial facilities. OSM tagging is inconsistent; adjust the regexes in the service file if a region needs tuning.

## Parsed result shape

Each item returned to the UI:

| Field           | Description                                      |
|----------------|--------------------------------------------------|
| `id`           | Stable id: `osm-{node\|way\|relation}-{osmId}`  |
| `name`         | From `name`, `name:en`, `operator`, `brand`, … |
| `addressLine`  | From `addr:*` tags when present                  |
| `lat`, `lon`   | Center point (`out center` for ways)           |
| `rawType`      | `amenity` or `building` tag for subtitle         |
| `photoUrl`     | Public image URL for the building profile (may be empty) |

## Building profile photos (OSM / Wikimedia / Wikidata)

[`ExpoApp/services/buildingPhotoUrl.js`](../ExpoApp/services/buildingPhotoUrl.js) resolves **`photoUrl`** for each nearby option:

1. **OSM `image=*`** — if the value is an `http(s)` URL, it is used as-is.
2. **OSM `wikimedia_commons=*`** — `File:…` is turned into a Wikimedia Commons **`Special:FilePath`** URL (spaces normalized to `_`). Values starting with **`Category:`** are skipped (not a single image).
3. **OSM `wikidata=*`** — first **`Q` id** is parsed; if there is still no `photoUrl`, the app calls Wikidata **`wbgetentities`** in batches (up to 50 ids per request) and reads claim **`P18` (image)** → same Commons **`Special:FilePath`** URL.

Requests to `wikidata.org` use a descriptive **`User-Agent`** (`WIKIMEDIA_USER_AGENT` in the module), as required by Wikimedia. Failures or missing P18 leave **`photoUrl` empty**; **`building.image`** is then empty and **Search** shows a **building icon** inside the circular profile slot.

**Attribution:** Commons files are under various free licenses; in-app display is normal use. If you copy or republish images elsewhere, follow each file’s license on Commons.

**Limits:** Many small POIs have no `image` / `wikimedia_commons` / P18 — expect empty `photoUrl` often. `Special:FilePath` redirects to `upload.wikimedia.org`; React Native `Image` usually follows redirects.

## Linking to app state

- User-selected row → post fields: `buildingId` (= `id`), optional `buildingName`, `buildingAddress`, optional **`buildingImageUrl`** (from `photoUrl`), `latitude`, `longitude`.
- **`AppContext`** upserts a **building** record when `buildingId` is not already known (demo seeds use `b1`, `b2`, …; OSM picks use `osm-way-…` etc.) and sets **`building.image`** to **`buildingImageUrl`** or **`PLACEHOLDER_BUILDING_IMAGE`** (empty string → icon avatar in Search).

## Fair use

Overpass is shared infrastructure. Do **not** hammer the API: fetch **once** after capture (or explicit refresh), avoid tight loops, and expect empty or slow responses occasionally. **504 Gateway Timeout** usually means that instance is saturated; the app retries other mirrors automatically. For production, consider your own Overpass instance or a backend proxy with caching.

## Seed buildings and post linkage

- [`ExpoApp/data/buildings.js`](../ExpoApp/data/buildings.js) exports `initialBuildings` (demo profiles) and `PLACEHOLDER_BUILDING_IMAGE` (empty: no URL, **Search** uses a circular **building** icon). Demo **`b1` / `b2`** use **Commons `Special:FilePath`** URLs for real FIU-area photos; **`b3` / `b4`** use neutral stock URLs for fictional addresses.
- [`ExpoApp/data/posts.js`](../ExpoApp/data/posts.js) seed posts include `buildingId` (`b1`–`b4`) so Search building grids stay populated before any user-created posts.
- **`AppContext`** initializes `buildings` from `initialBuildings` and appends a new row when `addPost` receives an unknown `buildingId` (typical for `osm-way-*` / `osm-node-*` ids from the picker).
