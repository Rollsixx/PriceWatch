import { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { COLORS } from '../../constants';

interface Props {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export default function SkeletonShimmer({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}: Props) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: COLORS.surfaceLight,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <View style={styles.card}>
      <SkeletonShimmer height={180} borderRadius={0} />
      <View style={styles.info}>
        <SkeletonShimmer width={80} height={18} borderRadius={6} />
        <View style={{ height: 8 }} />
        <SkeletonShimmer width="90%" height={16} />
        <View style={{ height: 4 }} />
        <SkeletonShimmer width="60%" height={16} />
        <View style={{ height: 12 }} />
        <SkeletonShimmer width={120} height={22} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.glass,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  info: {
    padding: 14,
  },
});
