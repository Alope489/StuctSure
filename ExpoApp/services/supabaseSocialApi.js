import { SUPABASE_POST_IMAGES_BUCKET } from './config'
import { createRequestError } from './requestErrors'
import { getSupabaseClient } from './supabaseClient'

const toRelativeTime = (createdAt) => {
  if (!createdAt) return 'Just now'
  const diffMs = Date.now() - new Date(createdAt).getTime()
  if (!Number.isFinite(diffMs) || diffMs < 0) return 'Just now'
  if (diffMs < 60000) return 'Just now'
  if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m ago`
  if (diffMs < 86400000) return `${Math.floor(diffMs / 3600000)}h ago`
  return `${Math.floor(diffMs / 86400000)}d ago`
}

const getRelationCount = (value) =>
  Array.isArray(value) ? Number(value[0]?.count || 0) : Number(value?.count || 0)

const mapPostRow = (row) => ({
  id: row?.id || `new-${Date.now()}`,
  issueId: row?.id || null,
  misskeyNoteId: null,
  author: row?.profiles?.username || 'unknown',
  time: toRelativeTime(row?.created_at),
  sortOrder: 0,
  title: row?.title || 'Report',
  body: row?.body || '',
  tags: row?.tags || [],
  tagsMore: 0,
  likes: getRelationCount(row?.upvotes),
  comments: getRelationCount(row?.comments),
  images: (row?.post_images || []).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).map((image) => ({ uri: image.public_url })),
  buildingId: row?.building_id || null,
  buildingName: row?.building_name || null,
  buildingAddress: row?.building_address || null,
  resolutionStatus: row?.resolution_status || 'unresolved',
  severity: row?.severity ?? null,
  latitude: row?.latitude ?? null,
  longitude: row?.longitude ?? null,
})

const mapCommentRow = (row) => ({
  id: row?.id || `c-${Date.now()}`,
  author: row?.profiles?.username || 'unknown',
  text: row?.text || '',
  time: toRelativeTime(row?.created_at),
  createdAt: row?.created_at || null,
})

async function getCurrentAuthUser() {
  const { data, error } = await getSupabaseClient().auth.getUser()
  if (error) throw createRequestError({ message: error.message || 'Auth check failed.', code: error.status ? `AUTH_${error.status}` : 'AUTH_CHECK_FAILED', retryable: false, operation: 'getCurrentAuthUser' })
  if (!data?.user?.id) throw createRequestError({ message: 'You must be logged in.', code: 'AUTH_REQUIRED', retryable: false, operation: 'getCurrentAuthUser' })
  return data.user
}

async function getHydratedPost(postId) {
  const { data, error } = await getSupabaseClient()
    .from('posts')
    .select(
      `
      id,
      title,
      body,
      tags,
      severity,
      resolution_status,
      building_id,
      building_name,
      building_address,
      latitude,
      longitude,
      created_at,
      profiles!posts_author_id_fkey(username),
      post_images(public_url, sort_order),
      comments(count),
      upvotes(count)
    `
    )
    .eq('id', postId)
    .single()
  if (error) throw createRequestError({ message: error.message || 'Could not load post.', code: error.code || 'POST_FETCH_FAILED', retryable: false, operation: 'getHydratedPost' })
  return mapPostRow(data)
}

async function uploadPostImage(userId, postId, uri, index) {
  const blob = await (await fetch(uri)).blob()
  const extension = uri?.split('.').pop()?.split('?')?.[0] || 'jpg'
  const filePath = `${userId}/${postId}/${Date.now()}-${index}.${extension}`
  const { error } = await getSupabaseClient().storage.from(SUPABASE_POST_IMAGES_BUCKET).upload(filePath, blob, { upsert: false, contentType: blob.type || 'image/jpeg' })
  if (error) throw createRequestError({ message: error.message || 'Image upload failed.', code: error.statusCode ? `STORAGE_${error.statusCode}` : 'IMAGE_UPLOAD_FAILED', retryable: false, operation: 'uploadPostImage' })
  return { storagePath: filePath, publicUrl: getSupabaseClient().storage.from(SUPABASE_POST_IMAGES_BUCKET).getPublicUrl(filePath).data.publicUrl }
}

export async function getSupabaseFeed() {
  const { data, error } = await getSupabaseClient()
    .from('posts')
    .select(
      `
      id,
      title,
      body,
      tags,
      severity,
      resolution_status,
      building_id,
      building_name,
      building_address,
      latitude,
      longitude,
      created_at,
      profiles!posts_author_id_fkey(username),
      post_images(public_url, sort_order),
      comments(count),
      upvotes(count)
    `
    )
    .order('created_at', { ascending: false })
  if (error) throw createRequestError({ message: error.message || 'Failed to fetch feed.', code: error.code || 'FEED_FETCH_FAILED', retryable: false, operation: 'getSupabaseFeed' })
  return (data || []).map(mapPostRow)
}

export async function createSupabasePost(post) {
  const user = await getCurrentAuthUser()
  const { data, error } = await getSupabaseClient()
    .from('posts')
    .insert({
      author_id: user.id,
      title: post?.title || 'Report',
      body: post?.body || '',
      tags: post?.tags || [],
      severity: post?.severity ?? null,
      resolution_status: post?.resolutionStatus || 'unresolved',
      building_id: post?.buildingId || null,
      building_name: post?.buildingName || null,
      building_address: post?.buildingAddress || null,
      latitude: post?.latitude ?? null,
      longitude: post?.longitude ?? null,
    })
    .select('id')
    .single()
  if (error) throw createRequestError({ message: error.message || 'Failed to create post.', code: error.code || 'POST_CREATE_FAILED', retryable: false, operation: 'createSupabasePost' })
  if ((post?.images || []).length) {
    const rows = await Promise.all(
      post.images.map(async (image, index) => {
        const uploaded = await uploadPostImage(user.id, data.id, image?.uri || image?.url || image, index)
        return { post_id: data.id, storage_path: uploaded.storagePath, public_url: uploaded.publicUrl, sort_order: index }
      })
    )
    const { error: imageError } = await getSupabaseClient().from('post_images').insert(rows)
    if (imageError) throw createRequestError({ message: imageError.message || 'Created post, but failed to save image references.', code: imageError.code || 'POST_IMAGES_CREATE_FAILED', retryable: false, operation: 'createSupabasePostImages' })
  }
  return getHydratedPost(data.id)
}

export async function deleteSupabasePost(postId) {
  const { error } = await getSupabaseClient().from('posts').delete().eq('id', postId)
  if (error) throw createRequestError({ message: error.message || 'Failed to delete post.', code: error.code || 'POST_DELETE_FAILED', retryable: false, operation: 'deleteSupabasePost' })
}

export async function updateSupabaseResolution(postId, resolutionStatus) {
  const { error } = await getSupabaseClient().from('posts').update({ resolution_status: resolutionStatus }).eq('id', postId)
  if (error) throw createRequestError({ message: error.message || 'Failed to update status.', code: error.code || 'RESOLUTION_UPDATE_FAILED', retryable: false, operation: 'updateSupabaseResolution' })
}

export async function getSupabaseComments(postId) {
  const { data, error } = await getSupabaseClient()
    .from('comments')
    .select('id, text, created_at, profiles!comments_author_id_fkey(username)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })
  if (error) throw createRequestError({ message: error.message || 'Failed to load comments.', code: error.code || 'COMMENTS_FETCH_FAILED', retryable: false, operation: 'getSupabaseComments' })
  return (data || []).map(mapCommentRow)
}

export async function addSupabaseComment(postId, text) {
  const user = await getCurrentAuthUser()
  const { data, error } = await getSupabaseClient().from('comments').insert({ post_id: postId, author_id: user.id, text }).select('id, text, created_at, profiles!comments_author_id_fkey(username)').single()
  if (error) throw createRequestError({ message: error.message || 'Failed to add comment.', code: error.code || 'COMMENT_CREATE_FAILED', retryable: false, operation: 'addSupabaseComment' })
  return mapCommentRow(data)
}

export async function toggleSupabaseUpvote(postId, isUpvoted) {
  const user = await getCurrentAuthUser()
  if (isUpvoted) {
    const { error } = await getSupabaseClient().from('upvotes').delete().eq('post_id', postId).eq('user_id', user.id)
    if (error) throw createRequestError({ message: error.message || 'Failed to remove upvote.', code: error.code || 'UPVOTE_DELETE_FAILED', retryable: false, operation: 'toggleSupabaseUpvote' })
    return
  }
  const { error } = await getSupabaseClient().from('upvotes').upsert({ post_id: postId, user_id: user.id }, { onConflict: 'post_id,user_id' })
  if (error) throw createRequestError({ message: error.message || 'Failed to add upvote.', code: error.code || 'UPVOTE_CREATE_FAILED', retryable: false, operation: 'toggleSupabaseUpvote' })
}
