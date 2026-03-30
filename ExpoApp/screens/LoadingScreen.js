import { useEffect } from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
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
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="StructSure"
        />
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
  logo: { height: 180, width: 240, maxWidth: '88%' },
})
