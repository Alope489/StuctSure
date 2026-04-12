import { HAS_SUPABASE_CONFIG, SUPABASE_POST_IMAGES_BUCKET } from './config'
import { createRequestError } from './requestErrors'
import { getSupabaseClient } from './supabaseClient'

const deriveUsername = (email) => (email || '').split('@')[0] || `user-${Date.now()}`
const isRemoteUrl = (value) => /^https?:\/\//i.test(value || '')
const contentTypeFromUri = (uri) =>
  ({
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    heic: 'image/heic',
    heif: 'image/heif',
  }[(uri?.split('.').pop()?.split('?')?.[0] || '').toLowerCase()] || 'image/jpeg')

const localUriToArrayBuffer = (uri) =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.onerror = () => reject(new Error('Could not read profile image bytes from local URI.'))
    xhr.onload = () => resolve(xhr.response)
    xhr.responseType = 'arraybuffer'
    xhr.open('GET', uri, true)
    xhr.send(null)
  })

async function toPersistentAvatarUrl(userId, photo) {
  if (!photo) return null
  if (isRemoteUrl(photo)) return photo
  const extension = (photo?.split('.').pop()?.split('?')?.[0] || 'jpg').toLowerCase()
  const filePath = `${userId}/profile/avatar-${Date.now()}.${extension}`
  const { error } = await getSupabaseClient().storage.from(SUPABASE_POST_IMAGES_BUCKET).upload(
    filePath,
    await (async () => {
      try {
        return await (await fetch(photo)).arrayBuffer()
      } catch (_unusedError) {
        return localUriToArrayBuffer(photo)
      }
    })(),
    { upsert: true, contentType: contentTypeFromUri(photo) }
  )
  if (error)
    throw createRequestError({
      message: error.message || 'Could not upload profile image.',
      code: error.statusCode ? `STORAGE_${error.statusCode}` : 'PROFILE_IMAGE_UPLOAD_FAILED',
      retryable: false,
      operation: 'toPersistentAvatarUrl',
    })
  return getSupabaseClient().storage.from(SUPABASE_POST_IMAGES_BUCKET).getPublicUrl(filePath).data.publicUrl
}

const toPublicUser = (authUser, profile) => ({
  id: authUser?.id || '',
  username: profile?.username || deriveUsername(authUser?.email),
  email: authUser?.email || '',
  photo: profile?.avatar_url || null,
  host: null,
})

async function getProfileById(userId) {
  if (!userId) return null
  const { data, error } = await getSupabaseClient().from('profiles').select('id, username, avatar_url').eq('id', userId).maybeSingle()
  if (error && error.code !== 'PGRST116') throw createRequestError({ message: error.message || 'Could not load profile.', code: error.code || 'PROFILE_FETCH_FAILED', retryable: false, operation: 'getProfileById' })
  return data || null
}

async function ensureProfile(authUser, requestedUsername) {
  if (!authUser?.id) return null
  const username = (requestedUsername || '').trim() || deriveUsername(authUser.email)
  const { data, error } = await getSupabaseClient()
    .from('profiles')
    .upsert({ id: authUser.id, username }, { onConflict: 'id' })
    .select('id, username, avatar_url')
    .single()
  if (error) throw createRequestError({ message: error.message || 'Could not save profile.', code: error.code || 'PROFILE_UPSERT_FAILED', retryable: false, operation: 'ensureProfile' })
  return data
}

async function toSessionPayload(session, requestedUsername) {
  if (!session?.user || !session?.access_token) return null
  const profile = requestedUsername ? await ensureProfile(session.user, requestedUsername) : await getProfileById(session.user.id)
  return { token: session.access_token, user: toPublicUser(session.user, profile), connectedAt: Date.now() }
}

export function hasSupabaseConfigured() {
  return HAS_SUPABASE_CONFIG
}

export async function signInWithSupabase(email, password) {
  if (!HAS_SUPABASE_CONFIG) throw new Error('Supabase is not configured.')
  const { data, error } = await getSupabaseClient().auth.signInWithPassword({ email: email.trim(), password })
  if (error) throw createRequestError({ message: error.message || 'Login failed.', code: error.status ? `AUTH_${error.status}` : 'AUTH_LOGIN_FAILED', retryable: false, operation: 'signInWithSupabase' })
  const payload = await toSessionPayload(data?.session, null)
  if (payload) return payload
  throw new Error('Login succeeded, but no active session was returned.')
}

export async function signUpWithSupabase(email, password, username) {
  if (!HAS_SUPABASE_CONFIG) throw new Error('Supabase is not configured.')
  const { data, error } = await getSupabaseClient().auth.signUp({ email: email.trim(), password, options: { data: { username: (username || '').trim() || deriveUsername(email) } } })
  if (error) throw createRequestError({ message: error.message || 'Signup failed.', code: error.status ? `AUTH_${error.status}` : 'AUTH_SIGNUP_FAILED', retryable: false, operation: 'signUpWithSupabase' })
  if (!data?.session) throw new Error('Signup submitted. If email confirmation is enabled, confirm your email before logging in.')
  const payload = await toSessionPayload(data.session, username)
  if (payload) return payload
  throw new Error('Signup succeeded, but no active session was returned.')
}

export async function restoreSupabaseSession() {
  if (!HAS_SUPABASE_CONFIG) return null
  const { data, error } = await getSupabaseClient().auth.getSession()
  if (error) throw createRequestError({ message: error.message || 'Failed to restore session.', code: error.status ? `AUTH_${error.status}` : 'AUTH_RESTORE_FAILED', retryable: false, operation: 'restoreSupabaseSession' })
  return toSessionPayload(data?.session, null)
}

export async function updateSupabaseProfile({ username, photo } = {}) {
  if (!HAS_SUPABASE_CONFIG) throw new Error('Supabase is not configured.')
  const { data, error } = await getSupabaseClient().auth.getUser()
  if (error) throw createRequestError({ message: error.message || 'Auth check failed.', code: error.status ? `AUTH_${error.status}` : 'AUTH_CHECK_FAILED', retryable: false, operation: 'updateSupabaseProfileAuth' })
  if (!data?.user?.id) throw createRequestError({ message: 'You must be logged in.', code: 'AUTH_REQUIRED', retryable: false, operation: 'updateSupabaseProfileAuth' })
  const profile = await getProfileById(data.user.id)
  const avatarUrl = await toPersistentAvatarUrl(data.user.id, photo ?? profile?.avatar_url ?? null)
  const { data: updated, error: upsertError } = await getSupabaseClient()
    .from('profiles')
    .upsert(
      {
        id: data.user.id,
        username: (username || '').trim() || profile?.username || deriveUsername(data.user.email),
        avatar_url: avatarUrl,
      },
      { onConflict: 'id' }
    )
    .select('id, username, avatar_url')
    .single()
  if (upsertError) throw createRequestError({ message: upsertError.message || 'Could not save profile.', code: upsertError.code || 'PROFILE_UPDATE_FAILED', retryable: false, operation: 'updateSupabaseProfile' })
  return toPublicUser(data.user, updated)
}

export async function signOutSupabase() {
  if (!HAS_SUPABASE_CONFIG) return
  const { error } = await getSupabaseClient().auth.signOut()
  if (error) throw createRequestError({ message: error.message || 'Sign-out failed.', code: error.status ? `AUTH_${error.status}` : 'AUTH_SIGNOUT_FAILED', retryable: false, operation: 'signOutSupabase' })
}
