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

Building profile photos are **not** loaded from OSM or Wikimedia; see [`building-photo-url.md`](./building-photo-url.md).

## Linking to app state

- User-selected row → post fields: `buildingId` (= `id`), `buildingName`, `buildingAddress`, `latitude`, `longitude`.
- **`AppContext`** upserts a **building** record when `buildingId` is not already known (demo seeds use `b1`, `b2`, …; OSM picks use `osm-way-…` etc.) and sets **`building.image`** to **`PLACEHOLDER_BUILDING_IMAGE`** (empty → icon avatar in Search).

## Fair use

Overpass is shared infrastructure. Do **not** hammer the API: fetch **once** after capture (or explicit refresh), avoid tight loops, and expect empty or slow responses occasionally. **504 Gateway Timeout** usually means that instance is saturated; the app retries other mirrors automatically. For production, consider your own Overpass instance or a backend proxy with caching.

## Seed buildings and post linkage

- [`ExpoApp/data/buildings.js`](../ExpoApp/data/buildings.js) exports `initialBuildings` (demo profiles) and `PLACEHOLDER_BUILDING_IMAGE`. Demo buildings use the placeholder image so Search shows the default building icon.
- [`ExpoApp/data/posts.js`](../ExpoApp/data/posts.js) seed posts include `buildingId` (`b1`–`b4`) so Search building grids stay populated before any user-created posts.
- **`AppContext`** initializes `buildings` from `initialBuildings` and appends a new row when `addPost` receives an unknown `buildingId` (typical for `osm-way-*` / `osm-node-*` ids from the picker).
