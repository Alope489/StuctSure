import { useState, useRef, useEffect } from 'react'
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, Dimensions, Modal, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { useApp } from '../context/AppContext'
import { getImageSource, getResolutionStatus } from '../data/posts'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const POST_BLOCK_HEIGHT = SCREEN_WIDTH + 420

function PostDetailBlock({ post, commentsByPost, upvotedPosts, toggleUpvote, getDisplayCommentCount, onPostMenu }) {
  const [carouselIdx, setCarouselIdx] = useState(0)
  const address =
    post.buildingAddress || post.body?.match(/Address: ([^\n]+)/)?.[1] || post.body?.match(/Building:[^\n]+\n([^\n]+)/)?.[1] || ''
  const metaText = address ? `${post.time} • ${address}` : post.time
  const isUpvoted = upvotedPosts.has(post.id)
  const upvoteCount = post.likes + (isUpvoted ? 1 : 0)
  const commentCount = getDisplayCommentCount(post.id)
  const tags = post.tags || []
  const tagsMore = post.tagsMore || 0

  return (
    <View style={styles.postBlock}>
      <View style={styles.postDetailMeta}>
        <View style={styles.postDetailAuthorRow}>
          <View style={styles.postDetailAvatar}>
            <Text style={styles.postDetailAvatarText}>{(post.author || '?').slice(0, 1)}</Text>
          </View>
          <View style={styles.postDetailAuthorMeta}>
            <View style={styles.postDetailMetaLocation}>
              <Ionicons name="location-outline" size={12} color="#888" />
              <Text style={styles.postDetailMetaText}>{metaText}</Text>
            </View>
          </View>
          {onPostMenu && (
            <TouchableOpacity onPress={() => onPostMenu(post)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="ellipsis-vertical" size={20} color="#888" />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.postDetailTitle}>{post.title}</Text>
        {post.body ? <Text style={styles.postDetailBody}>{post.body}</Text> : null}
        <View style={styles.postDetailTags}>
          <View
            style={[
              styles.tagChip,
              getResolutionStatus(post) === 'resolved' ? styles.tagChipResolved : styles.tagChipUnresolved,
            ]}
          >
            <Text style={styles.tagChipStatusText}>{getResolutionStatus(post)}</Text>
          </View>
          {tags.map((tag) => (
            <View key={tag} style={styles.tagChip}>
              <Text style={styles.tagChipText}>{tag}</Text>
            </View>
          ))}
          {tagsMore > 0 && (
            <View style={styles.tagChip}>
              <Text style={styles.tagChipText}>{tagsMore}</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.postImageContainer}>
        {post.images?.length > 0 ? (
          post.images.length === 1 ? (
            <Image
              source={getImageSource(post.images[0])}
              style={styles.postDetailImage}
              resizeMode="cover"
            />
          ) : (
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                style={styles.postImageCarousel}
                onScroll={(e) => {
                  const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH)
                  if (idx >= 0 && idx < post.images.length) setCarouselIdx(idx)
                }}
                scrollEventThrottle={100}
              >
                {post.images.map((img, idx) => (
                  <View key={idx} style={styles.postDetailImageSlide}>
                    <Image
                      source={getImageSource(img)}
                      style={styles.postDetailImage}
                      resizeMode="cover"
                    />
                  </View>
                ))}
              </ScrollView>
              <View style={styles.carouselDots}>
                {post.images.map((_, idx) => (
                  <View key={idx} style={[styles.carouselDot, carouselIdx === idx && styles.carouselDotActive]} />
                ))}
              </View>
            </>
          )
        ) : null}
      </View>
      <View style={styles.postDetailActions}>
        <TouchableOpacity style={styles.actionRow} onPress={() => toggleUpvote(post.id)} activeOpacity={0.6}>
          <Ionicons name={isUpvoted ? 'arrow-up' : 'arrow-up-outline'} size={20} color={isUpvoted ? '#00ff7f' : '#888'} />
          <Text style={[styles.actionText, isUpvoted && styles.actionTextActive]}>{upvoteCount}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionRow} activeOpacity={0.6}>
          <Ionicons name="chatbubble-outline" size={18} color="#888" />
          <Text style={styles.actionText}>{commentCount}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.commentsSection}>
        <Text style={styles.commentsSectionTitle}>Comments</Text>
        {(commentsByPost[post.id] || []).map((c) => (
          <View key={c.id} style={styles.commentItem}>
            <Text style={styles.commentAuthor}>{c.author}</Text>
            <Text style={styles.commentText}>{c.text}</Text>
            <Text style={styles.commentTime}>{c.time}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()
  const route = useRoute()
  const { user, posts, commentsByPost, addComment, deletePost, updatePostResolution, upvotedPosts, toggleUpvote, getDisplayCommentCount } = useApp()
  const profileUsername = route.params?.profileUsername
  const selfName = user?.username || 'johndoe'
  const displayUsername = profileUsername ?? selfName
  const isOwnProfile = displayUsername === selfName

  const handlePostMenu = (post) => {
    const isOwn = post.author === (user?.username || 'johndoe')
    if (isOwn) {
      Alert.alert('Your post', 'Choose an action.', [
        {
          text: 'Change status',
          onPress: () =>
            Alert.alert('Report status', 'Mark this report as resolved or unresolved.', [
              { text: 'Unresolved', onPress: () => updatePostResolution(post.id, 'unresolved') },
              { text: 'Resolved', onPress: () => updatePostResolution(post.id, 'resolved') },
              { text: 'Cancel', style: 'cancel' },
            ]),
        },
        {
          text: 'Delete post',
          style: 'destructive',
          onPress: () =>
            Alert.alert('Delete post', 'Are you sure you want to delete this post?', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                  deletePost(post.id)
                  setSelectedPostId(null)
                },
              },
            ]),
        },
        { text: 'Cancel', style: 'cancel' },
      ])
    } else {
      Alert.alert('Report post', 'Report this post for review?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Report', onPress: () => Alert.alert('Report submitted', 'Thank you. Your report has been submitted for review.') },
      ])
    }
  }

  const handleSettingsPress = () => {
    Alert.alert('Settings', 'Sign out of your account?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => navigation.navigate('Login') },
    ])
  }
  const displayedPosts = posts.filter((p) => p.author === displayUsername)
  const [selectedPostId, setSelectedPostId] = useState(null)
  const [commentInput, setCommentInput] = useState('')
  const { width } = Dimensions.get('window')
  const padding = 28
  const gap = 4
  const gridSize = (width - padding - gap * 2) / 3
  const postFeedRef = useRef(null)

  useEffect(() => {
    if (selectedPostId && postFeedRef.current) {
      const idx = displayedPosts.findIndex((p) => p.id === selectedPostId)
      if (idx >= 0) {
        setTimeout(() => {
          postFeedRef.current?.scrollTo({ y: idx * POST_BLOCK_HEIGHT, animated: false })
        }, 50)
      }
    }
  }, [selectedPostId, displayedPosts])

  const handleAddComment = () => {
    if (!selectedPostId || !commentInput.trim()) return
    addComment(selectedPostId, { text: commentInput.trim(), time: 'Just now' })
    setCommentInput('')
  }

  return (
    <View style={styles.container}>
      <View style={[styles.topbar, { paddingTop: 14 + insets.top }]}>
        {!isOwnProfile ? (
          <TouchableOpacity
            onPress={() => navigation.setParams({ profileUsername: undefined })}
            style={styles.profileBackBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="arrow-back" size={24} color="#e0e0e0" />
          </TouchableOpacity>
        ) : (
          <View style={styles.topbarSide} />
        )}
        <Text style={styles.brand}>StructSure</Text>
        {isOwnProfile ? (
          <TouchableOpacity style={styles.settingsBtn} onPress={handleSettingsPress} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons name="settings-outline" size={24} color="#888" />
          </TouchableOpacity>
        ) : (
          <View style={styles.topbarSide} />
        )}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <View style={styles.profilePicWrap}>
            {isOwnProfile ? (
              <Image source={user.photo ? { uri: user.photo } : require('../assets/johndoe.png')} style={styles.profilePic} />
            ) : (
              <View style={[styles.profilePic, styles.profilePicOther]}>
                <Text style={styles.profilePicOtherText}>{displayUsername.trim().slice(0, 1).toUpperCase()}</Text>
              </View>
            )}
          </View>
          <Text style={styles.username}>{displayUsername}</Text>
          {isOwnProfile ? <Text style={styles.email}>{user.email}</Text> : null}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{displayedPosts.length}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{displayedPosts.reduce((s, p) => s + p.likes, 0)}</Text>
            <Text style={styles.statLabel}>Upvotes</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{displayedPosts.reduce((s, p) => s + p.comments, 0)}</Text>
            <Text style={styles.statLabel}>Comments</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Post status</Text>
        <View style={[styles.postGrid, { gap }]}>
          {displayedPosts.map((post) => {
            const firstImg = post.images?.[0]
            const src = firstImg ? getImageSource(firstImg) : null
            return (
              <TouchableOpacity
                key={post.id}
                style={[styles.postGridItem, { width: gridSize, height: gridSize }]}
                activeOpacity={0.8}
                onPress={() => setSelectedPostId(post.id)}
              >
                {src && <Image source={src} style={styles.postGridImg} resizeMode="cover" />}
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>

      <Modal visible={!!selectedPostId} transparent animationType="fade" statusBarTranslucent>
        <View style={[styles.fullScreenModal, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.brand}>StructSure</Text>
            <TouchableOpacity onPress={() => { setSelectedPostId(null); setCommentInput('') }} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Ionicons name="close" size={28} color="#e0e0e0" />
            </TouchableOpacity>
          </View>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContent}>
            <ScrollView
              ref={postFeedRef}
              style={styles.postFeed}
              contentContainerStyle={styles.postFeedContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {displayedPosts.map((post) => (
                <PostDetailBlock
                  key={post.id}
                  post={post}
                  commentsByPost={commentsByPost}
                  upvotedPosts={upvotedPosts}
                  toggleUpvote={toggleUpvote}
                  getDisplayCommentCount={getDisplayCommentCount}
                  onPostMenu={handlePostMenu}
                />
              ))}
            </ScrollView>
            <View style={[styles.commentInputRow, { paddingBottom: insets.bottom + 12 }]}>
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
                <Text style={[styles.commentPostText, !commentInput.trim() && styles.commentPostTextDisabled]}>Post</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d' },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  topbarSide: { width: 40, height: 40 },
  profileBackBtn: { width: 40, height: 40, justifyContent: 'center' },
  brand: { fontSize: 18, fontWeight: '600', color: '#e0e0e0', flex: 1, textAlign: 'center' },
  settingsBtn: { padding: 4 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  profileSection: { alignItems: 'center', paddingVertical: 24 },
  profilePicWrap: { marginBottom: 12 },
  profilePic: { width: 100, height: 100, borderRadius: 50 },
  profilePicOther: {
    backgroundColor: 'rgba(0,255,127,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePicOtherText: { fontSize: 40, fontWeight: '700', color: '#e0e0e0' },
  profilePicPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  username: { fontSize: 20, fontWeight: '600', color: '#e0e0e0', marginBottom: 4 },
  email: { fontSize: 14, color: '#888' },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '700', color: '#00ff7f', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#888' },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e0e0e0',
    paddingHorizontal: 14,
    paddingTop: 20,
    paddingBottom: 12,
  },
  postGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
  },
  postGridItem: { borderRadius: 8, overflow: 'hidden' },
  postGridImg: { width: '100%', height: '100%' },
  fullScreenModal: {
    flex: 1,
    backgroundColor: '#0d0d0d',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  modalContent: { flex: 1 },
  postFeed: { flex: 1 },
  postFeedContent: { paddingBottom: 24 },
  postBlock: { marginBottom: 24 },
  postImageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    backgroundColor: '#000',
  },
  postImageCarousel: { flex: 1 },
  postDetailImageSlide: { width: SCREEN_WIDTH, height: SCREEN_WIDTH },
  postDetailImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  postDetailMeta: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 16 },
  postDetailAuthorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  postDetailAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,255,127,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  postDetailAvatarText: { color: '#e0e0e0', fontWeight: '700', fontSize: 16 },
  postDetailAuthorMeta: { flex: 1 },
  postDetailAuthorName: { fontSize: 16, fontWeight: '600', color: '#e0e0e0', marginBottom: 2 },
  postDetailTime: { fontSize: 13, color: '#888' },
  postDetailMetaText: { fontSize: 13, color: '#888', marginLeft: 4 },
  postDetailMetaLocation: { flexDirection: 'row', alignItems: 'center' },
  postDetailLocationText: { fontSize: 12, color: '#888' },
  postDetailTags: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(0,255,127,0.4)',
    backgroundColor: 'rgba(0,255,127,0.1)',
    marginRight: 8,
    marginBottom: 8,
  },
  tagChipText: { fontSize: 12, color: '#00ff7f' },
  tagChipResolved: { borderColor: 'rgba(0,255,127,0.35)', backgroundColor: 'rgba(0,255,127,0.12)' },
  tagChipUnresolved: { borderColor: 'rgba(255,193,7,0.45)', backgroundColor: 'rgba(255,193,7,0.1)' },
  tagChipStatusText: { fontSize: 12, color: '#c8e6c9', textTransform: 'capitalize' },
  carouselDots: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 10 },
  carouselDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 3 },
  carouselDotActive: { backgroundColor: '#00ff7f', width: 8, height: 8, borderRadius: 4 },
  postDetailActions: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, marginBottom: 8 },
  actionRow: { flexDirection: 'row', alignItems: 'center', marginRight: 18 },
  actionText: { color: '#888', fontSize: 13, marginLeft: 6 },
  actionTextActive: { color: '#00ff7f' },
  postDetailTitle: { fontSize: 18, fontWeight: '600', color: '#e0e0e0', marginBottom: 8 },
  postDetailBody: { fontSize: 15, color: 'rgba(224,224,224,0.9)', lineHeight: 22 },
  commentsSection: { paddingHorizontal: 16, paddingTop: 8 },
  commentsSectionTitle: { fontSize: 16, fontWeight: '600', color: '#e0e0e0', marginBottom: 16 },
  commentItem: { marginBottom: 20 },
  commentAuthor: { fontSize: 15, fontWeight: '600', color: '#e0e0e0', marginBottom: 4 },
  commentText: { fontSize: 15, color: 'rgba(224,224,224,0.9)', lineHeight: 22 },
  commentTime: { fontSize: 12, color: '#666', marginTop: 4 },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#0d0d0d',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  commentInput: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 12, color: '#e0e0e0', fontSize: 15, maxHeight: 100,
  },
  commentPostBtn: { paddingVertical: 12, paddingHorizontal: 16 },
  commentPostBtnDisabled: { opacity: 0.5 },
  commentPostText: { fontSize: 15, fontWeight: '600', color: '#00ff7f' },
  commentPostTextDisabled: { color: '#666' },
})
