import { useState } from 'react'
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, Modal, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import { Ionicons } from '@expo/vector-icons'
import { useApp } from '../context/AppContext'
import { PostCard } from '../components/PostCard'

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
