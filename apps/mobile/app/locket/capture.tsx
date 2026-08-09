import { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { locketApi } from '@/api';
import { generatePublicId } from '@/lib';

export default function CaptureLocketScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
      }
    })();
  }, []);

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      
      // Take picture
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: false,
      });

      if (!photo?.uri) {
        Alert.alert('Lỗi', 'Không thể chụp ảnh');
        return;
      }

      // In real app, upload to server first
      // For now, simulate with local URI
      const capturedAt = new Date().toISOString();
      const deviceHash = generatePublicId();

      // Create locket
      const locket = await locketApi.create({
        imageUrl: photo.uri,
        gpsLat: location?.coords.latitude || 0,
        gpsLng: location?.coords.longitude || 0,
        capturedAt,
        deviceHash,
        visibility: 'PUBLIC',
      });

      Alert.alert('Thành công', 'Đã lưu locket!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Capture error:', error);
      Alert.alert('Lỗi', 'Không thể lưu locket');
    } finally {
      setIsCapturing(false);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      // In real app, navigate to confirm screen
      console.log('Selected image:', result.assets[0].uri);
    }
  };

  if (!permission) {
    return (
      <SafeAreaView className="flex-1 bg-black items-center justify-center">
        <Text className="text-white">Đang tải camera...</Text>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center p-6">
        <Text className="text-6xl mb-4">📷</Text>
        <Text className="text-xl font-bold text-secondary-800 mb-2 text-center">
          Cần quyền truy cập camera
        </Text>
        <Text className="text-secondary-500 text-center mb-6">
          Food Roulette cần camera để chụp ảnh món ăn của bạn
        </Text>
        <TouchableOpacity
          className="bg-primary px-6 py-3 rounded-full"
          onPress={requestPermission}
        >
          <Text className="text-white font-semibold">Cho phép</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
      >
        <SafeAreaView className="flex-1">
          {/* Top bar */}
          <View className="flex-row justify-between items-center p-4">
            <TouchableOpacity
              className="w-10 h-10 bg-black/50 rounded-full items-center justify-center"
              onPress={() => router.back()}
            >
              <Text className="text-white text-xl">✕</Text>
            </TouchableOpacity>
            
            <View className="bg-black/50 rounded-full px-4 py-2">
              <Text className="text-white text-sm">
                📍 {location ? 'Đã có vị trí' : 'Đang lấy vị trí...'}
              </Text>
            </View>
          </View>

          {/* Capture frame */}
          <View className="flex-1 items-center justify-center">
            <View className="w-72 h-72 border-2 border-white/50 rounded-2xl" />
          </View>

          {/* Bottom controls */}
          <View className="p-6 items-center">
            <View className="flex-row items-center gap-8">
              {/* Gallery button */}
              <TouchableOpacity
                className="w-14 h-14 bg-black/50 rounded-full items-center justify-center"
                onPress={handlePickImage}
              >
                <Text className="text-2xl">🖼️</Text>
              </TouchableOpacity>

              {/* Capture button */}
              <TouchableOpacity
                className="w-20 h-20 bg-white rounded-full items-center justify-center border-4 border-primary"
                onPress={handleCapture}
                disabled={isCapturing || !location}
              >
                <View className={`w-16 h-16 bg-primary rounded-full ${isCapturing ? 'opacity-50' : ''}`} />
              </TouchableOpacity>

              {/* Flip camera */}
              <TouchableOpacity className="w-14 h-14 bg-black/50 rounded-full items-center justify-center">
                <Text className="text-2xl">🔄</Text>
              </TouchableOpacity>
            </View>

            <Text className="text-white/70 text-sm mt-4">
              Chạm để chụp · Camera-only
            </Text>
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  camera: {
    flex: 1,
  },
});
