const trimTrailingSlash = (value) => (value || '').trim().replace(/\/+$/, '')

export const SUPABASE_URL = trimTrailingSlash(process.env.EXPO_PUBLIC_SUPABASE_URL)
export const SUPABASE_ANON_KEY = (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '').trim()
export const SUPABASE_POST_IMAGES_BUCKET = (process.env.EXPO_PUBLIC_SUPABASE_POST_IMAGES_BUCKET || 'post-images').trim()
export const HAS_SUPABASE_CONFIG = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
