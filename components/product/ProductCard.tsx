import { memo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Product } from '../../types';
import { COLORS } from '../../constants';

interface Props {
  product: Product;
}

function ProductCard({ product }: Props) {
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
        <Image
          source={{ uri: product.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay} />
      </View>

      {hasDrop && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>-{discountPercent}%</Text>
        </View>
      )}

      <View style={styles.info}>
        <View style={styles.categoryPill}>
          <Text style={styles.category}>{product.category}</Text>
        </View>

        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.priceCurrency}>$</Text>
          <Text style={styles.currentPrice}>
            {product.currentPrice.toFixed(2)}
          </Text>
          {hasDrop && (
            <>
              <Text style={styles.originalPrice}>
                ${product.originalPrice.toFixed(2)}
              </Text>
              <View style={styles.savingPill}>
                <Text style={styles.savingText}>
                  Save ${(product.originalPrice - product.currentPrice).toFixed(2)}
                </Text>
              </View>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default memo(ProductCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.glass,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: COLORS.border,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'transparent',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  info: {
    padding: 14,
  },
  categoryPill: {
    backgroundColor: 'rgba(0,214,143,0.15)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  category: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
    lineHeight: 22,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  priceCurrency: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.accent,
  },
  currentPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  originalPrice: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
  },
  savingPill: {
    backgroundColor: 'rgba(0,214,143,0.15)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  savingText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
  },
});
