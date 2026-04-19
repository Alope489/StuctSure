import { useState, useCallback, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native'
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useApp } from '../context/AppContext'
import { useThemedDialog } from '../context/ThemedDialogContext'
import { PostCard } from '../components/PostCard'
import { getResolutionStatus } from '../data/posts'

const FEED_ITEM_LENGTH = 650

export default function FilteredPostsScreen({ mode }) {
  const route = useRoute()
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()
  const showThemedDialog = useThemedDialog()
  const {
    posts,
    buildings,
    user,
    deletePost,
    getDisplayCommentCount,
    updatePostResolution,
    addComment,
    deleteComment,
    commentsByPost,
    upvotedPosts,
    toggleUpvote,
    loadCommentsForPost,
    commentLoadingPostId,
    refreshPosts,
    operationErrors,
    hasAuthConfigured,
    sessionToken,
    authReady,
  } = useApp()

  const buildingId = route.params?.buildingId
  const postTab = route.params?.postTab || 'unresolved'
  const profileUsername = route.params?.profileUsername
  const initialPostId = route.params?.initialPostId
  const displayedPosts =
    mode === 'building'
      ? posts
          .filter((post) => post.buildingId === buildingId)
          .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999))
          .filter((post) => getResolutionStatus(post) === postTab)
      : posts.filter((post) => post.author === profileUsername)
  const anchorPost =
    mode === 'building'
      ? displayedPosts.find((post) => post.id === initialPostId) || displayedPosts[0]
      : displayedPosts[Math.min(Math.max(0, displayedPosts.findIndex((post) => post.id === initialPostId)), Math.max(0, displayedPosts.length - 1))]
  const [commentsOpenForPostId, setCommentsOpenForPostId] = useState(null)
  const [commentInput, setCommentInput] = useState('')
  useFocusEffect(
    useCallback(() => {
      refreshPosts()
    }, [refreshPosts])
  )
  // Depend only on post id — loadCommentsForPost is stable (AppContext avoids commentsByPost in its deps).
  useEffect(() => {
    if (commentsOpenForPostId) void loadCommentsForPost(commentsOpenForPostId)
  }, [commentsOpenForPostId])
  useEffect(() => {
    if (!hasAuthConfigured || sessionToken || !authReady) return
    const parent = navigation.getParent?.()
    const root = parent?.getParent?.() || parent
    if (root) root.navigate('Login')
    else navigation.navigate('Login')
  }, [authReady, hasAuthConfigured, navigation, sessionToken])
  const closeComments = () => {
    setCommentsOpenForPostId(null)
    setCommentInput('')
  }
  const confirmDeleteComment = (postId, commentId) => {
    showThemedDialog({
      title: 'Delete comment?',
      message: 'Are you sure you want to delete this comment?',
      buttons: [
        { text: 'Cancel', style: 'cancel', onPress: () => {} },
        { text: 'Delete', onPress: () => deleteComment(postId, commentId) },
      ],
    })
  }
  const handleAddComment = async () => {
    if (!commentsOpenForPostId || !commentInput.trim()) return
    await addComment(commentsOpenForPostId, { text: commentInput.trim(), time: 'Just now' })
    await loadCommentsForPost(commentsOpenForPostId)
    setCommentInput('')
  }
  const handlePostMenu = (post) => {
    if (post?.author === (user?.username || 'johndoe')) {
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
                  { text: 'Delete', style: 'destructive', onPress: async () => { await deletePost(post.id); navigation.goBack() } },
                ],
              }),
          },
          { text: 'Cancel', style: 'cancel', onPress: () => {} },
        ],
      })
      return
    }
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

  return (
    <View style={styles.screen}>
      {mode === 'building' ? (
        <View style={[styles.detailHeader, { paddingTop: 14 + insets.top }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons name="arrow-back" size={24} color="#e0e0e0" />
          </TouchableOpacity>
          <View style={styles.headerSpacer} />
        </View>
      ) : (
        <View style={[styles.modalHeader, { paddingTop: insets.top }]}>
          <Image source={require('../assets/StructSure-Logo-Horizontal.png')} style={styles.modalBrandMark} resizeMode="contain" accessibilityLabel="StructSure" />
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons name="close" size={28} color="#e0e0e0" />
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        key={mode === 'building' ? anchorPost?.id || 'building-feed' : initialPostId || 'profile-feed'}
        style={styles.postFeedList}
        data={displayedPosts}
        keyExtractor={(item) => item.id}
        initialScrollIndex={
          displayedPosts.length > 0
            ? Math.min(Math.max(0, displayedPosts.findIndex((post) => post.id === (mode === 'building' ? anchorPost?.id : initialPostId))), displayedPosts.length - 1)
            : 0
        }
        onScrollToIndexFailed={() => {}}
        getItemLayout={(_, index) => ({ length: FEED_ITEM_LENGTH, offset: 8 + FEED_ITEM_LENGTH * index, index })}
        ListEmptyComponent={
          <View style={styles.emptyFeed}>
            <Text style={styles.emptyFeedText}>No posts available.</Text>
          </View>
        }
        contentContainerStyle={displayedPosts.length === 0 ? styles.postFeedContentEmpty : styles.postFeedContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item: post }) => (
          <PostCard
            post={post}
            isUpvoted={upvotedPosts.has(post.id)}
            onUpvote={toggleUpvote}
            onComment={setCommentsOpenForPostId}
            displayCommentCount={getDisplayCommentCount(post.id)}
            onPostMenu={handlePostMenu}
            onAuthorPress={() =>
              post.author &&
              (mode === 'profile'
                ? navigation.push('ProfileMain', { profileUsername: post.author })
                : navigation.navigate('Profile', { screen: 'ProfileMain', params: { profileUsername: post.author } }))
            }
            onBuildingPress={
              post.buildingId
                ? () =>
                    navigation.navigate('Search', {
                      screen: 'SearchMain',
                      params: {
                        openBuildingId: post.buildingId,
                        returnTarget:
                          mode === 'building'
                            ? { kind: 'searchPosts', buildingId, postTab, initialPostId: post.id }
                            : { kind: 'profilePosts', profileUsername, initialPostId: post.id },
                      },
                    })
                : undefined
            }
            buildingLabel={post.buildingName || buildings.find((building) => building.id === post.buildingId)?.name}
          />
        )}
      />
      <Modal visible={!!commentsOpenForPostId} transparent animationType="slide">
        <View style={styles.commentModalOverlay}>
          <TouchableOpacity style={styles.commentModalBackdrop} activeOpacity={1} onPress={closeComments} />
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%', flex: 1 }}>
            <View style={[styles.commentModalPanel, { paddingBottom: insets.bottom + 12 }]}>
              <View style={styles.commentModalHandle} />
              <View style={styles.commentModalHeader}>
                <Text style={styles.commentModalTitle}>Comments</Text>
                <TouchableOpacity onPress={closeComments} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                  <Ionicons name="close" size={28} color="#e0e0e0" />
                </TouchableOpacity>
              </View>
              {commentsOpenForPostId ? (
                <>
                  <View style={styles.commentModalPostPreview}>
                    <Text style={styles.commentModalPostAuthor}>{(posts.find((post) => post.id === commentsOpenForPostId) || {}).author}</Text>
                    <Text style={styles.commentModalPostTitle} numberOfLines={2}>
                      {(posts.find((post) => post.id === commentsOpenForPostId) || {}).title}
                    </Text>
                  </View>
                  <View style={styles.commentListWrap}>
                    <ScrollView
                      style={styles.commentList}
                      contentContainerStyle={[styles.commentListContent, { flexGrow: 1 }]}
                      keyboardShouldPersistTaps="handled"
                      showsVerticalScrollIndicator={false}
                      nestedScrollEnabled
                    >
                      {commentLoadingPostId === commentsOpenForPostId ? (
                        <View style={styles.commentLoadingRow}>
                          <ActivityIndicator color="#00ff7f" />
                          <Text style={styles.commentMeta}>Loading comments…</Text>
                        </View>
                      ) : null}
                      {operationErrors.comments ? <Text style={styles.commentError}>{operationErrors.comments}</Text> : null}
                      {(commentsByPost[commentsOpenForPostId] || []).map((comment) => (
                      <View key={comment.id} style={styles.commentItem}>
                        <View style={styles.commentTopRow}>
                          <View style={styles.commentAvatar}>
                            {comment.authorPhoto ? (
                              <Image source={{ uri: comment.authorPhoto }} style={styles.commentAvatarImg} />
                            ) : (
                              <Text style={styles.commentAvatarText}>
                                {(comment.author || '?').trim().slice(0, 1).toUpperCase()}
                              </Text>
                            )}
                          </View>
                          <View style={styles.commentBody}>
                            <View style={styles.commentRowHead}>
                              <Text style={styles.commentAuthor}>{comment.author}</Text>
                              {comment.author === (user?.username || 'johndoe') ? (
                                <TouchableOpacity onPress={() => confirmDeleteComment(commentsOpenForPostId, comment.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                  <Ionicons name="trash-outline" size={16} color="#888" />
                                </TouchableOpacity>
                              ) : null}
                            </View>
                            <Text style={styles.commentText}>{comment.text}</Text>
                            <Text style={styles.commentTime}>{comment.time}</Text>
                          </View>
                        </View>
                      </View>
                    ))}
                    </ScrollView>
                  </View>
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
                    <TouchableOpacity style={[styles.commentPostBtn, !commentInput.trim() && styles.commentPostBtnDisabled]} onPress={handleAddComment} disabled={!commentInput.trim()} activeOpacity={0.7}>
                      <Text style={[styles.commentPostText, !commentInput.trim() && styles.commentPostTextDisabled]}>Post</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : null}
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0d0d0d' },
  emptyFeed: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyFeedText: { color: '#888', fontSize: 15 },
  detailHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  backBtn: { marginRight: 12 },
  headerSpacer: { flex: 1 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  modalBrandMark: { height: 26, width: 152, flexShrink: 0 },
  postFeedList: { flex: 1 },
  postFeedContent: { paddingHorizontal: 14, paddingTop: 8, paddingBottom: 24 },
  postFeedContentEmpty: { flexGrow: 1, paddingHorizontal: 14, paddingTop: 8, paddingBottom: 24 },
  commentModalOverlay: { flex: 1, justifyContent: 'flex-end' },
  commentModalBackdrop: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
  commentModalPanel: {
    flex: 1,
    backgroundColor: '#0d0d0d',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '100%',
    paddingHorizontal: 16,
  },
  commentModalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)', alignSelf: 'center', marginTop: 12, marginBottom: 8 },
  commentModalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  commentModalTitle: { fontSize: 18, fontWeight: '600', color: '#e0e0e0' },
  commentModalPostPreview: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  commentModalPostAuthor: { fontSize: 14, fontWeight: '600', color: '#00ff7f', marginBottom: 4 },
  commentModalPostTitle: { fontSize: 13, color: 'rgba(224,224,224,0.8)' },
  commentListWrap: { flex: 1, minHeight: 0 },
  commentList: { flex: 1 },
  commentListContent: { paddingVertical: 12, paddingBottom: 20 },
  commentLoadingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  commentMeta: { color: '#888', fontSize: 14 },
  commentError: { color: '#ff7d7d', marginBottom: 8 },
  commentItem: { marginBottom: 16 },
  commentTopRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  commentAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,255,127,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginTop: 2,
  },
  commentAvatarImg: { width: '100%', height: '100%' },
  commentAvatarText: { color: '#e0e0e0', fontWeight: '700', fontSize: 12 },
  commentBody: { flex: 1 },
  commentRowHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  commentAuthor: { fontSize: 14, fontWeight: '600', color: '#e0e0e0', marginBottom: 4 },
  commentText: { fontSize: 14, color: 'rgba(224,224,224,0.9)', lineHeight: 20 },
  commentTime: { fontSize: 12, color: '#666', marginTop: 4 },
  commentInputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  commentInput: { flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12, color: '#e0e0e0', fontSize: 15, maxHeight: 100 },
  commentPostBtn: { paddingVertical: 12, paddingHorizontal: 16 },
  commentPostBtnDisabled: { opacity: 0.5 },
  commentPostText: { fontSize: 15, fontWeight: '600', color: '#00ff7f' },
  commentPostTextDisabled: { color: '#666' },
})
