import { useState, useRef, useCallback } from 'react'
import { Alert } from 'react-native'
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { useApp } from '../context/AppContext'
import { getImageSource, getResolutionStatus } from '../data/posts'

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

function BuildingDetailView({ building, posts, onBack, onPostSelect }) {
  const insets = useSafeAreaInsets()
  const { width } = Dimensions.get('window')
  const padding = 28
  const gap = 4
  const gridItemSize = (width - padding - gap * 2) / 3
  const [postTab, setPostTab] = useState('unresolved')
  const forBuilding = posts
    .filter((p) => p.buildingId === building?.id)
    .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999))
  const resolvedCount = forBuilding.filter((p) => getResolutionStatus(p) === 'resolved').length
  const unresolvedCount = forBuilding.filter((p) => getResolutionStatus(p) === 'unresolved').length
  const postList = forBuilding.filter((p) => getResolutionStatus(p) === postTab)
  const allImages = postList.flatMap((p) => (p?.images || []).map((img) => ({ post: p, img })))
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

function PostDetailView({ post, building, onBack, getDisplayCommentCount, onPostMenu, onOpenBuildingProfile, onAuthorProfile }) {
  const insets = useSafeAreaInsets()
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const images = post?.images || []
  const scrollRef = useRef(null)
  const commentCount = getDisplayCommentCount ? getDisplayCommentCount(post?.id) : (post?.comments || 0)
  const canOpenBuilding = !!(building || post?.buildingId)

  return (
    <ScrollView style={styles.postDetailScroll} contentContainerStyle={styles.postDetailContent}>
      <View style={[styles.detailHeader, { paddingTop: 14 + insets.top }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="arrow-back" size={24} color="#e0e0e0" />
        </TouchableOpacity>
        <Text style={styles.detailTitle}>Search</Text>
      </View>

      {canOpenBuilding ? (
        <TouchableOpacity
          style={styles.postDetailBuildingLink}
          onPress={onOpenBuildingProfile}
          activeOpacity={0.7}
        >
          <Ionicons name="business-outline" size={16} color="#00ff7f" />
          <Text style={styles.postDetailBuildingLinkText}>Building profile</Text>
          <Ionicons name="chevron-forward" size={16} color="#666" />
        </TouchableOpacity>
      ) : null}

      <View style={styles.postDetailAuthorRow}>
        <TouchableOpacity
          style={styles.postDetailAuthorHit}
          onPress={() => onAuthorProfile?.(post?.author)}
          activeOpacity={0.7}
          disabled={!onAuthorProfile || !post?.author}
        >
          <View style={styles.postDetailAvatar}>
            <Text style={styles.postDetailAvatarText}>{(post?.author || '?').slice(0, 1)}</Text>
          </View>
          <View style={styles.postDetailMeta}>
            <Text style={styles.postDetailAuthor}>{post?.author}</Text>
            <Text style={styles.postDetailTime}>{post?.time}</Text>
          </View>
        </TouchableOpacity>
        {onPostMenu && (
          <TouchableOpacity onPress={() => onPostMenu(post)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.postDetailMenuBtn}>
            <Ionicons name="ellipsis-vertical" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      {post?.title ? <Text style={styles.postDetailPostTitle}>{post.title}</Text> : null}
      {post?.body ? <Text style={styles.postDetailBody}>{post.body}</Text> : null}

      {images.length > 0 && (
        <View style={styles.postDetailImageWrap}>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const offset = e.nativeEvent.contentOffset.x
              const w = Dimensions.get('window').width - 28
              const idx = Math.round(offset / w)
              if (idx >= 0 && idx < images.length) setActiveImageIndex(idx)
            }}
            scrollEventThrottle={100}
          >
            {images.map((img, idx) => (
              <View key={idx} style={[styles.postDetailImageSlide, { width: Dimensions.get('window').width - 28 }]}>
                <Image source={getImageSource(img)} style={styles.postDetailImage} resizeMode="cover" />
              </View>
            ))}
          </ScrollView>
          {images.length > 1 && (
            <View style={styles.postDetailDots}>
              {images.map((_, idx) => (
                <View key={idx} style={[styles.postDetailDot, activeImageIndex === idx && styles.postDetailDotActive]} />
              ))}
            </View>
          )}
          <View style={styles.postDetailTags}>
            <View
              style={[
                styles.tagChip,
                getResolutionStatus(post) === 'resolved' ? styles.tagChipResolved : styles.tagChipUnresolved,
              ]}
            >
              <Text style={styles.tagChipStatusText}>{getResolutionStatus(post)}</Text>
            </View>
            {(post?.tags || []).map((tag) => (
              <View key={tag} style={styles.tagChip}>
                <Text style={styles.tagChipText}>{tag}</Text>
              </View>
            ))}
            {(post?.tagsMore || 0) > 0 && (
              <View style={styles.tagChip}>
                <Text style={styles.tagChipText}>+{post.tagsMore}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      <View style={styles.postDetailActions}>
        <View style={styles.actionRow}>
          <Ionicons name="arrow-up" size={20} color="#00ff7f" />
          <Text style={[styles.actionText, styles.actionTextActive]}>{post?.likes || 0}</Text>
        </View>
        <View style={styles.actionRow}>
          <Ionicons name="chatbubble-outline" size={18} color="#888" />
          <Text style={styles.actionText}>{commentCount}</Text>
        </View>
      </View>

      {(building?.address || post?.buildingAddress) ? (
        <View style={styles.postDetailLocationBar}>
          <Ionicons name="location-outline" size={14} color="#888" />
          <Text style={styles.postDetailLocation}>{building?.address || post?.buildingAddress}</Text>
        </View>
      ) : null}
    </ScrollView>
  )
}

export default function SearchScreen() {
  const route = useRoute()
  const navigation = useNavigation()
  const { posts, buildings, user, deletePost, getDisplayCommentCount, updatePostResolution } = useApp()

  const [view, setView] = useState('map') // 'map' | 'building' | 'post'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBuilding, setSelectedBuilding] = useState(null)
  const [selectedPost, setSelectedPost] = useState(null)

  const goBack = () => {
    if (view === 'post') setView('building')
    else if (view === 'building') {
      setView('map')
      setSelectedBuilding(null)
    }
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
      }
      navigation.setParams({ openBuildingId: undefined })
      return undefined
    }, [route.params?.openBuildingId, buildings, navigation])
  )

  const handleBuildingSelect = (building) => {
    setSelectedBuilding(building)
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
        posts={posts}
        onBack={goBack}
        onPostSelect={handlePostSelect}
      />
    )
  }

  if (view === 'post' && selectedPost) {
    const buildingForPost =
      selectedBuilding?.id === selectedPost.buildingId
        ? selectedBuilding
        : buildings.find((b) => b.id === selectedPost.buildingId)
    return (
      <PostDetailView
        post={selectedPost}
        building={buildingForPost}
        onBack={goBack}
        getDisplayCommentCount={getDisplayCommentCount}
        onPostMenu={handlePostMenu}
        onAuthorProfile={(author) => author && navigation.navigate('Profile', { profileUsername: author })}
        onOpenBuildingProfile={() => {
          const b =
            selectedBuilding?.id === selectedPost.buildingId
              ? selectedBuilding
              : buildings.find((x) => x.id === selectedPost.buildingId)
          if (b) {
            setSelectedBuilding(b)
            setView('building')
            setSelectedPost(null)
          }
        }}
      />
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

  postDetailScroll: { flex: 1, backgroundColor: '#0d0d0d' },
  postDetailContent: { paddingBottom: 40 },
  postDetailBuildingLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0,255,127,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,127,0.2)',
  },
  postDetailBuildingLinkText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#00ff7f' },
  postDetailBody: {
    fontSize: 15,
    color: 'rgba(224,224,224,0.95)',
    lineHeight: 22,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  postDetailTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, marginBottom: 16 },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(0,255,127,0.4)',
    backgroundColor: 'rgba(0,255,127,0.1)',
  },
  tagChipResolved: { borderColor: 'rgba(0,255,127,0.35)', backgroundColor: 'rgba(0,255,127,0.12)' },
  tagChipUnresolved: { borderColor: 'rgba(255,193,7,0.45)', backgroundColor: 'rgba(255,193,7,0.1)' },
  tagChipText: { fontSize: 12, color: '#00ff7f' },
  tagChipStatusText: { fontSize: 12, color: '#c8e6c9', textTransform: 'capitalize' },
  postDetailImageWrap: { marginBottom: 12 },
  postDetailImageSlide: { aspectRatio: 1 },
  postDetailImage: { width: '100%', height: '100%', borderRadius: 0 },
  postDetailDots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 10 },
  postDetailDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.3)' },
  postDetailDotActive: { backgroundColor: '#00ff7f', width: 8, height: 8, borderRadius: 4 },
  postDetailActions: { flexDirection: 'row', gap: 24, paddingHorizontal: 16, paddingVertical: 12 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { color: '#888', fontSize: 14 },
  actionTextActive: { color: '#00ff7f' },
  postDetailAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  postDetailAuthorHit: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  postDetailMenuBtn: { padding: 4 },
  postDetailPostTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#e0e0e0',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  postDetailAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,255,127,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postDetailAvatarText: { color: '#e0e0e0', fontWeight: '700', fontSize: 14 },
  postDetailMeta: { flex: 1 },
  postDetailAuthor: { fontSize: 14, fontWeight: '600', color: '#e0e0e0' },
  postDetailTime: { fontSize: 12, color: '#888' },
  postDetailLocationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  postDetailLocation: { fontSize: 12, color: '#888' },
})
