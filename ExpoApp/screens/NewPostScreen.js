import { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native'
import Slider from '@react-native-community/slider'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import * as Location from 'expo-location'
import { useApp } from '../context/AppContext'
import { fetchNearbyPublicBuildings } from '../services/nearbyPublicBuildings'

const categories = [
  { id: 'structural', label: 'structural' },
  { id: 'electrical', label: 'electrical' },
  { id: 'plumbing', label: 'plumbing' },
  { id: 'hvac', label: 'HVAC' },
  { id: 'roofing', label: 'roofing' },
  { id: 'fire', label: 'fire & life safety' },
  { id: 'ada', label: 'ADA / code compliance' },
  { id: 'env', label: 'environmental/health' },
  { id: 'site', label: 'drainage & site conditions' },
  { id: 'maint', label: 'maintenance / wear' },
]

export default function NewPostScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()
  const { user, addPost } = useApp()
  const [permission, requestPermission] = useCameraPermissions()
  const [postTitle, setPostTitle] = useState('')
  const [caption, setCaption] = useState('')
  const [severity, setSeverity] = useState(5)
  const [selected, setSelected] = useState(new Set(['structural']))
  const [capturedPhoto, setCapturedPhoto] = useState(null)
  const [gpsCoords, setGpsCoords] = useState(null)
  const [nearbyOptions, setNearbyOptions] = useState([])
  const [nearbyLoading, setNearbyLoading] = useState(false)
  const [nearbyError, setNearbyError] = useState(null)
  const [linkedBuilding, setLinkedBuilding] = useState(null)
  const [resolutionStatus, setResolutionStatus] = useState(null)
  const [cameraReady, setCameraReady] = useState(false)
  const cameraRef = useRef(null)

  useEffect(() => {
    if (!gpsCoords || !capturedPhoto) return undefined
    const ac = new AbortController()
    setNearbyLoading(true)
    setNearbyError(null)
    setLinkedBuilding(null)
    setNearbyOptions([])
    fetchNearbyPublicBuildings(gpsCoords.latitude, gpsCoords.longitude, { signal: ac.signal })
      .then((list) => {
        setNearbyOptions(list)
        setNearbyLoading(false)
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        setNearbyError(err.message || 'Could not load nearby places.')
        setNearbyLoading(false)
      })
    return () => ac.abort()
  }, [gpsCoords, capturedPhoto])

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const capturePhoto = async () => {
    if (!cameraRef.current || !cameraReady) return
    try {
      await Location.requestForegroundPermissionsAsync()
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
      setGpsCoords(loc.coords)

      const photo = await cameraRef.current.takePictureAsync({ quality: 0.9 })
      setCapturedPhoto(photo.uri)
    } catch (err) {
      console.warn('Capture error:', err)
    }
  }

  const retake = () => {
    setCapturedPhoto(null)
    setGpsCoords(null)
    setNearbyOptions([])
    setNearbyLoading(false)
    setNearbyError(null)
    setLinkedBuilding(null)
  }

  const handleCancel = () => {
    Alert.alert('Are you sure?', 'Your post will not be saved. Do you want to discard it?', [
      { text: 'Keep editing', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => navigation.navigate('Home') },
    ])
  }

  const handleCreatePost = () => {
    if (!linkedBuilding) return

    addPost({
      id: `new-${Date.now()}`,
      author: user?.username || 'johndoe',
      time: 'Just now',
      sortOrder: 0,
      tags: [...selected],
      tagsMore: 0,
      title: postTitle.trim(),
      body: caption.trim() || 'No description provided.',
      likes: 0,
      comments: 0,
      images: capturedPhoto ? [{ uri: capturedPhoto }] : [],
      buildingId: linkedBuilding.id,
      buildingName: linkedBuilding.name,
      buildingAddress: linkedBuilding.addressLine,
      buildingImageUrl: linkedBuilding.photoUrl || undefined,
      latitude: linkedBuilding.lat,
      longitude: linkedBuilding.lon,
      resolutionStatus,
    })
    setPostTitle('')
    setCaption('')
    setCapturedPhoto(null)
    setGpsCoords(null)
    setNearbyOptions([])
    setNearbyError(null)
    setLinkedBuilding(null)
    setResolutionStatus(null)
    setSelected(new Set(['structural']))
    setSeverity(5)
    navigation.navigate('Home')
  }

  if (!permission) {
    return <View style={[styles.container, { paddingTop: insets.top + 24 }]}><Text style={styles.text}>Loading camera…</Text></View>
  }
  if (!permission.granted) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 24 }]}>
        <Text style={styles.text}>Camera permission required to capture damage photos.</Text>
        <TouchableOpacity style={styles.btnPrimary} onPress={requestPermission}>
          <Text style={styles.btnText}>Grant camera access</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={[styles.topbar, { paddingTop: 14 + insets.top }]}>
        <TouchableOpacity
          onPress={() => (caption || postTitle.trim() || capturedPhoto ? handleCancel() : navigation.navigate('Home'))}
          style={styles.backBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>New post</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.photoSection}>
          {capturedPhoto ? (
            <View style={styles.previewWrap}>
              <Image source={{ uri: capturedPhoto }} style={styles.previewImg} />
              <TouchableOpacity style={styles.retakeBtn} onPress={retake}>
                <Text style={styles.btnText}>Retake</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.cameraWrap}>
              <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing="back"
                onCameraReady={() => setCameraReady(true)}
              />
              <TouchableOpacity
                style={[styles.captureBtn, !cameraReady && styles.captureBtnDisabled]}
                onPress={capturePhoto}
                disabled={!cameraReady}
              >
                <Text style={styles.captureBtnText}>Take photo</Text>
              </TouchableOpacity>
            </View>
          )}
          <Text style={styles.hint}>Photo and location captured at capture time. Link a nearby public building below.</Text>
        </View>

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.titleInput}
          value={postTitle}
          onChangeText={setPostTitle}
          placeholder="Short headline for this report"
          placeholderTextColor="#888"
          maxLength={120}
        />

        <Text style={styles.label}>Comment</Text>
        <TextInput
          style={styles.input}
          value={caption}
          onChangeText={setCaption}
          placeholder="Describe the issue…"
          placeholderTextColor="#888"
          multiline
        />

        <Text style={styles.label}>Status</Text>
        <View style={styles.chips}>
          <TouchableOpacity
            style={[styles.chip, resolutionStatus === 'unresolved' && styles.chipActive]}
            onPress={() => setResolutionStatus('unresolved')}
          >
            <Text style={[styles.chipText, resolutionStatus === 'unresolved' && styles.chipTextActive]}>Unresolved</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chip, resolutionStatus === 'resolved' && styles.chipActive]}
            onPress={() => setResolutionStatus('resolved')}
          >
            <Text style={[styles.chipText, resolutionStatus === 'resolved' && styles.chipTextActive]}>Resolved</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Category</Text>
        <View style={styles.chips}>
          {categories.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[styles.chip, selected.has(c.id) && styles.chipActive]}
              onPress={() => toggle(c.id)}
            >
              <Text style={[styles.chipText, selected.has(c.id) && styles.chipTextActive]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Severity</Text>
        <View style={styles.severityRow}>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={10}
            step={1}
            value={severity}
            onValueChange={setSeverity}
            minimumTrackTintColor="#00ff7f"
            maximumTrackTintColor="rgba(255,255,255,0.2)"
            thumbTintColor="#00ff7f"
          />
          <Text style={styles.severityValue}>{Math.round(severity)}</Text>
        </View>

        {capturedPhoto && gpsCoords ? (
          <View style={styles.buildingSection}>
            <Text style={styles.label}>Link to nearby public building</Text>
            {nearbyLoading ? (
              <View style={styles.nearbyLoadingRow}>
                <ActivityIndicator color="#00ff7f" />
                <Text style={styles.nearbyHint}>Loading places from OpenStreetMap…</Text>
              </View>
            ) : null}
            {nearbyError ? <Text style={styles.nearbyError}>{nearbyError}</Text> : null}
            {!nearbyLoading && !nearbyError && nearbyOptions.length === 0 ? (
              <Text style={styles.nearbyEmpty}>
                No public buildings found within ~200 m. Try again outdoors or near campuses, transit, or civic buildings.
              </Text>
            ) : null}
            {nearbyOptions.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                style={[styles.buildingRow, linkedBuilding?.id === opt.id && styles.buildingRowActive]}
                onPress={() => setLinkedBuilding(opt)}
                activeOpacity={0.75}
              >
                <Text style={styles.buildingRowName}>{opt.name}</Text>
                {opt.addressLine ? <Text style={styles.buildingRowAddr}>{opt.addressLine}</Text> : null}
                {opt.rawType ? <Text style={styles.buildingRowType}>{opt.rawType}</Text> : null}
              </TouchableOpacity>
            ))}
            {linkedBuilding ? (
              <View style={styles.gpsBox}>
                <Text style={styles.gpsLabel}>Linked building</Text>
                <Text style={styles.gpsText}>{linkedBuilding.name}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.createBtn,
              (!capturedPhoto || !postTitle.trim() || !caption.trim() || !linkedBuilding || !resolutionStatus) &&
                styles.createBtnDisabled,
            ]}
            onPress={handleCreatePost}
            disabled={!capturedPhoto || !postTitle.trim() || !caption.trim() || !linkedBuilding || !resolutionStatus}
          >
            <Text
              style={[
                styles.createBtnText,
                (!capturedPhoto || !postTitle.trim() || !caption.trim() || !linkedBuilding || !resolutionStatus) &&
                  styles.createBtnTextDisabled,
              ]}
            >
              Create Post
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d' },
  text: { color: '#e0e0e0', fontSize: 16 },
  topbar: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  backBtn: { marginRight: 12 },
  backText: { color: '#00ffff', fontSize: 16 },
  title: { fontSize: 18, fontWeight: '600', color: '#e0e0e0' },
  scroll: { flex: 1 },
  scrollContent: { padding: 14, paddingBottom: 40 },
  photoSection: { marginBottom: 16 },
  cameraWrap: { borderRadius: 16, overflow: 'hidden', backgroundColor: '#000', aspectRatio: 1 },
  camera: { flex: 1, aspectRatio: 1 },
  previewWrap: { borderRadius: 16, overflow: 'hidden', aspectRatio: 1 },
  previewImg: { width: '100%', aspectRatio: 1, resizeMode: 'cover' },
  retakeBtn: { position: 'absolute', bottom: 12, alignSelf: 'center', backgroundColor: 'rgba(0,255,127,0.2)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999 },
  captureBtn: { position: 'absolute', bottom: 20, alignSelf: 'center', backgroundColor: 'rgba(0,255,127,0.25)', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 999 },
  captureBtnDisabled: { opacity: 0.5 },
  captureBtnText: { color: '#00ff7f', fontWeight: '600' },
  hint: { fontSize: 12, color: '#888', marginTop: 8 },
  label: { fontSize: 13, color: '#888', marginBottom: 8 },
  titleInput: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: 14,
    color: '#e0e0e0',
    fontSize: 16,
    marginBottom: 16,
  },
  input: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 14, color: '#e0e0e0', fontSize: 16, minHeight: 80, textAlignVertical: 'top', marginBottom: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  chipActive: { backgroundColor: 'rgba(0,255,127,0.15)', borderColor: 'rgba(0,255,127,0.3)' },
  chipText: { fontSize: 12, color: '#888' },
  chipTextActive: { color: '#00ff7f' },
  severityRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  slider: { flex: 1, height: 40 },
  severityValue: { fontSize: 18, fontWeight: '600', color: '#00ff7f', minWidth: 24, textAlign: 'right' },
  buildingSection: { marginBottom: 16 },
  nearbyLoadingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  nearbyHint: { fontSize: 13, color: '#888', flex: 1 },
  nearbyError: { fontSize: 13, color: '#ff6b6b', marginBottom: 12 },
  nearbyEmpty: { fontSize: 13, color: '#888', marginBottom: 12, lineHeight: 20 },
  buildingRow: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  buildingRowActive: { borderColor: 'rgba(0,255,127,0.45)', backgroundColor: 'rgba(0,255,127,0.1)' },
  buildingRowName: { fontSize: 15, fontWeight: '600', color: '#e0e0e0' },
  buildingRowAddr: { fontSize: 12, color: '#888', marginTop: 4 },
  buildingRowType: { fontSize: 11, color: '#666', marginTop: 2, textTransform: 'capitalize' },
  gpsBox: { backgroundColor: 'rgba(0,255,127,0.08)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(0,255,127,0.2)', marginBottom: 24, marginTop: 8 },
  gpsLabel: { fontSize: 12, color: '#00ff7f', marginBottom: 4 },
  gpsText: { fontSize: 14, color: '#e0e0e0' },
  buttonRow: { flexDirection: 'row', marginTop: 8 },
  cancelBtn: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
  },
  cancelBtnText: { color: '#888', fontWeight: '600', fontSize: 16 },
  createBtn: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#00ff7f',
    alignItems: 'center',
    marginLeft: 12,
  },
  createBtnDisabled: { opacity: 0.5 },
  createBtnText: { color: '#061014', fontWeight: '600', fontSize: 16 },
  createBtnTextDisabled: { color: '#333' },
  btnPrimary: { backgroundColor: '#00a0a0', borderRadius: 12, padding: 14, marginTop: 16 },
  btnText: { color: '#fff', fontWeight: '600' },
})
