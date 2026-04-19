# StructSure — iOS guide (Expo)

This app lives in **`ExpoApp/`**. Run all commands from that folder.

## Prerequisites

- **Node.js** (LTS recommended) and npm
- **Apple iPhone** with **Expo Go** from the App Store: search **“Expo Go”** or open  
  https://apps.apple.com/app/expo-go/id982107779  
- **Optional — iOS Simulator (Mac only):** **Xcode** from the Mac App Store (for `expo run:ios` / simulator)

## One-time setup

1. **Install dependencies**

   ```bash
   cd ExpoApp
   npm install
   ```

2. **Environment variables**

   Copy the example file and fill in real values (do **not** commit `.env`):

   ```bash
   cp .env.example .env
   ```

   | Variable | Purpose |
   |----------|--------|
   | `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
   | `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key |
   | `EXPO_PUBLIC_SUPABASE_POST_IMAGES_BUCKET` | Bucket name for post images |
   | `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` | Optional: Google **Places** (search suggestions) and **Maps SDK for Android**; on **iPhone** the in-app map uses **Apple MapKit** |

   After changing `.env`, restart Metro with a clean cache:

   ```bash
   npx expo start -c
   ```

## Run on a physical iPhone (Expo Go)

From **`ExpoApp/`**:

```bash
npx expo start
```

- **Same Wi‑Fi as your PC:** you can use the **LAN** URL / QR (often `exp://192.168.x.x:…`). Only devices on that network can open it.
- **Anyone, any network:** use a **tunnel** (slower but public):

  ```bash
  npx expo start --tunnel
  ```

Open **Expo Go** on the iPhone, scan the QR code, or open the link Expo prints.

**Note:** Your dev machine must stay on and Metro must keep running while testers use the app.

### Try-out QR for testers (tunnel — no database setup on their side)

For demos or UAT, the team used **tunnel mode** so the Expo QR code works **outside the house Wi‑Fi** (cellular or another network). From **`ExpoApp/`**:

```bash
npx expo start --tunnel
```

Expo prints a **tunnel URL** and QR code. Testers only need:

1. **Expo Go** installed on their iPhone  
2. To **scan that QR** (or open the link)

They **do not** need to clone the repo, create a **Supabase** project, or fill in **`.env`**. The JavaScript bundle is served from **your** machine, and the app uses the **`EXPO_PUBLIC_*`** values already configured on the host (e.g. shared Supabase project). Think of it as “pointing their Expo Go at your running dev server,” not each person provisioning a database.

**Caveats:** your PC must stay running with Metro + tunnel active; tunnel can be slower than LAN; treat shared keys like any public client and avoid sharing production secrets wider than you intend.

## Run on iOS Simulator (Mac + Xcode)

```bash
cd ExpoApp
npx expo run:ios
```

Or start the dev server and press **`i`** when prompted (simulator must be available).

## Maps behavior on iOS

- **Search tab map:** uses **Apple MapKit** on iPhone.
- **Google Places** (address / place suggestions in search) uses the **Places Web Service** from JavaScript when `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` is set. Enable **Places API** (and billing as required) on that key in Google Cloud Console.

## Builds beyond Expo Go (share without your laptop)

Expo Go is for **development**. To give people a **standalone app** (TestFlight, App Store, or internal install), use **EAS Build**. This repo includes **`eas.json`** with profiles such as `development`, `preview`, and `production`.

Typical flow (first time: create an Expo account, `npm i -g eas-cli`, `eas login`, `eas build:configure` if needed):

```bash
cd ExpoApp
eas build --platform ios --profile preview
```

Use **TestFlight** (or your org’s distribution process) for iPhone testers who should not depend on your dev server.

## Permissions (iOS)

The app may ask for:

- **Camera** — damage photos (`expo-camera`).
- **Location when in use** — tagging / nearby flows (`expo-location`).

These strings are configured in **`app.json`** under `expo.plugins`.

## Troubleshooting

| Issue | What to try |
|--------|-------------|
| QR opens but won’t load off Wi‑Fi | Use `npx expo start --tunnel` |
| “Could not connect to Metro” | Same network as LAN URL, or tunnel; firewall allowing Node |
| Env changes ignored | `npx expo start -c` after editing `.env` |
| Map / Places errors | Confirm APIs enabled on the Google key; check Metro logs |

## Repo branch

iOS-focused app changes have been developed on the **`ios`** Git branch (pushed as `origin/ios`). Merge or PR into your main branch as your team prefers.

---

*StructSure — Expo SDK 54 (`ExpoApp/package.json`).*
