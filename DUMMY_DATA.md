# StructSure — Dummy Data (Mock Nodes)

This document describes all placeholder/dummy data used in the StructSure app for development and prototyping. These are **not** connected to a backend—they exist only in the frontend to populate the UI.

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

## Replacing Dummy Data

When wiring up a real backend:

1. Replace `demoPosts` with API calls (e.g. `GET /api/posts`).
2. Replace `demoNotifications` with API calls (e.g. `GET /api/notifications`).
3. Replace `DEFAULT_USER` with authenticated user from your auth system.
4. Sync any schema differences between web and Expo (e.g. full `body` on posts).

---

*Last updated: March 2025*
