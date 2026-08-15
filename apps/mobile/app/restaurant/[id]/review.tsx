import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StarRating } from '../../../src/components/StarRating';
import { useState } from 'react';

export default function WriteReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [overall, setOverall] = useState(0);
  const [food, setFood] = useState(0);
  const [service, setService] = useState(0);
  const [price, setPrice] = useState(0);
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!overall || !food || !service || !price) {
      Alert.alert('Thiếu thông tin', 'Vui lòng đánh giá đủ số sao cho tất cả tiêu chí nhé!');
      return;
    }
    if (text.trim().length < 10) {
      Alert.alert('Đánh giá ngắn quá', 'Hãy viết thêm cảm nhận của bạn nhé (ít nhất 10 ký tự).');
      return;
    }

    try {
      setIsSubmitting(true);
      // Giả lập call API (TODO: Thay thế bằng API thật)
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Thành công', 'Cảm ơn bạn đã đóng góp đánh giá!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể gửi đánh giá lúc này.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
          <Text style={styles.submitText}>Gửi</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
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
            placeholder="Chia sẻ trải nghiệm của bạn tại quán ăn này nhé..."
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            value={text}
            onChangeText={setText}
          />
        </View>

        {/* Note about Photo upload - Mock for now */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hình ảnh (Tối đa 5)</Text>
          <TouchableOpacity style={styles.uploadButton}>
            <Text style={styles.uploadText}>📷 Thêm hình ảnh</Text>
          </TouchableOpacity>
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
  submitButton: { padding: 8, marginRight: -8 },
  submitButtonDisabled: { opacity: 0.5 },
  submitText: { color: '#D97706', fontSize: 16, fontWeight: '700' },
  content: { flex: 1, padding: 16 },
  section: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#292524', marginBottom: 16 },
  centerAlign: { alignItems: 'center' },
  ratingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  ratingLabel: { fontSize: 16, color: '#57534E' },
  textInput: { backgroundColor: '#F5F5F4', borderRadius: 8, padding: 12, fontSize: 16, minHeight: 120, color: '#292524' },
  uploadButton: { backgroundColor: '#F5F5F4', borderRadius: 8, padding: 16, alignItems: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: '#D97706' },
  uploadText: { color: '#D97706', fontWeight: '600', fontSize: 16 },
});
