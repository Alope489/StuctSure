import { useState, useMemo, useCallback } from 'react'
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { useApp } from '../context/AppContext'
import { AccountSidePanel } from '../components/AccountSidePanel'

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()
  const { user, posts, refreshPosts, feedLoading } = useApp()
  const [profileOpen, setProfileOpen] = useState(false)
  const activityNotifications = useMemo(
    () =>
      [
        ...posts
          .filter((post) => post.author === (user?.username || 'johndoe') && Number(post.likes || 0) > 0)
          .map((post) => ({
            id: `${post.id}-upvotes`,
            kind: 'upvote',
            count: Number(post.likes || 0),
            title: post.title || 'Untitled report',
            time: post.time || 'Recently',
          })),
        ...posts
          .filter((post) => post.author === (user?.username || 'johndoe') && Number(post.comments || 0) > 0)
          .map((post) => ({
            id: `${post.id}-comments`,
            kind: 'comment',
            count: Number(post.comments || 0),
            title: post.title || 'Untitled report',
            time: post.time || 'Recently',
          })),
      ].sort((a, b) => b.count - a.count),
    [posts, user?.username]
  )

  useFocusEffect(
    useCallback(() => {
      refreshPosts()
    }, [refreshPosts])
  )

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

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={feedLoading} onRefresh={refreshPosts} tintColor="#00ff7f" />}
      >
        {feedLoading ? <ActivityIndicator color="#00ff7f" style={styles.notificationsLoading} /> : null}
        {activityNotifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No notifications yet</Text>
            <Text style={styles.emptyStateBody}>
              When people upvote or comment on your reports, notifications will appear here.
            </Text>
            <TouchableOpacity style={styles.emptyStateRefreshBtn} onPress={refreshPosts} activeOpacity={0.7}>
              <Ionicons name="refresh" size={18} color="#00ff7f" />
              <Text style={styles.emptyStateRefreshText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        ) : (
          activityNotifications.map((item) => (
            <View key={item.id} style={styles.notificationCard}>
              <View style={[styles.notificationIconWrap, item.kind === 'comment' && styles.notificationIconWrapComment]}>
                <Ionicons
                  name={item.kind === 'comment' ? 'chatbubble-outline' : 'arrow-up'}
                  size={16}
                  color={item.kind === 'comment' ? '#4cc9f0' : '#00ff7f'}
                />
              </View>
              <View style={styles.notificationBody}>
                <Text style={styles.notificationTitle}>
                  {item.kind === 'comment'
                    ? item.count === 1
                      ? '1 new comment on your report'
                      : `${item.count} new comments on your report`
                    : item.count === 1
                      ? '1 new upvote on your report'
                      : `${item.count} new upvotes on your report`}
                </Text>
                <Text style={styles.notificationSubtitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.notificationTime}>{item.time}</Text>
              </View>
            </View>
          ))
        )}
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
  notificationsLoading: { marginBottom: 10 },
  emptyState: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
  },
  emptyStateTitle: { color: '#e0e0e0', fontSize: 16, fontWeight: '600' },
  emptyStateBody: { color: '#888', fontSize: 13, textAlign: 'center' },
  emptyStateRefreshBtn: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(0,255,127,0.35)',
    backgroundColor: 'rgba(0,255,127,0.08)',
  },
  emptyStateRefreshText: { color: '#00ff7f', fontSize: 14, fontWeight: '600' },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 12,
    marginBottom: 10,
    gap: 10,
  },
  notificationIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,255,127,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,127,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  notificationBody: { flex: 1 },
  notificationIconWrapComment: {
    backgroundColor: 'rgba(76,201,240,0.12)',
    borderColor: 'rgba(76,201,240,0.25)',
  },
  notificationTitle: { color: '#e0e0e0', fontSize: 14, fontWeight: '600' },
  notificationSubtitle: { color: '#9aa0a6', fontSize: 13, marginTop: 3 },
  notificationTime: { color: '#6e7378', fontSize: 12, marginTop: 6 },
})
