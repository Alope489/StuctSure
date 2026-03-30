/** Seed buildings for Search; posts link via buildingId. Dynamic OSM picks are merged in AppContext. */

/** Empty = no remote photo; Search shows a building icon inside the circular profile slot. */
export const PLACEHOLDER_BUILDING_IMAGE = ''

/** Demo seeds use the placeholder avatar; OSM-linked buildings added in context use the same default. */
export const initialBuildings = [
  {
    id: 'b1',
    name: 'Steven J. Green School of International and Public Affairs',
    address: '11150 SW 14th St, Miami, FL 33199',
    image: PLACEHOLDER_BUILDING_IMAGE,
    tags: 6,
    history: 877,
  },
  {
    id: 'b2',
    name: 'Ryder Business Bldg',
    address: '11200 SW 8th St, Miami, FL 33199',
    image: PLACEHOLDER_BUILDING_IMAGE,
    tags: 4,
    history: 312,
  },
  {
    id: 'b3',
    name: 'Riverside Plaza',
    address: '214 W Pine St',
    image: PLACEHOLDER_BUILDING_IMAGE,
    tags: 8,
    history: 1245,
  },
  {
    id: 'b4',
    name: 'Metro Center Garage',
    address: 'Stairwell B, Level P2',
    image: PLACEHOLDER_BUILDING_IMAGE,
    tags: 5,
    history: 523,
  },
]
