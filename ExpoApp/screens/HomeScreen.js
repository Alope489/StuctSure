import { useState, useRef } from 'react'
import { View, Text, ScrollView, StyleSheet, Image, useWindowDimensions, Dimensions, TouchableOpacity, Modal, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import { Ionicons } from '@expo/vector-icons'
import { useApp } from '../context/AppContext'
import { getImageSource, getResolutionStatus } from '../data/posts'

function PostCard({ post, isUpvoted, onUpvote, onComment, displayCommentCount, onPostMenu, onBuildingPress, buildingLabel, onAuthorPress }) {
  const { width: winWidth } = useWindowDimensions()
  const width = winWidth || Dimensions.get('window').width
  const slideWidth = Math.max(width - 52, 280)
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollRef = useRef(null)
  const initial = (post.author || '?').trim().slice(0, 1).toUpperCase()
  const images = post.images ?? []
  const displayCount = post.likes + (isUpvoted ? 1 : 0)
  const onScroll = (e) => {
    const offset = e.nativeEvent.contentOffset.x
    const idx = Math.round(offset / slideWidth)
    if (idx >= 0 && idx < images.length) setActiveIndex(idx)
  }
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <TouchableOpacity
          style={styles.cardAuthorHit}
          onPress={onAuthorPress}
          activeOpacity={0.7}
          disabled={!onAuthorPress}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.meta}>
            <Text style={styles.author}>{post.author}</Text>
            <Text style={styles.time}>{post.time}</Text>
          </View>
        </TouchableOpacity>
        {onPostMenu && (
          <TouchableOpacity onPress={() => onPostMenu(post)} style={styles.menuBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="ellipsis-vertical" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>
      {images.length > 0 ? (
        <View style={[styles.galleryWrap, { width: slideWidth }]}>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled
            onScroll={onScroll}
            scrollEventThrottle={100}
          >
            {images.map((img, idx) => (
              <View key={idx} style={[styles.slide, { width: slideWidth }]}>
                <Image source={getImageSource(img)} style={styles.postImage} resizeMode="cover" />
              </View>
            ))}
          </ScrollView>
          {images.length > 1 ? (
            <View style={styles.dots}>
              {images.map((_, idx) => (
                <View key={idx} style={[styles.dot, activeIndex === idx && styles.dotActive]} />
              ))}
            </View>
          ) : null}
        </View>
      ) : null}
      <Text style={styles.title}>{post.title}</Text>
      {post.body ? <Text style={styles.body}>{post.body}</Text> : null}
      {onBuildingPress && buildingLabel ? (
        <TouchableOpacity style={styles.buildingLink} onPress={onBuildingPress} activeOpacity={0.7}>
          <Ionicons name="business-outline" size={16} color="#00ff7f" />
          <Text style={styles.buildingLinkText}>{buildingLabel}</Text>
          <Ionicons name="chevron-forward" size={16} color="#666" />
        </TouchableOpacity>
      ) : null}
      <View style={styles.tagsRow}>
        <View
          style={[
            styles.tagChip,
            getResolutionStatus(post) === 'resolved' ? styles.tagChipResolved : styles.tagChipUnresolved,
          ]}
        >
          <Text style={styles.tagChipTextMuted}>{getResolutionStatus(post)}</Text>
        </View>
        {(post.tags || []).map((tag) => (
          <View key={tag} style={styles.tagChip}>
            <Text style={styles.tagChipText}>{tag}</Text>
          </View>
        ))}
        {(post.tagsMore || 0) > 0 && (
          <View style={styles.tagChip}>
            <Text style={styles.tagChipText}>{post.tagsMore}</Text>
          </View>
        )}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionRow} onPress={() => onUpvote(post.id)} activeOpacity={0.6}>
          <Ionicons name={isUpvoted ? 'arrow-up' : 'arrow-up-outline'} size={20} color={isUpvoted ? '#00ff7f' : '#888'} />
          <Text style={[styles.actionText, isUpvoted && styles.actionTextActive]}>{displayCount}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionRow} onPress={() => onComment(post.id)} activeOpacity={0.6}>
          <Ionicons name="chatbubble-outline" size={18} color="#888" />
          <Text style={styles.actionText}>{displayCommentCount}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets()
  const {
    posts,
    buildings,
    user,
    setUser,
    upvotedPosts,
    commentsByPost,
    toggleUpvote,
    addComment,
    deletePost,
    updatePostResolution,
    getDisplayCommentCount,
  } = useApp()

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
              { text: 'Delete', style: 'destructive', onPress: () => deletePost(post.id) },
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
  const [profileOpen, setProfileOpen] = useState(false)
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

  const handleEditPicture = () => {
    Alert.alert(
      'Profile picture',
      'Take a new photo or choose from your gallery',
      [
        { text: 'Take photo', onPress: takeProfilePhoto },
        { text: 'Choose from gallery', onPress: pickProfilePhoto },
        { text: 'Cancel', style: 'cancel' },
      ]
    )
  }

  const takeProfilePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Camera access', 'Permission to use the camera is required to take a profile photo.')
      return
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })
    if (!result.canceled && result.assets[0]) {
      setUser((u) => ({ ...u, photo: result.assets[0].uri }))
    }
  }

  const pickProfilePhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Gallery access', 'Permission to access photos is required to choose a profile picture.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })
    if (!result.canceled && result.assets[0]) {
      setUser((u) => ({ ...u, photo: result.assets[0].uri }))
    }
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
      <ScrollView style={styles.feed} contentContainerStyle={styles.feedContent}>
        {posts.map((p) => (
          <PostCard
            key={p.id}
            post={p}
            isUpvoted={upvotedPosts.has(p.id)}
            onUpvote={toggleUpvote}
            onComment={setCommentsOpenForPostId}
            displayCommentCount={getDisplayCommentCount(p.id)}
            onPostMenu={handlePostMenu}
            onAuthorPress={() => navigation.navigate('Profile', { profileUsername: p.author })}
            onBuildingPress={
              p.buildingId
                ? () => navigation.navigate('Search', { openBuildingId: p.buildingId })
                : undefined
            }
            buildingLabel={p.buildingName || buildings.find((b) => b.id === p.buildingId)?.name}
          />
        ))}
      </ScrollView>

      <Modal visible={profileOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setProfileOpen(false)} />
          <View style={styles.profilePanel}>
            <TouchableOpacity onPress={() => setProfileOpen(false)} style={styles.profileBackBtn}>
              <Ionicons name="arrow-back" size={24} color="#e0e0e0" />
            </TouchableOpacity>
            <View style={styles.profileContent}>
              <View style={styles.profilePicLarge}>
                <Image source={user?.photo ? { uri: user.photo } : require('../assets/johndoe.png')} style={styles.profilePicLargeImg} />
              </View>
              <TouchableOpacity style={styles.editPicBtn} onPress={handleEditPicture}>
                <Text style={styles.editPicText}>Edit picture</Text>
              </TouchableOpacity>
              <Text style={styles.profileLabel}>Username</Text>
              <TextInput
                style={styles.profileInput}
                value={user.username}
                onChangeText={(t) => setUser((u) => ({ ...u, username: t }))}
                placeholderTextColor="#666"
              />
              <Text style={styles.profileLabel}>Email</Text>
              <TextInput
                style={styles.profileInput}
                value={user.email}
                onChangeText={(t) => setUser((u) => ({ ...u, email: t }))}
                placeholderTextColor="#666"
                keyboardType="email-address"
              />
              <TouchableOpacity style={styles.profileActionBtn} onPress={() => { setProfileOpen(false); navigation.navigate('Profile'); }}>
                <Text style={styles.profileActionText}>Posts status</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.profileActionBtn, styles.profileActionOutlined]} onPress={() => { setProfileOpen(false); navigation.navigate('Login'); }}>
                <Text style={[styles.profileActionText, styles.profileActionOutlinedText]}>Log out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={!!commentsOpenForPostId} transparent animationType="slide">
        <View style={styles.commentModalOverlay}>
          <TouchableOpacity style={styles.commentModalBackdrop} activeOpacity={1} onPress={closeComments} />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ width: '100%' }}
          >
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
  container: { flex: 1, backgroundColor: '#0d0d0d' },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  brandLogo: { height: 28, width: 168, maxWidth: '58%' },
  cardAuthorHit: { flexDirection: 'row', alignItems: 'center', marginRight: 8 },
  profileBtn: { padding: 4 },
  profilePic: { width: 40, height: 40, borderRadius: 20 },
  profilePicPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  modalOverlay: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end' },
  modalBackdrop: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)' },
  profilePanel: { width: '80%', maxWidth: 320, backgroundColor: '#0d0d0d', borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.08)', paddingTop: 50, paddingHorizontal: 16, paddingBottom: 24 },
  profileBackBtn: { position: 'absolute', top: 14, left: 16, padding: 8 },
  profileContent: { alignItems: 'center' },
  profilePicLarge: { width: 100, height: 100, borderRadius: 50, overflow: 'hidden', marginBottom: 12 },
  profilePicLargeImg: { width: '100%', height: '100%' },
  profilePicLargePlaceholder: { width: '100%', height: '100%', backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  editPicBtn: { marginBottom: 20 },
  editPicText: { fontSize: 14, color: '#00ff7f' },
  profileLabel: { alignSelf: 'stretch', fontSize: 12, color: '#888', marginBottom: 6 },
  profileInput: { alignSelf: 'stretch', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 14, color: '#e0e0e0', fontSize: 16, marginBottom: 16 },
  profileActionBtn: { alignSelf: 'stretch', backgroundColor: '#00ff7f', borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 10 },
  profileActionText: { color: '#061014', fontWeight: '600', fontSize: 16 },
  profileActionOutlined: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#00ff7f' },
  profileActionOutlinedText: { color: '#00ff7f' },
  feed: { flex: 1 },
  feedContent: { padding: 14, gap: 14 },
  card: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  menuBtn: { marginLeft: 'auto', padding: 4 },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(0,255,127,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  avatarText: { color: '#e0e0e0', fontWeight: '700' },
  meta: {},
  author: { fontSize: 14, fontWeight: '600', color: '#e0e0e0' },
  time: { fontSize: 12, color: '#888' },
  galleryWrap: { marginBottom: 10, borderRadius: 12, overflow: 'hidden' },
  postGallery: { height: 200, borderRadius: 12 },
  slide: { height: 200 },
  postImage: { width: '100%', height: 200, borderRadius: 0, backgroundColor: 'rgba(255,255,255,0.05)' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.3)' },
  dotActive: { backgroundColor: '#00ff7f', width: 8, height: 8, borderRadius: 4 },
  title: { fontSize: 16, fontWeight: '600', color: '#e0e0e0', marginBottom: 8 },
  body: { fontSize: 13, color: 'rgba(224,224,224,0.9)', lineHeight: 20, marginBottom: 10 },
  buildingLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(0,255,127,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,127,0.2)',
  },
  buildingLinkText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#00ff7f' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  tagChipResolved: { borderColor: 'rgba(0,255,127,0.35)', backgroundColor: 'rgba(0,255,127,0.12)' },
  tagChipUnresolved: { borderColor: 'rgba(255,193,7,0.45)', backgroundColor: 'rgba(255,193,7,0.1)' },
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
  tagChipTextMuted: { fontSize: 12, color: '#c8e6c9', textTransform: 'capitalize' },
  actions: { flexDirection: 'row', gap: 18 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { color: '#888', fontSize: 13 },
  actionTextActive: { color: '#00ff7f' },
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
