# Demo Validation Checklist

Use this checklist to prove live shared state across multiple phones.

## Environment

- Expo env values set in `ExpoApp/.env`:
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
  - `EXPO_PUBLIC_SUPABASE_POST_IMAGES_BUCKET`
- Supabase schema and policies applied from `docs/api/supabase-social-schema.sql`.
- Team devices are logged into Supabase in the app.

## Optional automated API smoke check (legacy sidecar)

```bash
cd backend
API_URL=https://your-backend-url API_TOKEN=<misskey_token> npm run demo:validate
```

Expected result:
- Script exits successfully.
- Console prints `Demo validation passed for issue ...`.

## Multi-device manual proof

1. Phone A creates a post.
2. Phone B refreshes feed and verifies the post appears.
3. Phone C comments on that post.
4. Phone A opens comments and verifies Phone C comment appears.
5. Phone B upvotes post.
6. Phone A refreshes and verifies like count increases.
7. Phone C marks post resolved.
8. Phone A and B verify resolution status updates.

## Evidence to capture

- One screen recording showing all three phones.
- One screenshot of Supabase table updates (`posts`, `comments`, `upvotes`) or backend logs if sidecar validation is also run.
- One screenshot of successful `npm run demo:validate` output.
