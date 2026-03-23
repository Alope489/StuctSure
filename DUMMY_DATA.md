# StructSure — Dummy Data (Mock Nodes)

This document describes all placeholder/dummy data used in the StructSure app for development and prototyping. These are **not** connected to a backend—they exist only in the frontend to populate the UI.

---

## 0. Post Node Schema (Dummy)

All posts (feed + user-created) follow this structure. Used on **Home**, **Profile**, and **Search**.

### Location
- **Expo:** `ExpoApp/data/posts.js`, `ExpoApp/context/AppContext.js`

### Schema

| Field     | Type   | Required | Description                                      |
|-----------|--------|----------|--------------------------------------------------|
| `id`      | string | ✓        | Unique ID (e.g. `jd1`, `4`, `new-1711200000000`) |
| `author`  | string | ✓        | Username (e.g. `johndoe`, `Mia Chen`)            |
| `time`    | string | ✓        | Human-readable timestamp (`1 hour ago`, `Just now`) |
| `sortOrder` | number |          | Hours ago for chronological sort (lower = newer) |
| `title`   | string | ✓        | Post headline                                   |
| `body`    | string | ✓        | Full description (location, address, details)    |
| `tags`    | array  |          | Category tags (`structural`, `plumbing`, etc.)   |
| `tagsMore`| number |          | Count of additional tags not shown               |
| `likes`   | number | ✓        | Upvote count                                    |
| `comments`| number | ✓        | Base comment count (before user adds)            |
| `images`  | array  | ✓        | `require()` for local, `{ uri }` for remote      |

### User-Created Post (Create Post flow)

When the user creates a post from the New Post screen:

| Field   | Source                                                         |
|---------|-----------------------------------------------------------------|
| `id`    | `new-${Date.now()}`                                            |
| `author`| Current user (`johndoe`)                                       |
| `time`  | `"Just now"`                                                   |
| `sortOrder` | `0` (newest)                                               |
| `title` | First 60 chars of caption or `"New damage report"`              |
| `body`  | Full caption + GPS coords if captured                           |
| `tags`  | Selected categories from form                                   |
| `tagsMore` | `0`                                                         |
| `likes` | `0`                                                            |
| `comments` | `0`                                                          |
| `images`| `[{ uri: capturedPhotoUri }]` (local file)                      |

New posts appear on **Home** (all posts) and **Profile** (John Doe's posts only). Data is stored in `AppContext` state (temporary until app refresh; no persistence).

---

## 1. Demo Posts (`demoPosts`)

Used on the **Home feed** (web and mobile).

### Location
- **Web:** `Project/src/pages/Home.jsx`
- **Expo:** `ExpoApp/screens/HomeScreen.js`

### Schema

| Field   | Type     | Description                          |
|---------|----------|--------------------------------------|
| `id`    | string   | Unique ID (e.g. `p1`, `1`)            |
| `author`| string   | Display name of the post author       |
| `time`  | string   | Human-readable timestamp             |
| `title` | string   | Post headline                        |
| `body`  | string   | Full post text (web only)            |
| `likes` | number   | Like count                           |
| `comments` | number | Comment count                        |
| `images`| array    | `{ url, alt? }` — Unsplash URLs      |

### Web (5 posts)

| ID  | Author       | Title                                           |
|-----|--------------|--------------------------------------------------|
| p1  | Mia Chen     | Exterior foundation crack at Riverside Plaza     |
| p2  | Jordan Rivera| Cracked window at Cityline Bus Terminal          |
| p3  | Ayesha Patel | Water damage/mold smell in parking garage stairwell |
| p4  | Noah Williams| Cracked concrete walkway outside Greenway Market |
| p5  | Jordan Rivera| Ceiling damage above table area at Brew & Bean Café |

### Expo (3 posts)

| ID | Author       | Title                                           |
|----|--------------|--------------------------------------------------|
| 1  | Mia Chen     | Exterior foundation crack at Riverside Plaza     |
| 2  | Jordan Rivera| Cracked window at Cityline Bus Terminal          |
| 3  | Ayesha Patel | Water damage in parking garage stairwell        |

---

## 2. Demo Notifications (`demoNotifications`)

Used on the **Notifications** screen (web and mobile).

### Location
- **Web:** `Project/src/pages/Notifications.jsx`
- **Expo:** `ExpoApp/screens/NotificationsScreen.js`

### Schema

| Field    | Type    | Description                                    |
|----------|---------|------------------------------------------------|
| `id`     | string  | Unique ID (e.g. `n1`)                         |
| `name`   | string  | User who triggered the notification            |
| `message`| string  | Action or message text                         |
| `time`   | string  | Relative timestamp (e.g. `24m`, `2h`, `2d`)    |
| `unread` | boolean | Whether to show the green unread indicator    |

### Items (8 notifications, same on web and Expo)

| ID  | Name             | Message                        | Time  | Unread |
|-----|------------------|--------------------------------|-------|--------|
| n1  | Jane Cooper      | OMG! 😱 ...                    | 24m   | ✓      |
| n2  | Jenny Wilson     | Upvoted your post              | 2h    | ✓      |
| n3  | Esther Howard    | Upvoted your post              | 8h    | —      |
| n4  | Leslie Alexander | Upvoted your post              | 2h ago| —      |
| n5  | Savannah Nguyen  | Upvoted your post              | 2d    | —      |
| n6  | Darlene Robertson| I walked by just the other... | 2d    | —      |
| n7  | Marvin McKinney  | Upvoted your post              | 2w    | —      |
| n8  | Kathryn Murphy   | They need to fix it soon!...   | 2w    | —      |

---

## 3. Default User (`DEFAULT_USER`)

Used for the **profile** avatar and settings (Home screen).

### Location
- **Web:** `Project/src/pages/Home.jsx` — `{ photo: null, username: 'johndoe', email: 'user@domain.com' }`
- **Expo:** `ExpoApp/screens/HomeScreen.js` — same structure
- **Expo Notifications:** `ExpoApp/screens/NotificationsScreen.js` — `{ photo: null }` (profile avatar only)

### Schema

| Field    | Type   | Description                |
|----------|--------|----------------------------|
| `photo`  | string \| null | Profile image URL/data URI |
| `username` | string | Display name              |
| `email`  | string | User email                 |

---

## 4. New Post Categories (`categories`)

Used in the **New Post** screen for damage categories.

### Location
- **Web:** `Project/src/pages/NewPost.jsx`

### Items

`structural`, `electrical`, `plumbing`, `hvac`, `roofing`, `fire & life safety`, `ADA / code compliance`, `environmental/health`, `drainage & site conditions`, `maintenance / wear`

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
