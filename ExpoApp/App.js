import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { NavigationContainer, DarkTheme } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'

import { AppProvider } from './context/AppContext'
import { ThemedDialogProvider } from './context/ThemedDialogContext'
import LoadingScreen from './screens/LoadingScreen'
import LoginScreen from './screens/LoginScreen'
import SignupScreen from './screens/SignupScreen'
import HomeScreen from './screens/HomeScreen'
import SearchStack from './navigation/SearchStack'
import NewPostScreen from './screens/NewPostScreen'
import NotificationsScreen from './screens/NotificationsScreen'
import ProfileStack from './navigation/ProfileStack'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0d0d0d',
    card: '#0d0d0d',
  },
}

const stackScreenOpts = {
  headerShown: false,
  contentStyle: { backgroundColor: '#0d0d0d' },
  animation: 'fade',
}

function MainTabs() {
  return (
    <Tab.Navigator
      backBehavior="history"
      screenOptions={{
        headerShown: false,
        freezeOnBlur: true,
        lazy: false,
        tabBarStyle: { backgroundColor: '#0d0d0d', borderTopColor: 'rgba(255,255,255,0.08)' },
        tabBarActiveTintColor: '#00ff7f',
        tabBarInactiveTintColor: '#888',
        tabBarShowLabel: false,
        sceneStyle: { backgroundColor: '#0d0d0d' },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} /> }}
      />
      <Tab.Screen
        name="Search"
        component={SearchStack}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} /> }}
      />
      <Tab.Screen
        name="NewPost"
        component={NewPostScreen}
        options={{
          title: 'New',
          tabBarIcon: ({ color, size }) => <Ionicons name="add-circle" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'notifications' : 'notifications-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} /> }}
      />
    </Tab.Navigator>
  )
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navTheme}>
        <StatusBar style="light" />
        <AppProvider>
          <ThemedDialogProvider>
            <Stack.Navigator screenOptions={stackScreenOpts}>
              <Stack.Screen name="Loading" component={LoadingScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Signup" component={SignupScreen} />
              <Stack.Screen name="Main" component={MainTabs} />
            </Stack.Navigator>
          </ThemedDialogProvider>
        </AppProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}
