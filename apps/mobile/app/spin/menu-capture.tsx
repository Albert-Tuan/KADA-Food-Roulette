import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, Alert, SafeAreaView, ScrollView, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Feather, Ionicons } from '@expo/vector-icons';
import { menuApi, MenuCaptureResponse, setLatestCapturedMenu } from '../../src/api/endpoints/menu';

const { width } = Dimensions.get('window');

export default function MenuCaptureScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [restaurantId, setRestaurantId] = useState<string>('rest-1');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pickImage = async (useCamera: boolean) => {
    try {
      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
          });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUris(prev => [...prev, result.assets[0].uri]);
        setErrorMessage(null);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh, vui lòng thử lại.');
    }
  };

  const handleCapture = async () => {
    if (imageUris.length === 0) {
      setErrorMessage('Vui lòng chọn hoặc chụp ít nhất 1 ảnh menu trước.');
      return;
    }

    try {
      setIsScanning(true);
      setErrorMessage(null);

      const res: MenuCaptureResponse = await menuApi.captureMenu(restaurantId, imageUris);
      setLatestCapturedMenu(res);

      const paramsToPass: Record<string, string> = {
        menuId: res.menuId,
        confidence: res.confidence.toString(),
      };
      if (params.target && typeof params.target === 'string') {
        paramsToPass.target = params.target;
      }

      router.push({
        pathname: '/spin/menu-review' as any,
        params: paramsToPass,
      });
    } catch (err: any) {
      console.error('Menu capture API error:', err);
      setErrorMessage(err.response?.data?.message || err.message || 'Lỗi kết nối đến AI server. Vui lòng kiểm tra backend.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const removeImage = (index: number) => {
    setImageUris(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#fff8ef' }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {/* Header */}
        <View className="flex-row items-center mb-6 pt-2">
          <TouchableOpacity
            onPress={handleBack}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={{ backgroundColor: '#ffffff', borderColor: '#e2bebc' }}
            className="p-2.5 rounded-2xl border shadow-xs mr-3"
          >
            <Feather name="arrow-left" size={20} color="#b52330" />
          </TouchableOpacity>
          <View>
            <Text className="text-2xl font-extrabold" style={{ color: '#b52330' }}>
              📷 Chụp Menu Tại Quán
            </Text>
            <Text className="text-xs font-semibold mt-0.5" style={{ color: '#8e4e14' }}>
              Gemini AI Vision sẽ tự động quét và bóc tách
            </Text>
          </View>
        </View>

        {/* Selected Images Thumbnail List */}
        {imageUris.length > 0 && !isScanning && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4 flex-row">
            {imageUris.map((uri, idx) => (
              <View key={idx} className="relative mr-3 rounded-lg overflow-hidden border border-amber-200 shadow-sm">
                <Image source={{ uri }} style={{ width: 80, height: 100 }} resizeMode="cover" />
                <TouchableOpacity 
                  onPress={() => removeImage(idx)}
                  className="absolute top-1 right-1 bg-black/60 rounded-full p-1"
                >
                  <Feather name="x" size={14} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Main Viewfinder Box */}
        <View className="relative rounded-2xl overflow-hidden bg-stone-900 border-2 border-dashed border-amber-300 shadow-lg aspect-[3/4] flex items-center justify-center">
          {imageUris.length > 0 ? (
            <View className="relative w-full h-full">
              <Image source={{ uri: imageUris[imageUris.length - 1] }} className="w-full h-full" resizeMode="cover" />
              {isScanning && (
                <View className="absolute inset-0 bg-stone-900/80 flex items-center justify-center p-6">
                  <View className="mb-4">
                    <Ionicons name="sparkles" size={48} color="#FBBF24" />
                  </View>
                  <Text className="font-semibold text-lg text-amber-200 text-center">Gemini đang phân tích {imageUris.length} ảnh...</Text>
                  <Text className="text-xs text-stone-300 mt-2 text-center">
                    AI đang đọc toàn bộ món ăn và giá tiền từ các ảnh bạn vừa tải lên
                  </Text>
                  <ActivityIndicator size="large" color="#F59E0B" className="mt-4" />
                </View>
              )}
            </View>
          ) : (
            <View className="p-6 flex flex-col items-center">
              <View className="p-4 rounded-full bg-amber-500/10 border border-amber-500/20 mb-3">
                <Feather name="camera" size={40} color="#F59E0B" />
              </View>
              <Text className="text-sm font-medium text-stone-300 mb-1 text-center">
                Có thể chọn nhiều ảnh cùng lúc
              </Text>
              <Text className="text-xs text-stone-500 text-center px-4">
                Đảm bảo đủ ánh sáng và chữ viết rõ ràng để AI bóc tách chính xác nhất
              </Text>
            </View>
          )}

          {/* Input file overlay button */}
          {!isScanning && (
            <View className="absolute bottom-4 left-4 right-4 flex-row gap-2">
              <TouchableOpacity
                onPress={() => pickImage(true)}
                className="flex-1 bg-white/90 border border-amber-200 py-3 px-4 rounded-xl flex-row items-center justify-center shadow-md"
              >
                <Feather name="camera" size={16} color="#D97706" style={{ marginRight: 8 }} />
                <Text className="text-stone-700 text-xs font-semibold">Chụp ảnh</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => pickImage(false)}
                className="flex-1 bg-white/90 border border-amber-200 py-3 px-4 rounded-xl flex-row items-center justify-center shadow-md"
              >
                <Feather name="image" size={16} color="#D97706" style={{ marginRight: 8 }} />
                <Text className="text-stone-700 text-xs font-semibold">Thư viện</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Error display */}
        {errorMessage && (
          <View className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex-row items-center">
            <Feather name="alert-circle" size={16} color="#BE123C" style={{ marginRight: 8 }} />
            <Text className="text-rose-700 text-xs flex-1">{errorMessage}</Text>
          </View>
        )}

        {/* Action Button */}
        <View className="mt-6">
          <TouchableOpacity
            onPress={handleCapture}
            disabled={imageUris.length === 0 || isScanning}
            style={{
              backgroundColor: imageUris.length > 0 && !isScanning ? '#b52330' : '#e1d9cb',
              borderBottomColor: imageUris.length > 0 && !isScanning ? '#61000e' : '#8e706f',
            }}
            className="w-full py-4 rounded-2xl flex-row items-center justify-center border-b-4 shadow-md"
          >
            {isScanning ? (
              <>
                <ActivityIndicator size="small" color="#FFF" style={{ marginRight: 8 }} />
                <Text className="text-white font-extrabold text-base">Đang phân tích OCR...</Text>
              </>
            ) : (
              <>
                <Ionicons name="sparkles" size={18} color={imageUris.length > 0 ? "#FFF" : "#5a403f"} style={{ marginRight: 8 }} />
                <Text className={`font-extrabold text-base ${imageUris.length > 0 ? 'text-white' : 'text-stone-500'}`}>
                  Bắt đầu AI OCR Quét Menu
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
