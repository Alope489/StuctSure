import { useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'

export default function LoadingScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()

  useEffect(() => {
    const t = setTimeout(() => navigation.replace('Login'), 2200)
    return () => clearTimeout(t)
  }, [navigation])

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={[styles.label, { top: 48 + insets.top }]}>loading</Text>
      <View style={styles.logoWrap}>
        <Text style={styles.logoText}>StructSure</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
    padding: 24,
    justifyContent: 'center',
  },
  label: {
    position: 'absolute',
    left: 24,
    fontSize: 14,
    color: '#888',
    textTransform: 'lowercase',
  },
  logoWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#00ff7f',
  },
})
