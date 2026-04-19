const appJson = require('./app.json')

/**
 * Dynamic Expo config: inject native Google Maps API key from env (same key can enable Maps + Places).
 * Keep static metadata in app.json; this file extends android/ios map config for react-native-maps.
 */
module.exports = () => {
  const key = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  return {
    expo: {
      ...appJson.expo,
      android: {
        ...appJson.expo.android,
        config: {
          ...(appJson.expo.android?.config || {}),
          googleMaps: {
            apiKey: key,
          },
        },
      },
      ios: {
        ...appJson.expo.ios,
        // Map on iPhone uses Apple MapKit (SearchMainScreen). Google key in .env is still used for Places API (JS).
      },
    },
  }
}
