import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Image, ActivityIndicator, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StarRating } from '../../../src/components/StarRating';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import apiClient from '../../../src/api/client';

export default function WriteReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [overall, setOverall] = useState(0);
  const [food, setFood] = useState(0);
  const [service, setService] = useState(0);
  const [price, setPrice] = useState(0);
  const [text, setText] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const pickImage = async () => {
    if (photos.length >= 5) {
      setErrorMsg('Bạn chỉ được tải lên tối đa 5 hình ảnh.');
      return;
    }
    setErrorMsg('');

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0].uri) {
      setPhotos([...photos, result.assets[0].uri]);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  const handleSubmit = async () => {
    setErrorMsg('');
    if (!overall || !food || !service || !price) {
      setErrorMsg('Vui lòng đánh giá đủ số sao cho tất cả tiêu chí (Chung, Đồ ăn, Phục vụ, Giá cả) nhé!');
      return;
    }
    if (text.trim().length < 10) {
      setErrorMsg('Hãy viết thêm cảm nhận của bạn nhé (ít nhất 10 ký tự).');
      return;
    }

    try {
      setIsSubmitting(true);

      const uploadedPhotoUrls: string[] = [];

      // Upload photos sequentially
      for (const photoUri of photos) {
        const formData = new FormData();
        const filename = photoUri.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        let uploadResData;

        if (Platform.OS === 'web') {
          const response = await fetch(photoUri);
          const blob = await response.blob();
          formData.append('photo', blob, filename);

          // Bypass axios on Web for FormData to avoid boundary stripping issues
          const token = await require('@react-native-async-storage/async-storage').default.getItem('token');
          const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
          const rawRes = await fetch(`${apiUrl}/reviews/upload`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData,
          });
          uploadResData = await rawRes.json();
        } else {
          // React Native (iOS/Android)
          formData.append('photo', {
            uri: photoUri,
            name: filename,
            type,
          } as any);

          const uploadRes = await apiClient.post('/reviews/upload', formData);
          uploadResData = uploadRes.data;
        }

        if (uploadResData.success && uploadResData.url) {
          uploadedPhotoUrls.push(uploadResData.url);
        }
      }

      // Submit review
      await apiClient.post('/reviews', {
        restaurantId: id,
        overallRating: overall,
        tasteRating: food,
        serviceRating: service,
        valueRating: price,
        content: text,
        photoUrls: uploadedPhotoUrls,
        tags: [],
      });

      Alert.alert('Thành công', 'Cảm ơn bạn đã đóng góp đánh giá!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
      if (typeof window !== 'undefined' && window.alert) {
        window.alert('Cảm ơn bạn đã đóng góp đánh giá!');
        router.back();
      }
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.response?.data?.error || 'Không thể gửi đánh giá lúc này.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>Hủy</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Viết Đánh Giá</Text>
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? <ActivityIndicator color="#D97706" /> : <Text style={styles.submitText}>Gửi</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {errorMsg ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        {/* Overall Rating */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chất lượng chung</Text>
          <View style={styles.centerAlign}>
            <StarRating rating={overall} size={36} onChange={setOverall} />
          </View>
        </View>

        {/* Detailed Ratings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đánh giá chi tiết</Text>

          <View style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>🍽️ Đồ ăn (Vị)</Text>
            <StarRating rating={food} size={24} onChange={setFood} />
          </View>

          <View style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>💁 Phục vụ</Text>
            <StarRating rating={service} size={24} onChange={setService} />
          </View>

          <View style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>💰 Giá cả</Text>
            <StarRating rating={price} size={24} onChange={setPrice} />
          </View>
        </View>

        {/* Review Text */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cảm nhận của bạn</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Chia sẻ trải nghiệm của bạn tại quán ăn này nhé (ít nhất 10 ký tự)..."
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            value={text}
            onChangeText={setText}
          />
        </View>

        {/* Note about Photo upload */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hình ảnh (Tối đa 5)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoContainer}>
            {photos.map((uri, idx) => (
              <View key={idx} style={styles.photoWrapper}>
                <Image source={{ uri }} style={styles.photoPreview} />
                <TouchableOpacity style={styles.removePhoto} onPress={() => removePhoto(idx)}>
                  <Text style={styles.removePhotoText}>X</Text>
                </TouchableOpacity>
              </View>
            ))}
            {photos.length < 5 && (
              <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                <Text style={styles.uploadText}>📷 Thêm ảnh</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F4' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E7E5E4' },
  backButton: { padding: 8, marginLeft: -8 },
  backText: { color: '#78716C', fontSize: 16 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#292524' },
  submitButton: { padding: 8, marginRight: -8, minWidth: 44, alignItems: 'center' },
  submitButtonDisabled: { opacity: 0.5 },
  submitText: { color: '#D97706', fontSize: 16, fontWeight: '700' },
  content: { flex: 1, padding: 16 },
  errorBox: { backgroundColor: '#FEE2E2', padding: 12, borderRadius: 8, marginBottom: 16 },
  errorText: { color: '#EF4444', fontSize: 14, fontWeight: '500' },
  section: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#292524', marginBottom: 16 },
  centerAlign: { alignItems: 'center' },
  ratingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  ratingLabel: { fontSize: 16, color: '#57534E' },
  textInput: { backgroundColor: '#F5F5F4', borderRadius: 8, padding: 12, fontSize: 16, minHeight: 120, color: '#292524' },
  photoContainer: { flexDirection: 'row', paddingTop: 8 },
  uploadButton: { backgroundColor: '#F5F5F4', borderRadius: 8, width: 100, height: 100, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: '#D97706', marginRight: 12 },
  uploadText: { color: '#D97706', fontWeight: '600', fontSize: 14, textAlign: 'center' },
  photoWrapper: { position: 'relative', marginRight: 12 },
  photoPreview: { width: 100, height: 100, borderRadius: 8 },
  removePhoto: { position: 'absolute', top: -8, right: -8, backgroundColor: 'red', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  removePhotoText: { color: 'white', fontWeight: 'bold', fontSize: 12 }
});
