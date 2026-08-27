import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { preferencesApi } from '../../src/api/endpoints/preferences';
import { useAuthStore } from '../../src/stores/authStore';

const CUISINE_OPTIONS = [
  { id: 'pho_bun', name: 'Phở & Bún Việt', icon: '🍜', category: 'món việt' },
  { id: 'com_tam', name: 'Cơm Tấm & Cơm Niêu', icon: '🍚', category: 'cơm' },
  { id: 'lau_nuong', name: 'Lẩu & Nướng BBQ', icon: '🥩', category: 'tiệc' },
  { id: 'mon_nhat', name: 'Sushi & Món Nhật', icon: '🍣', category: 'nhật' },
  { id: 'mon_han', name: 'Đồ Hàn & Kimchi', icon: '🥘', category: 'hàn' },
  { id: 'mon_au', name: 'Pizza & Món Âu', icon: '🍕', category: 'âu' },
  { id: 'mon_thai', name: 'Món Thái Chua Cay', icon: '🌶️', category: 'thái' },
  { id: 'tra_sua', name: 'Trà Sữa & Cà Phê', icon: '🧋', category: 'đồ uống' },
  { id: 'an_vat', name: 'Ăn Vặt & Fastfood', icon: '🍟', category: 'ăn vặt' },
  { id: 'chay_healthy', name: 'Chay & Healthy', icon: '🥗', category: 'chay' },
  { id: 'hai_san', name: 'Hải Sản & Quán Ốc', icon: '🦪', category: 'hải sản' },
  { id: 'banh_mi', name: 'Bánh Mì & Điểm Tâm', icon: '🥖', category: 'điểm tâm' },
];

const SPICE_LEVELS = [
  { id: 'none', label: 'Không Cay', icon: '🧊' },
  { id: 'low', label: 'Ít Cay', icon: '🌶️' },
  { id: 'medium', label: 'Cay Vừa', icon: '🔥' },
  { id: 'high', label: 'Rất Cay', icon: '🌋' },
];

const DIETARY_OPTIONS = [
  { id: 'vegetarian', label: 'Ăn Chay (Ovo/Lacto)', icon: '🌿' },
  { id: 'vegan', label: 'Thuần Chay 100%', icon: '🌱' },
  { id: 'halal', label: 'Chuẩn Halal', icon: '🕌' },
  { id: 'gluten_free', label: 'Không Gluten', icon: '🌾' },
];

const DISLIKED_INGREDIENTS = [
  { id: 'onion', label: 'Hành lá / Củ hành' },
  { id: 'garlic', label: 'Tỏi' },
  { id: 'cilantro', label: 'Rau ngò / Mùi' },
  { id: 'peanut', label: 'Đậu phộng (Lạc)' },
  { id: 'seafood', label: 'Hải sản (Tôm, Cua)' },
  { id: 'pork', label: 'Thịt heo' },
  { id: 'beef', label: 'Thịt bò' },
];

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
];

export default function OnboardingScreen() {
  const router = useRouter();
  const updateUser = useAuthStore((s) => s.updateUser);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Step 1: Location state
  const [locationGranted, setLocationGranted] = useState<boolean>(false);
  const [detectedLocation, setDetectedLocation] = useState<string>('TP. Hồ Chí Minh (Gần bạn)');

  // Step 2: Cuisines
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([
    'pho_bun',
    'com_tam',
    'lau_nuong',
  ]);

  // Step 3: Dietary & Spice
  const [spiceTolerance, setSpiceTolerance] = useState<string>('medium');
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [dislikedList, setDislikedList] = useState<string[]>([]);

  // Step 4: Profile
  const [displayNamePublic, setDisplayNamePublic] = useState<string>('Foodie Explorer');
  const [displayNamePrivate, setDisplayNamePrivate] = useState<string>('Bạn Thân');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(PRESET_AVATARS[0]);
  const [bio, setBio] = useState<string>('Mê ẩm thực đường phố và thích khám phá quán mới mỗi ngày!');

  const toggleItem = (list: string[], setList: (v: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleRequestLocation = () => {
    setLocationGranted(true);
    setDetectedLocation('📍 Quận 1, TP. Hồ Chí Minh (Đã định vị)');
  };

  const handleCompleteOnboarding = async () => {
    try {
      setIsSubmitting(true);

      const cuisineScores: Record<string, number> = {};
      selectedCuisines.forEach((c) => {
        cuisineScores[c] = 90;
      });

      await preferencesApi.completeOnboarding({
        displayNamePrivate: displayNamePrivate.trim() || undefined,
        displayNamePublic: displayNamePublic.trim() || undefined,
        avatarUrl: selectedAvatar,
        bio: bio.trim() || undefined,
        preferences: {
          cuisineScores,
          priceRange: 2,
          dietaryRestrictions: selectedDietary,
          spiceTolerance,
          dislikedIngredients: dislikedList,
        },
      });

      // Cache locally for instant UI availability
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('user_is_onboarded', 'true');
        window.localStorage.setItem(
          'user_preferences',
          JSON.stringify({
            cuisineScores,
            priceRange: 2,
            dietaryRestrictions: selectedDietary,
            spiceTolerance,
            dislikedIngredients: dislikedList,
          })
        );
      }

      updateUser({ isOnboarded: true });
      setCurrentStep(5);
    } catch (error) {
      console.log('Non-blocking onboarding sync:', error);
      // Even if network fails, allow entering app smoothly
      updateUser({ isOnboarded: true });
      setCurrentStep(5);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepCard}>
            <View style={styles.iconCircle}>
              <Text style={styles.bigIcon}>📍</Text>
            </View>
            <Text style={styles.stepTitle}>Cho phép truy cập Vị trí GPS</Text>
            <Text style={styles.stepDescription}>
              Food Roulette sử dụng vị trí của bạn để quay và đề xuất các quán ăn ngon nhất quanh
              bạn trong bán kính 1km - 5km.
            </Text>

            <View style={styles.locationPreviewBox}>
              <Text style={styles.locationPreviewText}>
                {locationGranted ? `✅ ${detectedLocation}` : '📍 Vị trí chưa được cấp quyền'}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.primaryButton, locationGranted && styles.primaryButtonSuccess]}
              onPress={handleRequestLocation}
            >
              <Text style={styles.primaryButtonText}>
                {locationGranted ? '✓ ĐÃ CẤP QUYỀN VỊ TRÍ' : '📡 CHO PHÉP ĐỊNH VỊ GPS'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.skipButton}
              onPress={() => setCurrentStep(2)}
            >
              <Text style={styles.skipButtonText}>Để sau, tiếp tục ➔</Text>
            </TouchableOpacity>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepCard}>
            <Text style={styles.stepTitle}>Bạn thích ăn món gì nhất? 🍽️</Text>
            <Text style={styles.stepDescription}>
              Chọn ít nhất 2 thể loại yêu thích để thuật toán AI ưu tiên trên bánh xe quay.
            </Text>

            <ScrollView style={styles.scrollGrid} showsVerticalScrollIndicator={false}>
              <View style={styles.cuisineGrid}>
                {CUISINE_OPTIONS.map((c) => {
                  const isSelected = selectedCuisines.includes(c.id);
                  return (
                    <TouchableOpacity
                      key={c.id}
                      activeOpacity={0.8}
                      onPress={() => toggleItem(selectedCuisines, setSelectedCuisines, c.id)}
                      style={[styles.cuisineItem, isSelected && styles.cuisineItemSelected]}
                    >
                      <Text style={styles.cuisineIcon}>{c.icon}</Text>
                      <Text
                        style={[
                          styles.cuisineName,
                          isSelected && styles.cuisineNameSelected,
                        ]}
                      >
                        {c.name}
                      </Text>
                      {isSelected && <Text style={styles.checkBadge}>✓</Text>}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.primaryButton}
              onPress={() => setCurrentStep(3)}
            >
              <Text style={styles.primaryButtonText}>
                TIẾP TỤC ({selectedCuisines.length} MÓN ĐÃ CHỌN) ➔
              </Text>
            </TouchableOpacity>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepCard}>
            <Text style={styles.stepTitle}>Khẩu vị & Dị ứng ăn uống 🌶️</Text>
            <Text style={styles.stepDescription}>
              AI sẽ tự động lọc bỏ các món gây dị ứng hoặc không phù hợp với khẩu vị của bạn.
            </Text>

            <ScrollView style={styles.scrollForm} showsVerticalScrollIndicator={false}>
              {/* Spice Tolerance */}
              <Text style={styles.sectionHeaderTitle}>🔥 Mức độ ăn cay của bạn:</Text>
              <View style={styles.spiceRow}>
                {SPICE_LEVELS.map((sp) => (
                  <TouchableOpacity
                    key={sp.id}
                    activeOpacity={0.8}
                    onPress={() => setSpiceTolerance(sp.id)}
                    style={[
                      styles.spiceBtn,
                      spiceTolerance === sp.id && styles.spiceBtnActive,
                    ]}
                  >
                    <Text style={styles.spiceEmoji}>{sp.icon}</Text>
                    <Text
                      style={[
                        styles.spiceText,
                        spiceTolerance === sp.id && styles.spiceTextActive,
                      ]}
                    >
                      {sp.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Dietary Restrictions */}
              <Text style={[styles.sectionHeaderTitle, { marginTop: 16 }]}>
                🌱 Chế độ ăn uống đặc biệt:
              </Text>
              <View style={styles.tagWrap}>
                {DIETARY_OPTIONS.map((d) => {
                  const isChecked = selectedDietary.includes(d.id);
                  return (
                    <TouchableOpacity
                      key={d.id}
                      activeOpacity={0.8}
                      onPress={() => toggleItem(selectedDietary, setSelectedDietary, d.id)}
                      style={[styles.dietaryTag, isChecked && styles.dietaryTagActive]}
                    >
                      <Text style={styles.dietaryTagText}>
                        {d.icon} {d.label} {isChecked ? '✓' : ''}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Disliked Ingredients */}
              <Text style={[styles.sectionHeaderTitle, { marginTop: 16 }]}>
                🚫 Nguyên liệu muốn tránh (Dị ứng/Không ăn được):
              </Text>
              <View style={styles.tagWrap}>
                {DISLIKED_INGREDIENTS.map((ing) => {
                  const isChecked = dislikedList.includes(ing.id);
                  return (
                    <TouchableOpacity
                      key={ing.id}
                      activeOpacity={0.8}
                      onPress={() => toggleItem(dislikedList, setDislikedList, ing.id)}
                      style={[styles.dislikedTag, isChecked && styles.dislikedTagActive]}
                    >
                      <Text
                        style={[
                          styles.dislikedTagText,
                          isChecked && styles.dislikedTagTextActive,
                        ]}
                      >
                        {isChecked ? '❌ ' : '+ '}
                        {ing.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.primaryButton}
              onPress={() => setCurrentStep(4)}
            >
              <Text style={styles.primaryButtonText}>TIẾP THEO: THIẾT LẬP HỒ SƠ ➔</Text>
            </TouchableOpacity>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepCard}>
            <Text style={styles.stepTitle}>Hồ sơ & Avatar của bạn ✨</Text>
            <Text style={styles.stepDescription}>
              Tên và hình đại diện sẽ hiển thị khi bạn tham gia quay nhóm hoặc chia sẻ Locket.
            </Text>

            <ScrollView style={styles.scrollForm} showsVerticalScrollIndicator={false}>
              {/* Avatar Selector */}
              <Text style={styles.sectionHeaderTitle}>🖼️ Chọn ảnh đại diện:</Text>
              <View style={styles.avatarRow}>
                {PRESET_AVATARS.map((avatarUri, i) => (
                  <TouchableOpacity
                    key={i}
                    activeOpacity={0.8}
                    onPress={() => setSelectedAvatar(avatarUri)}
                    style={[
                      styles.avatarWrapper,
                      selectedAvatar === avatarUri && styles.avatarWrapperActive,
                    ]}
                  >
                    <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Display Names */}
              <Text style={[styles.sectionHeaderTitle, { marginTop: 14 }]}>
                👤 Tên hiển thị công khai (Bảng xếp hạng):
              </Text>
              <TextInput
                style={styles.inputField}
                placeholder="Vd: Hoàng Hiếu Foodie"
                placeholderTextColor="#a8a29e"
                value={displayNamePublic}
                onChangeText={setDisplayNamePublic}
              />

              <Text style={[styles.sectionHeaderTitle, { marginTop: 12 }]}>
                🔒 Biệt danh thân mật (Dành cho bạn bè):
              </Text>
              <TextInput
                style={styles.inputField}
                placeholder="Vd: Hiếu Mập"
                placeholderTextColor="#a8a29e"
                value={displayNamePrivate}
                onChangeText={setDisplayNamePrivate}
              />

              <Text style={[styles.sectionHeaderTitle, { marginTop: 12 }]}>
                ✍️ Giới thiệu ngắn về khẩu vị (Bio):
              </Text>
              <TextInput
                style={[styles.inputField, { height: 64, textAlignVertical: 'top' }]}
                placeholder="Thích ăn lẩu nướng, mê khám phá quán mới..."
                placeholderTextColor="#a8a29e"
                multiline
                value={bio}
                onChangeText={setBio}
              />
            </ScrollView>

            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.primaryButton, isSubmitting && styles.primaryButtonDisabled]}
              onPress={handleCompleteOnboarding}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>HOÀN TẤT & KHÁM PHÁ NGAY 🚀</Text>
              )}
            </TouchableOpacity>
          </View>
        );

      case 5:
      default:
        return (
          <View style={styles.stepCard}>
            <View style={styles.celebrationCircle}>
              <Text style={styles.bigCelebrationIcon}>🎉</Text>
            </View>
            <Text style={styles.celebrationTitle}>Chúc Mừng Bạn Đã Sẵn Sàng!</Text>
            <Text style={styles.stepDescription}>
              Hồ sơ ẩm thực AI của bạn đã được thiết lập thành công. Hãy bắt đầu cuộc phiêu lưu ẩm
              thực ngay hôm nay!
            </Text>

            {/* Taste Profile Summary Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Image source={{ uri: selectedAvatar }} style={styles.summaryAvatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.summaryName}>{displayNamePublic}</Text>
                  <Text style={styles.summaryBio}>{bio}</Text>
                </View>
              </View>

              <View style={styles.summaryDivider} />

              <View style={styles.summaryTagsRow}>
                <View style={styles.summaryBadge}>
                  <Text style={styles.summaryBadgeText}>
                    🍽️ {selectedCuisines.length} Thể loại yêu thích
                  </Text>
                </View>
                <View style={styles.summaryBadge}>
                  <Text style={styles.summaryBadgeText}>
                    🌶️ {SPICE_LEVELS.find((s) => s.id === spiceTolerance)?.label || 'Vừa'}
                  </Text>
                </View>
                {selectedDietary.length > 0 && (
                  <View style={styles.summaryBadge}>
                    <Text style={styles.summaryBadgeText}>🌿 {selectedDietary.length} Chế độ ăn</Text>
                  </View>
                )}
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.primaryButton, { backgroundColor: '#b52330' }]}
              onPress={() => router.replace('/(tabs)')}
            >
              <Text style={styles.primaryButtonText}>🎰 VÀO VÒNG QUAY CHỌN MÓN NGAY ➔</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Step Dots */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Text style={styles.brandTitle}>✨ FOOD ROULETTE</Text>
          <Text style={styles.stepIndicatorText}>Bước {currentStep} / 5</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarBg}>
          <View
            style={[styles.progressBarFill, { width: `${(currentStep / 5) * 100}%` }]}
          />
        </View>
      </View>

      {/* Main Content Area */}
      <View style={styles.contentArea}>{renderStepContent()}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8ef',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#fde68a',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#b52330',
    letterSpacing: 1,
  },
  stepIndicatorText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8e4e14',
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fef3c7',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#ea580c',
    borderRadius: 3,
  },
  contentArea: {
    flex: 1,
    padding: 16,
  },
  stepCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#fed7aa',
    shadowColor: '#d97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff7ed',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#ffedd5',
  },
  bigIcon: {
    fontSize: 32,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#292524',
    textAlign: 'center',
    marginBottom: 6,
  },
  stepDescription: {
    fontSize: 13,
    color: '#78716c',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  locationPreviewBox: {
    backgroundColor: '#f0fdf4',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#bbf7d0',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationPreviewText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#166534',
  },
  primaryButton: {
    backgroundColor: '#ea580c',
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    marginTop: 'auto',
  },
  primaryButtonSuccess: {
    backgroundColor: '#16a34a',
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#a8a29e',
  },
  scrollGrid: {
    flex: 1,
    marginBottom: 12,
  },
  cuisineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  cuisineItem: {
    width: '48%',
    backgroundColor: '#fffbeb',
    borderWidth: 1.5,
    borderColor: '#fde68a',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    position: 'relative',
  },
  cuisineItemSelected: {
    backgroundColor: '#ffedd5',
    borderColor: '#ea580c',
    borderWidth: 2,
  },
  cuisineIcon: {
    fontSize: 26,
    marginBottom: 4,
  },
  cuisineName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#44403c',
    textAlign: 'center',
  },
  cuisineNameSelected: {
    color: '#c2410c',
    fontWeight: '900',
  },
  checkBadge: {
    position: 'absolute',
    top: 6,
    right: 8,
    fontSize: 11,
    fontWeight: '900',
    color: '#ea580c',
  },
  scrollForm: {
    flex: 1,
    marginBottom: 12,
  },
  sectionHeaderTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#78350f',
    marginBottom: 8,
  },
  spiceRow: {
    flexDirection: 'row',
    gap: 6,
  },
  spiceBtn: {
    flex: 1,
    backgroundColor: '#fffbeb',
    borderWidth: 1.5,
    borderColor: '#fde68a',
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  spiceBtnActive: {
    backgroundColor: '#ea580c',
    borderColor: '#c2410c',
  },
  spiceEmoji: {
    fontSize: 16,
    marginBottom: 2,
  },
  spiceText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#78350f',
  },
  spiceTextActive: {
    color: '#ffffff',
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  dietaryTag: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1.5,
    borderColor: '#bbf7d0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  dietaryTagActive: {
    backgroundColor: '#16a34a',
    borderColor: '#15803d',
  },
  dietaryTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#166534',
  },
  dislikedTag: {
    backgroundColor: '#fff1f2',
    borderWidth: 1.5,
    borderColor: '#fecdd3',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  dislikedTagActive: {
    backgroundColor: '#e11d48',
    borderColor: '#be123c',
  },
  dislikedTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9f1239',
  },
  dislikedTagTextActive: {
    color: '#ffffff',
  },
  avatarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  avatarWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#fed7aa',
    overflow: 'hidden',
  },
  avatarWrapperActive: {
    borderColor: '#ea580c',
    borderWidth: 3,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  inputField: {
    backgroundColor: '#fffbeb',
    borderWidth: 1.5,
    borderColor: '#fed7aa',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    fontWeight: '700',
    color: '#292524',
    marginBottom: 4,
  },
  celebrationCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#fcd34d',
  },
  bigCelebrationIcon: {
    fontSize: 38,
  },
  celebrationTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#b52330',
    textAlign: 'center',
    marginBottom: 6,
  },
  summaryCard: {
    backgroundColor: '#fff7ed',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#fed7aa',
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#FFC107',
  },
  summaryName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#292524',
  },
  summaryBio: {
    fontSize: 11,
    color: '#78716c',
    marginTop: 2,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#fed7aa',
    marginVertical: 12,
  },
  summaryTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  summaryBadge: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  summaryBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#78350f',
  },
});
