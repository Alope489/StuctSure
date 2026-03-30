import { useState, useCallback } from 'react'
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions, TextInput } from 'react-native'
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { useApp } from '../context/AppContext'
import { getImageSource, getResolutionStatus, getPostCategoryTags } from '../data/posts'

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

      <View style={styles.mapSurface} />

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
  const allImages = tabPosts.flatMap((p) => (p?.images?.[0] ? [{ post: p, img: p.images[0] }] : []))
  const tagAggregate = forBuilding.reduce((sum, p) => sum + getPostCategoryTags(p).length, 0)

  return (
    <ScrollView style={styles.detailScroll} contentContainerStyle={styles.detailScrollContent}>
      <View style={[styles.detailHeader, { paddingTop: 14 + insets.top }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="arrow-back" size={24} color="#e0e0e0" />
        </TouchableOpacity>
        <View style={styles.detailHeaderSpacer} />
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

export default function SearchMainScreen() {
  const route = useRoute()
  const navigation = useNavigation()
  const { posts, buildings } = useApp()

  const [view, setView] = useState('map')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBuilding, setSelectedBuilding] = useState(null)
  const [postTab, setPostTab] = useState('unresolved')
  const [returnTarget, setReturnTarget] = useState(null)

  const forBuilding =
    selectedBuilding != null
      ? posts
          .filter((p) => p.buildingId === selectedBuilding.id)
          .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999))
      : []
  const tabPosts = forBuilding.filter((p) => getResolutionStatus(p) === postTab)

  const goBackToMap = () => {
    if (view === 'building') {
      setView('map')
      setSelectedBuilding(null)
    }
  }

  const handleBuildingBack = () => {
    if (returnTarget?.kind === 'searchPosts') {
      navigation.navigate('SearchPosts', {
        buildingId: returnTarget.buildingId,
        postTab: returnTarget.postTab,
        initialPostId: returnTarget.initialPostId,
      })
      setReturnTarget(null)
      setView('map')
      setSelectedBuilding(null)
      return
    }
    if (returnTarget?.kind === 'profilePosts') {
      navigation.navigate('Profile', {
        screen: 'ProfilePosts',
        params: {
          profileUsername: returnTarget.profileUsername,
          initialPostId: returnTarget.initialPostId,
        },
      })
      setReturnTarget(null)
      setView('map')
      setSelectedBuilding(null)
      return
    }
    goBackToMap()
  }

  useFocusEffect(
    useCallback(() => {
      const id = route.params?.openBuildingId
      const rt = route.params?.returnTarget
      if (!id) return undefined
      const b = buildings.find((x) => x.id === id)
      if (b) {
        setSelectedBuilding(b)
        setView('building')
        setPostTab('unresolved')
        setReturnTarget(
          rt?.kind === 'searchPosts' && rt.buildingId && (rt.postTab === 'resolved' || rt.postTab === 'unresolved')
            ? rt
            : rt?.kind === 'profilePosts' && rt.profileUsername
              ? rt
              : null
        )
      }
      navigation.setParams({ openBuildingId: undefined, returnTarget: undefined })
      return undefined
    }, [route.params?.openBuildingId, route.params?.returnTarget, buildings, navigation])
  )

  const handleBuildingSelect = (building) => {
    setReturnTarget(null)
    setSelectedBuilding(building)
    setPostTab('unresolved')
    setView('building')
    setSearchQuery('')
  }

  const handlePostSelect = (post) => {
    if (!selectedBuilding) return
    navigation.navigate('SearchPosts', {
      buildingId: selectedBuilding.id,
      postTab,
      initialPostId: post.id,
    })
  }

  if (view === 'building' && selectedBuilding) {
    return (
      <BuildingDetailView
        building={selectedBuilding}
        forBuilding={forBuilding}
        postTab={postTab}
        setPostTab={setPostTab}
        tabPosts={tabPosts}
        onBack={handleBuildingBack}
        onPostSelect={handlePostSelect}
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
  detailHeaderSpacer: { flex: 1 },
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
})
