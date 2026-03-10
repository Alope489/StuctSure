# StructSure Auth UI – Loading, Login & Signup (Frontend)

Mobile-first React frontend for the StructSure phone app: loading (splash), login, and signup screens. Purely frontend; no API or backend connectors.

## Design reference

Layout and styling follow `loading-signup-login-pages.png`:

- **Loading**: Centered StructSure logo on dark background; small “loading” label top-left; auto-redirects to login after ~2.2s.
- **Login**: Logo, “Email or Username” and “Password” fields, primary “Login” button, “Or login with” + “Google” button, “Don’t have an account? Signup” link.
- **Signup**: Logo, Username / Email / Password / Confirm password, “Signup” button, “Or signup with” + “Google”, “Already have an account! Login” link.

Theme: dark background (`#0d0d0d`), dark grey inputs (`#333`), teal primary buttons (`#00a0a0`), teal links (`#00ffff`), grey “Google” buttons (`#555`).

## Project structure

```
Project/
├── public/
│   └── logo.png          # StructSure logo (served at /logo.png)
├── src/
│   ├── main.jsx          # Entry: React root + BrowserRouter
│   ├── App.jsx           # Routes: / → Loading, /login → Login, /signup → Signup
│   ├── index.css         # Global styles, CSS variables, mobile viewport/safe-area
│   └── pages/
│       ├── Loading.jsx   # Splash with logo; redirects to /login
│       ├── Loading.css
│       ├── Login.jsx     # Login form (no submit handler)
│       ├── Signup.jsx    # Signup form (no submit handler)
│       └── Auth.css      # Shared styles for Login & Signup
├── index.html            # Viewport + theme-color for phone app
├── vite.config.js
└── package.json
```

## Scripts

- `npm install` – Install dependencies.
- `npm run dev` – Start dev server (e.g. http://localhost:5173).
- `npm run build` – Production build to `dist/`.
- `npm run preview` – Preview production build.

## Routing

| Path     | Component | Notes                          |
|----------|-----------|---------------------------------|
| `/`      | Loading   | Shows logo; then navigates to `/login`. |
| `/login` | Login     | Form only; no API calls.        |
| `/signup`| Signup    | Form only; no API calls.        |
| Other    | –         | Redirects to `/`.               |

## Mobile / phone app

- Viewport and `theme-color` set for mobile; safe-area insets used for notched devices.
- App container max-width 430px, centered, for phone-sized layout.
- Forms are touch-friendly; no backend so all actions are local (navigation only).

## Adding backend later

- In `Login.jsx` and `Signup.jsx`, replace the `onSubmit` that only calls `e.preventDefault()` with logic that calls your auth API, then navigate on success (e.g. to a home route).
