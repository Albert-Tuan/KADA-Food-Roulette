import { useState } from 'react';
import { Switch, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function ProfileSettingsScreen() {
  const router = useRouter();
  const [newTasteBoardNotifications, setNewTasteBoardNotifications] = useState(true);
  const [groupNotifications, setGroupNotifications] = useState(true);

  return (
    <SafeAreaView testID="profile-settings-screen" className="flex-1 bg-background" edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Top Header */}
      <View className="flex-row items-center justify-between px-5 py-3 border-b border-secondary-100 bg-surface-white mb-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 rounded-xl border border-secondary-200"
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={20} color="#b52330" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-secondary-900">Cài đặt</Text>
        <View style={{ width: 36 }} />
      </View>

      <View className="p-5">
        <Text className="text-secondary-500 mb-5">Cài đặt trên thiết bị này.</Text>
        <SettingRow label="Taste Board mới" value={newTasteBoardNotifications} onChange={setNewTasteBoardNotifications} />
        <SettingRow label="Hoạt động nhóm" value={groupNotifications} onChange={setGroupNotifications} />
        <View className="bg-primary-50 rounded-2xl p-4 mt-6">
          <Text className="font-semibold text-secondary-900">Quyền riêng tư</Text>
          <Text className="text-secondary-600 leading-5 mt-2">Bạn chọn người xem riêng cho từng Taste Board trước khi đăng.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function SettingRow({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <View className="flex-row items-center bg-white border border-secondary-100 rounded-2xl p-4 mb-3">
      <Text className="flex-1 text-secondary-900 font-semibold">{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ false: '#D4C5B5', true: '#D4A574' }} thumbColor={value ? '#C68E17' : '#F5F0EB'} />
    </View>
  );
}
