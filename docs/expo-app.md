## Expo app overview

The StructSure Expo app is a React Native / Expo client focused on field‑friendly reporting and review of building issues. It exposes the same core concepts as the web app (posts, notifications, user profile, and building context), but packaged as a mobile experience.

The app supports both local dummy data mode and Supabase-backed shared mode. For cross-device testing, set Supabase env values so all phones read/write shared data.

## Install and run

From the repository root:

```bash
cd ExpoApp
npm install
npx expo start
```

Use the Expo dev tools (terminal shortcuts or web UI) to open the app on an Android emulator, iOS simulator, or physical device via the Expo Go app.

For remote phone testing over the internet:

```bash
npm run start:tunnel
```

## Supabase configuration

Set these environment variables before starting Expo:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
EXPO_PUBLIC_SUPABASE_POST_IMAGES_BUCKET=post-images
```

- `EXPO_PUBLIC_SUPABASE_URL`: Supabase project URL.
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: public client key used by Expo.
- `EXPO_PUBLIC_SUPABASE_POST_IMAGES_BUCKET`: storage bucket for uploaded post images.

Example:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://abcd1234.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=ey...
EXPO_PUBLIC_SUPABASE_POST_IMAGES_BUCKET=post-images
```

## Supabase setup

- Supabase schema/policies: `docs/api/supabase-social-schema.sql`
- Supabase setup guide: `docs/api/supabase-setup.md`

- Team install guide: `docs/team-device-installs.md`
- Validation checklist: `docs/demo-validation-checklist.md`

## Fallback dummy data

The Expo app keeps minimal fallback fixtures in local JavaScript files when backend URLs are not configured.

- They live entirely in the frontend (no network calls).
- They provide a lightweight seed feed and building list for UI validation.
- They are documented in `DUMMY_DATA.md`.

