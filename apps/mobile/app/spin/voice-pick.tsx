import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { menuApi, MenuItem, VoicePickResponse } from '../../src/api/endpoints/menu';
import { VoicePickResultModal } from '../../src/components/VoicePickResultModal';

const MAX_RECORDING_SECONDS = 45;

export default function VoicePickScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(MAX_RECORDING_SECONDS);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<VoicePickResponse | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  // Pulse animation for recording mic
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (params.menuItems && typeof params.menuItems === 'string') {
      try {
        setMenuItems(JSON.parse(params.menuItems));
      } catch (e) {
        console.error('Error parsing menuItems', e);
      }
    }
  }, [params.menuItems]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recording) {
        recording.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, [recording]);

  // Start pulse animation
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording, pulseAnim]);

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Cần cấp quyền', 'Ứng dụng cần quyền Truy cập Micro để thu âm ý kiến nhóm.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
      setSecondsLeft(MAX_RECORDING_SECONDS);

      // Countdown timer
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            stopRecording(newRecording);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Lỗi', 'Không thể khởi động micro ghi âm.');
    }
  };

  const stopRecording = async (recToStop?: Audio.Recording) => {
    const targetRec = recToStop || recording;
    if (!targetRec) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsRecording(false);
    setIsAnalyzing(true);

    try {
      await targetRec.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      const uri = targetRec.getURI();
      setRecording(null);

      if (!uri) {
        throw new Error('No audio file URI found');
      }

      // Send to backend Gemini API
      console.log('Sending voice recording URI to backend:', uri);
      const result = await menuApi.processVoicePick(uri, menuItems);
      setAiResult(result);
      setIsModalVisible(true);
    } catch (error: any) {
      console.error('Error analyzing voice pick:', error);
      Alert.alert('Lỗi phân tích AI', error?.message || 'Không thể phân tích giọng nói. Vui lòng thử lại.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmAndSpin = (selectedItemNames: string[]) => {
    setIsModalVisible(false);

    // Map names back to full MenuItem objects
    const finalItems = menuItems.filter((i) =>
      selectedItemNames.some((name) => name.toLowerCase() === i.name.toLowerCase())
    );

    const itemsToPass = finalItems.length > 0 ? finalItems : menuItems;

    router.push({
      pathname: '/(tabs)/spin' as any,
      params: {
        menuItems: JSON.stringify(itemsToPass),
        fromMenuCapture: 'true',
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-amber-50 justify-between p-6">
      {/* Top Navigation */}
      <View className="flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="p-2 bg-white rounded-full border border-stone-200">
          <Feather name="arrow-left" size={24} color="#44403C" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-stone-800">Voice Pick Nhóm</Text>
        <View className="w-10" />
      </View>

      {/* Main Recording Body */}
      <View className="items-center justify-center my-auto">
        <Text className="text-center text-stone-600 text-sm px-6 mb-8">
          Đặt điện thoại ở giữa bàn. Cả nhóm hãy nói suy nghĩ & món thèm/ghét của mình nhé! (Tối đa 45 giây)
        </Text>

        {/* Pulsating Record Button */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }} className="mb-6">
          <TouchableOpacity
            onPress={isRecording ? () => stopRecording() : startRecording}
            disabled={isAnalyzing}
            className={`w-36 h-36 rounded-full items-center justify-center shadow-xl border-4 ${
              isRecording
                ? 'bg-rose-500 border-rose-300'
                : isAnalyzing
                ? 'bg-amber-400 border-amber-200'
                : 'bg-amber-500 border-amber-300'
            }`}
          >
            {isAnalyzing ? (
              <ActivityIndicator size="large" color="#FFF" />
            ) : (
              <Ionicons name={isRecording ? 'stop-circle' : 'mic'} size={60} color="#FFF" />
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Status & Timer */}
        {isRecording && (
          <View className="items-center">
            <Text className="text-2xl font-black text-rose-600 mb-1">
              00:{secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}
            </Text>
            <Text className="text-xs font-semibold text-rose-500">
              🔴 Đang thu âm nhóm... Nhấn để Dừng & Phân tích
            </Text>
          </View>
        )}

        {isAnalyzing && (
          <View className="items-center">
            <Text className="text-base font-bold text-amber-700 mb-1">
              🤖 AI Gemini đang lắng nghe & phân tích món ăn...
            </Text>
            <Text className="text-xs text-stone-500">Đang đối chiếu với menu {menuItems.length} món</Text>
          </View>
        )}

        {!isRecording && !isAnalyzing && (
          <View className="items-center">
            <Text className="text-base font-bold text-stone-800 mb-1">Nhấn nút Mic để bắt đầu</Text>
            <Text className="text-xs text-stone-500 text-center px-4">
              AI sẽ lọc các món thèm nhất và loại bỏ các món bị ghét/dị ứng của nhóm!
            </Text>
          </View>
        )}
      </View>

      {/* Footer Info */}
      <View className="bg-white p-4 rounded-2xl border border-amber-200 flex-row items-center">
        <Ionicons name="information-circle-outline" size={24} color="#D97706" style={{ marginRight: 12 }} />
        <View className="flex-1">
          <Text className="text-xs font-bold text-stone-800">Mẹo thu âm tiếng Việt:</Text>
          <Text className="text-xs text-stone-600">
            Nói rõ các từ như "thèm", "nhất định ăn", "không ăn được", "dị ứng"... để AI nhận biết chính xác nhất!
          </Text>
        </View>
      </View>

      {/* Result Modal */}
      <VoicePickResultModal
        visible={isModalVisible}
        result={aiResult}
        onClose={() => setIsModalVisible(false)}
        onConfirmAndSpin={handleConfirmAndSpin}
      />
    </SafeAreaView>
  );
}
