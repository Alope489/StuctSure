# Expo UI: home brand, profile deep links, new post fields, search post detail

## Brand assets

- **Home top-left:** `ExpoApp/assets/StructSure-Logo-Horizontal.png` — horizontal sandcastle + wordmark used in `HomeScreen` (`resizeMode: 'contain'`, fixed height).
- **General / legacy:** `ExpoApp/assets/logo.png` — former `logo-horizontal.png` copy of `Project/public/logo.png` (rename only; use the StructSure horizontal asset for the app bar).

## Profile navigation from posts

- **Param:** `profileUsername` (optional) on the `Profile` tab route.
- **Behavior:** Tapping the author row (avatar + name) on **Home** feed cards or **Search → post detail** calls `navigation.navigate('Profile', { profileUsername: author })`.
- **Profile screen:** When `profileUsername` is set and differs from the signed-in user, the screen shows that author’s posts and stats, a letter avatar (no photo URL for other users yet), hides email and settings, and shows a back control that clears the param via `navigation.setParams({ profileUsername: undefined })`.
- **Fix:** Post grid filtering now uses `user.username` (via `displayUsername`) instead of a hardcoded `johndoe` string.

## Search post detail — building row

- The large building name + address block above the author row was removed as redundant with the location line and building navigation.
- A single **“Building profile”** row (icon + label + chevron), styled like the home feed building link, opens the building profile when a `buildingId` is present.

## New post: title vs comment

- **Title:** Single-line input (`postTitle` state), required to enable **Create Post** (max length 120).
- **Comment:** Multiline `caption`; stored as `post.body` only (no longer derived from caption for `title`, and no longer appends an automatic `Building:` block into `body`).
- Building context remains on the post as `buildingId`, `buildingName`, `buildingAddress`, etc.

## Profile post meta / address

- `PostDetailBlock` resolves the location line from `post.buildingAddress` first, then legacy `Address:` in `body`, then a fallback for older `Building:` + following line format.
