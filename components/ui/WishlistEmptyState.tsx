import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants';

interface Props {
  type: 'empty' | 'no-drops';
}

export default function WishlistEmptyState({ type }: Props) {
  if (type === 'no-drops') {
    return (
      <View style={styles.container}>
        <View style={styles.iconRing}>
          <Text style={styles.iconText}>✓</Text>
        </View>
        <Text style={styles.title}>All quiet here</Text>
        <Text style={styles.message}>
          None of your wishlist items have dropped in the last 48 hours.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.starField}>
        <View style={[styles.dot, styles.dot1]} />
        <View style={[styles.dot, styles.dot2]} />
        <View style={[styles.dot, styles.dot3]} />
        <View style={styles.jarOuter}>
          <View style={styles.jarNeck} />
          <View style={styles.jarBody}>
            <Text style={styles.jarIcon}>✦</Text>
          </View>
        </View>
      </View>
      <Text style={styles.title}>Your wish jar is empty</Text>
      <Text style={styles.message}>
        Find something you love and tap the heart to drop it in.
      </Text>
      <View style={styles.decoLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  starField: {
    position: 'relative',
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  dot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
  dot1: { top: 10, right: 20, opacity: 0.4 },
  dot2: { top: 40, left: 10, opacity: 0.6 },
  dot3: { bottom: 20, right: 10, opacity: 0.3 },
  jarOuter: { alignItems: 'center' },
  jarNeck: {
    width: 24,
    height: 8,
    borderWidth: 2,
    borderColor: COLORS.glassBorder,
    borderBottomWidth: 0,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  jarBody: {
    width: 80,
    height: 90,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.glass,
  },
  jarIcon: {
    fontSize: 32,
    color: COLORS.primary,
    opacity: 0.6,
  },
  iconRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconText: {
    fontSize: 28,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  decoLine: {
    width: 40,
    height: 2,
    backgroundColor: COLORS.glassBorder,
    borderRadius: 1,
    marginTop: 24,
    opacity: 0.5,
  },
});
