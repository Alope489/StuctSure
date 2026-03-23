import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

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

const DEFAULT_USER = { photo: null }

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

  return (
    <View style={styles.container}>
      <View style={[styles.topbar, { paddingTop: 14 + insets.top }]}>
        <Text style={styles.brand}>StructSure</Text>
        <TouchableOpacity style={styles.profileBtn} activeOpacity={0.7}>
          {DEFAULT_USER.photo ? (
            <Image source={{ uri: DEFAULT_USER.photo }} style={styles.profilePic} />
          ) : (
            <View style={styles.profilePicPlaceholder}>
              <Ionicons name="person" size={22} color="#888" />
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {demoNotifications.map((item) => (
          <NotificationItem key={item.id} item={item} />
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingBottom: 12,
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  brand: { fontSize: 18, fontWeight: '600', color: '#fff' },
  profileBtn: { padding: 4 },
  profilePic: { width: 36, height: 36, borderRadius: 18 },
  profilePicPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  name: { fontWeight: '600', color: '#fff', fontSize: 15 },
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
