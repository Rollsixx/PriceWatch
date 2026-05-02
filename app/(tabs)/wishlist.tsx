// app/(tabs)/wishlist.tsx
import { useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useWishlistStore } from '../../store/useWishlistStore';
import EmptyState from '../../components/ui/EmptyState';
import { WishlistItem } from '../../types';
import { COLORS } from '../../constants';

const keyExtractor = (item: WishlistItem) => item.productId;

export default function WishlistScreen() {
  const { items, removeItem, loadWishlist, clearAll } = useWishlistStore();

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleRemove = useCallback((productId: string, name: string) => {
    Alert.alert(
      'Remove Item',
      `Remove "${name}" from wishlist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeItem(productId),
        },
      ]
    );
  }, [removeItem]);

  const handleClearAll = useCallback(() => {
    if (items.length === 0) return;
    Alert.alert(
      'Clear Wishlist',
      'Remove all items?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: clearAll },
      ]
    );
  }, [items.length, clearAll]);

  const renderItem = useCallback(
    ({ item }: { item: WishlistItem }) => (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/(stack)/product/${item.productId}`)}
        activeOpacity={0.85}
      >
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.price}>
            ${item.currentPrice.toFixed(2)}{' '}
            <Text style={styles.currency}>{item.currency}</Text>
          </Text>
          <Text style={styles.date}>
            Added {new Date(item.addedAt).toLocaleDateString()}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.removeBtn}
          onPress={() => handleRemove(item.productId, item.name)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.removeText}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    ),
    [handleRemove]
  );

  // Total value of all wishlist items
  const totalValue = items.reduce((sum, item) => sum + item.currentPrice, 0);

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}

        ListHeaderComponent={
          items.length > 0 ? (
            <View style={styles.header}>
              <View>
                <Text style={styles.headerTitle}>
                  My Wishlist ({items.length})
                </Text>
                <Text style={styles.totalValue}>
                  Total value: ${totalValue.toFixed(2)}
                </Text>
              </View>
              <TouchableOpacity onPress={handleClearAll}>
                <Text style={styles.clearText}>Clear All</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }

        ListEmptyComponent={
          <EmptyState
            icon="🤍"
            title="Your wishlist is empty"
            message="Tap ❤️ on any product to save it here."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    padding: 16,
    paddingBottom: 40,
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  totalValue: {
    fontSize: 13,
    color: COLORS.success,
    fontWeight: '600',
    marginTop: 2,
  },
  clearText: {
    fontSize: 14,
    color: COLORS.danger,
    fontWeight: '600',
    marginTop: 4,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 90,
    height: 90,
    backgroundColor: COLORS.border,
  },
  info: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
    lineHeight: 20,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  currency: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '400',
  },
  date: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  removeBtn: {
    padding: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
});