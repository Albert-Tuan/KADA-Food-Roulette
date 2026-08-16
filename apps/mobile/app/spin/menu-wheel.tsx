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
  const [lastWonDishes, setLastWonDishes] = useState<any[]>([]);
  const [spinMode, setSpinMode] = useState<1 | 2 | 3>(1);
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
    { name: 'Phở Bò Đặc Biệt', priceVND: 65000, category: 'món chính' },
    { name: 'Cơm Tấm Sườn Bì', priceVND: 55000, category: 'món chính' },
    { name: 'Bún Chả Hà Nội', priceVND: 60000, category: 'món chính' },
    { name: 'Gỏi Cuốn Tôm Thịt', priceVND: 40000, category: 'món phụ' },
    { name: 'Trà Đào Cam Sả', priceVND: 35000, category: 'đồ uống' },
    { name: 'Bánh Flan Tráng Miệng', priceVND: 25000, category: 'tráng miệng' },
  ];

  const handleSpin = () => {
    if (isSpinning || wheelDishes.length === 0) return;
    setIsSpinning(true);
    setLastWonDishes([]);

    const sliceAngle = 360 / wheelDishes.length;
    const extraRounds = (Math.floor(Math.random() * 3) + 4) * 360;
    const randomOffset = Math.floor(Math.random() * 360);
    const finalTargetDegree = currentRotation.current + extraRounds + randomOffset;

    currentRotation.current = finalTargetDegree;

    Animated.timing(spinValue, {
      toValue: finalTargetDegree,
      duration: 3200,
      easing: Easing.bezier(0.15, 0.85, 0.35, 1.05),
      useNativeDriver: false,
    }).start(() => {
      setIsSpinning(false);
      
      const normalizedRot = (finalTargetDegree % 360);
      const won: any[] = [];
      const usedIndices = new Set<number>();

      // Pointer offsets in degrees based on spinMode
      let pointerOffsets = [0]; // Top pointer at 0°
      if (spinMode === 2) {
        pointerOffsets = [0, 180]; // Top (0°) and Bottom (180°)
      } else if (spinMode === 3) {
        pointerOffsets = [0, 120, 240]; // 3 equidistant pointers
      }

      pointerOffsets.forEach((offset) => {
        const pointerAngle = (360 - ((normalizedRot + offset) % 360)) % 360;
        let index = Math.floor(pointerAngle / sliceAngle) % wheelDishes.length;
        
        // If duplicate in multi-pick mode, shift to next available if possible
        if (usedIndices.has(index) && wheelDishes.length >= pointerOffsets.length) {
          for (let step = 1; step < wheelDishes.length; step++) {
            const nextIdx = (index + step) % wheelDishes.length;
            if (!usedIndices.has(nextIdx)) {
              index = nextIdx;
              break;
            }
          }
        }
        
        usedIndices.add(index);
        won.push(wheelDishes[index]);
      });

      setLastWonDishes(won);
      setSelectedDishes((prev) => [...prev, ...won]);
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
    let text = `🍻 DANH SÁCH MÓN ĂN ĐÃ CHỐT QUA AI FOOD ROULETTE 3D:\n----------------------------------------\n`;
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
            <Text style={styles.backText}>← Quay lại</Text>
          </TouchableOpacity>
          <Text style={styles.title}>🎰 Vòng Quay 3D Chọn Món Menu</Text>
          <Text style={styles.subtitle}>Quay chọn ngẫu nhiên 1 đến 3 món cùng lúc ({wheelDishes.length} món sẵn sàng)</Text>
        </View>

        {/* Multi-Dish Spin Mode Selector (1, 2, 3 món cùng quay) */}
        <View style={styles.modeSelectorCard}>
          <Text style={styles.modeSelectorTitle}>⚡ CHỌN SỐ MÓN QUAY CÙNG LÚC:</Text>
          <View style={styles.modeButtonsRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => !isSpinning && setSpinMode(1)}
              style={[styles.modeButton, spinMode === 1 && styles.modeButtonActive]}
            >
              <Text style={[styles.modeButtonText, spinMode === 1 && styles.modeButtonTextActive]}>
                🎯 1 Món
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => !isSpinning && setSpinMode(2)}
              style={[styles.modeButton, spinMode === 2 && styles.modeButtonActive]}
            >
              <Text style={[styles.modeButtonText, spinMode === 2 && styles.modeButtonTextActive]}>
                ✌️ 2 Món (Đôi)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => !isSpinning && setSpinMode(3)}
              style={[styles.modeButton, spinMode === 3 && styles.modeButtonActive]}
            >
              <Text style={[styles.modeButtonText, spinMode === 3 && styles.modeButtonTextActive]}>
                👑 3 Món (Mâm)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Winner Banner (Combo 1-3 Món Vừa Trúng) */}
        {lastWonDishes.length > 0 && (
          <View style={styles.winnerBanner}>
            <View style={styles.winnerBannerHeader}>
              <Text style={styles.winnerTag}>
                {lastWonDishes.length === 1 ? '🎉 VỪA QUAY TRÚNG 1 MÓN:' : `🎉 VỪA QUAY TRÚNG COMBO ${lastWonDishes.length} MÓN CÙNG LÚC:`}
              </Text>
              <Text style={styles.winnerCountBadge}>+{lastWonDishes.length} món</Text>
            </View>

            <View style={styles.winnerItemsList}>
              {lastWonDishes.map((wonItem, idx) => (
                <View key={idx} style={styles.winnerItemRow}>
                  <View style={styles.winnerItemBadge}>
                    <Text style={styles.winnerItemBadgeText}>{idx + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.winnerName}>{wonItem.name}</Text>
                    <Text style={styles.winnerPrice}>
                      {wonItem.priceVND ? `${wonItem.priceVND.toLocaleString('vi-VN')}đ` : 'Theo giá menu'}
                    </Text>
                  </View>
                  <Text style={styles.winnerItemCategory}>{wonItem.category || 'món ngon'}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 3D Interactive SVG Roulette Wheel with Dynamic Multi-Pointers */}
        <View style={styles.wheelSection}>
          {/* Top Pointer (0°) */}
          <View style={styles.pointerTopWrapper}>
            <Svg width={32} height={38} viewBox="0 0 30 36">
              <Path d="M15 36 L0 0 L30 0 Z" fill="#b52330" stroke="#FFC107" strokeWidth={3} />
            </Svg>
            <View style={styles.pointerBadge}>
              <Text style={styles.pointerBadgeText}>1</Text>
            </View>
          </View>

          {/* Pointer 2 (180° for Mode 2, or 120° for Mode 3) */}
          {spinMode === 2 && (
            <View style={styles.pointerBottomWrapper}>
              <View style={styles.pointerBadge}>
                <Text style={styles.pointerBadgeText}>2</Text>
              </View>
              <Svg width={32} height={38} viewBox="0 0 30 36">
                <Path d="M15 0 L0 36 L30 36 Z" fill="#166b47" stroke="#FFC107" strokeWidth={3} />
              </Svg>
            </View>
          )}

          {spinMode === 3 && (
            <>
              {/* Pointer 2 at 120° (Bottom Right) */}
              <View style={styles.pointer120Wrapper}>
                <Svg width={32} height={38} viewBox="0 0 30 36" style={{ transform: [{ rotate: '120deg' }] }}>
                  <Path d="M15 36 L0 0 L30 0 Z" fill="#166b47" stroke="#FFC107" strokeWidth={3} />
                </Svg>
                <View style={styles.pointerBadge}>
                  <Text style={styles.pointerBadgeText}>2</Text>
                </View>
              </View>

              {/* Pointer 3 at 240° (Bottom Left) */}
              <View style={styles.pointer240Wrapper}>
                <Svg width={32} height={38} viewBox="0 0 30 36" style={{ transform: [{ rotate: '240deg' }] }}>
                  <Path d="M15 36 L0 0 L30 0 Z" fill="#8e4e14" stroke="#FFC107" strokeWidth={3} />
                </Svg>
                <View style={styles.pointerBadge}>
                  <Text style={styles.pointerBadgeText}>3</Text>
                </View>
              </View>
            </>
          )}

          {/* 3D Wheel Disc */}
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
            <Svg width={310} height={310} viewBox="0 0 310 310">
              {/* Outer 3D Metallic Ring */}
              <Path
                d="M 155, 155 m -150, 0 a 150,150 0 1,0 300,0 a 150,150 0 1,0 -300,0"
                fill="#800000"
                stroke="#FFC107"
                strokeWidth={8}
              />

              <G>
                {wheelDishes.map((dish: any, idx: number) => {
                  const sliceAngle = 360 / wheelDishes.length;
                  const startAngle = idx * sliceAngle;
                  const endAngle = startAngle + sliceAngle;

                  const startRad = ((startAngle - 90) * Math.PI) / 180;
                  const endRad = ((endAngle - 90) * Math.PI) / 180;

                  const center = 155;
                  const radius = 142;

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
                    '#b52330', '#ffab69', '#166b47', '#FFC107',
                    '#ff5a5f', '#55a37a', '#8e4e14', '#93000a',
                    '#2563eb', '#d97706', '#059669', '#7c3aed'
                  ];
                  const sliceColor = colors[idx % colors.length];
                  const shortName = dish.name.length > 12 ? dish.name.substring(0, 10) + '..' : dish.name;

                  return (
                    <G key={idx}>
                      <Path d={pathData} fill={sliceColor} stroke="#ffffff" strokeWidth={2.5} />
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

            {/* 3D Center Hub */}
            <View style={styles.centerHub}>
              <View style={styles.centerHubInner}>
                <Text style={styles.centerHubEmoji}>🎲</Text>
              </View>
            </View>
          </Animated.View>

          <TouchableOpacity
            style={[styles.spinButton, isSpinning && styles.disabledButton]}
            onPress={handleSpin}
            disabled={isSpinning || wheelDishes.length === 0}
            activeOpacity={0.85}
          >
            <Text style={styles.spinButtonText}>
              {isSpinning 
                ? '⏳ ĐANG QUAY CHỌN MÓN...' 
                : `🎰 QUAY NGAY (${spinMode} MÓN CÙNG LÚC)!`}
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
  modeSelectorCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#fde68a',
    shadowColor: '#d97706',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  modeSelectorTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#92400e',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  modeButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#fffbeb',
    borderWidth: 1.5,
    borderColor: '#fcd34d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#ea580c',
    borderColor: '#c2410c',
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 4,
  },
  modeButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#78350f',
  },
  modeButtonTextActive: {
    color: '#ffffff',
    fontWeight: '900',
  },
  winnerBanner: {
    backgroundColor: '#059669',
    padding: 16,
    borderRadius: 22,
    marginBottom: 20,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1.5,
    borderColor: '#34d399',
  },
  winnerBannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  winnerTag: {
    fontSize: 11,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  winnerCountBadge: {
    fontSize: 11,
    fontWeight: '900',
    color: '#065f46',
    backgroundColor: '#a7f3d0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  winnerItemsList: {
    gap: 8,
  },
  winnerItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    padding: 10,
    borderRadius: 14,
    gap: 8,
  },
  winnerItemBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  winnerItemBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#059669',
  },
  winnerName: {
    fontSize: 15,
    fontWeight: '900',
    color: '#ffffff',
  },
  winnerPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#d1fae5',
  },
  winnerItemCategory: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ecfdf5',
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    textTransform: 'uppercase',
  },
  wheelSection: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#fde68a',
    position: 'relative',
    shadowColor: '#d97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  pointerTopWrapper: {
    position: 'absolute',
    top: 8,
    zIndex: 30,
    alignItems: 'center',
  },
  pointerBottomWrapper: {
    position: 'absolute',
    bottom: 84,
    zIndex: 30,
    alignItems: 'center',
  },
  pointer120Wrapper: {
    position: 'absolute',
    bottom: 120,
    right: 28,
    zIndex: 30,
    alignItems: 'center',
  },
  pointer240Wrapper: {
    position: 'absolute',
    bottom: 120,
    left: 28,
    zIndex: 30,
    alignItems: 'center',
  },
  pointerBadge: {
    position: 'absolute',
    top: 3,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointerBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#b52330',
  },
  svgWheelContainer: {
    width: 310,
    height: 310,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
    position: 'relative',
  },
  centerHub: {
    position: 'absolute',
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#b52330',
    borderWidth: 4,
    borderColor: '#FFC107',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 8,
  },
  centerHubInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerHubEmoji: {
    fontSize: 22,
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
