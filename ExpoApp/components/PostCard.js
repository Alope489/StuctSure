import { useState, useRef } from 'react'
import { View, Text, ScrollView, StyleSheet, Image, useWindowDimensions, Dimensions, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { getImageSource, getResolutionStatus } from '../data/posts'

/**
 * @param {object} props
 * @param {object} props.post
 * @param {boolean} props.isUpvoted
 * @param {(id: string) => void} props.onUpvote
 * @param {(id: string) => void} props.onComment
 * @param {number} props.displayCommentCount
 * @param {(p: object) => void} [props.onPostMenu]
 * @param {() => void} [props.onBuildingPress]
 * @param {string} [props.buildingLabel]
 * @param {() => void} [props.onAuthorPress]
 */
export function PostCard({
  post,
  isUpvoted,
  onUpvote,
  onComment,
  displayCommentCount,
  onPostMenu,
  onBuildingPress,
  buildingLabel,
  onAuthorPress,
}) {
  const { width: winWidth } = useWindowDimensions()
  const width = winWidth || Dimensions.get('window').width
  const slideWidth = Math.max(width - 52, 280)
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollRef = useRef(null)
  const initial = (post.author || '?').trim().slice(0, 1).toUpperCase()
  const images = post.images ?? []
  const displayCount = post.likes + (isUpvoted ? 1 : 0)
  const onScroll = (e) => {
    const offset = e.nativeEvent.contentOffset.x
    const idx = Math.round(offset / slideWidth)
    if (idx >= 0 && idx < images.length) setActiveIndex(idx)
  }
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <TouchableOpacity
          style={styles.cardAuthorHit}
          onPress={onAuthorPress}
          activeOpacity={0.7}
          disabled={!onAuthorPress}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.meta}>
            <Text style={styles.author}>{post.author}</Text>
            <Text style={styles.time}>{post.time}</Text>
          </View>
        </TouchableOpacity>
        {onPostMenu && (
          <TouchableOpacity onPress={() => onPostMenu(post)} style={styles.menuBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="ellipsis-vertical" size={20} color="#888" />
          </TouchableOpacity>
        )}
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
                <Image source={getImageSource(img)} style={styles.postImage} resizeMode="cover" />
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
      {post.body ? <Text style={styles.body}>{post.body}</Text> : null}
      {onBuildingPress && buildingLabel ? (
        <TouchableOpacity style={styles.buildingLink} onPress={onBuildingPress} activeOpacity={0.7}>
          <Ionicons name="business-outline" size={16} color="#00ff7f" />
          <Text style={styles.buildingLinkText}>{buildingLabel}</Text>
          <Ionicons name="chevron-forward" size={16} color="#666" />
        </TouchableOpacity>
      ) : null}
      <View style={styles.tagsRow}>
        <View
          style={[
            styles.tagChip,
            getResolutionStatus(post) === 'resolved' ? styles.tagChipResolved : styles.tagChipUnresolved,
          ]}
        >
          <Text style={styles.tagChipTextMuted}>{getResolutionStatus(post)}</Text>
        </View>
        {(post.tags || []).map((tag) => (
          <View key={tag} style={styles.tagChip}>
            <Text style={styles.tagChipText}>{tag}</Text>
          </View>
        ))}
        {(post.tagsMore || 0) > 0 && (
          <View style={styles.tagChip}>
            <Text style={styles.tagChipText}>{post.tagsMore}</Text>
          </View>
        )}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionRow} onPress={() => onUpvote(post.id)} activeOpacity={0.6}>
          <Ionicons name={isUpvoted ? 'arrow-up' : 'arrow-up-outline'} size={20} color={isUpvoted ? '#00ff7f' : '#888'} />
          <Text style={[styles.actionText, isUpvoted && styles.actionTextActive]}>{displayCount}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionRow} onPress={() => onComment(post.id)} activeOpacity={0.6}>
          <Ionicons name="chatbubble-outline" size={18} color="#888" />
          <Text style={styles.actionText}>{displayCommentCount}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  cardAuthorHit: { flexDirection: 'row', alignItems: 'center', marginRight: 8 },
  menuBtn: { marginLeft: 'auto', padding: 4 },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,255,127,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: { color: '#e0e0e0', fontWeight: '700' },
  meta: {},
  author: { fontSize: 14, fontWeight: '600', color: '#e0e0e0' },
  time: { fontSize: 12, color: '#888' },
  galleryWrap: { marginBottom: 10, borderRadius: 12, overflow: 'hidden' },
  slide: { height: 200 },
  postImage: { width: '100%', height: 200, borderRadius: 0, backgroundColor: 'rgba(255,255,255,0.05)' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.3)' },
  dotActive: { backgroundColor: '#00ff7f', width: 8, height: 8, borderRadius: 4 },
  title: { fontSize: 16, fontWeight: '600', color: '#e0e0e0', marginBottom: 8 },
  body: { fontSize: 13, color: 'rgba(224,224,224,0.9)', lineHeight: 20, marginBottom: 10 },
  buildingLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(0,255,127,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,127,0.2)',
  },
  buildingLinkText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#00ff7f' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  tagChipResolved: { borderColor: 'rgba(0,255,127,0.35)', backgroundColor: 'rgba(0,255,127,0.12)' },
  tagChipUnresolved: { borderColor: 'rgba(255,193,7,0.45)', backgroundColor: 'rgba(255,193,7,0.1)' },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(0,255,127,0.4)',
    backgroundColor: 'rgba(0,255,127,0.1)',
    marginRight: 8,
    marginBottom: 8,
  },
  tagChipText: { fontSize: 12, color: '#00ff7f' },
  tagChipTextMuted: { fontSize: 12, color: '#c8e6c9', textTransform: 'capitalize' },
  actions: { flexDirection: 'row', gap: 18 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { color: '#888', fontSize: 13 },
  actionTextActive: { color: '#00ff7f' },
})
