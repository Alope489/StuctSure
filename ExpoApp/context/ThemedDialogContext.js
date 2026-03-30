import { createContext, useCallback, useContext, useState } from 'react'
import { Modal, View, Text, TouchableOpacity, Pressable, StyleSheet, ScrollView } from 'react-native'

const ThemedDialogContext = createContext(null)

export function ThemedDialogProvider({ children }) {
  const [config, setConfig] = useState(null)

  const hide = useCallback(() => setConfig(null), [])

  const showThemedDialog = useCallback((opts) => {
    setConfig({
      title: opts.title || '',
      message: opts.message || '',
      buttons: opts.buttons || [{ text: 'OK', onPress: () => {} }],
    })
  }, [])

  return (
    <ThemedDialogContext.Provider value={showThemedDialog}>
      {children}
      <Modal visible={!!config} transparent animationType="fade" onRequestClose={hide}>
        <Pressable style={styles.backdrop} onPress={hide}>
          <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
            {config?.title ? <Text style={styles.title}>{config.title}</Text> : null}
            {config?.message ? (
              <ScrollView style={styles.messageScroll} keyboardShouldPersistTaps="handled">
                <Text style={styles.message}>{config.message}</Text>
              </ScrollView>
            ) : null}
            <View style={styles.actions}>
              {(config?.buttons || []).map((b, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.btn,
                    b.style === 'destructive' && styles.btnDestructive,
                    b.style === 'cancel' && styles.btnCancel,
                  ]}
                  onPress={() => {
                    setConfig(null)
                    setTimeout(() => b.onPress?.(), 0)
                  }}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.btnText,
                      b.style === 'destructive' && styles.btnTextDestructive,
                      b.style === 'cancel' && styles.btnTextCancel,
                    ]}
                  >
                    {b.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ThemedDialogContext.Provider>
  )
}

export function useThemedDialog() {
  const fn = useContext(ThemedDialogContext)
  if (!fn) throw new Error('useThemedDialog must be used within ThemedDialogProvider')
  return fn
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#12161a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 20,
    maxHeight: '80%',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e8eef2',
    marginBottom: 10,
  },
  messageScroll: { maxHeight: 200, marginBottom: 16 },
  message: {
    fontSize: 15,
    color: 'rgba(224,232,240,0.88)',
    lineHeight: 22,
  },
  actions: { gap: 10 },
  btn: {
    backgroundColor: 'rgba(0,255,127,0.14)',
    borderWidth: 1,
    borderColor: '#00ff7f',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnDestructive: {
    backgroundColor: 'rgba(255,80,80,0.12)',
    borderColor: 'rgba(255,100,100,0.55)',
  },
  btnCancel: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.12)',
  },
  btnText: { fontSize: 16, fontWeight: '600', color: '#00ff7f' },
  btnTextDestructive: { color: '#ff8a8a' },
  btnTextCancel: { color: '#9aa4ae', fontWeight: '500' },
})
