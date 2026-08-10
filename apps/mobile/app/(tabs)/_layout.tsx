import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    home: '🏠',
    spin: '🎡',
    lockets: '📸',
    profile: '👤',
  };

  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 20, transform: [{ scale: focused ? 1.1 : 1 }] }}>
        {icons[name] || '•'}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#D97706',
        tabBarInactiveTintColor: '#A8A29E',
        tabBarStyle: {
          backgroundColor: '#FFF8E7',
          borderTopColor: '#E7E5E4',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: { backgroundColor: '#FFF8E7' },
        headerTintColor: '#D97706',
        headerTitleStyle: { fontWeight: '600' as const },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="spin"
        options={{
          title: 'Quay',
          tabBarIcon: ({ focused }) => <TabIcon name="spin" focused={focused} />,
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="lockets"
        options={{
          title: 'Lockets',
          tabBarIcon: ({ focused }) => <TabIcon name="lockets" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Hồ sơ',
          tabBarIcon: ({ focused }) => <TabIcon name="profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
