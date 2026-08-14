import { Tabs } from 'expo-router';
import { View, Text, Platform } from 'react-native';

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
        headerShown: false,
        tabBarActiveTintColor: '#b52330', // Brand Primary Red
        tabBarInactiveTintColor: '#5a403f',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e2bebc',
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 6,
          shadowColor: '#1e1b13',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.06,
          shadowRadius: 6,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '800',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          headerTitle: '🍜 Food Roulette',
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="spin"
        options={{
          title: 'Vòng quay',
          headerTitle: '🎡 Quay Món Hôm Nay',
          tabBarIcon: ({ focused }) => <TabIcon name="spin" focused={focused} />,
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="lockets"
        options={{
          title: 'Locket',
          headerTitle: '📸 Taste Board Bạn Bè',
          tabBarIcon: ({ focused }) => <TabIcon name="lockets" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Hồ sơ',
          headerTitle: '👤 Khẩu Vị Cá Nhân',
          tabBarIcon: ({ focused }) => <TabIcon name="profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
