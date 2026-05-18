import { memo } from 'react';
import { TouchableOpacity, Text, Image, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Product } from '../../types';
import { COLORS } from '../../constants';

interface Props {
  product: Product;
}

const CARD_W = 140;

function CompactProductCard({ product }: Props) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/(stack)/product/${product.id}`)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="cover" />
      <Text style={styles.price}>${product.currentPrice.toFixed(0)}</Text>
    </TouchableOpacity>
  );
}

export default memo(CompactProductCard);

const styles = StyleSheet.create({
  card: {
    width: CARD_W,
    height: 180,
    borderRadius: 14,
    overflow: 'hidden',
    marginRight: 10,
    backgroundColor: COLORS.border,
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  price: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
});
