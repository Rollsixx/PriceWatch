// components/ui/Toast.tsx
// Animated toast that slides in from the top when a price drop is detected

import { useEffect, useRef } from 'react';
import {
  Animated,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { COLORS } from '../../constants';

interface Props {
  message: string;
  productName: string;
  dropPercent: number;
  onDismiss: () => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const TOAST_DURATION = 4000; // Auto dismiss after 4 seconds

export default function Toast({
  message,
  productName,
  dropPercent,
  onDismiss,
}: Props) {
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Slide in
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss after duration
    const timer = setTimeout(() => {
      dismissToast();
    }, TOAST_DURATION);

    return () => clearTimeout(timer);
  }, []);

  function dismissToast() {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss());
  }

  function handlePress() {
    dismissToast();
    router.push('/(modals)/notifications');
  }

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY }], opacity },
      ]}
    >
      <TouchableOpacity
        style={styles.inner}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        {/* Left accent bar */}
        <TouchableOpacity style={styles.dismissBtn} onPress={dismissToast}>
          <Text style={styles.dismissText}>✕</Text>
        </TouchableOpacity>

        <Text style={styles.emoji}>🚨</Text>

        <Text style={styles.title} numberOfLines={1}>
          Price Drop: {productName}
        </Text>
        <Text style={styles.message}>
          ↓ {dropPercent.toFixed(1)}% below average — {message}
        </Text>
        <Text style={styles.tapHint}>Tap to view alerts</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 16,
    zIndex: 9999,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  inner: {
    padding: 16,
  },
  dismissBtn: {
    position: 'absolute',
    top: 10,
    right: 12,
    padding: 4,
    zIndex: 1,
  },
  dismissText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.surface,
    marginBottom: 2,
    paddingRight: 24,
  },
  message: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 6,
  },
  tapHint: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
});