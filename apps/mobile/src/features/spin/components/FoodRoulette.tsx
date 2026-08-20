import React, { useCallback, useImperativeHandle, forwardRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path, G, Text as SvgText, Circle } from 'react-native-svg';
import type { Restaurant } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const WHEEL_SIZE = Math.min(SCREEN_WIDTH - 48, 330);
const CENTER = WHEEL_SIZE / 2;
const RADIUS = CENTER - 18;

const SEGMENT_COLORS = [
  '#b52330', // Deep Crimson Red
  '#ffab69', // Warm Apricot
  '#166b47', // Garden Green
  '#FFC107', // Gold
  '#ff5a5f', // Coral Red
  '#55a37a', // Mint Green
  '#8e4e14', // Harvest Orange
  '#93000a', // Ruby Red
];

function getFoodEmoji(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('phở') || lower.includes('bún') || lower.includes('mì') || lower.includes('ramen')) return '🍜';
  if (lower.includes('cơm')) return '🍚';
  if (lower.includes('lẩu') || lower.includes('nướng') || lower.includes('bbq') || lower.includes('gyu')) return '🥩';
  if (lower.includes('pizza') || lower.includes('4p')) return '🍕';
  if (lower.includes('bánh mì') || lower.includes('huỳnh')) return '🥖';
  if (lower.includes('trà sữa') || lower.includes('gong') || lower.includes('koi')) return '🧋';
  if (lower.includes('gà') || lower.includes('kfc') || lower.includes('lotteria')) return '🍗';
  if (lower.includes('sushi') || lower.includes('nhật')) return '🍣';
  if (lower.includes('burger')) return '🍔';
  if (lower.includes('ốc') || lower.includes('hải sản')) return '🦪';
  if (lower.includes('chè') || lower.includes('kem') || lower.includes('bánh')) return '🍰';
  return '🍽️';
}

export interface FoodRouletteRef {
  spin: () => void;
  isSpinning: boolean;
}

export interface FoodRouletteProps {
  candidates: Restaurant[];
  onSpinStart?: () => Promise<number | undefined>;
  onSpinEnd?: (winner: Restaurant, index: number) => void;
  onMultiSpinEnd?: (winners: Restaurant[]) => void;
  multiSpinMode?: 1 | 2 | 3;
  disabled?: boolean;
  showSpinButton?: boolean;
}

export const FoodRoulette = forwardRef<FoodRouletteRef, FoodRouletteProps>(
  ({ candidates, onSpinStart, onSpinEnd, onMultiSpinEnd, multiSpinMode = 1, disabled = false, showSpinButton = true }, ref) => {
    const rotation = useSharedValue(0);
    const [spinning, setSpinning] = React.useState(false);

    const segmentAngle = candidates.length > 0 ? 360 / candidates.length : 360;

    const handleSpinEnd = useCallback(
      (winners: Restaurant[], primaryIndex: number) => {
        setSpinning(false);
        if (winners.length > 0) {
          onSpinEnd?.(winners[0], primaryIndex);
          onMultiSpinEnd?.(winners);
        }
      },
      [onSpinEnd, onMultiSpinEnd]
    );

    const spin = useCallback(async () => {
      if (spinning || disabled || candidates.length === 0) return;

      setSpinning(true);

      let targetIndex: number | undefined = undefined;
      if (onSpinStart) {
        try {
          targetIndex = await onSpinStart();
        } catch (e) {
          console.error('Spin start failed:', e);
          setSpinning(false);
          return;
        }
      }

      const extraSpins = (Math.floor(Math.random() * 4) + 4) * 360;
      let randomSegment = Math.floor(Math.random() * 360);
      const sliceAngle = 360 / candidates.length;

      if (targetIndex !== undefined && targetIndex >= 0 && targetIndex < candidates.length) {
         // Calculate the exact angle to land on targetIndex
         // primaryIndex = Math.floor(((360 - (normalizedRot % 360)) % 360) / sliceAngle)
         // We want primaryIndex = targetIndex
         const targetAngleStart = targetIndex * sliceAngle;
         // aim for the middle of the slice + some random noise
         const noise = (Math.random() * (sliceAngle * 0.8)) - (sliceAngle * 0.4);
         const targetAngle = targetAngleStart + (sliceAngle / 2) + noise;
         
         // 360 - (normalizedRot % 360) = targetAngle
         // normalizedRot % 360 = 360 - targetAngle
         randomSegment = 360 - targetAngle;
      }

      const newRotation = rotation.value + extraSpins + randomSegment;

      rotation.value = withTiming(
        newRotation,
        {
          duration: 3800,
          easing: Easing.bezier(0.15, 0.85, 0.35, 1.05), // Smooth casino decelerate bounce
        },
        (finished) => {
          if (finished) {
            const normalizedRot = (newRotation % 360);
            const sliceAngle = 360 / candidates.length;
            const won: Restaurant[] = [];
            const usedIndices = new Set<number>();

            let pointerOffsets = [0];
            if (multiSpinMode === 2) {
              pointerOffsets = [0, 180];
            } else if (multiSpinMode === 3) {
              pointerOffsets = [0, 120, 240];
            }

            pointerOffsets.forEach((offset) => {
              const pointerAngle = (360 - ((normalizedRot + offset) % 360)) % 360;
              let idx = Math.floor(pointerAngle / sliceAngle) % candidates.length;
              if (usedIndices.has(idx) && candidates.length >= pointerOffsets.length) {
                for (let step = 1; step < candidates.length; step++) {
                  const nextIdx = (idx + step) % candidates.length;
                  if (!usedIndices.has(nextIdx)) {
                    idx = nextIdx;
                    break;
                  }
                }
              }
              usedIndices.add(idx);
              won.push(candidates[idx]);
            });

            const primaryIndex = Math.floor(((360 - (normalizedRot % 360)) % 360) / sliceAngle) % candidates.length;
            runOnJS(handleSpinEnd)(won, primaryIndex);
          }
        }
      );
    }, [spinning, disabled, rotation, candidates, multiSpinMode, handleSpinEnd, onSpinStart]);

    useImperativeHandle(ref, () => ({
      spin,
      isSpinning: spinning,
    }));

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ rotate: `${rotation.value}deg` }],
    }));

    // Outer lights (16 lights around circumference)
    const renderOuterLights = () => {
      const lightsCount = 16;
      const lights = [];
      const lightRadius = RADIUS + 10;
      for (let i = 0; i < lightsCount; i++) {
        const angle = (i * 360) / lightsCount;
        const rad = (angle - 90) * (Math.PI / 180);
        const lx = CENTER + lightRadius * Math.cos(rad);
        const ly = CENTER + lightRadius * Math.sin(rad);
        lights.push(
          <Circle
            key={`light-${i}`}
            cx={lx}
            cy={ly}
            r={3.5}
            fill={i % 2 === 0 ? '#ffffff' : '#fff8ef'}
            stroke="#FFC107"
            strokeWidth={1}
          />
        );
      }
      return lights;
    };

    const renderSegments = () => {
      if (candidates.length === 0) return null;

      const sliceCount = candidates.length;
      const fontSize = sliceCount > 10 ? 9 : sliceCount > 7 ? 10 : sliceCount > 4 ? 11 : 12;

      return candidates.map((candidate, index) => {
        const startAngle = index * segmentAngle;
        const endAngle = startAngle + segmentAngle;

        const startRad = (startAngle - 90) * (Math.PI / 180);
        const endRad = (endAngle - 90) * (Math.PI / 180);

        const x1 = CENTER + RADIUS * Math.cos(startRad);
        const y1 = CENTER + RADIUS * Math.sin(startRad);
        const x2 = CENTER + RADIUS * Math.cos(endRad);
        const y2 = CENTER + RADIUS * Math.sin(endRad);

        const largeArcFlag = segmentAngle > 180 ? 1 : 0;

        const pathData = [
          `M ${CENTER} ${CENTER}`,
          `L ${x1} ${y1}`,
          `A ${RADIUS} ${RADIUS} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
          'Z',
        ].join(' ');

        const textAngle = startAngle + segmentAngle / 2;
        const textRad = (textAngle - 90) * (Math.PI / 180);

        // Position Emoji near outer edge, and text further in
        const emojiRadius = RADIUS * 0.78;
        const emojiX = CENTER + emojiRadius * Math.cos(textRad);
        const emojiY = CENTER + emojiRadius * Math.sin(textRad);

        const textRadius = RADIUS * 0.48;
        const textX = CENTER + textRadius * Math.cos(textRad);
        const textY = CENTER + textRadius * Math.sin(textRad);

        const foodEmoji = getFoodEmoji(candidate.name);
        const maxLen = sliceCount > 8 ? 8 : 11;
        const displayName =
          candidate.name.length > maxLen ? candidate.name.substring(0, maxLen - 1) + '…' : candidate.name;

        return (
          <G key={candidate.id}>
            <Path
              d={pathData}
              fill={SEGMENT_COLORS[index % SEGMENT_COLORS.length]}
              stroke="#ffffff"
              strokeWidth={2.5}
            />
            {/* Food Emoji Icon */}
            <SvgText
              x={emojiX}
              y={emojiY}
              fontSize={sliceCount > 8 ? 12 : 14}
              textAnchor="middle"
              alignmentBaseline="middle"
              transform={`rotate(${textAngle}, ${emojiX}, ${emojiY})`}
            >
              {foodEmoji}
            </SvgText>

            {/* Dish/Restaurant Name */}
            <SvgText
              x={textX}
              y={textY}
              fill="#ffffff"
              fontSize={fontSize}
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
        {/* Top 3D Pointer Badge (Pointer 1) */}
        <View style={styles.pointerContainer}>
          <Svg width={32} height={40} viewBox="0 0 28 36">
            <Path
              d="M14 36 L2 10 A12 12 0 1 1 26 10 Z"
              fill="#b52330"
              stroke="#FFC107"
              strokeWidth={2.5}
            />
            <Circle cx={14} cy={12} r={4} fill="#ffffff" />
          </Svg>
        </View>

        {/* Pointer 2 for Mode 2 (180° Bottom) */}
        {multiSpinMode === 2 && (
          <View style={styles.pointerBottomContainer}>
            <Svg width={32} height={40} viewBox="0 0 28 36" style={{ transform: [{ rotate: '180deg' }] }}>
              <Path
                d="M14 36 L2 10 A12 12 0 1 1 26 10 Z"
                fill="#166b47"
                stroke="#FFC107"
                strokeWidth={2.5}
              />
              <Circle cx={14} cy={12} r={4} fill="#ffffff" />
            </Svg>
          </View>
        )}

        {/* Pointer 2 & 3 for Mode 3 (120° and 240°) */}
        {multiSpinMode === 3 && (
          <>
            <View style={styles.pointer120Container}>
              <Svg width={32} height={40} viewBox="0 0 28 36" style={{ transform: [{ rotate: '120deg' }] }}>
                <Path
                  d="M14 36 L2 10 A12 12 0 1 1 26 10 Z"
                  fill="#166b47"
                  stroke="#FFC107"
                  strokeWidth={2.5}
                />
                <Circle cx={14} cy={12} r={4} fill="#ffffff" />
              </Svg>
            </View>
            <View style={styles.pointer240Container}>
              <Svg width={32} height={40} viewBox="0 0 28 36" style={{ transform: [{ rotate: '240deg' }] }}>
                <Path
                  d="M14 36 L2 10 A12 12 0 1 1 26 10 Z"
                  fill="#8e4e14"
                  stroke="#FFC107"
                  strokeWidth={2.5}
                />
                <Circle cx={14} cy={12} r={4} fill="#ffffff" />
              </Svg>
            </View>
          </>
        )}

        {/* Wheel Assembly */}
        <View style={styles.wheelOuterFrame}>
          <Animated.View style={[styles.wheelContainer, animatedStyle]}>
            <Svg width={WHEEL_SIZE} height={WHEEL_SIZE} viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}>
              {/* Outer Metallic Ring */}
              <Circle
                cx={CENTER}
                cy={CENTER}
                r={RADIUS + 9}
                fill="#b52330"
                stroke="#FFC107"
                strokeWidth={7}
              />

              {/* Slices */}
              <G>{renderSegments()}</G>

              {/* Circumference Lights */}
              <G>{renderOuterLights()}</G>
            </Svg>

            {candidates.length === 0 && (
              <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(181, 35, 48, 0.85)', borderRadius: WHEEL_SIZE / 2, zIndex: 10 }]}>
                <Text style={{ color: 'white', fontSize: 16, textAlign: 'center', padding: 20, fontWeight: 'bold', lineHeight: 24 }}>
                  Không tìm thấy quán ăn gần bạn.{'\n'}Hãy mở rộng khoảng cách{'\n'}hoặc tự "Thêm món" nhé!
                </Text>
              </View>
            )}

            {/* 3D Tactile Center Bullseye Hub */}
            <View style={[styles.centerCircle, { zIndex: 11 }]}>
              <View style={styles.centerInnerCircle}>
                <Text style={styles.centerEmoji}>{spinning ? '🎲' : '🍜'}</Text>
              </View>
            </View>
          </Animated.View>
        </View>

        {/* Spin Action Button */}
        {showSpinButton && (
          <TouchableOpacity
            onPress={spin}
            disabled={spinning || disabled || candidates.length === 0}
            activeOpacity={0.85}
            style={[
              styles.spinButton,
              (spinning || disabled || candidates.length === 0) && styles.spinButtonDisabled,
            ]}
          >
            <Text style={styles.spinButtonText}>
              {spinning 
                ? '🔄 ĐANG CHỌN MÓN...' 
                : multiSpinMode > 1 
                  ? `🎰 QUAY COMBO (${multiSpinMode} MÓN CÙNG LÚC)!` 
                  : '🎰 QUAY MÓN NGAY!'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  pointerContainer: {
    position: 'absolute',
    top: 2,
    zIndex: 20,
    alignItems: 'center',
    shadowColor: '#b52330',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 8,
  },
  pointerBottomContainer: {
    position: 'absolute',
    bottom: 60,
    zIndex: 20,
    alignItems: 'center',
    shadowColor: '#166b47',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 8,
  },
  pointer120Container: {
    position: 'absolute',
    bottom: 95,
    right: 15,
    zIndex: 20,
    alignItems: 'center',
    shadowColor: '#166b47',
    shadowOffset: { width: -3, height: -3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 8,
  },
  pointer240Container: {
    position: 'absolute',
    bottom: 95,
    left: 15,
    zIndex: 20,
    alignItems: 'center',
    shadowColor: '#8e4e14',
    shadowOffset: { width: 3, height: -3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 8,
  },
  wheelOuterFrame: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    borderRadius: WHEEL_SIZE / 2,
    shadowColor: '#b52330',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 8,
  },
  wheelContainer: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerCircle: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFC107',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#b52330',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  centerInnerCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff8ef',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#e2bebc',
  },
  centerEmoji: {
    fontSize: 24,
  },
  spinButton: {
    marginTop: 24,
    width: SCREEN_WIDTH - 64,
    backgroundColor: '#b52330',
    paddingVertical: 15,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#61000e',
    shadowColor: '#b52330',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  spinButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  spinButtonDisabled: {
    opacity: 0.6,
  },
});
