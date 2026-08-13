import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, Animated, Easing, Share, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Svg, { Path, G, Text as SvgText } from 'react-native-svg';

export default function MenuWheelScreen() {
  const params = useLocalSearchParams();
  const [dishes, setDishes] = useState<any[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedDishes, setSelectedDishes] = useState<any[]>([]);
  const [lastWonDish, setLastWonDish] = useState<any | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [peopleCount, setPeopleCount] = useState(4);
  const [toastText, setToastText] = useState<string | null>(null);

  const spinValue = useRef(new Animated.Value(0)).current;
  const currentRotation = useRef(0);

  const showToast = (msg: string) => {
    setToastText(msg);
    setTimeout(() => {
      setToastText(null);
    }, 3000);
  };

  useEffect(() => {
    let parsed: any[] = [];
    if (params.menuItems) {
      try {
        parsed = typeof params.menuItems === 'string' ? JSON.parse(params.menuItems) : params.menuItems;
      } catch (e) {
        console.error('Failed to parse menuItems param:', e);
      }
    }

    if ((!parsed || parsed.length === 0) && typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem('active_spin_menu') || window.localStorage.getItem('latest_scanned_menu');
      if (saved) {
        try {
          parsed = JSON.parse(saved);
        } catch (e) {}
      }
    }

    if (Array.isArray(parsed) && parsed.length > 0) {
      setDishes(parsed);
    }
  }, [params.menuItems]);

  const wheelDishes = dishes.length > 0 ? dishes : [
    { name: 'Món 1' }, { name: 'Món 2' }, { name: 'Món 3' }
  ];

  const handleSpin = () => {
    if (isSpinning || wheelDishes.length === 0) return;
    setIsSpinning(true);
    setLastWonDish(null);

    const winnerIndex = Math.floor(Math.random() * wheelDishes.length);
    const winner = wheelDishes[winnerIndex];

    const sliceAngle = 360 / wheelDishes.length;
    const targetSliceAngle = 360 - (winnerIndex * sliceAngle + sliceAngle / 2);
    const extraRounds = (Math.floor(Math.random() * 3) + 4) * 360;
    const finalTargetDegree = currentRotation.current + extraRounds + (targetSliceAngle - (currentRotation.current % 360));

    currentRotation.current = finalTargetDegree;

    Animated.timing(spinValue, {
      toValue: finalTargetDegree,
      duration: 3000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(() => {
      setIsSpinning(false);
      setLastWonDish(winner);
      setSelectedDishes((prev) => [...prev, winner]);
    });
  };

  const handleRemoveSelectedDish = (index: number) => {
    setSelectedDishes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAllSelectedDishes = () => {
    if (selectedDishes.length === 0) return;
    setSelectedDishes([]);
    showToast('Đã xóa tất cả món đã chọn');
  };

  const totalBill = selectedDishes.reduce((sum, item) => sum + (item.priceVND || 0), 0);
  const perPersonPrice = Math.round(totalBill / (peopleCount || 1));

  const formatSummaryText = () => {
    let text = `🍻 DANH SÁCH MÓN ĂN ĐÃ CHỐT QUA AI FOOD ROULETTE:\n----------------------------------------\n`;
    selectedDishes.forEach((item, i) => {
      const priceStr = item.priceVND ? `${item.priceVND.toLocaleString('vi-VN')}đ` : 'Theo giá menu';
      text += `${i + 1}. ${item.name} - ${priceStr}\n`;
    });
    text += `----------------------------------------\n💵 Tổng tiền (${selectedDishes.length} món): ${totalBill.toLocaleString('vi-VN')}đ\n👥 Chia ${peopleCount} người: ~${perPersonPrice.toLocaleString('vi-VN')}đ/người\n👉 Cùng đi ăn thôi nào!`;
    return text;
  };

  const handleShareGroup = async () => {
    if (selectedDishes.length === 0) {
      Alert.alert('Thông báo', 'Chưa có món nào được chọn. Hãy bấm QUAY CHỌN MÓN trước!');
      return;
    }

    const text = formatSummaryText();

    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.navigator?.clipboard) {
      try {
        await window.navigator.clipboard.writeText(text);
        showToast('📋 Đã sao chép danh sách món! Gửi ngay cho nhóm bạn nhậu 🚀');
      } catch (e) {
        showToast('Đã tạo danh sách món thành công');
      }
    }

    try {
      await Share.share({
        title: '🍻 Danh sách món ăn nhậu Food Roulette',
        message: text,
      });
    } catch (e) {}
  };

  const handleGoBack = () => {
    router.replace('/spin/menu-review');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Floating Toast Notice */}
        {toastText && (
          <View style={styles.toastBanner}>
            <Text style={styles.toastText}>{toastText}</Text>
          </View>
        )}

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Text style={styles.backText}>← Trang trước</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🍻 Vòng Quay Chọn Món Tại Quán</Text>
          <Text style={styles.subtitle}>Quay chọn món ăn cho chầu nhậu / tiệc nhóm ({dishes.length} món)</Text>
        </View>

        {/* Winner Banner */}
        {lastWonDish && (
          <View style={styles.winnerBanner}>
            <Text style={styles.winnerTag}>🎉 VỪA QUAY TRÚNG:</Text>
            <Text style={styles.winnerName}>{lastWonDish.name}</Text>
            <Text style={styles.winnerPrice}>
              {lastWonDish.priceVND ? `${lastWonDish.priceVND.toLocaleString('vi-VN')}đ` : 'Theo giá menu'}
            </Text>
          </View>
        )}

        {/* Interactive SVG Roulette Wheel */}
        <View style={styles.wheelSection}>
          <View style={styles.pointerWrapper}>
            <Svg width={30} height={36} viewBox="0 0 30 36">
              <Path d="M15 36 L0 0 L30 0 Z" fill="#ea580c" stroke="#ffffff" strokeWidth={2} />
            </Svg>
          </View>

          <Animated.View
            style={[
              styles.svgWheelContainer,
              {
                transform: [
                  {
                    rotate: spinValue.interpolate({
                      inputRange: [0, 360],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            <Svg width={300} height={300} viewBox="0 0 300 300">
              <G>
                {wheelDishes.map((dish: any, idx: number) => {
                  const sliceAngle = 360 / wheelDishes.length;
                  const startAngle = idx * sliceAngle;
                  const endAngle = startAngle + sliceAngle;

                  const startRad = ((startAngle - 90) * Math.PI) / 180;
                  const endRad = ((endAngle - 90) * Math.PI) / 180;

                  const center = 150;
                  const radius = 140;

                  const x1 = center + radius * Math.cos(startRad);
                  const y1 = center + radius * Math.sin(startRad);
                  const x2 = center + radius * Math.cos(endRad);
                  const y2 = center + radius * Math.sin(endRad);

                  const largeArcFlag = sliceAngle > 180 ? 1 : 0;
                  const pathData = [
                    `M ${center} ${center}`,
                    `L ${x1} ${y1}`,
                    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                    'Z',
                  ].join(' ');

                  const midAngle = startAngle + sliceAngle / 2;
                  const midRad = ((midAngle - 90) * Math.PI) / 180;
                  const textRadius = radius * 0.65;
                  const textX = center + textRadius * Math.cos(midRad);
                  const textY = center + textRadius * Math.sin(midRad);

                  const colors = [
                    '#f97316', '#ea580c', '#84cc16', '#06b6d4',
                    '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
                    '#3b82f6', '#d97706', '#ef4444', '#14b8a6'
                  ];
                  const sliceColor = colors[idx % colors.length];
                  const shortName = dish.name.length > 14 ? dish.name.substring(0, 12) + '..' : dish.name;

                  return (
                    <G key={idx}>
                      <Path d={pathData} fill={sliceColor} stroke="#ffffff" strokeWidth={2} />
                      <SvgText
                        x={textX}
                        y={textY}
                        fill="#ffffff"
                        fontSize={wheelDishes.length > 12 ? 9 : 11}
                        fontWeight="bold"
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        transform={`rotate(${midAngle}, ${textX}, ${textY})`}
                      >
                        {shortName}
                      </SvgText>
                    </G>
                  );
                })}
              </G>
            </Svg>

            <View style={styles.centerHub}>
              <Text style={styles.centerHubEmoji}>🎲</Text>
            </View>
          </Animated.View>

          <TouchableOpacity
            style={[styles.spinButton, isSpinning && styles.disabledButton]}
            onPress={handleSpin}
            disabled={isSpinning || wheelDishes.length === 0}
          >
            <Text style={styles.spinButtonText}>
              {isSpinning ? '⏳ ĐANG QUAY CHỌN MÓN...' : '🎯 QUAY CHỌN MÓN TIẾP THEO!'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Selected Dishes Board (Bàn Ăn / Món Đã Chọn) */}
        <View style={styles.boardCard}>
          <View style={styles.boardHeader}>
            <Text style={styles.boardTitle}>🍴 Danh Sách Món Đã Chọn ({selectedDishes.length})</Text>
            {selectedDishes.length > 0 && (
              <TouchableOpacity onPress={handleClearAllSelectedDishes} style={styles.clearAllButton}>
                <Text style={styles.clearAllText}>↻ Xóa hết</Text>
              </TouchableOpacity>
            )}
          </View>

          {selectedDishes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🍽️</Text>
              <Text style={styles.emptyText}>Chưa có món nào được chọn.</Text>
              <Text style={styles.emptySubText}>Bấm QUAY CHỌN MÓN TIẾP THEO để AI gắp món lên bàn ăn!</Text>
            </View>
          ) : (
            <View style={styles.dishesList}>
              {selectedDishes.map((item, idx) => (
                <View key={idx} style={styles.dishCardItem}>
                  <View style={styles.dishCardLeft}>
                    <View style={styles.numberBadge}>
                      <Text style={styles.numberBadgeText}>{idx + 1}</Text>
                    </View>
                    <View style={styles.dishCardInfo}>
                      <Text style={styles.dishCardName}>{item.name}</Text>
                      {item.subDishes && item.subDishes.length > 0 && (
                        <Text style={styles.dishSubText}>Gồm: {item.subDishes.join(', ')}</Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.dishCardRight}>
                    <Text style={styles.dishCardPrice}>
                      {item.priceVND ? `${item.priceVND.toLocaleString('vi-VN')}đ` : ''}
                    </Text>
                    <TouchableOpacity onPress={() => handleRemoveSelectedDish(idx)} style={styles.trashBtn}>
                      <Text style={styles.trashIcon}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              <View style={styles.totalRowBar}>
                <Text style={styles.totalLabelText}>💵 Tổng tiền dự tính ({selectedDishes.length} món):</Text>
                <Text style={styles.totalValueText}>{totalBill.toLocaleString('vi-VN')}đ</Text>
              </View>
            </View>
          )}
        </View>

        {/* Action Footer Buttons (Chốt Danh Sách Món & Gửi Nhóm Bạn Nhậu) */}
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={styles.confirmBtnFilled}
            onPress={() => {
              if (selectedDishes.length === 0) {
                Alert.alert('Thông báo', 'Chưa chọn món nào. Bấm QUAY CHỌN MÓN trước!');
                return;
              }
              setIsModalVisible(true);
            }}
          >
            <Text style={styles.confirmBtnText}>✓ Chốt Danh Sách Món</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.shareBtnOutline} onPress={handleShareGroup}>
            <Text style={styles.shareBtnText}>🔗 Gửi Nhóm Bạn Nhậu</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderPattern}>
              <Text style={styles.modalHeaderBadge}>✨ PHIẾU ĐẶT MÓN AI ROULETTE ✨</Text>
              <Text style={styles.modalTitle}>🎉 BÀN ĂN ĐÃ CHỐT!</Text>
              <Text style={styles.modalSubtitle}>Danh sách món vừa được gắp từ vòng quay</Text>
            </View>

            <View style={styles.modalBody}>
              {/* People Splitter */}
              <View style={styles.peopleBox}>
                <Text style={styles.peopleLabel}>👥 Số người đi ăn cùng:</Text>
                <View style={styles.peopleCounter}>
                  <TouchableOpacity
                    style={styles.countBtn}
                    onPress={() => setPeopleCount(Math.max(1, peopleCount - 1))}
                  >
                    <Text style={styles.countBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.peopleCountVal}>{peopleCount}</Text>
                  <TouchableOpacity
                    style={styles.countBtn}
                    onPress={() => setPeopleCount(peopleCount + 1)}
                  >
                    <Text style={styles.countBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Receipt Items */}
              <ScrollView style={styles.modalReceiptScroll}>
                {selectedDishes.map((d, i) => (
                  <View key={i} style={styles.modalReceiptRow}>
                    <Text style={styles.modalItemName}>{i + 1}. {d.name}</Text>
                    <Text style={styles.modalItemPrice}>
                      {d.priceVND ? `${d.priceVND.toLocaleString('vi-VN')}đ` : ''}
                    </Text>
                  </View>
                ))}
              </ScrollView>

              <View style={styles.modalTotalBox}>
                <View style={styles.modalTotalRow}>
                  <Text style={styles.modalTotalLabel}>TỔNG THÀNH TIỀN:</Text>
                  <Text style={styles.modalTotalValue}>{totalBill.toLocaleString('vi-VN')}đ</Text>
                </View>
                <View style={styles.modalSplitRow}>
                  <Text style={styles.modalSplitLabel}>Chia trung bình ({peopleCount} người):</Text>
                  <Text style={styles.modalSplitValue}>~{perPersonPrice.toLocaleString('vi-VN')}đ / người</Text>
                </View>
              </View>

              <View style={styles.modalModalActions}>
                <TouchableOpacity style={styles.modalShareBtn} onPress={handleShareGroup}>
                  <Text style={styles.modalShareText}>📲 Gửi Nhóm Zalo / Messenger</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.closeModalButton}
                  onPress={() => setIsModalVisible(false)}
                >
                  <Text style={styles.closeModalText}>Đóng & Quay Tiếp</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffbeb',
  },
  scrollContent: {
    padding: 20,
  },
  toastBanner: {
    backgroundColor: '#10b981',
    padding: 12,
    borderRadius: 14,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  toastText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  header: {
    marginBottom: 16,
  },
  backButton: {
    marginBottom: 8,
  },
  backText: {
    fontSize: 14,
    color: '#d97706',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#292524',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#78716c',
  },
  winnerBanner: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 20,
    marginBottom: 20,
  },
  winnerTag: {
    fontSize: 10,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 2,
  },
  winnerName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
  },
  winnerPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#d1fae5',
  },
  wheelSection: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#fde68a',
    position: 'relative',
  },
  pointerWrapper: {
    position: 'absolute',
    top: 10,
    zIndex: 20,
    alignItems: 'center',
  },
  svgWheelContainer: {
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    position: 'relative',
  },
  centerHub: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffffff',
    borderWidth: 4,
    borderColor: '#f97316',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  centerHubEmoji: {
    fontSize: 24,
  },
  spinButton: {
    backgroundColor: '#f97316',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  spinButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
  },
  boardCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fde68a',
    marginBottom: 20,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  boardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f4',
    paddingBottom: 10,
    marginBottom: 12,
  },
  boardTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#292524',
  },
  clearAllButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#a8a29e',
  },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#78716c',
    marginBottom: 4,
  },
  emptySubText: {
    fontSize: 11,
    color: '#a8a29e',
    textAlign: 'center',
  },
  dishesList: {
    gap: 8,
  },
  dishCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#ffedd5',
    padding: 10,
    borderRadius: 16,
  },
  dishCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  numberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f97316',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  numberBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#ffffff',
  },
  dishCardInfo: {
    flex: 1,
  },
  dishCardName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#292524',
  },
  dishSubText: {
    fontSize: 10,
    color: '#78716c',
    marginTop: 2,
  },
  dishCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dishCardPrice: {
    fontSize: 12,
    fontWeight: '900',
    color: '#78350f',
  },
  trashBtn: {
    padding: 4,
  },
  trashIcon: {
    fontSize: 14,
  },
  totalRowBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#fed7aa',
    marginTop: 8,
  },
  totalLabelText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#44403c',
  },
  totalValueText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#047857',
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 30,
  },
  confirmBtnFilled: {
    flex: 1,
    backgroundColor: '#ea580c',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  confirmBtnText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#ffffff',
  },
  shareBtnOutline: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#d6d3d1',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#292524',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  modalHeaderPattern: {
    backgroundColor: '#ea580c',
    padding: 18,
    alignItems: 'center',
  },
  modalHeaderBadge: {
    fontSize: 9,
    fontWeight: '900',
    color: '#ffffff',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 2,
  },
  modalSubtitle: {
    fontSize: 11,
    color: '#ffedd5',
  },
  modalBody: {
    padding: 16,
  },
  peopleBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ffedd5',
    marginBottom: 12,
  },
  peopleLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#44403c',
  },
  peopleCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f97316',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ea580c',
  },
  peopleCountVal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#292524',
    minWidth: 16,
    textAlign: 'center',
  },
  modalReceiptScroll: {
    maxHeight: 180,
    backgroundColor: '#f5f5f4',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  modalReceiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e7e5e4',
  },
  modalItemName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#292524',
    flex: 1,
  },
  modalItemPrice: {
    fontSize: 12,
    fontWeight: '800',
    color: '#78716c',
  },
  modalTotalBox: {
    backgroundColor: '#ecfdf5',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#a7f3d0',
    marginBottom: 14,
  },
  modalTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalTotalLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#065f46',
  },
  modalTotalValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#047857',
  },
  modalSplitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#a7f3d0',
    paddingTop: 4,
  },
  modalSplitLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  modalSplitValue: {
    fontSize: 12,
    fontWeight: '900',
    color: '#065f46',
  },
  modalModalActions: {
    gap: 8,
  },
  modalShareBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalShareText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
  closeModalButton: {
    backgroundColor: '#ea580c',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  closeModalText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },
});
