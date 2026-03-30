# Building profile images (OSM / Wikimedia)

**Removed.** The app no longer resolves photos from OSM `image` / `wikimedia_commons` / Wikidata P18 for building profiles.

- New buildings created from the OSM picker use [`PLACEHOLDER_BUILDING_IMAGE`](../ExpoApp/data/buildings.js) (empty URL → building icon in Search).
- [`ExpoApp/services/nearbyPublicBuildings.js`](../ExpoApp/services/nearbyPublicBuildings.js) returns only place metadata (`id`, `name`, `addressLine`, coordinates, `rawType`).

See [nearby-public-buildings.md](./nearby-public-buildings.md) for the Overpass flow.
