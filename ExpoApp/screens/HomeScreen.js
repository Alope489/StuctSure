import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

const demoPosts = [
  { id: '1', author: 'Mia Chen', time: '1 hour ago', title: 'Exterior foundation crack at Riverside Plaza', likes: 292, comments: 598 },
  { id: '2', author: 'Jordan Rivera', time: '4 hours ago', title: 'Cracked window at Cityline Bus Terminal', likes: 84, comments: 31 },
]

function PostCard({ post }) {
  const initial = (post.author || '?').trim().slice(0, 1).toUpperCase()
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.meta}>
          <Text style={styles.author}>{post.author}</Text>
          <Text style={styles.time}>{post.time}</Text>
        </View>
      </View>
      <Text style={styles.title}>{post.title}</Text>
      <View style={styles.actions}>
        <View style={styles.actionRow}>
          <Ionicons name="heart-outline" size={18} color="#00ff7f" />
          <Text style={styles.actionText}>{post.likes}</Text>
        </View>
        <View style={styles.actionRow}>
          <Ionicons name="chatbubble-outline" size={18} color="#888" />
          <Text style={styles.actionText}>{post.comments}</Text>
        </View>
      </View>
    </View>
  )
}

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.topbar}>
        <Text style={styles.brand}>StructSure</Text>
      </View>
      <ScrollView style={styles.feed} contentContainerStyle={styles.feedContent}>
        {demoPosts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d' },
  topbar: { padding: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  brand: { fontSize: 18, fontWeight: '600', color: '#e0e0e0' },
  feed: { flex: 1 },
  feedContent: { padding: 14, gap: 14 },
  card: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(0,255,127,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  avatarText: { color: '#e0e0e0', fontWeight: '700' },
  meta: {},
  author: { fontSize: 14, fontWeight: '600', color: '#e0e0e0' },
  time: { fontSize: 12, color: '#888' },
  title: { fontSize: 16, fontWeight: '600', color: '#e0e0e0', marginBottom: 10 },
  actions: { flexDirection: 'row', gap: 18 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { color: '#888', fontSize: 13 },
})
