# PostCard component

[`ExpoApp/components/PostCard.js`](../ExpoApp/components/PostCard.js) renders a single post in the same layout as the **Home** feed: author row, horizontal image carousel (200px height), title/body, optional building link, resolution + tag chips, upvote and comment actions.

## Usage

Imported by:

- [`ExpoApp/screens/HomeScreen.js`](../ExpoApp/screens/HomeScreen.js) — main feed
- [`ExpoApp/screens/ProfileScreen.js`](../ExpoApp/screens/ProfileScreen.js) — full-screen modal `FlatList` of the viewed user’s posts (scroll to tapped grid item)
- [`ExpoApp/screens/SearchScreen.js`](../ExpoApp/screens/SearchScreen.js) — building tab feed (`FlatList` of unresolved or resolved posts for the open building)

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

Profile and Search use `FlatList` with `initialScrollIndex` and a fixed `getItemLayout` estimate (`~520px` per row) so opening a post from a grid lands near that item; actual card height varies slightly with content.
