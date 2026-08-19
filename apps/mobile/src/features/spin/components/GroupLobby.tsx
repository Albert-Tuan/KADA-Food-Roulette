import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, TextInput, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useGroupSpinStore } from '../../../stores/groupSpinStore';
import { useSpinStore } from '../../../stores/spinStore';
import { FoodRoulette, type FoodRouletteRef } from './FoodRoulette';
import { SpinFilterSheet } from './SpinFilterSheet';
import { InviteMembersSheet } from './InviteMembersSheet';
import { GroupVoteVeto } from './GroupVoteVeto';
import { GroupVoteResult } from './GroupVoteResult';
import type { Restaurant } from '../types';

interface GroupLobbyProps {
  onSpinEnd?: (winner: Restaurant) => void;
}

type GroupSpinStep = 'LOBBY' | 'VOTE_VETO' | 'VOTE_RESULT';

export function GroupLobby({ onSpinEnd }: GroupLobbyProps) {
  const router = useRouter();
  const rouletteRef = useRef<FoodRouletteRef>(null);
  const { members } = useGroupSpinStore();
  const {
    candidates,
    filters,
    customCandidates: storeCustomCandidates,
    setFilters,
    addCustomCandidate,
    removeCustomCandidate,
    setCurrentResult,
    resetStore,
    currentResult,
  } = useSpinStore();
  const [step, setStep] = useState<GroupSpinStep>('LOBBY');
  const [newFoodInput, setNewFoodInput] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  const displayCandidates = storeCustomCandidates.length > 0 ? storeCustomCandidates : candidates;
  const allReady = members.length > 0;

  const handleSpinEnd = (winner: Restaurant) => {
    setIsSpinning(false);
    setCurrentResult(winner);
    if (onSpinEnd) onSpinEnd(winner);
    setStep('VOTE_VETO');
  };

  const handleAddDish = (dishName: string) => {
    if (!dishName.trim()) return;
    addCustomCandidate(dishName.trim());
    setNewFoodInput('');
  };

  if (step === 'VOTE_VETO') {
    return (
      <View style={styles.container}>
        <GroupVoteVeto
          onVote={(decision) => {
            if (decision === 'ACCEPT') {
              setStep('VOTE_RESULT');
            } else {
              setStep('LOBBY');
            }
          }}
        />
      </View>
    );
  }

  if (step === 'VOTE_RESULT') {
    return (
      <View style={styles.container}>
        <GroupVoteResult
          onCreatePact={() => {
            Alert.alert('🤝 Khế Ước Thành Công', 'Cả nhóm đã lập khế ước ăn uống thành công!');
          }}
          onRespin={() => setStep('LOBBY')}
          onDirections={() => {
            const resultData = currentResult || candidates[0];
            if (resultData) {
              const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(resultData.name)}`;
              Linking.openURL(url).catch(() => Alert.alert('Lỗi', 'Không thể mở bản đồ'));
            } else {
              Alert.alert('🧭 Chỉ đường', 'Đang mở bản đồ chỉ đường đến quán...');
            }
          }}
        />
      </View>
    );
  }

  return (
    <>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Room Header Banner */}
          <View style={styles.roomCard}>
            <View style={styles.roomHeaderRow}>
              <View>
                <View style={styles.roomCodeBadge}>
                  <Text style={styles.roomCodeText}>MÃ PHÒNG: #PARTY2026 📋</Text>
                </View>
                <Text style={styles.roomTitle}>Phòng Nhậu Roulette 🍻</Text>
                <Text style={styles.roomSubtitle}>Góp món cùng nhau, chốt nhanh kèo nhậu trong 30s!</Text>
              </View>
              <TouchableOpacity onPress={() => setIsFilterOpen(true)} style={styles.settingsBtn}>
                <Text style={styles.settingsIcon}>⚙️</Text>
              </TouchableOpacity>
            </View>

            {/* Member Avatars Bar */}
            <View style={styles.membersBar}>
              <Text style={styles.membersTitle}>Thành viên ({members.length}):</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.avatarScroll}>
                {members.map((m, i) => (
                  <View key={m.id} style={styles.avatarWrapper}>
                    <Image source={{ uri: m.avatarUrl }} style={styles.avatarImage} />
                    {i === 0 && (
                      <View style={styles.hostCrown}>
                        <Text style={styles.hostCrownText}>👑</Text>
                      </View>
                    )}
                    <Text style={styles.avatarName} numberOfLines={1}>{m.name}</Text>
                  </View>
                ))}

                <TouchableOpacity
                  style={styles.addMemberBtn}
                  onPress={() => setIsInviteOpen(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.addMemberIcon}>➕</Text>
                  <Text style={styles.addMemberText}>Mời bạn</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>

          {/* Quick AI & Input Helper Tools */}
          <View style={styles.toolsContainer}>
            <Text style={styles.toolsSectionTitle}>⚡ GỢI Ý MÓN ĂN NHANH</Text>

            {/* AI Shortcut Strip */}
            <View style={styles.aiToolsRow}>
              <TouchableOpacity
                style={styles.aiToolBtnPink}
                onPress={() => router.push('/spin/menu-capture?target=group' as any)}
                activeOpacity={0.85}
              >
                <Text style={styles.aiToolIcon}>📷</Text>
                <View>
                  <Text style={styles.aiToolTitle}>Quét Menu AI</Text>
                  <Text style={styles.aiToolSub}>Tự bóc tách thực đơn</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.aiToolBtnOrange}
                onPress={() => router.push('/spin/voice-pick?target=group' as any)}
                activeOpacity={0.85}
              >
                <Text style={styles.aiToolIcon}>🎙️</Text>
                <View>
                  <Text style={styles.aiToolTitle}>Voice Pick</Text>
                  <Text style={styles.aiToolSub}>Nói thèm gì AI chọn nấy</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Unified Custom Input Bar */}
            <View style={styles.addInputRow}>
              <TextInput
                placeholder="Ví dụ: Bún đậu mắm tôm, Lẩu thái..."
                value={newFoodInput}
                onChangeText={setNewFoodInput}
                onSubmitEditing={() => handleAddDish(newFoodInput)}
                style={styles.addInput}
                placeholderTextColor="#8e4e14"
              />
              <TouchableOpacity
                style={styles.addInputBtn}
                onPress={() => handleAddDish(newFoodInput)}
                activeOpacity={0.85}
              >
                <Text style={styles.addInputBtnText}>➕ Thêm</Text>
              </TouchableOpacity>
            </View>

            {/* Fast Suggestion Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
              {['🍜 Phở Thìn', '🥩 Lẩu Gyu-Kaku', '🍕 Pizza Hut', '🧋 Trà Sữa KOI', '🍚 Cơm Tấm Ba Ghiền'].map((chip, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.quickChip}
                  onPress={() => handleAddDish(chip.substring(3))}
                >
                  <Text style={styles.quickChipText}>{chip}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Group Candidates Pool Display */}
          {storeCustomCandidates.length > 0 && (
            <View style={styles.poolSection}>
              <View style={styles.poolHeader}>
                <Text style={styles.poolTitle}>🎯 Món Nhóm Đã Đề Xuất ({storeCustomCandidates.length})</Text>
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert('Xóa tất cả', 'Bạn có chắc chắn muốn làm mới danh sách?', [
                      { text: 'Hủy', style: 'cancel' },
                      { text: 'Xóa', style: 'destructive', onPress: () => resetStore() },
                    ]);
                  }}
                >
                  <Text style={styles.clearAllText}>Xóa tất cả 🔄</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.chipGrid}>
                {storeCustomCandidates.map((c) => (
                  <View key={c.id} style={styles.candidateBadge}>
                    <Text style={styles.candidateText}>🍽️ {c.name}</Text>
                    <TouchableOpacity onPress={() => removeCustomCandidate(c.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Text style={styles.removeIcon}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* The Spin Wheel */}
          <View style={styles.wheelWrapper}>
            <FoodRoulette
              ref={rouletteRef}
              showSpinButton={false}
              candidates={displayCandidates}
              onSpinEnd={(winner) => handleSpinEnd(winner)}
            />
          </View>
        </ScrollView>

        {/* Fixed 3D Game Press Action Dock */}
        <View style={styles.bottomDock}>
          <TouchableOpacity
            style={[styles.startSpinBtn, (!allReady || isSpinning) && styles.startSpinBtnDisabled]}
            disabled={!allReady || isSpinning}
            activeOpacity={0.88}
            onPress={() => {
              setIsSpinning(true);
              rouletteRef.current?.spin();
            }}
          >
            <Text style={styles.startSpinText}>
              {isSpinning
                ? '🔄 ĐANG QUAY VÒNG NHÓM...'
                : allReady
                ? `🎉 QUAY NHÓM NGAY! (${members.length} NGƯỜI SẴN SÀNG)`
                : 'Đợi mọi người tham gia...'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Filter Sheet */}
      <SpinFilterSheet
        visible={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onApply={(f) => setFilters(f)}
        customCandidates={storeCustomCandidates.map((c) => ({ id: c.id, name: c.name }))}
        onAddCustom={addCustomCandidate}
        onRemoveCustom={removeCustomCandidate}
      />

      {/* Invite Members Sheet */}
      <InviteMembersSheet visible={isInviteOpen} onClose={() => setIsInviteOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8ef',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },

  // Room Card Banner
  roomCard: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#e2bebc',
    shadowColor: '#b52330',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  roomHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  roomCodeBadge: {
    backgroundColor: '#ffdad8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#ff5a5f',
  },
  roomCodeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#b52330',
  },
  roomTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: '#b52330',
  },
  roomSubtitle: {
    fontSize: 12,
    color: '#8e4e14',
    marginTop: 2,
    fontWeight: '600',
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff8ef',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2bebc',
  },
  settingsIcon: {
    fontSize: 18,
  },

  // Members Bar
  membersBar: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#fbf3e4',
  },
  membersTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8e4e14',
    marginBottom: 8,
  },
  avatarScroll: {
    gap: 12,
    alignItems: 'center',
  },
  avatarWrapper: {
    alignItems: 'center',
    position: 'relative',
  },
  avatarImage: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: '#b52330',
  },
  hostCrown: {
    position: 'absolute',
    top: -6,
    right: -2,
    backgroundColor: '#FFC107',
    borderRadius: 10,
    paddingHorizontal: 3,
  },
  hostCrownText: {
    fontSize: 10,
  },
  avatarName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#5a403f',
    marginTop: 3,
    maxWidth: 50,
  },
  addMemberBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#b52330',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#b52330',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addMemberIcon: {
    fontSize: 14,
    color: '#ffffff',
  },
  addMemberText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: -2,
  },

  // Tools Container
  toolsContainer: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  toolsSectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#8e4e14',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  aiToolsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  aiToolBtnPink: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffdad8',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#ff5a5f',
    gap: 8,
  },
  aiToolBtnOrange: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffdcc4',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#ffab69',
    gap: 8,
  },
  aiToolIcon: {
    fontSize: 22,
  },
  aiToolTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#b52330',
  },
  aiToolSub: {
    fontSize: 10.5,
    color: '#8e4e14',
    fontWeight: '600',
  },

  // Input Row
  addInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  addInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2bebc',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13.5,
    color: '#b52330',
    fontWeight: '700',
  },
  addInputBtn: {
    backgroundColor: '#b52330',
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: '#61000e',
  },
  addInputBtnText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 13,
  },

  // Fast Chips
  chipScroll: {
    gap: 8,
  },
  quickChip: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2bebc',
  },
  quickChipText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#b52330',
  },

  // Candidates Pool
  poolSection: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#e2bebc',
  },
  poolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  poolTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#b52330',
  },
  clearAllText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#8e4e14',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  candidateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffdad8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ff5a5f',
    gap: 6,
  },
  candidateText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#b52330',
  },
  removeIcon: {
    fontSize: 12,
    fontWeight: '900',
    color: '#b52330',
    marginLeft: 2,
  },

  // Wheel
  wheelWrapper: {
    marginTop: 10,
  },

  // Bottom Dock
  bottomDock: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1.5,
    borderTopColor: '#e2bebc',
  },
  startSpinBtn: {
    backgroundColor: '#b52330',
    paddingVertical: 15,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#61000e',
    shadowColor: '#b52330',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  startSpinBtnDisabled: {
    backgroundColor: '#e1d9cb',
    borderBottomColor: '#8e706f',
  },
  startSpinText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
