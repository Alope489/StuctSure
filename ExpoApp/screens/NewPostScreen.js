import { useState, useRef } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import * as Location from 'expo-location'

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
  const navigation = useNavigation()
  const [permission, requestPermission] = useCameraPermissions()
  const [locationPermission, requestLocationPermission] = Location.useForegroundPermissions()
  const [caption, setCaption] = useState('')
  const [selected, setSelected] = useState(new Set(['structural']))
  const [capturedPhoto, setCapturedPhoto] = useState(null)
  const [gpsCoords, setGpsCoords] = useState(null)
  const [cameraReady, setCameraReady] = useState(false)
  const cameraRef = useRef(null)

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
  }

  if (!permission) {
    return <View style={styles.container}><Text style={styles.text}>Loading camera…</Text></View>
  }
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Camera permission required to capture damage photos.</Text>
        <TouchableOpacity style={styles.btnPrimary} onPress={requestPermission}>
          <Text style={styles.btnText}>Grant camera access</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.topbar}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backBtn}>
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
          <Text style={styles.hint}>Photo and GPS captured at capture time.</Text>
        </View>

        <Text style={styles.label}>Add a caption…</Text>
        <TextInput
          style={styles.input}
          value={caption}
          onChangeText={setCaption}
          placeholder="Describe the issue…"
          placeholderTextColor="#888"
          multiline
        />

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

        {gpsCoords && (
          <View style={styles.gpsBox}>
            <Text style={styles.gpsLabel}>GPS (captured)</Text>
            <Text style={styles.gpsText}>{gpsCoords.latitude.toFixed(6)}, {gpsCoords.longitude.toFixed(6)}</Text>
          </View>
        )}
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
  input: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 14, color: '#e0e0e0', fontSize: 16, minHeight: 80, textAlignVertical: 'top', marginBottom: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  chipActive: { backgroundColor: 'rgba(0,255,127,0.15)', borderColor: 'rgba(0,255,127,0.3)' },
  chipText: { fontSize: 12, color: '#888' },
  chipTextActive: { color: '#00ff7f' },
  gpsBox: { backgroundColor: 'rgba(0,255,127,0.08)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(0,255,127,0.2)' },
  gpsLabel: { fontSize: 12, color: '#00ff7f', marginBottom: 4 },
  gpsText: { fontSize: 14, color: '#e0e0e0' },
  btnPrimary: { backgroundColor: '#00a0a0', borderRadius: 12, padding: 14, marginTop: 16 },
  btnText: { color: '#fff', fontWeight: '600' },
})
