# Team Device Installs (No App Store)

Use this flow for school-team installs on Android and iPhone without public app store release.

## 1) Expo Go path (fastest)

1. Start metro with tunnel:

```bash
cd ExpoApp
npm install
npm run start:tunnel
```

2. Teammates install Expo Go.
3. Each teammate scans the QR code.
4. Everyone connects to the same remote backend URL in `.env`.

## 2) Internal build path (recommended for stable demos)

Requires EAS account and, for iOS, Apple Developer access.

```bash
cd ExpoApp
npx eas login
npx eas build --platform android --profile preview
npx eas build --platform ios --profile preview
```

- Android preview profile outputs an APK you can share directly.
- iOS preview profile creates an internal build install link from EAS.

## 3) Ship updates remotely

- JS-only changes (no new native dependency):

```bash
cd ExpoApp
npx eas update --branch preview --message "School demo update"
```

- Native dependency changes: create new preview builds and redistribute install links/APKs.
