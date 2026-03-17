import { useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'

export default function LoadingScreen() {
  const navigation = useNavigation()

  useEffect(() => {
    const t = setTimeout(() => navigation.replace('Login'), 2200)
    return () => clearTimeout(t)
  }, [navigation])

  return (
    <View style={styles.container}>
      <Text style={styles.label}>loading</Text>
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
    top: 48,
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
