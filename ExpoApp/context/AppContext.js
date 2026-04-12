import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { allPosts, initialCommentsByPost } from '../data/posts'
import { initialBuildings, PLACEHOLDER_BUILDING_IMAGE } from '../data/buildings'
import {
  addComment as addRemoteComment,
  createPost,
  deleteComment as deleteRemoteComment,
  deletePost as deleteRemotePost,
  fetchComments,
  fetchFeed,
  fetchMyUpvotes,
  toggleUpvote as toggleRemoteUpvote,
  updatePostResolution as updateRemoteResolution,
} from '../services/apiClient'
import {
  hasSupabaseConfigured,
  restoreSupabaseSession,
  signInWithSupabase,
  signOutSupabase,
  signUpWithSupabase,
  updateSupabaseProfile,
} from '../services/supabaseAuth'
import { isAuthError } from '../services/requestErrors'

const AppContext = createContext(null)
const DEFAULT_USER = { photo: null, username: 'johndoe', email: 'user@domain.com' }

const withKnownBuildings = (posts, buildings) =>
  posts.reduce(
    (acc, post) =>
      post?.buildingId && !acc.some((building) => building.id === post.buildingId)
        ? [
            {
              id: post.buildingId,
              name: post.buildingName || 'Building',
              address: post.buildingAddress || '',
              image: PLACEHOLDER_BUILDING_IMAGE,
              tags: 0,
              history: 0,
            },
            ...acc,
          ]
        : acc,
    [...buildings]
  )

const mergeComments = (localComments, remoteComments) =>
  [...(remoteComments || []), ...(localComments || [])].reduce(
    (acc, comment) =>
      acc.some((saved) => saved.id === comment.id || `${saved.author}:${saved.text}` === `${comment.author}:${comment.text}`)
        ? acc
        : [...acc, comment],
    []
  )

export function AppProvider({ children }) {
  const [posts, setPosts] = useState([...allPosts])
  const [buildings, setBuildings] = useState(() => [...initialBuildings])
  const [user, setUser] = useState(DEFAULT_USER)
  const [upvotedPosts, setUpvotedPosts] = useState(new Set())
  const [commentsByPost, setCommentsByPost] = useState({ ...initialCommentsByPost })
  const [authReady, setAuthReady] = useState(false)
  const [authBusy, setAuthBusy] = useState(false)
  const [sessionToken, setSessionToken] = useState(null)
  const [feedLoading, setFeedLoading] = useState(false)
  const [commentLoadingPostId, setCommentLoadingPostId] = useState(null)
  const [operationErrors, setOperationErrors] = useState({})
  const [lastError, setLastError] = useState(null)
  const feedRefreshInFlight = useRef(false)

  const clearError = useCallback((operation) => {
    setOperationErrors((prev) => {
      const next = { ...prev }
      delete next[operation]
      return next
    })
    setLastError(null)
  }, [])

  const setError = useCallback(
    (operation, error, fallback) => {
      const message = error?.message || fallback || 'Request failed.'
      setOperationErrors((prev) => ({ ...prev, [operation]: message }))
      setLastError(message)
      if (isAuthError(error)) {
        signOutSupabase()
        setSessionToken(null)
        setUser(DEFAULT_USER)
      }
    },
    []
  )

  const restoreAuthSession = useCallback(async () => {
    setAuthBusy(true)
    clearError('auth')
    try {
      if (!hasSupabaseConfigured()) {
        setSessionToken(null)
        setAuthReady(true)
        setAuthBusy(false)
        return null
      }
      const session = await restoreSupabaseSession()
      setSessionToken(session?.token || null)
      setUser(session?.user ? { ...DEFAULT_USER, ...session.user } : DEFAULT_USER)
      setAuthReady(true)
      setAuthBusy(false)
      return session
    } catch (error) {
      setSessionToken(null)
      setUser(DEFAULT_USER)
      setAuthReady(true)
      setAuthBusy(false)
      setError('auth', error, 'Unable to restore session.')
      return null
    }
  }, [clearError, setError])

  const loginWithSupabase = useCallback(async (email, password) => {
    setAuthBusy(true)
    clearError('auth')
    try {
      const session = await signInWithSupabase(email, password)
      setSessionToken(session.token)
      setUser({ ...DEFAULT_USER, ...session.user })
      setAuthReady(true)
      setAuthBusy(false)
      return session
    } catch (error) {
      setAuthBusy(false)
      setError('auth', error, 'Login failed.')
      throw error
    }
  }, [clearError, setError])

  const signupWithSupabase = useCallback(
    async (email, password, username) => {
      setAuthBusy(true)
      clearError('auth')
      try {
        const session = await signUpWithSupabase(email, password, username)
        setSessionToken(session.token)
        setUser({ ...DEFAULT_USER, ...session.user })
        setAuthReady(true)
        setAuthBusy(false)
        return session
      } catch (error) {
        setAuthBusy(false)
        setError('auth', error, 'Signup failed.')
        throw error
      }
    },
    [clearError, setError]
  )

  const logout = useCallback(async () => {
    await signOutSupabase()
    setSessionToken(null)
    setUser(DEFAULT_USER)
    setUpvotedPosts(new Set())
    clearError('auth')
  }, [clearError])

  const updateProfile = useCallback(
    async (patch) => {
      clearError('profile')
      setUser((prev) => ({ ...prev, ...patch }))
      if (!hasSupabaseConfigured() || !sessionToken) return
      try {
        const saved = await updateSupabaseProfile(patch)
        setUser((prev) => ({ ...prev, ...saved }))
      } catch (error) {
        setError('profile', error, 'Could not update profile.')
      }
    },
    [sessionToken, clearError, setError]
  )

  const refreshPosts = useCallback(async () => {
    if (feedRefreshInFlight.current) return []
    feedRefreshInFlight.current = true
    setFeedLoading(true)
    clearError('feed')
    try {
      const nextPosts = await fetchFeed(sessionToken)
      const nextUpvotedPosts = await fetchMyUpvotes(sessionToken)
      setPosts(nextPosts)
      setUpvotedPosts(new Set(nextUpvotedPosts))
      setBuildings((prev) => withKnownBuildings(nextPosts, prev.length ? prev : initialBuildings))
      return nextPosts
    } catch (error) {
      setError('feed', error, 'Failed to refresh feed.')
      return []
    } finally {
      setFeedLoading(false)
      feedRefreshInFlight.current = false
    }
  }, [sessionToken, clearError, setError])

  const loadCommentsForPost = useCallback(
    async (postId) => {
      const post = posts.find((item) => item.id === postId)
      if (!post) return commentsByPost[postId] || []
      setCommentLoadingPostId(postId)
      clearError('comments')
      try {
        const remote = await fetchComments(sessionToken, post)
        setCommentsByPost((prev) => ({ ...prev, [postId]: mergeComments(prev[postId], remote) }))
        setCommentLoadingPostId(null)
        return remote
      } catch (error) {
        setCommentLoadingPostId(null)
        setError('comments', error, 'Could not load comments.')
        return commentsByPost[postId] || []
      }
    },
    [posts, commentsByPost, sessionToken, clearError, setError]
  )

  const addPost = useCallback(
    async (newPost) => {
      const optimistic = {
        ...newPost,
        id: newPost.id || `new-${Date.now()}`,
        sortOrder: 0,
        author: newPost.author || user.username,
        time: 'Just now',
      }
      clearError('createPost')
      setPosts((prev) => [optimistic, ...prev])
      setCommentsByPost((prev) => ({ ...prev, [optimistic.id]: [] }))
      setBuildings((prev) => withKnownBuildings([optimistic], prev))
      try {
        const created = await createPost(sessionToken, optimistic)
        setPosts((prev) => [created, ...prev.filter((post) => post.id !== optimistic.id)])
        if (created.id !== optimistic.id)
          setCommentsByPost((prev) => {
            const next = { ...prev, [created.id]: prev[optimistic.id] || [] }
            delete next[optimistic.id]
            return next
          })
        return created
      } catch (error) {
        setPosts((prev) => prev.filter((post) => post.id !== optimistic.id))
        setError('createPost', error, 'Could not create post.')
        throw error
      }
    },
    [sessionToken, user.username, clearError, setError]
  )

  const deletePost = useCallback(
    async (postId) => {
      const target = posts.find((post) => post.id === postId)
      clearError('deletePost')
      setPosts((prev) => prev.filter((post) => post.id !== postId))
      setCommentsByPost((prev) => {
        const next = { ...prev }
        delete next[postId]
        return next
      })
      setUpvotedPosts((prev) => {
        const next = new Set(prev)
        next.delete(postId)
        return next
      })
      try {
        await deleteRemotePost(sessionToken, target, postId)
      } catch (error) {
        setError('deletePost', error, 'Could not delete post.')
        if (target) setPosts((prev) => [target, ...prev])
      }
    },
    [sessionToken, posts, clearError, setError]
  )

  const updatePostResolution = useCallback(
    async (postId, resolutionStatus) => {
      if (resolutionStatus !== 'resolved' && resolutionStatus !== 'unresolved') return
      const target = posts.find((post) => post.id === postId)
      clearError('updateResolution')
      setPosts((prev) =>
        prev.map((post) => (post.id !== postId || post.author !== user.username ? post : { ...post, resolutionStatus }))
      )
      try {
        if (target) await updateRemoteResolution(sessionToken, target, resolutionStatus)
      } catch (error) {
        setError('updateResolution', error, 'Could not update status.')
      }
    },
    [sessionToken, posts, user.username, clearError, setError]
  )

  const toggleUpvote = useCallback(
    async (postId) => {
      const target = posts.find((post) => post.id === postId)
      const isUpvoted = upvotedPosts.has(postId)
      clearError('upvote')
      setPosts((prev) =>
        prev.map((post) =>
          post.id !== postId ? post : { ...post, likes: Math.max(0, Number(post.likes || 0) + (isUpvoted ? -1 : 1)) }
        )
      )
      setUpvotedPosts((prev) => {
        const next = new Set(prev)
        if (next.has(postId)) next.delete(postId)
        else next.add(postId)
        return next
      })
      try {
        if (target) await toggleRemoteUpvote(sessionToken, target, isUpvoted)
      } catch (error) {
        setError('upvote', error, 'Could not update upvote.')
        setPosts((prev) =>
          prev.map((post) =>
            post.id !== postId ? post : { ...post, likes: Math.max(0, Number(post.likes || 0) + (isUpvoted ? 1 : -1)) }
          )
        )
        setUpvotedPosts((prev) => {
          const next = new Set(prev)
          if (isUpvoted) next.add(postId)
          else next.delete(postId)
          return next
        })
      }
    },
    [sessionToken, posts, upvotedPosts, clearError, setError]
  )

  const addComment = useCallback(
    async (postId, comment) => {
      if (!postId || !comment?.text?.trim()) return
      const optimistic = { id: `c-${Date.now()}`, author: user.username, text: comment.text.trim(), time: comment.time || 'Just now' }
      clearError('addComment')
      setCommentsByPost((prev) => ({ ...prev, [postId]: [...(prev[postId] || []), optimistic] }))
      setPosts((prev) =>
        prev.map((post) =>
          post.id !== postId ? post : { ...post, comments: Math.max(0, Number(post.comments || 0) + 1) }
        )
      )
      try {
        const target = posts.find((post) => post.id === postId)
        if (!target) return
        const remoteComment = await addRemoteComment(sessionToken, target, comment.text.trim())
        setCommentsByPost((prev) => ({
          ...prev,
          [postId]: mergeComments((prev[postId] || []).map((item) => (item.id === optimistic.id ? { ...remoteComment, time: remoteComment.time || optimistic.time } : item)), [remoteComment]),
        }))
      } catch (error) {
        setError('addComment', error, 'Could not add comment.')
        setPosts((prev) =>
          prev.map((post) =>
            post.id !== postId ? post : { ...post, comments: Math.max(0, Number(post.comments || 0) - 1) }
          )
        )
      }
    },
    [sessionToken, posts, user.username, clearError, setError]
  )

  const deleteComment = useCallback(
    async (postId, commentId) => {
      if (!postId || !commentId) return
      clearError('deleteComment')
      setCommentsByPost((prev) => ({
        ...prev,
        [postId]: (prev[postId] || []).filter((comment) => comment.id !== commentId),
      }))
      setPosts((prev) =>
        prev.map((post) =>
          post.id !== postId ? post : { ...post, comments: Math.max(0, Number(post.comments || 0) - 1) }
        )
      )
      try {
        await deleteRemoteComment(sessionToken, commentId)
      } catch (error) {
        setError('deleteComment', error, 'Could not delete comment.')
        await Promise.all([loadCommentsForPost(postId), refreshPosts()])
      }
    },
    [sessionToken, clearError, setError, loadCommentsForPost, refreshPosts]
  )

  const value = {
    posts,
    buildings,
    user,
    setUser,
    sessionToken,
    authReady,
    authBusy,
    feedLoading,
    commentLoadingPostId,
    lastError,
    operationErrors,
    hasAuthConfigured: hasSupabaseConfigured(),
    restoreAuthSession,
    loginWithSupabase,
    signupWithSupabase,
    logout,
    updateProfile,
    refreshPosts,
    loadCommentsForPost,
    upvotedPosts,
    commentsByPost,
    addPost,
    deletePost,
    updatePostResolution,
    toggleUpvote,
    addComment,
    deleteComment,
    getDisplayCommentCount: (postId) => {
      const post = posts.find((item) => item.id === postId)
      if (!post) return 0
      return Math.max(Number(post.comments || 0), (commentsByPost[postId] || []).length)
    },
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
