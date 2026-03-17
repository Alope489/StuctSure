import { useState, useRef } from 'react'
import { View, Text, ScrollView, StyleSheet, Image, useWindowDimensions, Dimensions } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

const demoPosts = [
  { id: '1', author: 'Mia Chen', time: '1 hour ago', title: 'Exterior foundation crack at Riverside Plaza', likes: 292, comments: 598, images: [{ url: 'https://images.unsplash.com/photo-1740921303129-126a783b9c6c?auto=format&fit=crop&w=1400&q=70' }, { url: 'https://images.unsplash.com/photo-1740921303048-6b8f232a91ff?auto=format&fit=crop&w=1400&q=70' }] },
  { id: '2', author: 'Jordan Rivera', time: '4 hours ago', title: 'Cracked window at Cityline Bus Terminal', likes: 84, comments: 31, images: [{ url: 'https://images.unsplash.com/photo-1646310585298-8a9b8ada20c5?auto=format&fit=crop&w=1400&q=70' }] },
  { id: '3', author: 'Ayesha Patel', time: 'Yesterday', title: 'Water damage in parking garage stairwell', likes: 137, comments: 62, images: [{ url: 'https://images.unsplash.com/photo-1724230442705-646dc7c86943?auto=format&fit=crop&w=1400&q=70' }, { url: 'https://images.unsplash.com/photo-1768573264138-6a67ddce05cd?auto=format&fit=crop&w=1400&q=70' }, { url: 'https://images.unsplash.com/photo-1768573264138-6a67ddce05cd?auto=format&fit=crop&w=1400&q=70' }] },
]

function PostCard({ post }) {
  const { width: winWidth } = useWindowDimensions()
  const width = winWidth || Dimensions.get('window').width
  const slideWidth = Math.max(width - 52, 280)
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollRef = useRef(null)
  const initial = (post.author || '?').trim().slice(0, 1).toUpperCase()
  const images = post.images ?? []
  const onScroll = (e) => {
    const offset = e.nativeEvent.contentOffset.x
    const idx = Math.round(offset / slideWidth)
    if (idx >= 0 && idx < images.length) setActiveIndex(idx)
  }
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
      {images.length > 0 ? (
        <View style={[styles.galleryWrap, { width: slideWidth }]}>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled
            onScroll={onScroll}
            scrollEventThrottle={100}
          >
            {images.map((img, idx) => (
              <View key={idx} style={[styles.slide, { width: slideWidth }]}>
                <Image source={{ uri: img.url }} style={styles.postImage} resizeMode="cover" />
              </View>
            ))}
          </ScrollView>
          {images.length > 1 ? (
            <View style={styles.dots}>
              {images.map((_, idx) => (
                <View key={idx} style={[styles.dot, activeIndex === idx && styles.dotActive]} />
              ))}
            </View>
          ) : null}
        </View>
      ) : null}
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
  galleryWrap: { marginBottom: 10, borderRadius: 12, overflow: 'hidden' },
  postGallery: { height: 200, borderRadius: 12 },
  slide: { height: 200 },
  postImage: { width: '100%', height: 200, borderRadius: 0, backgroundColor: 'rgba(255,255,255,0.05)' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.3)' },
  dotActive: { backgroundColor: '#00ff7f', width: 8, height: 8, borderRadius: 4 },
  title: { fontSize: 16, fontWeight: '600', color: '#e0e0e0', marginBottom: 10 },
  actions: { flexDirection: 'row', gap: 18 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { color: '#888', fontSize: 13 },
})
