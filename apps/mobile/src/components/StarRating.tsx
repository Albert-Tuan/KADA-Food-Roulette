import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface StarRatingProps {
  rating: number;
  size?: number;
  onChange?: (rating: number) => void;
  disabled?: boolean;
}

export function StarRating({ rating, size = 24, onChange, disabled = false }: StarRatingProps) {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          disabled={disabled || !onChange}
          onPress={() => onChange?.(star)}
        >
          <Text style={{ fontSize: size, color: star <= rating ? '#D97706' : '#E7E5E4' }}>
            ★
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 4,
  },
});
