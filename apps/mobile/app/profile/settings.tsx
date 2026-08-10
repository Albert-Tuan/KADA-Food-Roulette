import { Switch, Text, View } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileSettingsScreen() {
  const [newLocketNotifications, setNewLocketNotifications] = useState(true);
  const [groupNotifications, setGroupNotifications] = useState(true);

  return (
    <SafeAreaView className="flex-1 bg-background p-5" edges={['bottom']}>
      <Text className="text-secondary-500 mb-5">Cài đặt trên thiết bị này.</Text>
      <SettingRow label="Taste Board mới" value={newLocketNotifications} onChange={setNewLocketNotifications} />
      <SettingRow label="Hoạt động nhóm" value={groupNotifications} onChange={setGroupNotifications} />
      <View className="bg-primary-50 rounded-2xl p-4 mt-6">
        <Text className="font-semibold text-secondary-900">Quyền riêng tư</Text>
        <Text className="text-secondary-600 leading-5 mt-2">Bạn chọn người xem riêng cho từng Taste Board trước khi đăng.</Text>
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
