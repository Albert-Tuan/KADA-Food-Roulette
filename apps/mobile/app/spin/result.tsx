import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSpinStore } from '../../src/stores/spinStore';
import { SpinResultCard } from '../../src/features/spin/components/SpinResultCard';

export default function SpinResultScreen() {
  const router = useRouter();
  const { currentResult } = useSpinStore();

  if (!currentResult) {
    router.replace('/(tabs)/spin');
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <SpinResultCard
          restaurant={currentResult}
          onSpinAgain={() => router.replace('/(tabs)/spin')}
          onAccept={() => router.replace('/spin/lucky-spin')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
