# StructSure — Dummy Data (Mock Nodes)

This document describes placeholder/fallback data used in the StructSure app. The Expo app now supports Supabase integration, but keeps local fixtures for offline/demo mode when environment variables are not configured.

---

## 0. Post Node Schema (Dummy)

All posts (feed + user-created) follow this structure. Used on **Expo Home**, **Expo Profile**, and **Expo Search**.

### Location
- **Expo seed data & helpers:** `ExpoApp/data/posts.js`
- **Expo state & mutations:** `ExpoApp/context/AppContext.js`

### Schema (Expo posts)

| Field             | Type    | Required | Description                                                                 |
|-------------------|---------|----------|-----------------------------------------------------------------------------|
| `id`              | string  | ✓        | Unique ID (e.g. `jd1`, `4`, `new-1711200000000`)                           |
| `author`          | string  | ✓        | Username (e.g. `johndoe`, `Mia Chen`)                                      |
| `time`            | string  | ✓        | Human-readable timestamp (`1 hour ago`, `Yesterday`, `Just now`)           |
| `sortOrder`       | number  |          | Approximate hours ago for chronological sort (lower = newer)               |
| `title`           | string  | ✓        | Post headline                                                              |
| `body`            | string  | ✓        | Full description (location, address, details)                              |
| `tags`            | array   |          | Category labels (e.g. `['structural', 'plumbing']`)                        |
| `tagsMore`        | number  |          | Count of “extra” categories, expanded via `getPostCategoryTags` helper     |
| `likes`           | number  | ✓        | Upvote count                                                               |
| `comments`        | number  | ✓        | Base comment count (before user adds comments in-session)                  |
| `images`          | array   | ✓        | RN images (`require('../assets/...')`, `{ uri }`, or `{ url }`)           |
| `buildingId`      | string  |          | ID of linked building (`initialBuildings` or OSM-derived building)        |
| `buildingName`    | string  |          | Resolved building name (for new posts from OSM search)                     |
| `buildingAddress` | string  |          | Resolved building address line from OSM                                    |
| `resolutionStatus`| string  |          | `'resolved'` or `'unresolved'` (see `getResolutionStatus`)                 |
| `severity`        | number  |          | 1–10 score, used by severity chips and `getSeverityChipColors`             |
| `latitude`        | number  |          | Lat from GPS / OSM when user links a building                              |
| `longitude`       | number  |          | Lon from GPS / OSM when user links a building                              |

Helper functions in `ExpoApp/data/posts.js`:

- `getPostCategoryTags(post)` — expands `tags` + `tagsMore` into a full category list for chips.
- `getPostSeverityTag(post)` — maps numeric `severity` to a label like `"severity 6/10"`.
- `getSeverityChipColors(severity)` — maps severity 1–10 to a gradient from green to red with readable text colors.
- `getResolutionStatus(post)` — normalizes missing/unknown status to `'unresolved'`.
- `getImageSource(img)` — converts mixed image representations into a usable React Native `Image` source.

### User-Created Post (Expo New Post flow)

When the user creates a post from the **New Post** screen in the Expo app:

| Field             | Source                                                                 |
|-------------------|------------------------------------------------------------------------|
| `id`              | ``new-${Date.now()}``                                                  |
| `author`          | `user?.username || 'johndoe'` (from context)                           |
| `time`            | `'Just now'`                                                           |
| `sortOrder`       | `0` (guaranteed newest)                                                |
| `title`           | `postTitle.trim()` (required title input)                              |
| `body`            | `caption.trim() || 'No description provided.'`                         |
| `tags`            | Selected category labels from `categories` in `NewPostScreen`         |
| `tagsMore`        | `0`                                                                    |
| `likes`           | `0`                                                                    |
| `comments`        | `0`                                                                    |
| `images`          | `capturedPhoto ? [{ uri: capturedPhoto }] : []`                        |
| `buildingId`      | `linkedBuilding.id` (from OSM nearby search)                          |
| `buildingName`    | `linkedBuilding.name`                                                 |
| `buildingAddress` | `linkedBuilding.addressLine`                                          |
| `latitude`        | `linkedBuilding.lat`                                                  |
| `longitude`       | `linkedBuilding.lon`                                                  |
| `resolutionStatus`| User-selected `'resolved'` / `'unresolved'`                            |
| `severity`        | `Math.round(severity)` from 1–10 slider                               |

New posts are kept in `AppContext` state only (no persistence); they appear on the Expo **Home** feed and in the current user’s profile view.

---

## 1. Demo Posts (`demoPosts`, `johndoePosts`, `otherPosts`, `allPosts`)

Seed/demo posts are used in the Expo app.

### Location
- **Expo data:** `ExpoApp/data/posts.js` — `johndoePosts`, `otherPosts`, `allPosts`.

### Expo schema (`johndoePosts`, `otherPosts`)

Expo posts extend the base schema from section **0** and split into:

- `johndoePosts` — 3 posts authored by `johndoe` with local images via `require('../assets/johndoe-damageX.png')`.
- `otherPosts` — 3 posts authored by other users (`Mia Chen`, `Jordan Rivera`, `Ayesha Patel`) with remote Unsplash images (`{ uri }`).

`allPosts` is a sorted fallback array:

```js
export const allPosts = [johndoePosts[0], otherPosts[0]].sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999))
```

---

## 2. Demo Notifications (`demoNotifications`)

Used on the **Notifications** screen in the Expo app.

### Locations
- **Expo:** `ExpoApp/screens/NotificationsScreen.js` — `demoNotifications` constant.

### Schema

| Field    | Type    | Description                                    |
|----------|---------|------------------------------------------------|
| `id`     | string  | Unique ID (e.g. `n1`)                          |
| `name`   | string  | User who triggered the notification            |
| `message`| string  | Action or message text                         |
| `time`   | string  | Relative timestamp (e.g. `24m`, `2h`, `2d`)    |
| `unread` | boolean | Whether to show the green unread indicator     |

The same 8 notifications are used in Expo, e.g.:

- `n1` — Jane Cooper — `OMG! 😱 ...` — `24m` — `unread: true`
- `n2` — Jenny Wilson — `Upvoted your post` — `2h` — `unread: true`
- …

---

## 3. Default User (`DEFAULT_USER`, `user` in AppContext)

Used as the current user identity in the Expo app.

### Locations
- **Expo:** `ExpoApp/context/AppContext.js` — `user` state with at least `username`, `email`, and optional `photo`.

### Schema

| Field     | Type           | Description                            |
|-----------|----------------|----------------------------------------|
| `photo`   | string \| null | Profile image URL/data URI             |
| `username`| string         | Display name                           |
| `email`   | string         | User email                             |

In Expo, `user.photo` is `null` by default and is rendered as a static avatar image (`johndoe.png`) until the user changes it.

---

## 4. New Post Categories (`categories`)

Used in the **New Post** screens to tag the type of issue.

### Locations
- **Expo:** `ExpoApp/screens/NewPostScreen.js` — `const categories = [...]`.

### Items (Expo)

Each category has an `id` and a human-readable `label`:

- `structural`, `electrical`, `plumbing`, `HVAC`, `roofing`,
- `fire & life safety`, `ADA / code compliance`,
- `environmental/health`, `drainage & site conditions`,
- `maintenance / wear`.

The Expo `addPost` call maps selected `id`s back to labels for storage on the post object.

---

## 5. Comments (`initialCommentsByPost`)

Used in the **comments modal** on the Expo Home feed.

### Location
- **Expo:** `ExpoApp/screens/HomeScreen.js`

### Schema

| Field   | Type   | Description              |
|---------|--------|--------------------------|
| `id`    | string | Unique comment ID        |
| `author`| string | Commenter display name   |
| `text`  | string | Comment body             |
| `time`  | string | Relative timestamp       |

### Structure

```js
{
  '1': [{ id, author, text, time }, ...],  // comments for post 1
  '2': [...],
  '3': [...],
}
```

### Dummy State (Expo Home)

- `upvotedPosts` — `Set` of post IDs the current user has upvoted (toggle on/off)
- `commentsByPost` — `{ [postId]: Comment[] }` — comments per post, includes user-added

---

## Backend Integration Guide

When connecting to a real API, replace the dummy data and handlers as follows.

### 1. Posts (Feed)

| Dummy | Replace With |
|-------|--------------|
| `demoPosts` | `GET /api/posts` or `GET /api/feed` |
| Static array | `useEffect` + `fetch` / `axios` on mount |

**Example API response:**
```json
{
  "posts": [
    {
      "id": "uuid",
      "author": "Mia Chen",
      "authorId": "user-uuid",
      "time": "2025-03-23T14:30:00Z",
      "title": "Exterior foundation crack...",
      "body": "Location: Riverside Plaza...",
      "likes": 292,
      "comments": 598,
      "images": [{ "url": "https://...", "alt": "..." }],
      "userHasUpvoted": false
    }
  ]
}
```

**Implementation notes:**
- Map API `time` to human-readable (e.g. "1 hour ago") or use a lib like `date-fns`
- `userHasUpvoted` replaces local `upvotedPosts` for initial load

---

### 2. Upvotes (Toggle)

| Dummy | Replace With |
|-------|--------------|
| `upvotedPosts` (Set) | Sync with backend on each toggle |
| `toggleUpvote(postId)` | `POST /api/posts/:id/upvote` or `DELETE /api/posts/:id/upvote` |

**API endpoints:**
```
POST   /api/posts/:postId/upvote   → { upvotes: 293 }
DELETE /api/posts/:postId/upvote   → { upvotes: 292 }
```

**Implementation notes:**
- On toggle: call API, then update local state from response
- Optimistic update: change UI first, revert on API error
- Use `userHasUpvoted` from post object for initial state

---

### 3. Comments (View & Add)

| Dummy | Replace With |
|-------|--------------|
| `initialCommentsByPost` | `GET /api/posts/:postId/comments` |
| `commentsByPost` (state) | Fetch when modal opens, append on add |
| `addComment()` | `POST /api/posts/:postId/comments` |

**API endpoints:**
```
GET  /api/posts/:postId/comments  → { comments: [{ id, author, text, createdAt }, ...] }
POST /api/posts/:postId/comments  Body: { text: "..." }  → { comment: { id, author, text, createdAt } }
```

**Example GET response:**
```json
{
  "comments": [
    {
      "id": "comment-uuid",
      "author": "Alex Turner",
      "authorId": "user-uuid",
      "text": "I passed by there last week...",
      "createdAt": "2025-03-23T15:00:00Z"
    }
  ],
  "total": 598
}
```

**Implementation notes:**
- Fetch comments when user opens the comments modal
- On add: POST, then append returned comment to local list
- Update `displayCommentCount` from `total` or `comments.length` from API
- Paginate: `GET /api/posts/:postId/comments?page=2&limit=20`

---

### 4. Notifications

| Dummy | Replace With |
|-------|--------------|
| `demoNotifications` | `GET /api/notifications` |
| Static array | Poll or WebSocket for updates |

**API:**
```
GET /api/notifications  → { notifications: [...], unreadCount: 2 }
PATCH /api/notifications/:id/read  (mark as read)
```

---

### 5. Auth / User

| Dummy | Replace With |
|-------|--------------|
| `DEFAULT_USER` | Auth context / session (e.g. JWT decode, `GET /api/me`) |
| `user.username` in comments | From auth token or `/api/me` |

**API:**
```
GET /api/me  → { id, username, email, photo }
```

---

### 6. Create Post (New Post)

| Dummy | Replace With |
|-------|--------------|
| `addPost()` in AppContext | `POST /api/posts` |
| Local state (temporary) | Persist to backend, then refresh feed |

**API:**
```
POST /api/posts
Body: {
  title: string,
  body: string,
  tags: string[],
  images: [{ uri: string }] or FormData,
  location?: { lat, lng }
}
→ { post: { id, author, time, ... } }
```

**Implementation notes:**
- Upload images as multipart/form-data or presigned URL
- Backend assigns real `id`, `author` from auth, `time` from server
- On success: append returned post to feed or refetch

---

### 7. Data Flow Summary

| Feature | Fetch | Mutate |
|---------|-------|--------|
| Posts | `GET /api/posts` | `POST /api/posts` (create) |
| Upvote | — | `POST/DELETE /api/posts/:id/upvote` |
| Comments (list) | `GET /api/posts/:id/comments` | — |
| Comments (add) | — | `POST /api/posts/:id/comments` |
| Notifications | `GET /api/notifications` | `PATCH /api/notifications/:id/read` |
| User | `GET /api/me` or auth token | — |

---

### 8. Error Handling & Loading

- Add `loading` and `error` state for each data type
- Show skeletons/spinners while fetching
- On API error: toast/snackbar, optionally revert optimistic updates
- Retry logic for transient failures (e.g. network)

---

### 9. Shared API Client (Suggested)

Create a shared module (e.g. `api.js` or `api.ts`) used by both web and Expo:

```js
const API_BASE = 'https://your-api.example.com'

export async function getPosts() {
  const res = await fetch(`${API_BASE}/api/posts`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  if (!res.ok) throw new Error('Failed to fetch posts')
  return res.json()
}

export async function toggleUpvote(postId, currentlyUpvoted) {
  const method = currentlyUpvoted ? 'DELETE' : 'POST'
  const res = await fetch(`${API_BASE}/api/posts/${postId}/upvote`, { method, headers: { Authorization: `Bearer ${getToken()}` } })
  if (!res.ok) throw new Error('Failed to update upvote')
  return res.json()
}

export async function getComments(postId) { /* ... */ }
export async function addComment(postId, text) { /* ... */ }
```

---

*Last updated: March 2025*
