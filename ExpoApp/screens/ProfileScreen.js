import { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  FlatList,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { useApp } from '../context/AppContext'
import { getImageSource } from '../data/posts'
import { PostCard } from '../components/PostCard'

const { width } = Dimensions.get('window')
const padding = 28
const gap = 4
const gridSize = (width - padding - gap * 2) / 3
/** FlatList scroll anchor; real cards vary slightly in height. */
const POST_FEED_ITEM_LENGTH = 520

export default function ProfileScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()
  const route = useRoute()
  const {
    user,
    posts,
    buildings,
    commentsByPost,
    addComment,
    deletePost,
    updatePostResolution,
    upvotedPosts,
    toggleUpvote,
    getDisplayCommentCount,
  } = useApp()
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
  const [commentsOpenForPostId, setCommentsOpenForPostId] = useState(null)
  const [commentInput, setCommentInput] = useState('')

  const handleAddComment = () => {
    if (!commentsOpenForPostId || !commentInput.trim()) return
    addComment(commentsOpenForPostId, { text: commentInput.trim(), time: 'Just now' })
    setCommentInput('')
  }

  const closeComments = () => {
    setCommentsOpenForPostId(null)
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
        <View style={styles.brandMarkWrap}>
          <Image
            source={require('../assets/StructSure-Logo-Horizontal.png')}
            style={styles.brandMark}
            resizeMode="contain"
            accessibilityLabel="StructSure"
          />
        </View>
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
            <Image
              source={require('../assets/StructSure-Logo-Horizontal.png')}
              style={styles.modalBrandMark}
              resizeMode="contain"
              accessibilityLabel="StructSure"
            />
            <TouchableOpacity onPress={() => { setSelectedPostId(null); setCommentInput('') }} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Ionicons name="close" size={28} color="#e0e0e0" />
            </TouchableOpacity>
          </View>
          <FlatList
            style={styles.postFeedList}
            key={selectedPostId || 'none'}
            data={displayedPosts}
            keyExtractor={(item) => item.id}
            initialScrollIndex={
              displayedPosts.length > 0
                ? Math.min(
                    Math.max(0, displayedPosts.findIndex((p) => p.id === selectedPostId)),
                    displayedPosts.length - 1
                  )
                : 0
            }
            onScrollToIndexFailed={() => {}}
            getItemLayout={(_, index) => ({
              length: POST_FEED_ITEM_LENGTH,
              offset: 8 + POST_FEED_ITEM_LENGTH * index,
              index,
            })}
            contentContainerStyle={styles.postFeedContent}
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
                onAuthorPress={() => navigation.navigate('Profile', { profileUsername: p.author })}
                onBuildingPress={
                  p.buildingId
                    ? () => {
                        setSelectedPostId(null)
                        navigation.navigate('Search', { openBuildingId: p.buildingId })
                      }
                    : undefined
                }
                buildingLabel={p.buildingName || buildings.find((b) => b.id === p.buildingId)?.name}
              />
            )}
          />
        </View>
      </Modal>

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
                      <Text style={[styles.commentPostText, !commentInput.trim() && styles.commentPostTextDisabled]}>Post</Text>
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
  brandMarkWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  brandMark: { height: 28, width: 168, maxWidth: '70%' },
  modalBrandMark: { height: 26, width: 152, flexShrink: 0 },
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
  postFeedList: { flex: 1 },
  postFeedContent: { paddingHorizontal: 14, paddingTop: 8, paddingBottom: 24 },
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
