## StructSure Expo App

StructSure’s Expo app is a React Native client for reporting, browsing, and tracking issues in and around public buildings. It mirrors the core web experience (posts, notifications, and building profiles) while being optimized for mobile use in the field.

The app is currently front‑end only and ships with **dummy data** (local mock posts, notifications, and user info) so you can explore the UI without a backend.

## Prerequisites

- Node.js and npm installed (LTS recommended).
- `expo` CLI installed globally:

```bash
npm install --global expo-cli
```

- Android emulator, iOS simulator, or the Expo Go app on a physical device.

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

## What “dummy data” means in StructSure

This Expo app uses **dummy data**: hard‑coded JavaScript objects and arrays that live entirely on the client. They are used to:

- Pre‑populate the feed with example posts.
- Show sample notifications.
- Provide a default logged‑in user profile.

There is **no real backend** behind these objects; they are placeholders that make the UI feel real while you design flows and iterate. For a detailed breakdown of every dummy data structure and how to replace it with real APIs later, see `DUMMY_DATA.md` in the repository root.

