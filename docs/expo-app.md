## Expo app overview

The StructSure Expo app is a React Native / Expo client focused on field‑friendly reporting and review of building issues. It exposes the same core concepts as the web app (posts, notifications, user profile, and building context), but packaged as a mobile experience.

The current implementation is front‑end only and backed by **dummy data** so designers and developers can exercise all primary screens without standing up an API.

## Install and run

From the repository root:

```bash
cd ExpoApp
npm install
npx expo start
```

Use the Expo dev tools (terminal shortcuts or web UI) to open the app on an Android emulator, iOS simulator, or physical device via the Expo Go app.

## Dummy data in the Expo app

The Expo app’s feed, notifications, and default user are powered by local JavaScript constants (dummy data). These mock posts, notifications, and user records:

- Live entirely in the frontend (no network calls).
- Provide realistic, but fake, examples for UI and interaction design.
- Are documented in detail in `DUMMY_DATA.md`, which also explains how to replace them with real backend APIs later.

