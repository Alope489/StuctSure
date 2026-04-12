import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useApp } from '../context/AppContext'
import { useThemedDialog } from '../context/ThemedDialogContext'

/**
 * Same slide-in account panel as Home (profile photo, username, email, Posts status, Log out).
 * @param {{ visible: boolean, onClose: () => void, navigation: import('@react-navigation/native').NavigationProp<Record<string, object | undefined>> }} props
 */
export function AccountSidePanel({ visible, onClose, navigation }) {
  const insets = useSafeAreaInsets()
  const { width: winW } = useWindowDimensions()
  const panelWidth = Math.min(400, Math.round(winW * 0.9))
  const { user, setUser, logout } = useApp()
  const showThemedDialog = useThemedDialog()

  const takeProfilePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') {
      showThemedDialog({
        title: 'Camera access',
        message: 'Permission to use the camera is required to take a profile photo.',
        buttons: [{ text: 'OK', onPress: () => {} }],
      })
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
      showThemedDialog({
        title: 'Gallery access',
        message: 'Permission to access photos is required to choose a profile picture.',
        buttons: [{ text: 'OK', onPress: () => {} }],
      })
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

  const handleEditPicture = () => {
    showThemedDialog({
      title: 'Profile picture',
      message: 'Take a new photo or choose from your gallery.',
      buttons: [
        { text: 'Take photo', onPress: takeProfilePhoto },
        { text: 'Choose from gallery', onPress: pickProfilePhoto },
        { text: 'Cancel', style: 'cancel', onPress: () => {} },
      ],
    })
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[
            styles.panelColumn,
            {
              width: panelWidth,
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
            },
          ]}
        >
          <ScrollView
            style={styles.panelScroll}
            contentContainerStyle={styles.panelScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <TouchableOpacity onPress={onClose} style={styles.profileBackBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
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
              <TouchableOpacity
                style={styles.profileActionBtn}
                onPress={() => {
                  onClose()
                  navigation.navigate('Profile', { screen: 'ProfileMain', params: {} })
                }}
              >
                <Text style={styles.profileActionText}>Posts status</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.profileActionBtn, styles.profileActionOutlined]}
                onPress={async () => {
                  await logout()
                  onClose()
                  navigation.replace('Login')
                }}
              >
                <Text style={[styles.profileActionText, styles.profileActionOutlinedText]}>Log out</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalRoot: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  panelColumn: {
    alignSelf: 'stretch',
    backgroundColor: '#0d0d0d',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.1)',
    zIndex: 2,
  },
  panelScroll: { flexGrow: 1, flexShrink: 1 },
  panelScrollContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32, flexGrow: 1 },
  profileBackBtn: { alignSelf: 'flex-start', paddingVertical: 8, paddingRight: 16, marginBottom: 12 },
  profileContent: { alignItems: 'center', width: '100%' },
  profilePicLarge: { width: 120, height: 120, borderRadius: 60, overflow: 'hidden', marginBottom: 12 },
  profilePicLargeImg: { width: '100%', height: '100%' },
  editPicBtn: { marginBottom: 20 },
  editPicText: { fontSize: 14, color: '#00ff7f' },
  profileLabel: { alignSelf: 'stretch', fontSize: 12, color: '#888', marginBottom: 6 },
  profileInput: {
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 14,
    color: '#e0e0e0',
    fontSize: 16,
    marginBottom: 16,
  },
  profileActionBtn: {
    alignSelf: 'stretch',
    backgroundColor: '#00ff7f',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  profileActionText: { color: '#061014', fontWeight: '600', fontSize: 16 },
  profileActionOutlined: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#00ff7f' },
  profileActionOutlinedText: { color: '#00ff7f' },
})
