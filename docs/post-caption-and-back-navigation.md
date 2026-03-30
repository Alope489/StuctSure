# Post UI, navigation, and search

## Caption truncation (`PostCard`)

- Post body text longer than **200 characters** is shown truncated until the user taps **`...more`** (accent color). Tapping expands the full caption for that card.
- When the list reuses a card for a different post (`post.id` changes), the caption returns to the collapsed state.

## Severity on posts

- Posts may include **`severity`** (1–10). New posts store the slider value from **New post** (rounded).
- `getPostSeverityTag` builds the label **`severity N/10`**. **`getSeverityChipColors`** maps **1 → theme green (#00ff7f)**, **5 → yellow**, **10 → red**, with contrasting text (dark on light chips, light on red).
- **Resolved** uses the same **neon green** (`#00ff7f`) as the rest of the app with dark text **`#061014`**. **Unresolved** stays orange.

## Account side panel (`AccountSidePanel`)

- Drawer is **full height** (`alignSelf: 'stretch'`), **~90% of screen width** (capped at 400px), with safe-area padding. Content scrolls inside **`ScrollView`** so inputs and actions are usable on small screens.

## Transitions and background flash

- **NavigationContainer** uses a dark theme with **`background`** and **`card`** set to `#0d0d0d` so the default surface matches the app.
- Native stacks (**root**, **Search**, **Profile**) use **`animation: 'fade'`** and **`contentStyle`** with the same background.
- Tabs use **`freezeOnBlur`**, **`lazy: false`**, and **`sceneStyle`** so tab scenes stay on the same background and reduce visible flashes when switching tabs.

## Building profile: where Back goes

- From **Search map / search results** (no return target): Back on the building profile returns to the **map/search list** (existing behavior).
- From **building post feed** (`SearchPosts`): Opening the building passes **`returnTarget: { kind: 'searchPosts', buildingId, postTab, initialPostId }`**. Back on the building profile returns to **that post feed** at the same post.
- From **profile post feed** (`ProfilePosts`): Opening the building passes **`returnTarget: { kind: 'profilePosts', profileUsername, initialPostId }`**. Back returns to **that profile feed**.
- Building and post-feed headers no longer show the **Search** label; the header is back control and flexible space.

## Search tab map area

- The **FIU map image** under the search field was removed; the area is a plain dark panel (buildings still appear when you search).

## Other back navigation

- **Tab navigator** (`App.js`): `backBehavior="history"` where supported.
- **Profile (other user)** (`ProfileScreen`): Back tries stack `goBack()`, then the tab navigator’s `goBack()`, then clears `profileUsername` via `setParams`.
- **New post** (`NewPostScreen`): Leaving uses stack → tab → `navigate('Home')` when needed; submit still navigates to **Home**.
- **Profile post feed**: Opening another profile from a post uses **`push('ProfileMain', …)`** so Back returns to the post feed.
