import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

import { useApp } from '../context/AppContext'
import { getImageSource, getResolutionStatus, getPostCategoryTags } from '../data/posts'
import {
  isGooglePlacesConfigured,
  searchBuildingsLocal,
  fetchPlacePredictions,
  fetchPlaceDetailsLatLng,
  regionForBuildings,
} from '../services/geoMapController'

let MapViewComp = null
let MarkerComp = null
let ProviderGoogle = undefined
if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps')
  MapViewComp = Maps.default
  MarkerComp = Maps.Marker
  ProviderGoogle = Maps.PROVIDER_GOOGLE
}

/** Thumbnail for the small circle next to a building name: explicit image URL, else first report photo. */
function getBuildingAvatarSource(building, postsForLookup) {
  if (!building) return null
  if (building.image && String(building.image).trim()) {
    return { uri: String(building.image).trim() }
  }
  const list = Array.isArray(postsForLookup) ? postsForLookup : []
  for (const p of list) {
    if (p?.buildingId !== building.id) continue
    const src = p?.images?.[0] ? getImageSource(p.images[0]) : null
    if (src) return src
  }
  return null
}

function BuildingProfileCircle({ source, uri, size }) {
  const [loadFailed, setLoadFailed] = useState(false)
  useEffect(() => {
    setLoadFailed(false)
  }, [source, uri])
  const dim = { width: size, height: size, borderRadius: size / 2 }
  const resolved = source ?? (uri?.trim() ? { uri: uri.trim() } : null)
  const showIcon = resolved == null || loadFailed
  if (showIcon) {
    return (
      <View style={[dim, styles.buildingProfileFallback]}>
        <Ionicons name="business" size={Math.round(size * 0.46)} color="#00ff7f" />
      </View>
    )
  }
  return (
    <Image
      source={resolved}
      style={[dim, styles.buildingProfilePhoto]}
      onError={() => setLoadFailed(true)}
    />
  )
}

function MapSearchView({ searchQuery, onSearchChange, onBuildingSelect, buildings, posts }) {
  const insets = useSafeAreaInsets()
  const mapRef = useRef(null)
  const [placesPredictions, setPlacesPredictions] = useState([])
  const [placesLoading, setPlacesLoading] = useState(false)
  const [explorePin, setExplorePin] = useState(null)

  const qTrim = searchQuery.trim()
  const hasQuery = qTrim.length > 0

  const localMatches = useMemo(
    () => searchBuildingsLocal(buildings, posts, searchQuery, getPostCategoryTags),
    [buildings, posts, searchQuery]
  )

  const initialRegion = useMemo(() => regionForBuildings(buildings), [buildings])

  const reportCountByBuildingId = useMemo(() => {
    const m = new Map()
    for (const p of posts) {
      if (!p?.buildingId) continue
      m.set(p.buildingId, (m.get(p.buildingId) || 0) + 1)
    }
    return m
  }, [posts])

  useEffect(() => {
    if (!isGooglePlacesConfigured() || qTrim.length < 2) {
      setPlacesPredictions([])
      return undefined
    }
    let cancelled = false
    const t = setTimeout(async () => {
      setPlacesLoading(true)
      try {
        const preds = await fetchPlacePredictions(qTrim)
        if (!cancelled) setPlacesPredictions(preds)
      } finally {
        if (!cancelled) setPlacesLoading(false)
      }
    }, 280)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [qTrim])

  const buildingsWithCoords = useMemo(
    () =>
      buildings.filter(
        (b) => typeof b.latitude === 'number' && typeof b.longitude === 'number' && !Number.isNaN(b.latitude)
      ),
    [buildings]
  )

  const handlePlaceRowPress = async (place) => {
    const geo = await fetchPlaceDetailsLatLng(place.placeId)
    if (!geo) return
    onSearchChange('')
    setPlacesPredictions([])
    const region = {
      latitude: geo.lat,
      longitude: geo.lng,
      latitudeDelta: 0.025,
      longitudeDelta: 0.025,
    }
    mapRef.current?.animateToRegion(region, 450)
    setExplorePin({
      lat: geo.lat,
      lng: geo.lng,
      title: geo.name || place.primaryText,
      subtitle: geo.formattedAddress || place.description,
    })
  }

  const handleMarkerBuildingPress = (building) => {
    onBuildingSelect(building)
    setExplorePin(null)
  }

  const mapTopOffset = 14 + insets.top + 56

  /** Android: Google Maps when key is set. iOS: Apple MapKit (no extra native Google Maps pod). */
  const mapProvider =
    MapViewComp && Platform.OS === 'android' && isGooglePlacesConfigured() ? ProviderGoogle : undefined

  return (
    <View style={styles.mapContainer}>
      <View style={[styles.searchBar, { marginTop: 14 + insets.top }]}>
        <Ionicons name="search" size={20} color="#888" />
        <TextInput
          style={styles.searchInput}
          placeholder={
            isGooglePlacesConfigured()
              ? 'Search buildings, addresses, or places'
              : 'Search buildings by name or address'
          }
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={onSearchChange}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {placesLoading ? <ActivityIndicator size="small" color="#00ff7f" /> : null}
      </View>

      <View style={styles.mapSurface}>
        {MapViewComp ? (
          <MapViewComp
            ref={mapRef}
            style={StyleSheet.absoluteFillObject}
            initialRegion={initialRegion}
            provider={mapProvider}
            showsUserLocation={false}
            showsMyLocationButton={false}
            mapType="standard"
          >
            {buildingsWithCoords.map((b) => {
              const n = reportCountByBuildingId.get(b.id) || 0
              return (
                <MarkerComp
                  key={b.id}
                  coordinate={{ latitude: b.latitude, longitude: b.longitude }}
                  title={b.name}
                  description={n ? `${n} infrastructure report${n === 1 ? '' : 's'}` : 'No reports yet'}
                  onPress={() => handleMarkerBuildingPress(b)}
                />
              )
            })}
            {explorePin ? (
              <MarkerComp
                coordinate={{ latitude: explorePin.lat, longitude: explorePin.lng }}
                pinColor="#f59e0b"
                title={explorePin.title}
                description={explorePin.subtitle}
              />
            ) : null}
          </MapViewComp>
        ) : (
          <View style={[styles.mapFallback, StyleSheet.absoluteFillObject]}>
            <Ionicons name="map-outline" size={48} color="#444" />
            <Text style={styles.mapFallbackText}>Map is not available on web.</Text>
            <Text style={styles.mapFallbackSub}>Use iOS or Android for the geographic view.</Text>
          </View>
        )}
      </View>

      {explorePin ? (
        <TouchableOpacity
          style={[styles.clearPinBtn, { bottom: 18 + insets.bottom }]}
          onPress={() => setExplorePin(null)}
          activeOpacity={0.85}
        >
          <Ionicons name="close-circle" size={18} color="#0d0d0d" />
          <Text style={styles.clearPinText}>Clear place pin</Text>
        </TouchableOpacity>
      ) : null}

      {hasQuery ? (
        <View style={[styles.searchResultsOverlay, { top: mapTopOffset }]}>
          <ScrollView style={styles.searchResultsScroll} keyboardShouldPersistTaps="handled">
            {localMatches.map(({ building, tagMatches }) => (
              <TouchableOpacity
                key={building.id}
                style={styles.searchResultItem}
                onPress={() => {
                  onBuildingSelect(building)
                  setExplorePin(null)
                }}
                activeOpacity={0.7}
              >
                <BuildingProfileCircle source={getBuildingAvatarSource(building, posts)} size={48} />
                <View style={styles.searchResultText}>
                  <Text style={styles.searchResultName}>{building.name}</Text>
                  <Text style={styles.searchResultAddress}>{building.address}</Text>
                  {tagMatches.length ? (
                    <Text style={styles.searchResultTags}>
                      {tagMatches.length === 1
                        ? `Tag match: ${tagMatches[0]}`
                        : `Tag matches: ${tagMatches.slice(0, 2).join(', ')}`}
                    </Text>
                  ) : null}
                  <Text style={styles.searchResultBadge}>In-app building</Text>
                </View>
              </TouchableOpacity>
            ))}

            {isGooglePlacesConfigured() && qTrim.length >= 2 ? (
              <>
                {localMatches.length > 0 ? <Text style={styles.sectionLabel}>Google Places</Text> : null}
                {placesPredictions.map((p) => (
                  <TouchableOpacity
                    key={p.placeId}
                    style={styles.searchResultItem}
                    onPress={() => handlePlaceRowPress(p)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.placeIconWrap}>
                      <Ionicons name="navigate-outline" size={22} color="#60a5fa" />
                    </View>
                    <View style={styles.searchResultText}>
                      <Text style={styles.searchResultName}>{p.primaryText}</Text>
                      <Text style={styles.searchResultAddress}>{p.secondaryText || p.description}</Text>
                      <Text style={styles.searchResultPlaces}>Places API</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            ) : null}

            {!placesLoading &&
            localMatches.length === 0 &&
            placesPredictions.length === 0 &&
            (!isGooglePlacesConfigured() || qTrim.length < 2) ? (
              <Text style={styles.searchResultEmpty}>
                {isGooglePlacesConfigured() && qTrim.length < 2
                  ? 'Type at least 2 characters for address / place suggestions.'
                  : 'No buildings found in your data.'}
              </Text>
            ) : null}

            {!placesLoading &&
            isGooglePlacesConfigured() &&
            qTrim.length >= 2 &&
            localMatches.length === 0 &&
            placesPredictions.length === 0 ? (
              <Text style={styles.searchResultEmpty}>No Places matches — try another query.</Text>
            ) : null}
          </ScrollView>
        </View>
      ) : null}
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

  const circleSource = useMemo(() => getBuildingAvatarSource(building, forBuilding), [building, forBuilding])

  return (
    <ScrollView style={styles.detailScroll} contentContainerStyle={styles.detailScrollContent}>
      <View style={[styles.detailHeader, { paddingTop: 14 + insets.top }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="arrow-back" size={24} color="#e0e0e0" />
        </TouchableOpacity>
        <View style={styles.detailHeaderSpacer} />
      </View>

      <View style={styles.buildingHeader}>
        <BuildingProfileCircle source={circleSource} size={100} />
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
    if (returnTarget?.kind === 'homeFeed') {
      navigation.navigate('Home', {
        screen: 'Home',
        params: { focusPostId: returnTarget.initialPostId },
      })
      setReturnTarget(null)
      setView('map')
      setSelectedBuilding(null)
      return
    }
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
              : rt?.kind === 'homeFeed'
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
      posts={posts}
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
  mapFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#15181c',
    padding: 24,
  },
  mapFallbackText: { color: '#888', fontSize: 15, marginTop: 12, textAlign: 'center' },
  mapFallbackSub: { color: '#555', fontSize: 13, marginTop: 6, textAlign: 'center' },
  clearPinBtn: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#00ff7f',
  },
  clearPinText: { color: '#0d0d0d', fontWeight: '700', fontSize: 14 },
  searchResultsOverlay: {
    position: 'absolute',
    left: 14,
    right: 14,
    zIndex: 20,
    elevation: 20,
    backgroundColor: 'rgba(13,13,13,0.98)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    maxHeight: 320,
  },
  searchResultsScroll: { padding: 12 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#666',
    letterSpacing: 0.6,
    marginTop: 8,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  searchResultItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  placeIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(96,165,250,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  searchResultTags: { fontSize: 12, color: '#00ff7f', marginTop: 4 },
  searchResultBadge: { fontSize: 11, color: '#888', marginTop: 4, fontWeight: '600' },
  searchResultPlaces: { fontSize: 11, color: '#60a5fa', marginTop: 4, fontWeight: '600' },
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
