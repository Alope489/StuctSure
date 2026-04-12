import { allPosts } from '../data/posts'
import { HAS_SUPABASE_CONFIG } from './config'
import {
  addSupabaseComment,
  createSupabasePost,
  deleteSupabasePost,
  getSupabaseComments,
  getSupabaseFeed,
  toggleSupabaseUpvote,
  updateSupabaseResolution,
} from './supabaseSocialApi'

const createLocalId = () => `new-${Date.now()}`

export async function fetchFeed(token) {
  if (!HAS_SUPABASE_CONFIG || !token) return [...allPosts]
  return getSupabaseFeed()
}

export async function createPost(token, post) {
  if (!HAS_SUPABASE_CONFIG || !token) return { ...post, id: post.id || createLocalId(), sortOrder: 0 }
  return createSupabasePost(post)
}

export async function deletePost(token, post, postId) {
  if (!HAS_SUPABASE_CONFIG || !token) return
  await deleteSupabasePost(postId || post?.id)
}

export async function updatePostResolution(token, post, resolutionStatus) {
  if (!HAS_SUPABASE_CONFIG || !token || !post?.id) return
  await updateSupabaseResolution(post.id, resolutionStatus)
}

export async function toggleUpvote(token, post, isUpvoted) {
  if (!HAS_SUPABASE_CONFIG || !token || !post?.id) return
  await toggleSupabaseUpvote(post.id, isUpvoted)
}

export async function fetchComments(token, post) {
  if (!post) return []
  if (!HAS_SUPABASE_CONFIG || !token || !post?.id) return []
  return getSupabaseComments(post.id)
}

export async function addComment(token, post, text) {
  if (!HAS_SUPABASE_CONFIG || !token || !post?.id) return { id: `c-${Date.now()}`, text, time: 'Just now' }
  return addSupabaseComment(post.id, text)
}
