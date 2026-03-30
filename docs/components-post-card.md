# PostCard component

[`ExpoApp/components/PostCard.js`](../ExpoApp/components/PostCard.js) renders a single post in the same layout as the **Home** feed: author row, **square** horizontal image carousel (width ≈ card inner width, 1:1 like New Post capture), title/body, optional building link, **cyan** pill chips for resolution + every category from [`getPostCategoryTags`](../ExpoApp/data/posts.js) (no “+N more” summary), upvote and comment actions.

## Usage

Imported by:

- [`ExpoApp/screens/HomeScreen.js`](../ExpoApp/screens/HomeScreen.js) — main feed
- [`ExpoApp/screens/ProfilePostsScreen.js`](../ExpoApp/screens/ProfilePostsScreen.js) — profile tab stack: `FlatList` anchored to the grid tile
- [`ExpoApp/screens/BuildingPostsScreen.js`](../ExpoApp/screens/BuildingPostsScreen.js) — search tab stack: building’s unresolved/resolved feed

## Props

| Prop | Role |
|------|------|
| `post` | Post object (`images`, `author`, `title`, `body`, tags, etc.) |
| `isUpvoted` | Whether the current user upvoted this post |
| `onUpvote` | `(postId) => void` |
| `onComment` | `(postId) => void` — parent opens comments UI |
| `displayCommentCount` | Number from context (`getDisplayCommentCount`) |
| `onPostMenu` | Optional `(post) => void` |
| `onBuildingPress` / `buildingLabel` | Optional building chip |
| `onAuthorPress` | Optional navigate to author profile |

Comments are not inlined in the card; screens open a bottom sheet modal (same pattern as Home).

## Scroll anchoring

Profile and Search post feeds use `FlatList` with `initialScrollIndex` and a fixed `getItemLayout` estimate (`~650px` per row) so opening a post from a grid lands near that item; actual card height varies slightly with content.

## Navigation

Search and Profile tabs use nested stack navigators ([`SearchStack`](../ExpoApp/navigation/SearchStack.js), [`ProfileStack`](../ExpoApp/navigation/ProfileStack.js)) so the **bottom tab bar stays visible** while viewing post feeds.
