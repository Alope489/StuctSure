import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'

export default function LoginScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={[styles.label, { top: 48 + insets.top }]}>login</Text>
      <View style={styles.content}>
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="StructSure"
        />
        <TextInput style={styles.input} placeholder="username" placeholderTextColor="#888" />
        <TextInput style={styles.input} placeholder="••••••••" placeholderTextColor="#888" secureTextEntry />
        <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.replace('Main')}>
          <Text style={styles.btnText}>Login</Text>
        </TouchableOpacity>
        <Text style={styles.divider}>Or login with</Text>
        <TouchableOpacity style={styles.btnSecondary}>
          <Text style={styles.btnText}>Google</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.footer}>Don't have an account? <Text style={styles.link}>Signup</Text></Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d', padding: 24 },
  label: { position: 'absolute', left: 24, fontSize: 14, color: '#888' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 48 },
  logo: { height: 140, width: 220, maxWidth: '90%', marginBottom: 32 },
  input: { backgroundColor: '#333', color: '#e0e0e0', borderRadius: 12, padding: 14, width: '100%', maxWidth: 320, marginBottom: 16, fontSize: 16 },
  btnPrimary: { backgroundColor: '#00a0a0', borderRadius: 12, padding: 14, width: '100%', maxWidth: 320, alignItems: 'center', marginTop: 8 },
  btnSecondary: { backgroundColor: '#555', borderRadius: 12, padding: 14, width: '100%', maxWidth: 320, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  divider: { fontSize: 14, color: '#888', marginVertical: 12 },
  footer: { fontSize: 14, color: '#888', marginTop: 28 },
  link: { color: '#00ffff', fontWeight: '500' },
})
