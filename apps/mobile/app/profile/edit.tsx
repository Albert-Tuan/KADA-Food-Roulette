import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useMyProfile, useUpdateProfile } from '@/features/profile';

const MAX_BIO_LENGTH = 160;

export default function EditProfileScreen() {
  const profile = useMyProfile();
  const updateProfile = useUpdateProfile();
  const [avatarUri, setAvatarUri] = useState<string>();
  const [privateName, setPrivateName] = useState('');
  const [publicName, setPublicName] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!profile.data) return;
    setAvatarUri(profile.data.avatarUrl);
    setPrivateName(profile.data.displayNamePrivate);
    setPublicName(profile.data.displayNamePublic);
    setBio(profile.data.bio ?? '');
  }, [profile.data]);

  const chooseAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Cần cấp quyền truy cập ảnh để đổi avatar.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!publicName.trim()) {
      setError('Tên công khai không được để trống.');
      return;
    }
    if (!privateName.trim()) {
      setError('Tên trong nhóm không được để trống.');
      return;
    }
    if (bio.length > MAX_BIO_LENGTH) {
      setError(`Bio tối đa ${MAX_BIO_LENGTH} ký tự.`);
      return;
    }
    try {
      setError('');
      await updateProfile.mutateAsync({
        avatarUri,
        displayNamePrivate: privateName,
        displayNamePublic: publicName,
        bio,
      });
      router.back();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Chưa lưu được profile.');
    }
  };

  if (profile.isLoading) {
    return <SafeAreaView className="flex-1 bg-background items-center justify-center"><ActivityIndicator color="#C68E17" /></SafeAreaView>;
  }
  if (profile.isError || !profile.data) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-8">
        <Text className="text-xl font-bold text-secondary-900">Chưa tải được profile</Text>
        <TouchableOpacity onPress={() => profile.refetch()} className="bg-primary rounded-xl px-6 py-3 mt-5">
          <Text className="text-white font-semibold">Thử lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView testID="profile-edit-screen" className="flex-1 bg-background" edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Top Header */}
      <View className="flex-row items-center justify-between px-5 py-3 border-b border-secondary-100 bg-surface-white">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 rounded-xl border border-secondary-200"
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={20} color="#b52330" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-secondary-900">Chỉnh sửa hồ sơ</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <View className="items-center">
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} className="w-28 h-28 rounded-full bg-secondary-100" />
            ) : (
              <View className="w-28 h-28 rounded-full bg-primary-50" />
            )}
            <TouchableOpacity onPress={chooseAvatar} className="px-5 py-3 mt-2">
              <Text className="text-primary-800 font-semibold">Đổi avatar</Text>
            </TouchableOpacity>
          </View>

          <ProfileField label="Tên trong nhóm">
            <TextInput testID="profile-private-name-input" value={privateName} onChangeText={setPrivateName} maxLength={50} className="bg-white border border-secondary-200 rounded-xl px-4 py-3 text-secondary-900" />
            <Text className="text-secondary-500 text-xs mt-2">Chỉ dùng trong nhóm bạn.</Text>
          </ProfileField>
          <ProfileField label="Tên công khai">
            <TextInput testID="profile-public-name-input" value={publicName} onChangeText={setPublicName} maxLength={50} className="bg-white border border-secondary-200 rounded-xl px-4 py-3 text-secondary-900" />
            <Text className="text-secondary-500 text-xs mt-2">Tên này xuất hiện trên profile công khai.</Text>
          </ProfileField>
          <ProfileField label={`Bio · ${bio.length}/${MAX_BIO_LENGTH}`}>
            <TextInput
              testID="profile-bio-input"
              value={bio}
              onChangeText={setBio}
              maxLength={MAX_BIO_LENGTH}
              multiline
              textAlignVertical="top"
              className="min-h-28 bg-white border border-secondary-200 rounded-xl px-4 py-3 text-secondary-900"
            />
          </ProfileField>

          {error ? <Text className="text-red-700 mt-4">{error}</Text> : null}
          <TouchableOpacity
            testID="profile-save-button"
            onPress={handleSave}
            disabled={updateProfile.isPending}
            className="bg-primary rounded-xl py-4 items-center mt-7 disabled:opacity-50"
          >
            {updateProfile.isPending ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Lưu thay đổi</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ProfileField({ label, children }: { label: string; children: React.ReactNode }) {
  return <View className="mt-5"><Text className="text-secondary-800 font-semibold mb-2">{label}</Text>{children}</View>;
}
