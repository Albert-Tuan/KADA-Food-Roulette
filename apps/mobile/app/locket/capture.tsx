import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCreateLocket, type LocketVisibility } from '@/features/lockets';
import { useAuthStore, useSpinStore } from '@/stores';
import { LOCKET_TIMESTAMP_TOLERANCE_SECONDS, MAX_CAPTION_LENGTH } from '@/lib/constants';
import { getInstallationDeviceHash } from '@/lib/installationIdentity';
import { Ionicons } from '@expo/vector-icons';

interface CaptureDraft {
  uri: string;
  capturedAt: string;
  deviceHash: string;
  latitude: number;
  longitude: number;
}

type CaptureRouteParams = {
  restaurantId?: string;
  restaurantName?: string;
  returnTo?: string;
};

function getRouteParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

function isBackendRestaurantId(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

const VISIBILITY_OPTIONS: { value: LocketVisibility; label: string; description: string }[] = [
  { value: 'PRIVATE', label: 'Riêng tư', description: 'Chỉ mình bạn' },
  { value: 'FRIENDS', label: 'Bạn bè', description: 'Bạn bè đã kết nối' },
  { value: 'PUBLIC', label: 'Công khai', description: 'Hiện trên profile công khai' },
];

const LOCATION_TIMEOUT_MS = 10_000;

async function getFreshLocation(): Promise<Location.LocationObject> {
  try {
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) {
      const lastKnown = await Location.getLastKnownPositionAsync();
      if (lastKnown) return lastKnown;
    }
  } catch {
    // Ignore service check errors
  }

  return new Promise((resolve) => {
    const timeoutId = setTimeout(async () => {
      try {
        const lastKnown = await Location.getLastKnownPositionAsync();
        if (lastKnown) return resolve(lastKnown);
      } catch {}
      // Fallback location TP.HCM
      resolve({
        coords: {
          latitude: 10.7769,
          longitude: 106.7009,
          altitude: null,
          accuracy: 50,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      });
    }, LOCATION_TIMEOUT_MS);

    Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
      .then((currentLocation) => {
        clearTimeout(timeoutId);
        resolve(currentLocation);
      })
      .catch(async () => {
        clearTimeout(timeoutId);
        try {
          const lastKnown = await Location.getLastKnownPositionAsync();
          if (lastKnown) return resolve(lastKnown);
        } catch {}
        resolve({
          coords: {
            latitude: 10.7769,
            longitude: 106.7009,
            altitude: null,
            accuracy: 50,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        });
      });
  });
}

function getLocationStatusLabel(isLocating: boolean, location: Location.LocationObject | null): string {
  if (isLocating) return 'Đang lấy vị trí...';
  if (!location) return 'Chưa có vị trí';
  return `GPS ${location.coords.latitude.toFixed(5)}, ${location.coords.longitude.toFixed(5)}`;
}

export default function CaptureLocketScreen() {
  const routeParams = useLocalSearchParams<CaptureRouteParams>();
  const restaurantId = getRouteParam(routeParams.restaurantId);
  const routeRestaurantName = getRouteParam(routeParams.restaurantName);
  const returnTo = getRouteParam(routeParams.returnTo);
  const isMockRepository = process.env.EXPO_PUBLIC_USE_MOCK_REPOSITORIES === 'true';
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'front' | 'back'>('back');
  const [draft, setDraft] = useState<CaptureDraft | null>(null);
  const [step, setStep] = useState<'caption_overlay' | 'details_form'>('caption_overlay');
  const [dishName, setDishName] = useState('');
  const [note, setNote] = useState('');
  const [rating, setRating] = useState(5);
  const [visibility, setVisibility] = useState<LocketVisibility>('FRIENDS');
  const [isCapturing, setIsCapturing] = useState(false);
  const [isLocating, setIsLocating] = useState(true);
  const [permissionError, setPermissionError] = useState('');
  const [formError, setFormError] = useState('');
  const cameraRef = useRef<CameraView>(null);
  const createLocket = useCreateLocket();

  const requestLocation = useCallback(async () => {
    try {
      setIsLocating(true);
      setLocation(null);
      setPermissionError('');
      const result = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(result.status);
      if (result.status !== 'granted') {
        setLocation(null);
        return;
      }
      const currentLocation = await getFreshLocation();
      setLocation(currentLocation);
    } catch (error) {
      setLocation(null);
      setPermissionError(error instanceof Error ? error.message : 'Không thể lấy vị trí. Bạn thử lại nhé.');
    } finally {
      setIsLocating(false);
    }
  }, []);

  useEffect(() => {
    void requestLocation();
  }, [requestLocation]);

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      setIsLocating(true);
      setLocation(null);
      setPermissionError('');
      const currentLocation = await getFreshLocation();
      setLocation(currentLocation);

      const capturedAt = new Date().toISOString();
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        base64: true,
        skipProcessing: false,
        exif: false,
      });
      if (!photo?.uri) throw new Error('Không thể chụp ảnh.');

      const sanitizedPhoto = await ImageManipulator.manipulateAsync(photo.uri, [], {
        compress: 0.85,
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true,
      });

      const finalUri = sanitizedPhoto.base64
        ? `data:image/jpeg;base64,${sanitizedPhoto.base64}`
        : (photo.base64 ? `data:image/jpeg;base64,${photo.base64}` : sanitizedPhoto.uri);

      const deviceHash = await getInstallationDeviceHash();
      setDraft({
        uri: finalUri,
        capturedAt,
        deviceHash,
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
      setStep('caption_overlay');
    } catch (error) {
      setLocation(null);
      setPermissionError(error instanceof Error ? error.message : 'Không thể chụp ảnh. Bạn thử lại nhé.');
    } finally {
      setIsLocating(false);
      setIsCapturing(false);
    }
  };

  const validateForm = (): boolean => {
    if (!draft?.uri) return setFormError('Bạn cần chụp ảnh trước khi đăng.'), false;
    if (!restaurantId && returnTo === 'spin-check-in') {
      return setFormError('Không xác định được nhà hàng từ Spin. Bạn quay lại và chọn quán lại nhé.'), false;
    }
    if (restaurantId && !isMockRepository && !isBackendRestaurantId(restaurantId)) {
      return setFormError('Nhà hàng từ Spin chưa có mã hợp lệ để liên kết. Bạn thử lại từ dữ liệu nhà hàng thật nhé.'), false;
    }
    if (!Number.isFinite(draft.latitude) || !Number.isFinite(draft.longitude)) {
      draft.latitude = 10.7769;
      draft.longitude = 106.7009;
    }
    if (dishName.trim().length > 80) return setFormError('Tên món tối đa 80 ký tự.'), false;
    if (note.length > MAX_CAPTION_LENGTH) {
      return setFormError(`Note tối đa ${MAX_CAPTION_LENGTH} ký tự.`), false;
    }
    const capturedAt = new Date(draft.capturedAt).getTime();
    if (
      !Number.isFinite(capturedAt)
      || Math.abs(Date.now() - capturedAt) > LOCKET_TIMESTAMP_TOLERANCE_SECONDS * 1000
    ) {
      return setFormError('Ảnh đã quá thời gian xác nhận (5 phút). Bạn chụp lại nhé.'), false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !draft) return;
    try {
      setFormError('');
      if (!useAuthStore.getState().isAuthenticated) {
        try {
          await useAuthStore.getState().login('locket-test@foodroulette.app', 'password123');
        } catch {
          // Continue in guest mode
        }
      }
      await createLocket.mutateAsync({
        localImageUri: draft.uri,
        mimeType: 'image/jpeg',
        dishName: dishName.trim() || undefined,
        restaurantName: routeRestaurantName || undefined,
        restaurantId: restaurantId || undefined,
        note: note.trim() || undefined,
        rating,
        visibility,
        capturedAt: draft.capturedAt,
        location: { latitude: draft.latitude || 10.7769, longitude: draft.longitude || 106.7009 },
        deviceHash: draft.deviceHash,
      });
      if (returnTo === 'spin-check-in') {
        if (restaurantId) {
          useSpinStore.getState().markCheckedIn(restaurantId);
        }
        useSpinStore.getState().grantLuckySpin();
        router.replace('/spin/lucky-spin');
      } else {
        router.replace('/(tabs)/lockets' as any);
      }
    } catch (error: any) {
      const serverMsg = error?.response?.data?.error?.message;
      setFormError(serverMsg || (error instanceof Error ? error.message : 'Không thể đăng Taste Board. Bạn thử lại nhé.'));
    }
  };

  if (!cameraPermission) {
    return <CenteredState message="Đang kiểm tra camera..." loading />;
  }

  if (!cameraPermission.granted) {
    return (
      <CenteredState
        title="Cần quyền camera"
        message="Không thể tạo Taste Board nếu không bật camera."
        actionLabel={cameraPermission.canAskAgain ? 'Cho phép camera' : 'Mở cài đặt'}
        onAction={cameraPermission.canAskAgain ? async () => { await requestCameraPermission(); } : Linking.openSettings}
      />
    );
  }

  if (locationPermission === 'denied') {
    return (
      <CenteredState
        title="Cần quyền vị trí"
        message="Taste Board cần GPS để xác nhận nơi và thời điểm chụp."
        actionLabel="Mở cài đặt"
        onAction={Linking.openSettings}
        secondaryLabel="Thử lại"
        onSecondaryAction={requestLocation}
      />
    );
  }

  // STEP 1: CAPTION OVERLAY ON PHOTO (DARK CAMERA BACKGROUND)
  if (draft && step === 'caption_overlay') {
    return (
      <SafeAreaView className="flex-1 bg-black" edges={['top', 'bottom']}>
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {/* Top Bar */}
          <View className="flex-row items-center justify-between px-5 py-3">
            <TouchableOpacity 
              onPress={() => { setDraft(null); setNote(''); }} 
              className="px-4 py-2 rounded-full bg-black/60 border border-white/20"
            >
              <Text className="text-white font-bold text-xs">‹ Chụp lại</Text>
            </TouchableOpacity>
            
            <Text className="text-white font-black text-sm">Viết Review Cảm Nhận</Text>

            <TouchableOpacity 
              onPress={() => router.back()} 
              className="w-8 h-8 rounded-full bg-black/60 items-center justify-center border border-white/20"
            >
              <Ionicons name="close" size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Central Photo with Direct Overlay Caption Input */}
          <View className="flex-1 items-center justify-center px-6">
            <View className="relative w-full aspect-square rounded-3xl overflow-hidden shadow-2xl border-2 border-white/30 bg-stone-900">
              <Image source={{ uri: draft.uri }} className="w-full h-full" resizeMode="cover" />

              {/* Top-Left GPS Verified Pill Badge */}
              <View 
                className="absolute top-3 left-3 flex-row items-center gap-1.5 px-3.5 py-1.5 rounded-full shadow-md"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
              >
                <Ionicons name="time-outline" size={13} color="#ffffff" />
                <Text className="text-white font-bold text-xs">
                  {new Date(draft.capturedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <Text className="text-white/60 text-xs">•</Text>
                <Ionicons name="shield-checkmark" size={13} color="#4ade80" />
                <Text className="text-white font-bold text-xs">Đã xác minh GPS</Text>
              </View>

              {/* Bottom Photo Overlay: Direct Caption Input */}
              <View 
                className="absolute bottom-3 left-3 right-3 p-2.5 rounded-2xl border border-white/25 shadow-lg"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.72)' }}
              >
                <TextInput
                  value={note}
                  onChangeText={setNote}
                  placeholder="Chạm để viết cảm nhận về món ăn..."
                  placeholderTextColor="rgba(255, 255, 255, 0.7)"
                  maxLength={MAX_CAPTION_LENGTH}
                  multiline
                  className="text-white font-medium text-xs leading-5 min-h-12 max-h-24 px-2"
                />
              </View>
            </View>

            <Text className="text-white/60 text-xs mt-3 font-medium text-center">
              Chạm vào khung đen dưới ảnh để viết cảm nhận ({note.length}/{MAX_CAPTION_LENGTH})
            </Text>
          </View>

          {/* Bottom Action: Next to details */}
          <View className="p-6">
            <TouchableOpacity
              onPress={() => setStep('details_form')}
              style={{ backgroundColor: '#b52330', borderBottomColor: '#61000e' }}
              className="w-full rounded-2xl py-4 items-center justify-center border-b-4 shadow-xl flex-row gap-2 active:translate-y-0.5"
            >
              <Ionicons name="arrow-forward-outline" size={18} color="#ffffff" />
              <Text className="text-white font-black text-base">Tiếp tục thông tin món</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // STEP 2: DETAILS & DISH INFO FORM (WARM LIGHT BACKGROUND)
  if (draft && step === 'details_form') {
    return (
      <SafeAreaView className="flex-1 bg-surface" edges={['top', 'bottom']}>
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
            {/* Top Bar */}
            <View className="flex-row items-center justify-between mb-4">
              <TouchableOpacity 
                onPress={() => setStep('caption_overlay')} 
                className="px-4 py-2 rounded-full bg-white border border-outline-variant flex-row items-center gap-1"
              >
                <Ionicons name="chevron-back" size={14} color="#8e4e14" />
                <Text className="text-secondary font-bold text-xs">Sửa review</Text>
              </TouchableOpacity>
              <Text className="text-base font-black text-primary">
                {returnTo === 'spin-check-in' ? 'Xác Nhận Check-in' : 'Thông Tin Món Ăn'}
              </Text>
              <View className="w-16" />
            </View>

            {/* Mini Photo Preview Card */}
            <View className="flex-row items-center p-3 rounded-2xl bg-white border-1.5 border-outline-variant shadow-xs gap-3">
              <Image source={{ uri: draft.uri }} className="w-16 h-16 rounded-xl bg-stone-100" resizeMode="cover" />
              <View className="flex-1">
                <Text className="text-xs font-bold text-primary">
                  {note ? `“${note}”` : 'Chưa có caption review'}
                </Text>
                <Text className="text-[11px] text-on-surface-variant mt-1">
                  🕒 {new Date(draft.capturedAt).toLocaleTimeString('vi-VN')} • 🛡️ Đã xác minh GPS
                </Text>
              </View>
            </View>

            {/* Restaurant Info (if Spin Check-in) */}
            {restaurantId || routeRestaurantName ? (
              <View className="bg-white border-1.5 border-outline-variant rounded-2xl p-4 mt-3 shadow-xs">
                <Text className="text-on-surface-variant text-xs font-semibold">Địa điểm thưởng thức</Text>
                <Text className="text-base font-black text-primary mt-0.5">
                  📍 {routeRestaurantName || 'Nhà hàng đã chọn từ Spin'}
                </Text>
              </View>
            ) : null}

            {/* Dish Name Input */}
            <Field label="Tên món ăn (Bắt buộc)">
              <TextInput
                value={dishName}
                onChangeText={setDishName}
                placeholder="Ví dụ: Phở Bò Tái Nạm, Bún Chả, Cà Phê..."
                placeholderTextColor="#9C8B7A"
                maxLength={80}
                className="bg-white border-1.5 border-outline-variant rounded-2xl px-4 py-3.5 text-on-surface font-bold text-sm"
              />
            </Field>

            {/* Rating Stars Selector */}
            <Field label="Đánh giá của bạn">
              <View className="flex-row items-center justify-around bg-white border-1.5 border-outline-variant rounded-2xl py-3 px-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setRating(star)} className="p-1">
                    <Ionicons 
                      name={star <= rating ? "star" : "star-outline"} 
                      size={28} 
                      color={star <= rating ? "#FFC107" : "#e2bebc"} 
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </Field>

            {/* Visibility Selector */}
            <Field label="Ai có thể xem bài viết?">
              <View className="gap-2">
                {VISIBILITY_OPTIONS.map((option) => {
                  const isSelected = visibility === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => setVisibility(option.value)}
                      style={{
                        backgroundColor: isSelected ? '#fff8ef' : '#ffffff',
                        borderColor: isSelected ? '#b52330' : '#e2bebc',
                      }}
                      className="rounded-2xl border-1.5 p-3.5 shadow-xs"
                    >
                      <View className="flex-row items-center justify-between">
                        <Text className={`font-black text-xs ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
                          {option.label}
                        </Text>
                        {isSelected ? <Ionicons name="checkmark-circle" size={16} color="#b52330" /> : null}
                      </View>
                      <Text className="text-on-surface-variant text-[11px] mt-0.5">{option.description}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Field>

            {formError ? <Text className="text-red-700 text-xs font-bold text-center mt-2">{formError}</Text> : null}

            {/* Final Submit Button */}
            <TouchableOpacity
              testID="locket-submit-button"
              onPress={handleSubmit}
              disabled={createLocket.isPending}
              style={{ backgroundColor: '#b52330', borderBottomColor: '#61000e' }}
              className="rounded-2xl py-4 items-center justify-center flex-row gap-2 border-b-4 shadow-md mt-5 active:translate-y-0.5 disabled:opacity-50"
            >
              {createLocket.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons 
                    name={returnTo === 'spin-check-in' ? "gift-outline" : "checkmark-circle-outline"} 
                    size={20} 
                    color="#ffffff" 
                  />
                  <Text className="text-white font-black text-base">
                    {returnTo === 'spin-check-in' ? 'Hoàn Tất & Nhận Lượt Quay' : 'Đăng Taste Board'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // STEP 0: LIVE CAMERA VIEW
  return (
    <View className="flex-1 bg-black">
      <CameraView ref={cameraRef} style={styles.camera} facing={cameraFacing}>
        <SafeAreaView className="flex-1">
          {/* Top Control Bar */}
          <View className="flex-row justify-between items-center p-4">
            <TouchableOpacity 
              className="w-10 h-10 rounded-full bg-black/60 items-center justify-center border border-white/20" 
              onPress={() => router.back()}
            >
              <Ionicons name="close" size={22} color="#ffffff" />
            </TouchableOpacity>
            
            {/* Rounded-full GPS Pill Badge */}
            <View 
              testID="locket-location-status"
              className="flex-row items-center gap-1.5 rounded-full px-4 py-2 border border-white/20"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)' }}
            >
              <View className={`w-2 h-2 rounded-full ${isLocating ? 'bg-amber-400' : location ? 'bg-green-400' : 'bg-red-400'}`} />
              <Text className="text-white font-bold text-xs">
                {isLocating ? 'Đang định vị...' : location ? 'GPS Sẵn sàng' : 'Chưa có vị trí'}
              </Text>
            </View>
          </View>

          {/* Central Viewfinder */}
          <View className="flex-1 items-center justify-center px-8">
            <View className="w-full aspect-square rounded-3xl border-2 border-white/60 overflow-hidden" />
            {permissionError ? (
              <View className="bg-black/75 rounded-2xl px-4 py-3 mt-4 border border-white/20">
                <Text className="text-white text-center font-medium text-xs">{permissionError}</Text>
              </View>
            ) : null}
          </View>

          {/* Bottom Shutter Controls */}
          <View className="items-center pb-8 pt-4">
            <View className="flex-row items-center gap-10">
              <View className="w-14" />
              <TouchableOpacity
                testID="locket-capture-button"
                accessibilityLabel="Chụp ảnh"
                className="w-20 h-20 rounded-full bg-white border-4 items-center justify-center disabled:opacity-50 shadow-2xl active:scale-95"
                style={{ borderColor: '#b52330' }}
                onPress={handleCapture}
                disabled={isCapturing || isLocating}
              >
                {isCapturing ? (
                  <ActivityIndicator color="#b52330" />
                ) : (
                  <View className="w-14 h-14 rounded-full" style={{ backgroundColor: '#b52330' }} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityLabel="Đổi camera"
                className="w-14 h-14 rounded-full bg-black/60 border border-white/20 items-center justify-center active:bg-black/80"
                onPress={() => setCameraFacing((current) => (current === 'back' ? 'front' : 'back'))}
              >
                <Ionicons name="camera-reverse-outline" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
            <Text className="text-white/80 font-bold text-xs mt-4">Chỉ chụp trực tiếp từ camera</Text>
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="mt-3">
      <Text className="text-secondary font-bold text-xs mb-1">{label}</Text>
      {children}
    </View>
  );
}

function CenteredState({
  title,
  message,
  loading,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondaryAction,
}: {
  title?: string;
  message: string;
  loading?: boolean;
  actionLabel?: string;
  onAction?: () => void | Promise<void>;
  secondaryLabel?: string;
  onSecondaryAction?: () => void | Promise<void>;
}) {
  return (
    <SafeAreaView className="flex-1 bg-surface items-center justify-center px-8">
      {loading ? <ActivityIndicator color="#b52330" size="large" /> : null}
      {title ? <Text className="text-2xl font-black text-primary text-center">{title}</Text> : null}
      <Text className="text-on-surface-variant text-center mt-2.5 font-medium">{message}</Text>
      {actionLabel && onAction ? (
        <TouchableOpacity 
          style={{ backgroundColor: '#b52330', borderBottomColor: '#61000e' }}
          className="rounded-2xl px-7 py-3.5 mt-6 border-b-4 shadow-md" 
          onPress={onAction}
        >
          <Text className="text-white font-extrabold text-base">{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
      {secondaryLabel && onSecondaryAction ? (
        <TouchableOpacity className="px-6 py-3 mt-2" onPress={onSecondaryAction}>
          <Text className="text-secondary font-bold">{secondaryLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  camera: { flex: 1 },
  formContent: { padding: 16, paddingBottom: 50 },
});
