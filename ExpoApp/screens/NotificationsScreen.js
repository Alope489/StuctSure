import { useState } from 'react'
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { useApp } from '../context/AppContext'
import { AccountSidePanel } from '../components/AccountSidePanel'

const demoNotifications = [
  { id: 'n1', name: 'Jane Cooper', message: 'OMG! 😱 ...', time: '24m', unread: true },
  { id: 'n2', name: 'Jenny Wilson', message: 'Upvoted your post', time: '2h', unread: true },
  { id: 'n3', name: 'Esther Howard', message: 'Upvoted your post', time: '8h', unread: false },
  { id: 'n4', name: 'Leslie Alexander', message: 'Upvoted your post', time: '2h ago', unread: false },
  { id: 'n5', name: 'Savannah Nguyen', message: 'Upvoted your post', time: '2d', unread: false },
  { id: 'n6', name: 'Darlene Robertson', message: 'I walked by just the other...', time: '2d', unread: false },
  { id: 'n7', name: 'Marvin McKinney', message: 'Upvoted your post', time: '2w', unread: false },
  { id: 'n8', name: 'Kathryn Murphy', message: 'They need to fix it soon!...', time: '2w', unread: false },
]

function NotificationItem({ item }) {
  const initial = (item.name || '?').trim().slice(0, 1).toUpperCase()

  return (
    <TouchableOpacity style={styles.item} activeOpacity={0.7}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.message}>
          <Text style={styles.name}>{item.name} </Text>
          {item.message} <Text style={styles.time}>{item.time}</Text>
        </Text>
      </View>
      {item.unread && <View style={styles.dot} />}
    </TouchableOpacity>
  )
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()
  const { user } = useApp()
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <View style={styles.container}>
      <View style={[styles.topbar, { paddingTop: 14 + insets.top }]}>
        <Image
          source={require('../assets/StructSure-Logo-Horizontal.png')}
          style={styles.brandLogo}
          resizeMode="contain"
          accessibilityLabel="StructSure"
        />
        <TouchableOpacity onPress={() => setProfileOpen(true)} style={styles.profileBtn} activeOpacity={0.7} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Image source={user?.photo ? { uri: user.photo } : require('../assets/johndoe.png')} style={styles.profilePic} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {demoNotifications.map((item) => (
          <NotificationItem key={item.id} item={item} />
        ))}
      </ScrollView>

      <AccountSidePanel visible={profileOpen} onClose={() => setProfileOpen(false)} navigation={navigation} />
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
    backgroundColor: '#0d0d0d',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  brandLogo: { height: 28, width: 168, maxWidth: '58%' },
  profileBtn: { padding: 4 },
  profilePic: { width: 40, height: 40, borderRadius: 20 },
  list: { flex: 1 },
  listContent: { padding: 14 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,255,127,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#e0e0e0', fontWeight: '700', fontSize: 16 },
  content: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline' },
  name: { fontWeight: '600', color: '#e8eef2', fontSize: 15 },
  message: { color: '#888', fontSize: 14 },
  time: { color: '#888', fontSize: 13 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00ff7f',
    marginLeft: 8,
  },
})
