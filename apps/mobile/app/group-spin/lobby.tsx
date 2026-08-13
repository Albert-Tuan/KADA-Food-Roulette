import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { GroupLobby } from '../../src/features/spin/components/GroupLobby';
import type { Restaurant } from '../../src/features/spin/types';

export default function GroupSpinLobbyScreen() {
  const router = useRouter();

  const handleSpinEnd = (winner: Restaurant) => {
    router.push({
      pathname: '/spin/result',
      params: {
        restaurantId: winner.id,
        restaurantName: winner.name,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header Navigation */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#292524" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nhóm Quay Roulette</Text>
        <View style={{ width: 36 }} />
      </View>

      <GroupLobby onSpinEnd={handleSpinEnd} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E7',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
    backgroundColor: '#FFF',
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#292524',
  },
});
