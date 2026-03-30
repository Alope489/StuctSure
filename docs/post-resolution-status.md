# Post resolution status (resolved / unresolved)

## Data model

- Each post may include **`resolutionStatus`**: `'resolved'` | `'unresolved'`.
- **`getResolutionStatus(post)`** in `ExpoApp/data/posts.js` treats any value other than `'resolved'` as **`'unresolved'`** (including missing field) so older seed data stays valid.

## Creating posts

- **`ExpoApp/screens/NewPostScreen.js`**: The author must pick **Unresolved** or **Resolved** before **Create Post** is enabled.
- The value is stored on the post as **`resolutionStatus`** (not mixed into damage category tags like structural/plumbing).

## Display

- Feed cards (**`HomeScreen`**) show a **status chip** next to category tags.
- Search post detail and Profile post blocks use the same chip styling (green accent for resolved, amber tint for unresolved).

## Editing status

- **`ExpoApp/context/AppContext.js`** exposes **`updatePostResolution(postId, resolutionStatus)`**.
- Only the post **author** (matched to **`user.username`**) can update status; other users get no API path for this change.
- **Own post** menu (⋯) on **Home**, **Search** post detail, and **Profile** includes **Change status** plus **Delete**.

## Building profile (Search)

- Tapping the **building** row on a feed card navigates to the **Search** tab with **`openBuildingId`** and opens that building’s profile.
- The building profile shows **`N unresolved · M resolved`**, plus **Unresolved** / **Resolved** tabs that filter the photo grid.
- From a **post detail** in Search, the building header is tappable and returns to the same building profile.

## Deep link param

- **`navigation.navigate('Search', { openBuildingId: '<building id>' })`** — consumed in **`SearchScreen`** via **`useFocusEffect`**; the param is cleared after handling so repeats are avoided.
