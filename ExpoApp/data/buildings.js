/** Seed buildings for Search; posts link via buildingId. Dynamic OSM picks are merged in AppContext. */

/** Empty = no remote photo; Search shows a building icon inside the circular profile slot. */
export const PLACEHOLDER_BUILDING_IMAGE = ''

/** Wikimedia Commons Special:FilePath (redirects to upload.wikimedia.org). b1/b2: real FIU-area Commons photos. b3/b4: demo fiction — neutral stock. */
const COMMONS = 'https://commons.wikimedia.org/wiki/Special:FilePath'

export const initialBuildings = [
  {
    id: 'b1',
    name: 'Steven J. Green School of International and Public Affairs',
    address: '11150 SW 14th St, Miami, FL 33199',
    image: `${COMMONS}/FIU_Green_Library_South_Entrance.jpg`,
    tags: 6,
    history: 877,
  },
  {
    id: 'b2',
    name: 'Ryder Business Bldg',
    address: '11200 SW 8th St, Miami, FL 33199',
    image: `${COMMONS}/FIU_Green_Library.JPG`,
    tags: 4,
    history: 312,
  },
  {
    id: 'b3',
    name: 'Riverside Plaza',
    address: '214 W Pine St',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=70',
    tags: 8,
    history: 1245,
  },
  {
    id: 'b4',
    name: 'Metro Center Garage',
    address: 'Stairwell B, Level P2',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=70',
    tags: 5,
    history: 523,
  },
]
