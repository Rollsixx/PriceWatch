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
const TOAST_DURATION = 4000;

export default function Toast({
  message,
  productName,
  dropPercent,
  onDismiss,
}: Props) {
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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
        <TouchableOpacity style={styles.dismissBtn} onPress={dismissToast}>
          <Text style={styles.dismissText}>✕</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Price Drop: {productName}</Text>
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
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
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
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 2,
    paddingRight: 24,
  },
  message: {
    fontSize: 13,
    color: COLORS.primary,
    marginBottom: 6,
  },
  tapHint: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});
