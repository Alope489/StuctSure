import { createContext, useContext, useState, useCallback } from 'react'
import { allPosts, initialCommentsByPost } from '../data/posts'
import { initialBuildings, PLACEHOLDER_BUILDING_IMAGE } from '../data/buildings'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [posts, setPosts] = useState([...allPosts])
  const [buildings, setBuildings] = useState(() => [...initialBuildings])
  const [user, setUser] = useState({ photo: null, username: 'johndoe', email: 'user@domain.com' })
  const [upvotedPosts, setUpvotedPosts] = useState(new Set())
  const [commentsByPost, setCommentsByPost] = useState({ ...initialCommentsByPost })

  const addPost = useCallback((newPost) => {
    setPosts((prev) => [{ ...newPost, sortOrder: 0 }, ...prev])
    setCommentsByPost((prev) => ({ ...prev, [newPost.id]: [] }))
    if (!newPost.buildingId) return
    setBuildings((prev) => {
      if (prev.some((b) => b.id === newPost.buildingId)) return prev
      return [
        {
          id: newPost.buildingId,
          name: newPost.buildingName || 'Building',
          address: newPost.buildingAddress || '',
          image: newPost.buildingImageUrl || PLACEHOLDER_BUILDING_IMAGE,
          tags: 0,
          history: 0,
        },
        ...prev,
      ]
    })
  }, [])

  const deletePost = useCallback((postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId))
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
  }, [])

  const toggleUpvote = useCallback((postId) => {
    setUpvotedPosts((prev) => {
      const next = new Set(prev)
      if (next.has(postId)) next.delete(postId)
      else next.add(postId)
      return next
    })
  }, [])

  const addComment = useCallback((postId, comment) => {
    if (!postId || !comment?.text?.trim()) return
    const newComment = {
      id: `c-${Date.now()}`,
      author: user.username,
      text: comment.text.trim(),
      time: comment.time || 'Just now',
    }
    setCommentsByPost((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment],
    }))
  }, [user.username])

  const value = {
    posts,
    buildings,
    user,
    setUser,
    upvotedPosts,
    commentsByPost,
    addPost,
    deletePost,
    toggleUpvote,
    addComment,
    getDisplayCommentCount: (postId) => {
      const post = posts.find((p) => p.id === postId)
      if (!post) return 0
      const base = post.comments || 0
      const initialLen = (initialCommentsByPost[postId] || []).length
      const currentLen = (commentsByPost[postId] || []).length
      return base + Math.max(0, currentLen - initialLen)
    },
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
