import { useEffect, useCallback, useState, useMemo } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useWishlistStore } from '../../store/useWishlistStore';
import ProductGridCard from '../../components/product/ProductGridCard';
import WishlistEmptyState from '../../components/ui/WishlistEmptyState';
import { WishlistItem, PriceRecord } from '../../types';
import { COLORS } from '../../constants';
import { getPriceHistory } from '../../database/priceHistoryDb';
import { hasDroppedInLastNHours } from '../../utils/priceAlgorithm';

const keyExtractor = (item: WishlistItem) => item.productId;
const DROP_WINDOW_HOURS = 48;

export default function WishlistScreen() {
  const { items, removeItem, loadWishlist, clearAll } = useWishlistStore();
  const [showDroppedOnly, setShowDroppedOnly] = useState(false);
  const [droppedIds, setDroppedIds] = useState<Set<string>>(new Set());
  const [checking, setChecking] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    loadWishlist();
  }, []);

  useEffect(() => {
    if (!showDroppedOnly || items.length === 0) {
      setDroppedIds(new Set());
      return;
    }
    setChecking(true);
    const ids = new Set<string>();
    for (const item of items) {
      const history = getPriceHistory(item.productId);
      if (hasDroppedInLastNHours(history, DROP_WINDOW_HOURS)) {
        ids.add(item.productId);
      }
    }
    setDroppedIds(ids);
    setChecking(false);
  }, [showDroppedOnly, items]);

  const filteredItems = useMemo(() => {
    if (!showDroppedOnly || droppedIds.size === 0) return items;
    return items.filter((i) => droppedIds.has(i.productId));
  }, [items, showDroppedOnly, droppedIds]);

  const handleRemove = useCallback((productId: string, name: string) => {
    setSelectedId(null);
    Alert.alert('Remove Item', `Remove "${name}" from wishlist?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeItem(productId) },
    ]);
  }, [removeItem]);

  const handleClearAll = useCallback(() => {
    if (items.length === 0) return;
    Alert.alert('Clear Wishlist', 'Remove all items?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear All', style: 'destructive', onPress: clearAll },
    ]);
  }, [items.length, clearAll]);

  const handleLongPress = useCallback((productId: string) => {
    setSelectedId((prev) => (prev === productId ? null : productId));
  }, []);

  const displayItems = showDroppedOnly ? filteredItems : items;
  const totalValue = displayItems.reduce((sum, item) => sum + item.currentPrice, 0);

  return (
    <View style={styles.container}>
      <FlatList
        data={displayItems}
        keyExtractor={keyExtractor}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        renderItem={({ item }) => (
            <View style={styles.gridCol}>
            <View style={styles.cardWrapper}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push(`/(stack)/product/${item.productId}`)}
                onLongPress={() => handleLongPress(item.productId)}
                delayLongPress={400}
              >
                <ProductGridCard
                  product={{
                    id: item.productId,
                    name: item.name,
                    description: '',
                    category: '',
                    imageUrl: item.imageUrl,
                    currentPrice: item.currentPrice,
                    originalPrice: item.currentPrice,
                    currency: item.currency,
                    createdAt: item.addedAt,
                  }}
                />
              </TouchableOpacity>
              {selectedId === item.productId && (
                <TouchableOpacity
                  style={styles.floatingDelete}
                  onPress={() => handleRemove(item.productId, item.name)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.floatingDeleteText}>✕ Remove</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        ListHeaderComponent={
          items.length > 0 ? (
            <View style={styles.headerSection}>
              <View style={styles.header}>
                <View>
                  <Text style={styles.headerTitle}>
                    My Wishlist ({displayItems.length})
                  </Text>
                  <Text style={styles.totalValue}>
                    ${totalValue.toFixed(2)} total
                  </Text>
                </View>
                <TouchableOpacity onPress={handleClearAll}>
                  <Text style={styles.clearText}>Clear All</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.filterToggle, showDroppedOnly && styles.filterToggleActive]}
                onPress={() => setShowDroppedOnly((v) => !v)}
              >
                <Text style={[styles.filterToggleText, showDroppedOnly && styles.filterToggleTextActive]}>
                  {showDroppedOnly ? '▼ Dropped in 48h' : '○ Show drops in 48h'}
                </Text>
              </TouchableOpacity>

              <Text style={styles.hint}>Long-press a card to reveal remove</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          showDroppedOnly && items.length > 0 ? (
            <WishlistEmptyState type="no-drops" />
          ) : (
            <WishlistEmptyState type="empty" />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { paddingBottom: 80, flexGrow: 1 },
  headerSection: { paddingHorizontal: 16, marginBottom: 8 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary },
  totalValue: { fontSize: 13, color: COLORS.primary, fontWeight: '600', marginTop: 2 },
  clearText: { fontSize: 14, color: COLORS.secondary, fontWeight: '600', marginTop: 4 },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  filterToggleActive: {
    backgroundColor: 'rgba(0,214,143,0.1)',
    borderColor: COLORS.primary,
  },
  filterToggleText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  filterToggleTextActive: { color: COLORS.primary },
  hint: { fontSize: 11, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 8 },
  gridRow: { paddingHorizontal: 12, gap: 10 },
  gridCol: { flex: 1 },
  cardWrapper: { position: 'relative' },
  floatingDelete: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    zIndex: 10,
  },
  floatingDeleteText: { color: '#000', fontSize: 11, fontWeight: 'bold' },
});
