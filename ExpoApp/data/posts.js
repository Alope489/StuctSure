// Shared post data - John Doe's 3 posts use his unique images, others use different Unsplash images
// No image reuse between John Doe and other authors

// John Doe's posts - ceiling damage, flooded house, cracked basement
// sortOrder: hours ago (lower = newer), for chronological feed
export const johndoePosts = [
  {
    id: 'jd1',
    author: 'johndoe',
    time: '2 hours ago',
    sortOrder: 2,
    tags: ['structural', 'plumbing'],
    tagsMore: 0,
    title: 'Ceiling water damage in high-rise unit',
    body: 'Location: Downtown Miami high-rise\nAddress: 1101 Brickell Ave area\nVisited: Today\n\nLarge water stain and crack in the ceiling. Paint is peeling in several spots. Leak appears to be from above. Needs inspection.',
    likes: 124,
    comments: 38,
    images: [require('../assets/johndoe-damage1.png')],
    buildingId: 'b1',
  },
  {
    id: 'jd2',
    author: 'johndoe',
    time: '1 day ago',
    sortOrder: 24,
    tags: ['plumbing', 'unresolved'],
    tagsMore: 0,
    title: 'Flooded living room - plumbing failure',
    body: 'Location: Town Park Estates\nAddress: SW 112th Ave area\nVisited: Yesterday\n\nLiving room flooded from apparent plumbing failure. Water still present. Ceiling fan reflection visible in standing water. Fireplace and windows affected.',
    likes: 89,
    comments: 24,
    images: [require('../assets/johndoe-damage2.png')],
    buildingId: 'b2',
  },
  {
    id: 'jd3',
    author: 'johndoe',
    time: '3 days ago',
    sortOrder: 72,
    tags: ['structural'],
    tagsMore: 0,
    title: 'Cracked basement floor near support column',
    body: 'Location: Residential basement/garage\nAddress: University Park area\nVisited: 3 days ago\n\nLarge branching crack in painted concrete floor. Support pole at junction. Possible settling issue. PVC plumbing and storage nearby.',
    likes: 67,
    comments: 15,
    images: [require('../assets/johndoe-damage3.png')],
    buildingId: 'b3',
  },
]

// Other authors' posts - use different Unsplash images (not John Doe's)
export const otherPosts = [
  {
    id: '4',
    author: 'Mia Chen',
    tags: ['structural', 'plumbing'],
    tagsMore: 2,
    time: '1 hour ago',
    sortOrder: 1,
    title: 'Exterior foundation crack at Riverside Plaza',
    body: 'Location: Riverside Plaza (North entrance, by the loading zone)\nAddress: 214 W Pine St\nVisited: Today around 11:30 AM\n\nThere\'s a visible separation where the wall meets the slab, and the crack line looks like it\'s spreading along the corner. Pieces of material are flaking off around it.',
    likes: 292,
    comments: 598,
    images: [
      { uri: 'https://images.unsplash.com/photo-1740921303129-126a783b9c6c?auto=format&fit=crop&w=1400&q=70' },
      { uri: 'https://images.unsplash.com/photo-1740921303048-6b8f232a91ff?auto=format&fit=crop&w=1400&q=70' },
    ],
    buildingId: 'b3',
  },
  {
    id: '5',
    author: 'Jordan Rivera',
    tags: ['structural'],
    tagsMore: 0,
    time: '4 hours ago',
    sortOrder: 4,
    title: 'Cracked window at Cityline Bus Terminal',
    body: 'Location: Cityline Bus Terminal (Gate 4 waiting area)\nVisited: Today around 8:00 AM\n\nA window pane has a spiderweb crack starting near the corner. It\'s not taped off and people are leaning bags against it.\n\nFlagging this as a safety issue—seems like it could shatter further with vibration or impact.',
    likes: 84,
    comments: 31,
    images: [{ uri: 'https://images.unsplash.com/photo-1646310585298-8a9b8ada20c5?auto=format&fit=crop&w=1400&q=70' }],
    buildingId: 'b2',
  },
  {
    id: '6',
    author: 'Ayesha Patel',
    tags: ['plumbing', 'structural'],
    tagsMore: 0,
    time: 'Yesterday',
    sortOrder: 24,
    title: 'Water damage in parking garage stairwell',
    body: 'Location: Metro Center Garage (Stairwell B, Level P2)\nVisited: Yesterday around 6:30 PM\n\nThe lower wall has dark damp patches and the stairwell smells musty. No standing water, but it feels humid and looks like repeated moisture exposure.',
    likes: 137,
    comments: 62,
    images: [
      { uri: 'https://images.unsplash.com/photo-1724230442705-646dc7c86943?auto=format&fit=crop&w=1400&q=70' },
      { uri: 'https://images.unsplash.com/photo-1768573264138-6a67ddce05cd?auto=format&fit=crop&w=1400&q=70' },
    ],
    buildingId: 'b4',
  },
]

export const allPosts = [...johndoePosts, ...otherPosts].sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999))

export const initialCommentsByPost = {
  jd1: [
    { id: 'c1', author: 'Alex T.', text: 'That ceiling leak looks serious. Have you contacted management?', time: '1h' },
  ],
  jd2: [
    { id: 'c2', author: 'Sam R.', text: 'Same thing happened in my unit last year. Took weeks to fix.', time: '5h' },
  ],
  jd3: [
    { id: 'c3', author: 'Maya C.', text: 'Crack by the column is concerning. Could be structural.', time: '2d' },
  ],
  '4': [
    { id: 'c4', author: 'Alex Turner', text: 'I passed by there last week. Definitely getting worse.', time: '45m' },
    { id: 'c5', author: 'Sam Rivera', text: 'Reported to building management. Thanks for flagging!', time: '2h' },
  ],
  '5': [
    { id: 'c6', author: 'Jordan K.', text: 'That window has been like that for months. Safety hazard for sure.', time: '1h' },
  ],
  '6': [
    { id: 'c7', author: 'Maya Chen', text: 'Same smell in stairwell C. Could be a bigger drainage issue.', time: '3h' },
    { id: 'c8', author: 'Dev Patel', text: 'They really need to inspect the whole garage.', time: '5h' },
  ],
}

// Helper: get image source for RN Image (handles require result, {uri}, {url})
export function getImageSource(img) {
  if (typeof img === 'number') return img
  if (img && (img.uri || img.url)) return { uri: img.uri || img.url }
  if (typeof img === 'string') return { uri: img }
  return null
}
