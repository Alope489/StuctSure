import { useState } from 'react'
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
} from 'react-native'
import { useRoute, useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { useApp } from '../context/AppContext'
import { useThemedDialog } from '../context/ThemedDialogContext'
import { PostCard } from '../components/PostCard'
import { getResolutionStatus } from '../data/posts'

const FEED_ITEM_LENGTH = 650

export default function BuildingPostsScreen() {
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
    commentsByPost,
    upvotedPosts,
    toggleUpvote,
  } = useApp()

  const buildingId = route.params?.buildingId
  const postTab = route.params?.postTab || 'unresolved'
  const initialPostId = route.params?.initialPostId

  const forBuilding = posts
    .filter((p) => p.buildingId === buildingId)
    .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999))
  const tabPosts = forBuilding.filter((p) => getResolutionStatus(p) === postTab)
  const anchorPost = tabPosts.find((p) => p.id === initialPostId) || tabPosts[0]

  const [commentsOpenForPostId, setCommentsOpenForPostId] = useState(null)
  const [commentInput, setCommentInput] = useState('')

  const closeComments = () => {
    setCommentsOpenForPostId(null)
    setCommentInput('')
  }

  const handleAddComment = () => {
    if (!commentsOpenForPostId || !commentInput.trim()) return
    addComment(commentsOpenForPostId, { text: commentInput.trim(), time: 'Just now' })
    setCommentInput('')
  }

  const handlePostMenu = (post) => {
    const isOwn = post?.author === (user?.username || 'johndoe')
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
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                      deletePost(post.id)
                      navigation.goBack()
                    },
                  },
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

  return (
    <View style={styles.screen}>
      <View style={[styles.detailHeader, { paddingTop: 14 + insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="arrow-back" size={24} color="#e0e0e0" />
        </TouchableOpacity>
        <View style={styles.headerSpacer} />
      </View>
      <FlatList
        key={anchorPost?.id || 'feed'}
        style={styles.postFeedList}
        data={tabPosts}
        keyExtractor={(item) => item.id}
        initialScrollIndex={
          tabPosts.length > 0 && anchorPost
            ? Math.min(Math.max(0, tabPosts.findIndex((p) => p.id === anchorPost.id)), tabPosts.length - 1)
            : 0
        }
        onScrollToIndexFailed={() => {}}
        getItemLayout={(_, index) => ({
          length: FEED_ITEM_LENGTH,
          offset: 8 + FEED_ITEM_LENGTH * index,
          index,
        })}
        ListEmptyComponent={
          <View style={styles.emptyFeed}>
            <Text style={styles.emptyFeedText}>No posts in this tab.</Text>
          </View>
        }
        contentContainerStyle={tabPosts.length === 0 ? styles.postFeedContentEmpty : styles.postFeedContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item: p }) => (
          <PostCard
            post={p}
            isUpvoted={upvotedPosts.has(p.id)}
            onUpvote={toggleUpvote}
            onComment={setCommentsOpenForPostId}
            displayCommentCount={getDisplayCommentCount(p.id)}
            onPostMenu={handlePostMenu}
            onAuthorPress={() =>
              p.author &&
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
                          kind: 'searchPosts',
                          buildingId,
                          postTab,
                          initialPostId: p.id,
                        },
                      },
                    })
                : undefined
            }
            buildingLabel={p.buildingName || buildings.find((b) => b.id === p.buildingId)?.name}
          />
        )}
      />

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
  screen: { flex: 1, backgroundColor: '#0d0d0d' },
  emptyFeed: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyFeedText: { color: '#888', fontSize: 15 },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  backBtn: { marginRight: 12 },
  headerSpacer: { flex: 1 },
  postFeedList: { flex: 1 },
  postFeedContent: { paddingHorizontal: 14, paddingTop: 8, paddingBottom: 24 },
  postFeedContentEmpty: { flexGrow: 1, paddingHorizontal: 14, paddingTop: 8, paddingBottom: 24 },

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
