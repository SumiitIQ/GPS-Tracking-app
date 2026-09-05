import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Theme } from '../../theme/Theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(247, 249, 252, 0.9)', // surface with opacity
          borderTopColor: 'rgba(197, 198, 202, 0.3)', // outlineVariant/30
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 85 : 65,
          position: 'absolute', // For blur effect
          elevation: 0,
        },
        tabBarActiveTintColor: Theme.colors.secondary,
        tabBarInactiveTintColor: Theme.colors.onSurfaceVariant,
        tabBarLabelStyle: {
          ...Theme.typography.labelCaps,
          marginTop: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="explore" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="record"
        options={{
          title: 'Record',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="fiber-manual-record" size={28} color={Theme.colors.secondary} />,
        }}
      />
      <Tabs.Screen
        name="navigate"
        options={{
          title: 'Navigate',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="terrain" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color, size }) => <MaterialIcons name="directions-run" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
