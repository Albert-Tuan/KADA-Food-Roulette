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
import { LOCKET_TIMESTAMP_TOLERANCE_SECONDS, MAX_CAPTION_LENGTH } from '@/lib/constants';
import { getInstallationDeviceHash } from '@/lib/installationIdentity';

interface CaptureDraft {
  uri: string;
  capturedAt: string;
  deviceHash: string;
  latitude: number;
  longitude: number;
}

type CaptureRouteParams = {
  restaurantId?: string;
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
  const servicesEnabled = await Location.hasServicesEnabledAsync();
  if (!servicesEnabled) {
    throw new Error('Dịch vụ vị trí đang tắt. Bạn bật GPS rồi thử lại nhé.');
  }

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Không nhận được vị trí mới. Bạn kiểm tra GPS rồi thử lại nhé.'));
    }, LOCATION_TIMEOUT_MS);

    Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
      .then((currentLocation) => {
        clearTimeout(timeoutId);
        resolve(currentLocation);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
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
  const returnTo = getRouteParam(routeParams.returnTo);
  const isMockRepository = process.env.EXPO_PUBLIC_USE_MOCK_REPOSITORIES === 'true';
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'front' | 'back'>('back');
  const [draft, setDraft] = useState<CaptureDraft | null>(null);
  const [note, setNote] = useState('');
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
        base64: false,
        skipProcessing: false,
        exif: false,
      });
      if (!photo?.uri) throw new Error('Không thể chụp ảnh.');

      const sanitizedPhoto = await ImageManipulator.manipulateAsync(photo.uri, [], {
        compress: 0.85,
        format: ImageManipulator.SaveFormat.JPEG,
      });

      const deviceHash = await getInstallationDeviceHash();
      setDraft({
        uri: sanitizedPhoto.uri,
        capturedAt,
        deviceHash,
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
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
      return setFormError('Cần vị trí để đăng Taste Board.'), false;
    }
    if (note.length > MAX_CAPTION_LENGTH) {
      return setFormError(`Note tối đa ${MAX_CAPTION_LENGTH} ký tự.`), false;
    }
    const capturedAt = new Date(draft.capturedAt).getTime();
    if (
      !Number.isFinite(capturedAt)
      || Math.abs(Date.now() - capturedAt) > LOCKET_TIMESTAMP_TOLERANCE_SECONDS * 1000
    ) {
      return setFormError('Ảnh đã quá thời gian xác nhận. Bạn chụp lại nhé.'), false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !draft) return;
    try {
      setFormError('');
      const created = await createLocket.mutateAsync({
        localImageUri: draft.uri,
        mimeType: 'image/jpeg',
        restaurantId: restaurantId || undefined,
        note: note.trim() || undefined,
        visibility,
        capturedAt: draft.capturedAt,
        location: { latitude: draft.latitude, longitude: draft.longitude },
        deviceHash: draft.deviceHash,
      });
      if (returnTo === 'spin-check-in') {
        router.replace({ pathname: '/spin/check-in', params: { tasteBoardId: created.id } });
      } else {
        router.replace(`/locket/${created.id}`);
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Không thể đăng Taste Board. Bạn thử lại nhé.');
    }
  };

  if (!cameraPermission) {
    return <CenteredState testID="locket-camera-permission-loading" message="Đang kiểm tra camera..." loading />;
  }

  if (!cameraPermission.granted) {
    return (
      <CenteredState
        testID="locket-camera-permission-required"
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
        testID="locket-location-permission-required"
        title="Cần quyền vị trí"
        message="Taste Board cần GPS để xác nhận nơi và thời điểm chụp."
        actionLabel="Mở cài đặt"
        onAction={Linking.openSettings}
        secondaryLabel="Thử lại"
        onSecondaryAction={requestLocation}
      />
    );
  }

  if (draft) {
    return (
      <SafeAreaView testID="locket-preview-screen" className="flex-1 bg-background">
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
            <View className="flex-row items-center justify-between mb-4">
              <TouchableOpacity testID="locket-retake-button" onPress={() => setDraft(null)} className="px-3 py-2">
                <Text className="text-secondary-700">Chụp lại</Text>
              </TouchableOpacity>
              <Text className="text-xl font-bold text-secondary-900">Taste Board mới</Text>
              <View className="w-20" />
            </View>

            <Image source={{ uri: draft.uri }} className="w-full aspect-square rounded-3xl bg-secondary-100" />

            <Field label={`Review · ${note.length}/${MAX_CAPTION_LENGTH}`}>
              <TextInput
                testID="locket-note-input"
                value={note}
                onChangeText={setNote}
                placeholder="Chia sẻ khoảnh khắc này với bạn bè nhé."
                placeholderTextColor="#9C8B7A"
                maxLength={MAX_CAPTION_LENGTH}
                multiline
                textAlignVertical="top"
                className="min-h-24 bg-white border border-secondary-200 rounded-xl px-4 py-3 text-secondary-900"
              />
            </Field>

            <Field label="Ai có thể xem?">
              <View className="gap-2">
                {VISIBILITY_OPTIONS.map((option) => (
                  <TouchableOpacity
                    testID={`locket-visibility-${option.value.toLowerCase()}`}
                    key={option.value}
                    onPress={() => setVisibility(option.value)}
                    className={`rounded-xl border p-4 ${
                      visibility === option.value ? 'border-primary bg-primary-50' : 'border-secondary-200 bg-white'
                    }`}
                  >
                    <Text className="font-semibold text-secondary-900">{option.label}</Text>
                    <Text className="text-secondary-500 text-sm mt-1">{option.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Field>

            <View className="bg-secondary-50 rounded-xl p-4 gap-1">
              <Text className="text-secondary-700 text-sm">GPS: {draft.latitude.toFixed(5)}, {draft.longitude.toFixed(5)}</Text>
              <Text className="text-secondary-700 text-sm">Chụp lúc: {new Date(draft.capturedAt).toLocaleString('vi-VN')}</Text>
            </View>

            {formError ? <Text className="text-red-700 text-sm">{formError}</Text> : null}

            <TouchableOpacity
              testID="locket-submit-button"
              onPress={handleSubmit}
              disabled={createLocket.isPending}
              className="bg-primary rounded-xl py-4 items-center disabled:opacity-50"
            >
              {createLocket.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-base">Đăng Taste Board</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <View testID="locket-camera-screen" className="flex-1 bg-black">
      <CameraView ref={cameraRef} style={styles.camera} facing={cameraFacing}>
        <SafeAreaView className="flex-1">
          <View className="flex-row justify-between items-center p-4">
            <TouchableOpacity testID="locket-close-button" className="rounded-full bg-black/60 px-4 py-3" onPress={() => router.back()}>
              <Text className="text-white font-semibold">Đóng</Text>
            </TouchableOpacity>
            <View testID="locket-location-status" className="rounded-full bg-black/60 px-4 py-3">
              <Text className="text-white text-sm">{getLocationStatusLabel(isLocating, location)}</Text>
            </View>
          </View>

          <View className="flex-1 items-center justify-center px-8">
            <View className="w-full aspect-square rounded-3xl border-2 border-white/70" />
            {permissionError ? (
              <View className="bg-black/70 rounded-xl px-4 py-3 mt-4">
                <Text className="text-white text-center">{permissionError}</Text>
              </View>
            ) : null}
          </View>

          <View className="items-center p-7">
            <View className="flex-row items-center gap-10">
              <View className="w-14" />
              <TouchableOpacity
                testID="locket-capture-button"
                accessibilityLabel="Chụp ảnh"
                className="w-20 h-20 rounded-full bg-white border-4 border-primary items-center justify-center disabled:opacity-50"
                onPress={handleCapture}
                disabled={isCapturing || isLocating}
              >
                {isCapturing ? <ActivityIndicator color="#C68E17" /> : <View className="w-14 h-14 rounded-full bg-primary" />}
              </TouchableOpacity>
              <TouchableOpacity
                testID="locket-flip-camera-button"
                accessibilityLabel="Đổi camera"
                className="w-14 h-14 rounded-full bg-black/60 items-center justify-center"
                onPress={() => setCameraFacing((current) => (current === 'back' ? 'front' : 'back'))}
              >
                <Text className="text-white text-xl">↻</Text>
              </TouchableOpacity>
            </View>
            <Text className="text-white/80 text-sm mt-4">Chỉ chụp trực tiếp từ camera</Text>
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="mt-5">
      <Text className="text-secondary-800 font-semibold mb-2">{label}</Text>
      {children}
    </View>
  );
}

function CenteredState({
  testID,
  title,
  message,
  loading,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondaryAction,
}: {
  testID: string;
  title?: string;
  message: string;
  loading?: boolean;
  actionLabel?: string;
  onAction?: () => void | Promise<void>;
  secondaryLabel?: string;
  onSecondaryAction?: () => void | Promise<void>;
}) {
  return (
    <SafeAreaView testID={testID} className="flex-1 bg-background items-center justify-center px-8">
      {loading ? <ActivityIndicator color="#C68E17" size="large" /> : null}
      {title ? <Text className="text-2xl font-bold text-secondary-900 text-center">{title}</Text> : null}
      <Text className="text-secondary-600 text-center mt-3">{message}</Text>
      {actionLabel && onAction ? (
        <TouchableOpacity className="bg-primary rounded-xl px-6 py-4 mt-6" onPress={onAction}>
          <Text className="text-white font-semibold">{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
      {secondaryLabel && onSecondaryAction ? (
        <TouchableOpacity className="px-6 py-3 mt-2" onPress={onSecondaryAction}>
          <Text className="text-secondary-700 font-semibold">{secondaryLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  camera: { flex: 1 },
  formContent: { padding: 16, paddingBottom: 40 },
});
