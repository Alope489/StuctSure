import { useState, useCallback } from 'react'
import {
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from 'react-native'
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { useApp } from '../context/AppContext'
import { getImageSource, getResolutionStatus } from '../data/posts'
import { PostCard } from '../components/PostCard'

const BUILDING_POST_FEED_ITEM_LENGTH = 520

function BuildingProfileCircle({ uri, size }) {
  const [loadFailed, setLoadFailed] = useState(false)
  const dim = { width: size, height: size, borderRadius: size / 2 }
  const showIcon = !uri?.trim() || loadFailed
  if (showIcon) {
    return (
      <View style={[dim, styles.buildingProfileFallback]}>
        <Ionicons name="business" size={Math.round(size * 0.46)} color="#00ff7f" />
      </View>
    )
  }
  return (
    <Image
      source={{ uri }}
      style={[dim, styles.buildingProfilePhoto]}
      onError={() => setLoadFailed(true)}
    />
  )
}

function MapSearchView({ searchQuery, onSearchChange, onBuildingSelect, buildings }) {
  const insets = useSafeAreaInsets()
  const filtered = buildings.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.address.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <View style={styles.mapContainer}>
      <View style={[styles.searchBar, { marginTop: 14 + insets.top }]}>
        <Ionicons name="search" size={20} color="#888" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={onSearchChange}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.mapSurface}>
        <Image source={require('../assets/fiu-map.png')} style={styles.mapImage} resizeMode="cover" />
      </View>

      {searchQuery.length > 0 && (
        <View style={styles.searchResultsOverlay}>
          <ScrollView style={styles.searchResultsScroll} keyboardShouldPersistTaps="handled">
            {filtered.map((b) => (
              <TouchableOpacity
                key={b.id}
                style={styles.searchResultItem}
                onPress={() => onBuildingSelect(b)}
                activeOpacity={0.7}
              >
                <BuildingProfileCircle uri={b.image} size={48} />
                <View style={styles.searchResultText}>
                  <Text style={styles.searchResultName}>{b.name}</Text>
                  <Text style={styles.searchResultAddress}>{b.address}</Text>
                </View>
              </TouchableOpacity>
            ))}
            {filtered.length === 0 && (
              <Text style={styles.searchResultEmpty}>No buildings found</Text>
            )}
          </ScrollView>
        </View>
      )}

      <TouchableOpacity
        style={[styles.mapPinButton, { bottom: 20 }]}
        onPress={() => filtered.length > 0 && onBuildingSelect(filtered[0])}
        activeOpacity={0.8}
      >
        <Ionicons name="location" size={24} color="#00ff7f" />
      </TouchableOpacity>
    </View>
  )
}

function BuildingDetailView({ building, forBuilding, postTab, setPostTab, tabPosts, onBack, onPostSelect }) {
  const insets = useSafeAreaInsets()
  const { width } = Dimensions.get('window')
  const padding = 28
  const gap = 4
  const gridItemSize = (width - padding - gap * 2) / 3
  const resolvedCount = forBuilding.filter((p) => getResolutionStatus(p) === 'resolved').length
  const unresolvedCount = forBuilding.filter((p) => getResolutionStatus(p) === 'unresolved').length
  const allImages = tabPosts.flatMap((p) => (p?.images || []).map((img) => ({ post: p, img })))
  const tagAggregate = forBuilding.reduce((sum, p) => sum + (p.tags?.length || 0) + (p.tagsMore || 0), 0)

  return (
    <ScrollView style={styles.detailScroll} contentContainerStyle={styles.detailScrollContent}>
      <View style={[styles.detailHeader, { paddingTop: 14 + insets.top }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="arrow-back" size={24} color="#e0e0e0" />
        </TouchableOpacity>
        <Text style={styles.detailTitle}>Search</Text>
      </View>

      <View style={styles.buildingHeader}>
        <BuildingProfileCircle uri={building?.image} size={100} />
        <View style={styles.buildingBadges}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{tagAggregate} Tags</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{forBuilding.length} Reports</Text>
          </View>
        </View>
      </View>

      <Text style={styles.buildingName}>{building?.name}</Text>
      <Text style={styles.buildingAddress}>{building?.address}</Text>

      <View style={styles.buildingStatusSummary}>
        <Text style={styles.buildingStatusSummaryText}>
          {unresolvedCount} unresolved · {resolvedCount} resolved
        </Text>
      </View>

      <View style={styles.buildingTabs}>
        <TouchableOpacity
          style={[styles.buildingTab, postTab === 'unresolved' && styles.buildingTabActive]}
          onPress={() => setPostTab('unresolved')}
          activeOpacity={0.8}
        >
          <Text style={[styles.buildingTabText, postTab === 'unresolved' && styles.buildingTabTextActive]}>
            Unresolved ({unresolvedCount})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.buildingTab, postTab === 'resolved' && styles.buildingTabActive]}
          onPress={() => setPostTab('resolved')}
          activeOpacity={0.8}
        >
          <Text style={[styles.buildingTabText, postTab === 'resolved' && styles.buildingTabTextActive]}>
            Resolved ({resolvedCount})
          </Text>
        </TouchableOpacity>
      </View>

      {allImages.length === 0 ? (
        <Text style={styles.buildingTabEmpty}>No {postTab} reports for this building yet.</Text>
      ) : (
        <View style={[styles.photoGrid, { gap }]}>
          {allImages.slice(0, 9).map((item, idx) => (
            <TouchableOpacity
              key={`${item.post?.id}-${idx}`}
              style={[styles.photoGridItem, { width: gridItemSize, height: gridItemSize }]}
              onPress={() => onPostSelect(item.post)}
              activeOpacity={0.8}
            >
              <Image source={getImageSource(item.img)} style={styles.photoGridImg} resizeMode="cover" />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  )
}

function BuildingPostsFeed({
  insets,
  tabPosts,
  anchorPost,
  buildings,
  onBack,
  navigation,
  getDisplayCommentCount,
  handlePostMenu,
  upvotedPosts,
  toggleUpvote,
  setCommentsOpenForPostId,
}) {
  return (
    <View style={styles.postFeedScreen}>
      <View style={[styles.detailHeader, { paddingTop: 14 + insets.top }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="arrow-back" size={24} color="#e0e0e0" />
        </TouchableOpacity>
        <Text style={styles.detailTitle}>Search</Text>
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
          length: BUILDING_POST_FEED_ITEM_LENGTH,
          offset: 8 + BUILDING_POST_FEED_ITEM_LENGTH * index,
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
            onAuthorPress={() => p.author && navigation.navigate('Profile', { profileUsername: p.author })}
            onBuildingPress={
              p.buildingId ? () => navigation.navigate('Search', { openBuildingId: p.buildingId }) : undefined
            }
            buildingLabel={p.buildingName || buildings.find((b) => b.id === p.buildingId)?.name}
          />
        )}
      />
    </View>
  )
}

export default function SearchScreen() {
  const route = useRoute()
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()
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

  const [view, setView] = useState('map') // 'map' | 'building' | 'post'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBuilding, setSelectedBuilding] = useState(null)
  const [selectedPost, setSelectedPost] = useState(null)
  const [postTab, setPostTab] = useState('unresolved')
  const [commentsOpenForPostId, setCommentsOpenForPostId] = useState(null)
  const [commentInput, setCommentInput] = useState('')

  const forBuilding =
    selectedBuilding != null
      ? posts
          .filter((p) => p.buildingId === selectedBuilding.id)
          .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999))
      : []
  const tabPosts = forBuilding.filter((p) => getResolutionStatus(p) === postTab)

  const goBack = () => {
    if (view === 'post') {
      setView('building')
      setSelectedPost(null)
    } else if (view === 'building') {
      setView('map')
      setSelectedBuilding(null)
    }
  }

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
                  goBack()
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

  useFocusEffect(
    useCallback(() => {
      const id = route.params?.openBuildingId
      if (!id) return undefined
      const b = buildings.find((x) => x.id === id)
      if (b) {
        setSelectedBuilding(b)
        setView('building')
        setSelectedPost(null)
        setPostTab('unresolved')
      }
      navigation.setParams({ openBuildingId: undefined })
      return undefined
    }, [route.params?.openBuildingId, buildings, navigation])
  )

  const handleBuildingSelect = (building) => {
    setSelectedBuilding(building)
    setPostTab('unresolved')
    setView('building')
    setSearchQuery('')
  }

  const handlePostSelect = (post) => {
    setSelectedPost(post)
    setView('post')
  }

  if (view === 'building' && selectedBuilding) {
    return (
      <BuildingDetailView
        building={selectedBuilding}
        forBuilding={forBuilding}
        postTab={postTab}
        setPostTab={setPostTab}
        tabPosts={tabPosts}
        onBack={goBack}
        onPostSelect={handlePostSelect}
      />
    )
  }

  if (view === 'post' && selectedPost) {
    return (
      <View style={styles.searchStack}>
        <BuildingPostsFeed
          insets={insets}
          tabPosts={tabPosts}
          anchorPost={selectedPost}
          buildings={buildings}
          onBack={goBack}
          navigation={navigation}
          getDisplayCommentCount={getDisplayCommentCount}
          handlePostMenu={handlePostMenu}
          upvotedPosts={upvotedPosts}
          toggleUpvote={toggleUpvote}
          setCommentsOpenForPostId={setCommentsOpenForPostId}
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

  return (
    <MapSearchView
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onBuildingSelect={handleBuildingSelect}
      buildings={buildings}
    />
  )
}

const styles = StyleSheet.create({
  mapContainer: { flex: 1, backgroundColor: '#0d0d0d' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 14,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  searchInput: { flex: 1, color: '#e0e0e0', fontSize: 16 },
  mapSurface: {
    flex: 1,
    minHeight: 280,
    marginHorizontal: 14,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#15181c',
    position: 'relative',
  },
  mapImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  mapPinButton: {
    position: 'absolute',
    right: 14,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchResultsOverlay: {
    position: 'absolute',
    left: 14,
    right: 14,
    top: 100,
    backgroundColor: 'rgba(13,13,13,0.98)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    maxHeight: 280,
  },
  searchResultsScroll: { padding: 12 },
  searchResultItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  buildingProfileFallback: {
    backgroundColor: 'rgba(0,255,127,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  buildingProfilePhoto: { backgroundColor: 'rgba(255,255,255,0.06)' },
  searchResultText: { flex: 1 },
  searchResultName: { fontSize: 15, fontWeight: '600', color: '#e0e0e0', marginBottom: 2 },
  searchResultAddress: { fontSize: 12, color: '#888' },
  searchResultEmpty: { padding: 20, color: '#666', textAlign: 'center' },

  detailScroll: { flex: 1, backgroundColor: '#0d0d0d' },
  detailScrollContent: { paddingBottom: 40 },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  backBtn: { marginRight: 12 },
  detailTitle: { fontSize: 18, fontWeight: '600', color: '#e0e0e0' },
  buildingHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 16 },
  buildingBadges: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#00ff7f',
  },
  badgeText: { fontSize: 13, fontWeight: '600', color: '#00ff7f' },
  buildingName: { fontSize: 18, fontWeight: '600', color: '#e0e0e0', marginHorizontal: 16, marginBottom: 4 },
  buildingAddress: { fontSize: 14, color: '#888', marginHorizontal: 16, marginBottom: 12 },
  buildingStatusSummary: { marginHorizontal: 16, marginBottom: 16 },
  buildingStatusSummaryText: { fontSize: 14, color: '#aaa', fontWeight: '500' },
  buildingTabs: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 16, gap: 10 },
  buildingTab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  buildingTabActive: { borderColor: '#00ff7f', backgroundColor: 'rgba(0,255,127,0.12)' },
  buildingTabText: { fontSize: 13, fontWeight: '600', color: '#888' },
  buildingTabTextActive: { color: '#00ff7f' },
  buildingTabEmpty: { marginHorizontal: 16, marginBottom: 24, fontSize: 14, color: '#666', textAlign: 'center' },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
  },
  photoGridItem: { borderRadius: 8, overflow: 'hidden' },
  photoGridImg: { width: '100%', height: '100%', borderRadius: 8 },

  searchStack: { flex: 1, backgroundColor: '#0d0d0d' },
  postFeedScreen: { flex: 1, backgroundColor: '#0d0d0d' },
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
