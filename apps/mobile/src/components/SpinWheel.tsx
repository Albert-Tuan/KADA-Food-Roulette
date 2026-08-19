import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path, G, Text as SvgText } from 'react-native-svg';
import { Button } from './Button';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const WHEEL_SIZE = Math.min(SCREEN_WIDTH - 80, 320);
const CENTER_SIZE = 60;

interface PrizeSegment {
  label: string;
  color: string;
  textColor?: string;
  icon: string;
}

const SEGMENTS: PrizeSegment[] = [
  { label: 'Phở & Bún', color: '#b52330', icon: '🍜' },
  { label: 'Cơm Tấm', color: '#8e4e14', icon: '🍚' },
  { label: 'Lẩu Nướng', color: '#ff5a5f', icon: '🍲' },
  { label: 'Trà Sữa', color: '#ffab69', textColor: '#1e1b13', icon: '🧋' },
  { label: 'Bánh Mì', color: '#166b47', icon: '🥖' },
  { label: 'Ăn Vặt', color: '#FFC107', textColor: '#1e1b13', icon: '🍢' },
];

interface SpinWheelProps {
  onSpinStart?: () => void;
  onSpinEnd?: (prize: PrizeSegment) => void;
  disabled?: boolean;
  buttonTitle?: string;
  spinningTitle?: string;
  resultPrefixLabel?: string;
}

export function SpinWheel({
  onSpinStart,
  onSpinEnd,
  disabled = false,
  buttonTitle,
  spinningTitle,
  resultPrefixLabel,
}: SpinWheelProps) {
  const rotation = useSharedValue(0);
  const [spinning, setSpinning] = React.useState(false);
  const [lastPrize, setLastPrize] = React.useState<PrizeSegment | null>(null);

  const segmentAngle = 360 / SEGMENTS.length;

  const handleSpinEnd = useCallback((prize: PrizeSegment) => {
    setSpinning(false);
    setLastPrize(prize);
    onSpinEnd?.(prize);
  }, [onSpinEnd]);

  const spin = useCallback(() => {
    if (spinning || disabled) return;

    setSpinning(true);
    setLastPrize(null);
    onSpinStart?.();

    // Random number of full spins (3-5) plus random segment
    const extraSpins = (Math.floor(Math.random() * 3) + 3) * 360;
    const randomSegment = Math.floor(Math.random() * SEGMENTS.length);
    const targetAngle = extraSpins + (randomSegment * segmentAngle) + (segmentAngle / 2);

    const newRotation = rotation.value + targetAngle;

    rotation.value = withTiming(
      newRotation,
      {
        duration: 4000,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      },
      (finished) => {
        if (finished) {
          // Calculate which segment we're in
          const normalizedRotation = newRotation % 360;
          const pointerAngle = (360 - normalizedRotation + segmentAngle / 2) % 360;
          const segmentIndex = Math.floor(pointerAngle / segmentAngle);
          const prize = SEGMENTS[segmentIndex % SEGMENTS.length];

          runOnJS(handleSpinEnd)(prize);
        }
      }
    );
  }, [spinning, disabled, rotation, segmentAngle, handleSpinEnd, onSpinStart]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  // Create wheel segments
  const renderSegments = () => {
    return SEGMENTS.map((segment, index) => {
      const startAngle = index * segmentAngle;
      const endAngle = startAngle + segmentAngle;

      const startRad = (startAngle - 90) * (Math.PI / 180);
      const endRad = (endAngle - 90) * (Math.PI / 180);

      const center = WHEEL_SIZE / 2;
      const radius = center - 10;

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

      // Calculate text position
      const textAngle = startAngle + segmentAngle / 2;
      const textRad = (textAngle - 90) * (Math.PI / 180);
      const textRadius = radius * 0.65;
      const textX = center + textRadius * Math.cos(textRad);
      const textY = center + textRadius * Math.sin(textRad);

      return (
        <G key={index}>
          <Path
            d={pathData}
            fill={segment.color}
            stroke="#fff8ef"
            strokeWidth={3}
          />
          <SvgText
            x={textX}
            y={textY}
            fill={segment.textColor || '#ffffff'}
            fontSize={13}
            fontWeight="bold"
            textAnchor="middle"
            alignmentBaseline="middle"
            transform={`rotate(${textAngle}, ${textX}, ${textY})`}
          >
            {`${segment.icon} ${segment.label}`}
          </SvgText>
        </G>
      );
    });
  };

  return (
    <View style={styles.container}>
      {/* Wheel Pointer */}
      <View style={styles.pointerContainer}>
        <Svg width={28} height={36} viewBox="0 0 24 32">
          <Path
            d="M12 32 L0 8 L24 8 Z"
            fill="#b52330"
            stroke="#ffffff"
            strokeWidth={2}
          />
        </Svg>
      </View>

      {/* Wheel */}
      <Animated.View style={[styles.wheelContainer, animatedStyle]}>
        <Svg width={WHEEL_SIZE} height={WHEEL_SIZE} viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}>
          <G>
            {renderSegments()}
          </G>
        </Svg>

        {/* Center circle */}
        <View style={styles.centerCircle}>
          <Text style={styles.centerText}>🎰</Text>
        </View>
      </Animated.View>

      {/* Spin Button */}
      <View style={styles.buttonContainer}>
        <Button
          title={spinning ? (spinningTitle || 'Đang chọn món...') : (buttonTitle || 'QUAY MÓN NGAY!')}
          onPress={spin}
          disabled={spinning || disabled}
          loading={spinning}
          icon={spinning ? undefined : '🎡'}
          size="lg"
        />
      </View>

      {/* Last Prize */}
      {lastPrize && (
        <View style={styles.prizeContainer}>
          <Text style={styles.prizeLabel}>{resultPrefixLabel || 'Gợi ý món thèm nhất hôm nay:'}</Text>
          <View style={[styles.prizeBadge, { backgroundColor: lastPrize.color }]}>
            <Text style={[styles.prizeText, { color: lastPrize.textColor || '#ffffff' }]}>
              {lastPrize.icon} {lastPrize.label}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

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
    width: CENTER_SIZE,
    height: CENTER_SIZE,
    borderRadius: CENTER_SIZE / 2,
    backgroundColor: '#fff8ef',
    borderWidth: 4,
    borderColor: '#b52330',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#b52330',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  centerText: {
    fontSize: 26,
  },
  buttonContainer: {
    marginTop: 24,
  },
  prizeContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  prizeLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#b52330',
    marginBottom: 8,
  },
  prizeBadge: {
    paddingHorizontal: 26,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#e2bebc',
    shadowColor: '#b52330',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  prizeText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
});
