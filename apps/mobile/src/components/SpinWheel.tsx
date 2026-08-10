import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
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
  icon: string;
}

const SEGMENTS: PrizeSegment[] = [
  { label: 'Voucher 10%', color: '#FF5A5F', icon: '🎟️' },
  { label: 'Credit 5k', color: '#FFAB69', icon: '💰' },
  { label: 'Món Tặng', color: '#55A37A', icon: '🍜' },
  { label: 'Nước Free', color: '#FFC107', icon: '🥤' },
  { label: '+1 Lượt', color: '#B52330', icon: '🎲' },
];

interface SpinWheelProps {
  onSpinEnd?: (prize: PrizeSegment) => void;
  disabled?: boolean;
}

export function SpinWheel({ onSpinEnd, disabled = false }: SpinWheelProps) {
  const rotation = useSharedValue(0);
  const isSpinning = useSharedValue(false);
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
  }, [spinning, disabled, rotation, segmentAngle, handleSpinEnd]);

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
            stroke="#FFF"
            strokeWidth={2}
          />
          <SvgText
            x={textX}
            y={textY}
            fill="white"
            fontSize={12}
            fontWeight="bold"
            textAnchor="middle"
            alignmentBaseline="middle"
            transform={`rotate(${textAngle}, ${textX}, ${textY})`}
          >
            {segment.icon}
          </SvgText>
        </G>
      );
    });
  };

  return (
    <View style={styles.container}>
      {/* Wheel Pointer */}
      <View style={styles.pointerContainer}>
        <Svg width={24} height={32} viewBox="0 0 24 32">
          <Path
            d="M12 32 L0 8 L24 8 Z"
            fill="#D97706"
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
          <Text style={styles.centerText}>🍜</Text>
        </View>
      </Animated.View>

      {/* Spin Button */}
      <View style={styles.buttonContainer}>
        <Button
          title={spinning ? 'Đang quay...' : 'QUAY NGAY!'}
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
          <Text style={styles.prizeLabel}>Bạn nhận được:</Text>
          <View style={[styles.prizeBadge, { backgroundColor: lastPrize.color }]}>
            <Text style={styles.prizeText}>
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
    paddingVertical: 20,
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
    backgroundColor: '#FFF8E7',
    borderWidth: 4,
    borderColor: '#D97706',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  centerText: {
    fontSize: 24,
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
    color: '#78716C',
    marginBottom: 8,
  },
  prizeBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  prizeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
