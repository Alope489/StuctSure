/** Seed buildings for Search; posts link via buildingId. Dynamic OSM picks are merged in AppContext. */

/** Empty = no remote photo; Search shows a building icon inside the circular profile slot. */
export const PLACEHOLDER_BUILDING_IMAGE = ''

/** Demo seeds use the placeholder avatar; OSM-linked buildings added in context use the same default. */
export const initialBuildings = [
  {
    id: 'b1',
    name: 'Steven J. Green School of International and Public Affairs',
    address: '11150 SW 14th St, Miami, FL 33199',
    latitude: 25.7571,
    longitude: -80.3734,
    image: PLACEHOLDER_BUILDING_IMAGE,
    tags: 6,
    history: 877,
  },
  {
    id: 'b2',
    name: 'Town Park Estates',
    address: 'SW 112th Ave area, Miami-Dade, FL',
    latitude: 25.579,
    longitude: -80.438,
    image: PLACEHOLDER_BUILDING_IMAGE,
    tags: 5,
    history: 412,
  },
  {
    id: 'b3',
    name: 'Riverside Plaza',
    address: '214 W Pine St',
    latitude: 25.7743,
    longitude: -80.1933,
    image: PLACEHOLDER_BUILDING_IMAGE,
    tags: 8,
    history: 1245,
  },
  {
    id: 'b4',
    name: 'Metro Center Garage',
    address: 'Downtown metro parking — stairwell & levels',
    latitude: 25.7786,
    longitude: -80.1968,
    image: PLACEHOLDER_BUILDING_IMAGE,
    tags: 6,
    history: 890,
  },
]
