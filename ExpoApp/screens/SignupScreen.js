import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { useApp } from '../context/AppContext'

export default function SignupScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()
  const { signupWithSupabase, authBusy, hasAuthConfigured, lastError, refreshPosts, operationErrors } = useApp()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [localError, setLocalError] = useState(null)

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={[styles.label, { top: 48 + insets.top }]}>signup</Text>
      <View style={styles.content}>
        <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" accessibilityLabel="StructSure" />
        <TextInput style={styles.input} placeholder="Username" placeholderTextColor="#888" autoCapitalize="none" autoCorrect={false} value={username} onChangeText={setUsername} />
        <TextInput style={styles.input} placeholder="user@domain.com" placeholderTextColor="#888" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} value={email} onChangeText={setEmail} />
        <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#888" secureTextEntry value={password} onChangeText={setPassword} />
        <TextInput style={styles.input} placeholder="Confirm password" placeholderTextColor="#888" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={async () => {
            if (!hasAuthConfigured) {
              setLocalError('Supabase is not configured for this build.')
              return
            }
            if (!username.trim() || !email.trim() || !password || !confirmPassword) {
              setLocalError('Fill out all signup fields.')
              return
            }
            if (password !== confirmPassword) {
              setLocalError('Passwords do not match.')
              return
            }
            setLocalError(null)
            try {
              await signupWithSupabase(email, password, username)
              await refreshPosts()
              navigation.replace('Main')
            } catch (error) {
              setLocalError(error.message || 'Signup failed.')
            }
          }}
          disabled={authBusy || !username.trim() || !email.trim() || !password || !confirmPassword}
        >
          {authBusy ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create account</Text>}
        </TouchableOpacity>
        <Text style={styles.divider}>{hasAuthConfigured ? 'Supabase handles account creation and sign-in.' : 'Supabase is not configured for this build.'}</Text>
        <TouchableOpacity style={styles.btnSecondary} onPress={() => navigation.navigate('Login')} disabled={authBusy}>
          <Text style={styles.btnText}>Go to Login</Text>
        </TouchableOpacity>
        {localError || operationErrors.auth || lastError ? <Text style={styles.errorText}>{localError || operationErrors.auth || lastError}</Text> : null}
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
  btnSecondary: { backgroundColor: '#555', borderRadius: 12, padding: 14, width: '100%', maxWidth: 320, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  divider: { fontSize: 14, color: '#888', marginVertical: 12, textAlign: 'center', maxWidth: 320 },
  errorText: { color: '#ff7d7d', marginTop: 12, textAlign: 'center', maxWidth: 320 },
})
