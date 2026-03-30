import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { useApp } from '../context/AppContext'
import { useThemedDialog } from '../context/ThemedDialogContext'
import { getImageSource } from '../data/posts'

const { width } = Dimensions.get('window')
const padding = 28
const gap = 4
const gridSize = (width - padding - gap * 2) / 3

export default function ProfileScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()
  const route = useRoute()
  const showThemedDialog = useThemedDialog()
  const { user, posts } = useApp()
  const profileUsername = route.params?.profileUsername
  const selfName = user?.username || 'johndoe'
  const displayUsername = profileUsername ?? selfName
  const isOwnProfile = displayUsername === selfName

  const handleSettingsPress = () => {
    showThemedDialog({
      title: 'Settings',
      message: 'Sign out of your account?',
      buttons: [
        { text: 'Cancel', style: 'cancel', onPress: () => {} },
        { text: 'Sign out', style: 'destructive', onPress: () => navigation.navigate('Login') },
      ],
    })
  }
  const displayedPosts = posts.filter((p) => p.author === displayUsername)

  return (
    <View style={styles.container}>
      <View style={[styles.topbar, { paddingTop: 14 + insets.top }]}>
        {!isOwnProfile ? (
          <TouchableOpacity
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack()
                return
              }
              const tabNav = navigation.getParent()
              if (tabNav?.canGoBack?.()) {
                tabNav.goBack()
                return
              }
              navigation.setParams({ profileUsername: undefined })
            }}
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
                onPress={() =>
                  navigation.navigate('ProfilePosts', {
                    profileUsername: displayUsername,
                    initialPostId: post.id,
                  })
                }
              >
                {src && <Image source={src} style={styles.postGridImg} resizeMode="cover" />}
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>
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
})
