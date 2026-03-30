# Themed dialog (in-app alerts)

[`ExpoApp/context/ThemedDialogContext.js`](../ExpoApp/context/ThemedDialogContext.js) provides **`ThemedDialogProvider`** and **`useThemedDialog()`** so confirmation and action sheets match the app shell (dark card `#12161a`, green accents, muted cancel/destructive styles) instead of the native `Alert` chrome.

## Usage

Wrap the navigation tree inside **`ThemedDialogProvider`** (after **`AppProvider`** in [`App.js`](../ExpoApp/App.js)).

```javascript
const showThemedDialog = useThemedDialog()
showThemedDialog({
  title: 'Title',
  message: 'Body text',
  buttons: [
    { text: 'OK', onPress: () => {} },
    { text: 'Cancel', style: 'cancel', onPress: () => {} },
    { text: 'Delete', style: 'destructive', onPress: () => doDelete() },
  ],
})
```

Nested flows (e.g. “Change status” → second dialog) chain by calling **`showThemedDialog`** again from a button **`onPress`**; the previous dialog is dismissed first.

## Related

- [`AccountSidePanel`](../ExpoApp/components/AccountSidePanel.js) uses **`useThemedDialog`** for camera/gallery permission messages and shares the Home slide-in account UI with Notifications.
