import { createNativeStackNavigator } from '@react-navigation/native-stack'
import SearchMainScreen from '../screens/SearchMainScreen'
import BuildingPostsScreen from '../screens/BuildingPostsScreen'

const Stack = createNativeStackNavigator()

export default function SearchStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0d0d0d' },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="SearchMain" component={SearchMainScreen} />
      <Stack.Screen name="SearchPosts" component={BuildingPostsScreen} />
    </Stack.Navigator>
  )
}
