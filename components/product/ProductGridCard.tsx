import { memo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Product } from '../../types';
import { COLORS } from '../../constants';

interface Props {
  product: Product;
}

function ProductGridCard({ product }: Props) {
  const discountPercent = Math.round(
    ((product.originalPrice - product.currentPrice) / product.originalPrice) * 100
  );
  const hasDrop = discountPercent > 0;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/(stack)/product/${product.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.imageWrapper}>
        <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="cover" />
        {hasDrop && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>-{discountPercent}%</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>${product.currentPrice.toFixed(2)}</Text>
          {hasDrop && (
            <Text style={styles.originalPrice}>${product.originalPrice.toFixed(0)}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default memo(ProductGridCard);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.glass,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    marginBottom: 12,
  },
  imageWrapper: { position: 'relative' },
  image: {
    width: '100%',
    height: 140,
    backgroundColor: COLORS.border,
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: COLORS.secondary,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: { color: '#000', fontWeight: 'bold', fontSize: 10 },
  info: { padding: 10 },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  originalPrice: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
  },
});
