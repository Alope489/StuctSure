import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { useApp } from '../context/AppContext'

export default function LoginScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()
  const { loginWithSupabase, hasAuthConfigured, authBusy, lastError, refreshPosts, operationErrors } = useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState(null)

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={[styles.label, { top: 48 + insets.top }]}>login</Text>
      <View style={styles.content}>
        <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" accessibilityLabel="StructSure" />
        <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#888" autoCapitalize="none" autoCorrect={false} value={email} onChangeText={setEmail} keyboardType="email-address" />
        <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#888" secureTextEntry value={password} onChangeText={setPassword} />
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={async () => {
            if (!hasAuthConfigured) {
              setLocalError('Supabase is not configured for this build.')
              return
            }
            if (!email.trim() || !password) {
              setLocalError('Enter your email and password.')
              return
            }
            setLocalError(null)
            try {
              await loginWithSupabase(email, password)
              await refreshPosts()
              navigation.replace('Main')
            } catch (error) {
              setLocalError(error.message || 'Login failed.')
            }
          }}
          disabled={authBusy || !email.trim() || !password || !hasAuthConfigured}
        >
          {authBusy ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Login</Text>}
        </TouchableOpacity>
        {!hasAuthConfigured ? <Text style={styles.divider}>Supabase is not configured for this build.</Text> : null}
        {localError || operationErrors.auth || lastError ? <Text style={styles.errorText}>{localError || operationErrors.auth || lastError}</Text> : null}
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
  input: { backgroundColor: '#333', color: '#e0e0e0', borderRadius: 12, padding: 14, width: '100%', maxWidth: 320, marginBottom: 16, fontSize: 16, opacity: 0.7 },
  btnPrimary: { backgroundColor: '#00a0a0', borderRadius: 12, padding: 14, width: '100%', maxWidth: 320, alignItems: 'center', marginTop: 8, minHeight: 50, justifyContent: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  divider: { fontSize: 14, color: '#888', marginVertical: 12 },
  footer: { fontSize: 14, color: '#888', marginTop: 28 },
  link: { color: '#00ffff', fontWeight: '500' },
  errorText: { color: '#ff7d7d', marginTop: 12, textAlign: 'center', maxWidth: 320 },
})
