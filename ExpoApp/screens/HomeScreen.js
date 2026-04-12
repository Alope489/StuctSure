import { useState, useRef, useCallback, useEffect } from 'react'
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect, useScrollToTop } from '@react-navigation/native'
import { useApp } from '../context/AppContext'
import { useThemedDialog } from '../context/ThemedDialogContext'
import { PostCard } from '../components/PostCard'
import { AccountSidePanel } from '../components/AccountSidePanel'

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets()
  const showThemedDialog = useThemedDialog()
  const scrollRef = useRef(null)
  useScrollToTop(scrollRef)
  const {
    posts,
    buildings,
    user,
    upvotedPosts,
    commentsByPost,
    toggleUpvote,
    addComment,
    deletePost,
    updatePostResolution,
    getDisplayCommentCount,
    refreshPosts,
    feedLoading,
    lastError,
    loadCommentsForPost,
    commentLoadingPostId,
    operationErrors,
    hasAuthConfigured,
    sessionToken,
    authReady,
  } = useApp()
  const [profileOpen, setProfileOpen] = useState(false)
  const [commentsOpenForPostId, setCommentsOpenForPostId] = useState(null)
  const [commentInput, setCommentInput] = useState('')

  useFocusEffect(
    useCallback(() => {
      refreshPosts()
    }, [refreshPosts])
  )

  useEffect(() => {
    if (commentsOpenForPostId) loadCommentsForPost(commentsOpenForPostId)
  }, [commentsOpenForPostId, loadCommentsForPost])
  useEffect(() => {
    if (!hasAuthConfigured || sessionToken || !authReady) return
    const parent = navigation.getParent?.()
    if (parent) parent.navigate('Login')
    else navigation.navigate('Login')
  }, [authReady, hasAuthConfigured, navigation, sessionToken])

  const handlePostMenu = (post) => {
    const isOwn = post.author === (user?.username || 'johndoe')
    if (isOwn) {
      showThemedDialog({
        title: 'Your post',
        message: 'Choose an action.',
        buttons: [
          {
            text: 'Change status',
            onPress: () =>
              showThemedDialog({
                title: 'Report status',
                message: 'Mark this report as resolved or unresolved.',
                buttons: [
                  { text: 'Unresolved', onPress: () => updatePostResolution(post.id, 'unresolved') },
                  { text: 'Resolved', onPress: () => updatePostResolution(post.id, 'resolved') },
                  { text: 'Cancel', style: 'cancel', onPress: () => {} },
                ],
              }),
          },
          {
            text: 'Delete post',
            style: 'destructive',
            onPress: () =>
              showThemedDialog({
                title: 'Delete post',
                message: 'Are you sure you want to delete this post?',
                buttons: [
                  { text: 'Cancel', style: 'cancel', onPress: () => {} },
                  { text: 'Delete', style: 'destructive', onPress: () => deletePost(post.id) },
                ],
              }),
          },
          { text: 'Cancel', style: 'cancel', onPress: () => {} },
        ],
      })
    } else {
      showThemedDialog({
        title: 'Report post',
        message: 'Report this post for review?',
        buttons: [
          { text: 'Cancel', style: 'cancel', onPress: () => {} },
          {
            text: 'Report',
            onPress: () =>
              showThemedDialog({
                title: 'Report submitted',
                message: 'Thank you. Your report has been submitted for review.',
                buttons: [{ text: 'OK', onPress: () => {} }],
              }),
          },
        ],
      })
    }
  }
  const handleAddComment = async () => {
    if (!commentsOpenForPostId || !commentInput.trim()) return
    await addComment(commentsOpenForPostId, { text: commentInput.trim(), time: 'Just now' })
    await loadCommentsForPost(commentsOpenForPostId)
    setCommentInput('')
  }

  const closeComments = () => {
    setCommentsOpenForPostId(null)
    setCommentInput('')
  }

  return (
    <View style={styles.container}>
      <View style={[styles.topbar, { paddingTop: 14 + insets.top }]}>
        <Image
          source={require('../assets/StructSure-Logo-Horizontal.png')}
          style={styles.brandLogo}
          resizeMode="contain"
          accessibilityRole="header"
          accessibilityLabel="StructSure"
        />
        <TouchableOpacity onPress={() => setProfileOpen(true)} style={styles.profileBtn} activeOpacity={0.7} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Image source={user?.photo ? { uri: user.photo } : require('../assets/johndoe.png')} style={styles.profilePic} />
        </TouchableOpacity>
      </View>
      <ScrollView ref={scrollRef} style={styles.feed} contentContainerStyle={styles.feedContent}>
        {feedLoading ? <ActivityIndicator color="#00ff7f" style={styles.feedLoading} /> : null}
        {lastError ? <Text style={styles.errorText}>{lastError}</Text> : null}
        {posts.map((p) => (
          <PostCard
            key={p.id}
            post={p}
            isUpvoted={upvotedPosts.has(p.id)}
            onUpvote={toggleUpvote}
            onComment={setCommentsOpenForPostId}
            displayCommentCount={getDisplayCommentCount(p.id)}
            onPostMenu={handlePostMenu}
            onAuthorPress={() =>
              navigation.navigate('Profile', { screen: 'ProfileMain', params: { profileUsername: p.author } })
            }
            onBuildingPress={
              p.buildingId
                ? () =>
                    navigation.navigate('Search', {
                      screen: 'SearchMain',
                      params: {
                        openBuildingId: p.buildingId,
                        returnTarget: {
                          kind: 'homeFeed',
                          initialPostId: p.id,
                        },
                      },
                    })
                : undefined
            }
            buildingLabel={p.buildingName || buildings.find((b) => b.id === p.buildingId)?.name}
          />
        ))}
      </ScrollView>

      <AccountSidePanel visible={profileOpen} onClose={() => setProfileOpen(false)} navigation={navigation} />

      <Modal visible={!!commentsOpenForPostId} transparent animationType="slide">
        <View style={styles.commentModalOverlay}>
          <TouchableOpacity style={styles.commentModalBackdrop} activeOpacity={1} onPress={closeComments} />
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%' }}>
            <View style={[styles.commentModalPanel, { paddingBottom: insets.bottom + 80 }]}>
              <View style={styles.commentModalHandle} />
              <View style={styles.commentModalHeader}>
                <Text style={styles.commentModalTitle}>Comments</Text>
                <TouchableOpacity onPress={closeComments} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                  <Ionicons name="close" size={28} color="#e0e0e0" />
                </TouchableOpacity>
              </View>
              {commentsOpenForPostId && (
                <>
                  <View style={styles.commentModalPostPreview}>
                    <Text style={styles.commentModalPostAuthor}>
                      {(posts.find((p) => p.id === commentsOpenForPostId) || {}).author}
                    </Text>
                    <Text style={styles.commentModalPostTitle} numberOfLines={2}>
                      {(posts.find((p) => p.id === commentsOpenForPostId) || {}).title}
                    </Text>
                  </View>
                  <ScrollView
                    style={styles.commentList}
                    contentContainerStyle={styles.commentListContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                  >
                    {commentLoadingPostId === commentsOpenForPostId ? <ActivityIndicator color="#00ff7f" style={styles.commentLoading} /> : null}
                    {operationErrors.comments ? <Text style={styles.commentError}>{operationErrors.comments}</Text> : null}
                    {(commentsByPost[commentsOpenForPostId] || []).map((c) => (
                      <View key={c.id} style={styles.commentItem}>
                        <Text style={styles.commentAuthor}>{c.author}</Text>
                        <Text style={styles.commentText}>{c.text}</Text>
                        <Text style={styles.commentTime}>{c.time}</Text>
                      </View>
                    ))}
                  </ScrollView>
                  <View style={styles.commentInputRow}>
                    <TextInput
                      style={styles.commentInput}
                      placeholder="Add a comment..."
                      placeholderTextColor="#666"
                      value={commentInput}
                      onChangeText={setCommentInput}
                      multiline
                      maxLength={500}
                    />
                    <TouchableOpacity
                      style={[styles.commentPostBtn, !commentInput.trim() && styles.commentPostBtnDisabled]}
                      onPress={handleAddComment}
                      disabled={!commentInput.trim()}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.commentPostText, !commentInput.trim() && styles.commentPostTextDisabled]}>
                        Post
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d' },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  brandLogo: { height: 28, width: 168, maxWidth: '58%' },
  profileBtn: { padding: 4 },
  profilePic: { width: 40, height: 40, borderRadius: 20 },
  feed: { flex: 1 },
  feedContent: { padding: 14, gap: 14 },
  feedLoading: { marginBottom: 12 },
  errorText: { color: '#ff7d7d', marginBottom: 8 },
  commentModalOverlay: { flex: 1, justifyContent: 'flex-end' },
  commentModalBackdrop: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
  commentModalPanel: {
    backgroundColor: '#0d0d0d',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingHorizontal: 16,
  },
  commentModalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  commentModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  commentModalTitle: { fontSize: 18, fontWeight: '600', color: '#e0e0e0' },
  commentModalPostPreview: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  commentModalPostAuthor: { fontSize: 14, fontWeight: '600', color: '#00ff7f', marginBottom: 4 },
  commentModalPostTitle: { fontSize: 13, color: 'rgba(224,224,224,0.8)' },
  commentList: { maxHeight: 280 },
  commentLoading: { marginBottom: 10 },
  commentError: { color: '#ff7d7d', marginBottom: 10 },
  commentListContent: { paddingVertical: 12, paddingBottom: 20 },
  commentItem: { marginBottom: 16 },
  commentAuthor: { fontSize: 14, fontWeight: '600', color: '#e0e0e0', marginBottom: 4 },
  commentText: { fontSize: 14, color: 'rgba(224,224,224,0.9)', lineHeight: 20 },
  commentTime: { fontSize: 12, color: '#666', marginTop: 4 },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  commentInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#e0e0e0',
    fontSize: 15,
    maxHeight: 100,
  },
  commentPostBtn: { paddingVertical: 12, paddingHorizontal: 16 },
  commentPostBtnDisabled: { opacity: 0.5 },
  commentPostText: { fontSize: 15, fontWeight: '600', color: '#00ff7f' },
  commentPostTextDisabled: { color: '#666' },
})
