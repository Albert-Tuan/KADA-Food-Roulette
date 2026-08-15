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
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
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
      Alert.alert('Cần quyền truy cập ảnh', 'Bạn bật quyền ảnh để đổi avatar nhé.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]?.uri) setAvatarUri(result.assets[0].uri);
  };

  const save = async () => {
    if (privateName.trim().length < 2 || publicName.trim().length < 2) {
      setError('Tên hiển thị cần ít nhất 2 ký tự.');
      return;
    }
    if (privateName.trim().length > 50 || publicName.trim().length > 50) {
      setError('Tên hiển thị tối đa 50 ký tự.');
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
    <SafeAreaView testID="profile-edit-screen" className="flex-1 bg-background" edges={['bottom']}>
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
            onPress={save}
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
