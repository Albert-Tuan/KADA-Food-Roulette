import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useGroupSpinStore } from '../../../stores/groupSpinStore';
import { useSpinStore } from '../../../stores/spinStore';
import { FoodRoulette } from './FoodRoulette';
import { SpinFilterSheet } from './SpinFilterSheet';
import { InviteMembersSheet } from './InviteMembersSheet';
import type { Restaurant } from '../types';

interface GroupLobbyProps {
  onSpinEnd: (winner: Restaurant) => void;
}

export function GroupLobby({ onSpinEnd }: GroupLobbyProps) {
  const router = useRouter();
  const { members } = useGroupSpinStore();
  const {
    candidates,
    filters,
    customCandidates: storeCustomCandidates,
    setFilters,
    addCustomCandidate,
    removeCustomCandidate,
    setCurrentResult,
  } = useSpinStore();
  const [customFoods, setCustomFoods] = useState<Record<string, string>>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const customCandidates: Restaurant[] = Object.entries(customFoods)
    .filter(([_, food]) => food.trim() !== '')
    .map(([memberId, food]) => ({
      id: `custom-${memberId}`,
      name: food,
      category: 'Đề xuất nhóm',
      rating: 5.0,
      totalReviews: 1,
      distance: 0,
      priceLevel: 2 as const,
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400',
    }));

  const displayCandidates = customCandidates.length > 0 ? customCandidates : candidates;

  const handleSpinEnd = (winner: Restaurant) => {
    setCurrentResult(winner);
    onSpinEnd(winner);
  };

  return (
    <>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setIsFilterOpen(true)} style={styles.filterButton}>
            <Text style={styles.filterIcon}>⚙️</Text>
          </TouchableOpacity>
          <View style={styles.avatarStack}>
            {members.slice(0, 5).map((m, i) => (
              <Image
                key={m.id}
                source={{ uri: m.avatarUrl }}
                style={[styles.avatar, { marginLeft: i > 0 ? -12 : 0, zIndex: 5 - i }]}
              />
            ))}
            <TouchableOpacity
              style={[
                styles.addMemberAvatarBtn,
                { marginLeft: members.length > 0 ? -12 : 0, zIndex: 10, elevation: 10 },
              ]}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={() => setIsInviteOpen(true)}
            >
              <Text style={styles.addMemberAvatarText}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.title}>Phòng Chờ (Lobby)</Text>
          <Text style={styles.subtitle}>Góp món cùng nhau, chốt nhanh kèo nhậu!</Text>
        </View>

        {/* Quick AI Tools Bar */}
        <View style={styles.aiToolsSection}>
          <TouchableOpacity
            style={styles.aiButton}
            onPress={() => router.push({ pathname: '/spin/menu-capture', params: { target: 'group' } })}
          >
            <Text style={styles.aiButtonIcon}>📷</Text>
            <Text style={styles.aiButtonText}>Quét Menu AI</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.aiButton, styles.aiVoiceButton]}
            onPress={() => router.push({ pathname: '/spin/voice-pick', params: { target: 'group' } })}
          >
            <Text style={styles.aiButtonIcon}>🎤</Text>
            <Text style={styles.aiVoiceButtonText}>Voice Pick Cá Nhân</Text>
          </TouchableOpacity>
        </View>

        {/* Custom Food Inputs */}
        <View style={styles.inputSection}>
          <Text style={styles.inputTitle}>Thêm đề xuất của nhóm</Text>
          <Text style={styles.inputHint}>
            Mỗi người có thể gợi ý 1 món. Nếu không ai gợi ý, vòng xoay sẽ tự chọn quán ngẫu nhiên.
          </Text>
          {members.map(member => (
            <View key={member.id} style={styles.memberInputRow}>
              <Image source={{ uri: member.avatarUrl }} style={styles.memberAvatar} />
              <Text style={styles.memberName} numberOfLines={1}>{member.name}</Text>
              <TextInput
                placeholder="Ví dụ: Cơm tấm, Pizza..."
                value={customFoods[member.id] || ''}
                onChangeText={(text) => setCustomFoods(prev => ({ ...prev, [member.id]: text }))}
                style={styles.memberInput}
                placeholderTextColor="#A8A29E"
              />
            </View>
          ))}
        </View>

        {/* Wheel */}
        <FoodRoulette
          candidates={displayCandidates}
          onSpinEnd={(winner) => handleSpinEnd(winner)}
        />
      </ScrollView>

      {/* Filter Sheet */}
      <SpinFilterSheet
        visible={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onApply={(f) => setFilters(f)}
        customCandidates={storeCustomCandidates.map(c => ({ id: c.id, name: c.name }))}
        onAddCustom={addCustomCandidate}
        onRemoveCustom={removeCustomCandidate}
      />

      {/* Invite Members Sheet */}
      <InviteMembersSheet
        visible={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
    position: 'relative',
  },
  filterButton: {
    position: 'absolute',
    top: 16,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E7E5E4',
    zIndex: 10,
  },
  filterIcon: {
    fontSize: 18,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  addMemberAvatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#FFF',
    backgroundColor: '#B52330',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMemberAvatarText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFF',
    marginTop: -2,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#B52330',
  },
  subtitle: {
    fontSize: 13,
    color: '#78716C',
    marginTop: 4,
  },
  inputSection: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E7E5E4',
  },
  inputTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B52330',
    marginBottom: 4,
  },
  inputHint: {
    fontSize: 12,
    color: '#78716C',
    marginBottom: 12,
  },
  memberInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7E5E4',
  },
  memberName: {
    fontSize: 13,
    fontWeight: '600',
    width: 56,
    color: '#292524',
  },
  memberInput: {
    flex: 1,
    backgroundColor: '#FAFAF9',
    borderWidth: 1,
    borderColor: '#E7E5E4',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#292524',
  },
  aiToolsSection: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 16,
  },
  aiButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  aiVoiceButton: {
    backgroundColor: '#FFF7ED',
    borderColor: '#EA580C',
  },
  aiButtonIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  aiButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
  },
  aiVoiceButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#C2410C',
  },
});
