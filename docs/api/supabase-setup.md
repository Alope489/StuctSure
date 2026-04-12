# Supabase Setup For Expo Social Stack

This project now uses Supabase directly from `ExpoApp` for auth, feed, posts, comments, upvotes, and image uploads.

## 1) Create a Supabase project

- Create a new project in Supabase.
- Copy:
  - Project URL
  - `anon` public API key

## 2) Apply schema and policies

- Open SQL Editor in Supabase.
- Run [`docs/api/supabase-social-schema.sql`](./supabase-social-schema.sql).
- This script creates:
  - `profiles`, `posts`, `post_images`, `comments`, `upvotes`
  - RLS policies for read/write ownership
  - `post-images` storage bucket and policies
  - auth trigger to auto-create `profiles` rows for new users

## 3) Configure Expo env

Create `ExpoApp/.env` from `ExpoApp/.env.example` and set:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
EXPO_PUBLIC_SUPABASE_POST_IMAGES_BUCKET=post-images
```

## 4) Run the app

```bash
cd ExpoApp
npm install
npx expo start
```

## 5) Confirm feature parity

- Sign up and log in with email/password.
- Create a post with image + building link.
- Verify feed loads and profile counts update.
- Add comments and toggle upvotes.
- Update post resolution and delete your own post.
