## StructSure Expo App

StructSure’s Expo app is a React Native client for reporting, browsing, and tracking issues in and around public buildings. It mirrors the core web experience (posts, notifications, and building profiles) while being optimized for mobile use in the field.

The app now uses Supabase directly for auth, feed, comments, upvotes, and image-backed posts, while still supporting fallback dummy data for local UI-only runs.

## Prerequisites

- Node.js and npm installed (LTS recommended).
- `expo` CLI installed globally:

```bash
npm install --global expo-cli
```

- Android emulator, iOS simulator, or the Expo Go app on a physical device.
- A Supabase project.

## Install dependencies

From the project root:

```bash
cd ExpoApp
npm install
```

This installs all dependencies defined in `package.json` into `ExpoApp/node_modules`.

## Running the Expo app

From the `ExpoApp` folder:

```bash
npx expo start
```

Then:

- **Press `a`** in the terminal to open Android emulator, or
- **Press `i`** to open the iOS simulator (macOS + Xcode required), or
- **Scan the QR code** with the Expo Go app on your device.

The Metro bundler will rebuild automatically as you edit files under `ExpoApp`.

To share with remote phones during development, use:

```bash
npm run start:tunnel
```

## Supabase integration setup

The Expo app supports Supabase email/password auth and Supabase-backed feed/actions through a service layer.

1. Create a Supabase project.
2. Run schema and policies from `docs/api/supabase-social-schema.sql`.
3. Set environment variables before running Expo:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
EXPO_PUBLIC_SUPABASE_POST_IMAGES_BUCKET=post-images
```

- `EXPO_PUBLIC_SUPABASE_URL` is your Supabase project URL.
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` is your public client key.
- `EXPO_PUBLIC_SUPABASE_POST_IMAGES_BUCKET` is the storage bucket used for post photos.

If Supabase env values are missing, the app falls back to minimal local fixtures in `ExpoApp/data`.

See Supabase setup in `docs/api/supabase-setup.md`.
See team install steps in `docs/team-device-installs.md`.
See final validation checklist in `docs/demo-validation-checklist.md`.

## What “dummy data” means in StructSure

This Expo app uses **dummy data**: hard‑coded JavaScript objects and arrays that live entirely on the client. They are used to:

- Pre‑populate the feed with example posts.
- Show sample notifications.
- Provide a default logged‑in user profile.

These objects are placeholders for UI-first development, and are bypassed when Supabase env vars are configured. For a detailed breakdown of every dummy data structure and how to replace it with real APIs later, see `DUMMY_DATA.md` in the repository root.

