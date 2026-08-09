import { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { locketApi } from '../../src/api';
import { generatePublicId } from '../../src/lib/utils';

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
      
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: false,
      });

      if (!photo?.uri) {
        Alert.alert('Lỗi', 'Không thể chụp ảnh');
        return;
      }

      const capturedAt = new Date().toISOString();
      const deviceHash = generatePublicId();

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
      console.log('Selected image:', result.assets[0].uri);
    }
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Đang tải camera...</Text>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <Text style={styles.permissionEmoji}>📷</Text>
        <Text style={styles.permissionTitle}>Cần quyền truy cập camera</Text>
        <Text style={styles.permissionText}>
          Food Roulette cần camera để chụp ảnh món ăn của bạn
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Cho phép</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
      >
        <SafeAreaView style={styles.cameraSafeArea}>
          {/* Top bar */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => router.back()}
            >
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
            
            <View style={styles.locationBadge}>
              <Text style={styles.locationText}>
                📍 {location ? 'Đã có vị trí' : 'Đang lấy vị trí...'}
              </Text>
            </View>
          </View>

          {/* Capture frame */}
          <View style={styles.frameContainer}>
            <View style={styles.captureFrame} />
          </View>

          {/* Bottom controls */}
          <View style={styles.bottomControls}>
            <View style={styles.controlsRow}>
              {/* Gallery button */}
              <TouchableOpacity
                style={styles.sideButton}
                onPress={handlePickImage}
              >
                <Text style={styles.sideButtonIcon}>🖼️</Text>
              </TouchableOpacity>

              {/* Capture button */}
              <TouchableOpacity
                style={styles.captureButton}
                onPress={handleCapture}
                disabled={isCapturing || !location}
              >
                <View style={[
                  styles.captureButtonInner,
                  (isCapturing || !location) && styles.captureButtonDisabled
                ]} />
              </TouchableOpacity>

              {/* Flip camera */}
              <TouchableOpacity style={styles.sideButton}>
                <Text style={styles.sideButtonIcon}>🔄</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.hint}>
              Chạm để chụp · Camera-only
            </Text>
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  cameraSafeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#FFF8E7',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  permissionEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#292524',
    marginBottom: 8,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 14,
    color: '#78716C',
    textAlign: 'center',
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: '#D97706',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
  },
  permissionButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    color: 'white',
    fontSize: 20,
  },
  locationBadge: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  locationText: {
    color: 'white',
    fontSize: 13,
  },
  frameContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureFrame: {
    width: 288,
    height: 288,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 16,
  },
  bottomControls: {
    padding: 24,
    alignItems: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  sideButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideButtonIcon: {
    fontSize: 24,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#D97706',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#D97706',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  hint: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginTop: 16,
  },
});
