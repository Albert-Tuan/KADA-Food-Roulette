import React, { useCallback, useImperativeHandle, forwardRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path, G, Text as SvgText } from 'react-native-svg';
import type { Restaurant } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const WHEEL_SIZE = Math.min(SCREEN_WIDTH - 64, 320);

const SEGMENT_COLORS = ['#FF5A5F', '#FFAB69', '#55A37A', '#FFC107', '#B52330', '#88D7AA'];

export interface FoodRouletteRef {
  spin: () => void;
  isSpinning: boolean;
}

export interface FoodRouletteProps {
  candidates: Restaurant[];
  onSpinEnd?: (winner: Restaurant, index: number) => void;
  disabled?: boolean;
  showSpinButton?: boolean;
}

export const FoodRoulette = forwardRef<FoodRouletteRef, FoodRouletteProps>(
  ({ candidates, onSpinEnd, disabled = false, showSpinButton = true }, ref) => {
    const rotation = useSharedValue(0);
    const [spinning, setSpinning] = React.useState(false);

    const segmentAngle = candidates.length > 0 ? 360 / candidates.length : 360;

    const handleSpinEnd = useCallback(
      (winner: Restaurant, index: number) => {
        setSpinning(false);
        onSpinEnd?.(winner, index);
      },
      [onSpinEnd]
    );

    const spin = useCallback(() => {
      if (spinning || disabled || candidates.length === 0) return;

      setSpinning(true);

      const extraSpins = (Math.floor(Math.random() * 4) + 3) * 360;
      const randomSegment = Math.floor(Math.random() * 360);
      const newRotation = rotation.value + extraSpins + randomSegment;

      rotation.value = withTiming(
        newRotation,
        {
          duration: 3500,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        },
        (finished) => {
          if (finished) {
            const pointerAngle = (360 - (newRotation % 360)) % 360;
            const sliceAngle = 360 / candidates.length;
            const winnerIndex = Math.floor(pointerAngle / sliceAngle) % candidates.length;
            runOnJS(handleSpinEnd)(candidates[winnerIndex], winnerIndex);
          }
        }
      );
    }, [spinning, disabled, rotation, candidates, handleSpinEnd]);

    useImperativeHandle(ref, () => ({
      spin,
      isSpinning: spinning,
    }));

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ rotate: `${rotation.value}deg` }],
    }));

    const renderSegments = () => {
      if (candidates.length === 0) return null;

      return candidates.map((candidate, index) => {
        const startAngle = index * segmentAngle;
        const endAngle = startAngle + segmentAngle;

        const startRad = (startAngle - 90) * (Math.PI / 180);
        const endRad = (endAngle - 90) * (Math.PI / 180);

        const center = WHEEL_SIZE / 2;
        const radius = center - 8;

        const x1 = center + radius * Math.cos(startRad);
        const y1 = center + radius * Math.sin(startRad);
        const x2 = center + radius * Math.cos(endRad);
        const y2 = center + radius * Math.sin(endRad);

        const largeArcFlag = segmentAngle > 180 ? 1 : 0;

        const pathData = [
          `M ${center} ${center}`,
          `L ${x1} ${y1}`,
          `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
          'Z',
        ].join(' ');

        const textAngle = startAngle + segmentAngle / 2;
        const textRad = (textAngle - 90) * (Math.PI / 180);
        const textRadius = radius * 0.6;
        const textX = center + textRadius * Math.cos(textRad);
        const textY = center + textRadius * Math.sin(textRad);

        const displayName =
          candidate.name.length > 12 ? candidate.name.substring(0, 11) + '…' : candidate.name;

        return (
          <G key={candidate.id}>
            <Path
              d={pathData}
              fill={SEGMENT_COLORS[index % SEGMENT_COLORS.length]}
              stroke="#FFF"
              strokeWidth={2}
            />
            <SvgText
              x={textX}
              y={textY}
              fill="white"
              fontSize={10}
              fontWeight="bold"
              textAnchor="middle"
              alignmentBaseline="middle"
              transform={`rotate(${textAngle}, ${textX}, ${textY})`}
            >
              {displayName}
            </SvgText>
          </G>
        );
      });
    };

    return (
      <View style={styles.container}>
        {/* Pointer */}
        <View style={styles.pointerContainer}>
          <Svg width={24} height={32} viewBox="0 0 24 32">
            <Path d="M12 32 L0 8 L24 8 Z" fill="#B52330" />
          </Svg>
        </View>

        {/* Wheel */}
        <Animated.View style={[styles.wheelContainer, animatedStyle]}>
          <Svg width={WHEEL_SIZE} height={WHEEL_SIZE} viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}>
            <G>{renderSegments()}</G>
          </Svg>

          {/* Center circle */}
          <View style={styles.centerCircle}>
            <Text style={styles.centerEmoji}>🍜</Text>
          </View>
        </Animated.View>

        {/* Spin Button (optional) */}
        {showSpinButton && (
          <View style={styles.buttonWrapper}>
            <Text
              style={[
                styles.spinButton,
                (spinning || disabled || candidates.length === 0) && styles.spinButtonDisabled,
              ]}
              onPress={spin}
            >
              {spinning ? '🔄 ĐANG QUAY...' : '🎉 QUAY NGAY!'}
            </Text>
          </View>
        )}
      </View>
    );
  }
);


const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  pointerContainer: {
    position: 'absolute',
    top: 0,
    zIndex: 10,
    alignItems: 'center',
  },
  wheelContainer: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  centerCircle: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFF',
    borderWidth: 4,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  centerEmoji: {
    fontSize: 22,
  },
  buttonWrapper: {
    marginTop: 20,
    width: '100%',
    paddingHorizontal: 40,
  },
  spinButton: {
    backgroundColor: '#B52330',
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 16,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#B52330',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  spinButtonDisabled: {
    opacity: 0.5,
  },
});
