// app/(stack)/product/[id].tsx
import PriceChart from '../../../components/chart/PriceChart';
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { fetchProductById } from '../../../services/productService';
import { useProductStore } from '../../../store/useProductStore';
import { useWishlist } from '../../../hooks/useWishlist';
import { usePriceHistory } from '../../../hooks/usePriceHistory';
import { simulatePriceChange } from '../../../utils/priceSimulator';
import { useNotificationStore } from '../../../store/useNotificationStore';
import LoadingState from '../../../components/ui/LoadingState';
import ErrorState from '../../../components/ui/ErrorState';
import { COLORS } from '../../../constants';

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    selectedProduct,
    setSelectedProduct,
    isLoading,
    error,
    setLoading,
    setError,
  } = useProductStore();

  const { wishlisted, toggleWishlist } = useWishlist(
    selectedProduct ?? undefined
  );

  const {
    history,
    averagePrice,
    isSimulating,
    initHistory,
    simulatePrice,
    loadHistory,
  } = usePriceHistory(id ?? '');

  const { addAlert } = useNotificationStore();

  useEffect(() => {
    loadProduct();
    return () => setSelectedProduct(null);
  }, [id]);

  // Once product loads, seed and load price history
  useEffect(() => {
    if (selectedProduct) {
      initHistory(selectedProduct.currentPrice, selectedProduct.originalPrice);
    }
  }, [selectedProduct]);

  async function loadProduct() {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const product = await fetchProductById(id);
      setSelectedProduct(product);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load product');
    } finally {
      setLoading(false);
    }
  }

  function handleSimulate() {
    if (!selectedProduct) return;

    const result = simulatePriceChange(
      selectedProduct.id,
      selectedProduct.name,
      selectedProduct.currentPrice
    );

    // If algorithm detected a price drop → add to notification store
    if (result.alert) {
      addAlert(result.alert);
    }

    loadHistory(); // Refresh history display

    // Show result to user
    const dropDetected = result.alert !== null;
    Alert.alert(
      dropDetected ? '🚨 Price Drop Detected!' : '📊 Price Updated',
      `Old: $${result.oldPrice.toFixed(2)}\n` +
        `New: $${result.newPrice.toFixed(2)}\n` +
        `Change: ${result.changePercent > 0 ? '+' : ''}${result.changePercent}%` +
        (dropDetected ? `\n\n✅ Alert added to notifications!` : ''),
      [{ text: 'OK' }]
    );
  }

  if (isLoading) return <LoadingState message="Loading product..." />;
  if (error) return <ErrorState message={error} onRetry={loadProduct} />;
  if (!selectedProduct) return <ErrorState message="Product not found." />;

  const product = selectedProduct;
  const discountPercent = Math.round(
    ((product.originalPrice - product.currentPrice) / product.originalPrice) * 100
  );

  // Latest price from history or current price
  const latestPrice =
    history.length > 0
      ? history[history.length - 1].price
      : product.currentPrice;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Image
        source={{ uri: product.imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />

      {discountPercent > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>-{discountPercent}% OFF</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.category}>{product.category}</Text>
        <Text style={styles.name}>{product.name}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.currentPrice}>${latestPrice.toFixed(2)}</Text>
          {discountPercent > 0 && (
            <Text style={styles.originalPrice}>
              ${product.originalPrice.toFixed(2)}
            </Text>
          )}
        </View>

        <Text style={styles.description}>{product.description}</Text>

        {/* Price Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Average</Text>
            <Text style={styles.statValue}>${averagePrice.toFixed(2)}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Lowest</Text>
            <Text style={[styles.statValue, { color: COLORS.success }]}>
              $
              {history.length > 0
                ? Math.min(...history.map((h) => h.price)).toFixed(2)
                : product.currentPrice.toFixed(2)}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Highest</Text>
            <Text style={[styles.statValue, { color: COLORS.danger }]}>
              $
              {history.length > 0
                ? Math.max(...history.map((h) => h.price)).toFixed(2)
                : product.originalPrice.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Price History List */}
        <Text style={styles.sectionTitle}>
          Price History ({history.length} records)
        </Text>

        {history.length === 0 ? (
          <Text style={styles.noHistory}>No price history yet</Text>
        ) : (
          <View style={styles.historyList}>
            {[...history]
              .reverse()
              .slice(0, 5)
              .map((record, index) => (
                <View key={record.id ?? index} style={styles.historyRow}>
                  <Text style={styles.historyDate}>
                    {new Date(record.recordedAt).toLocaleDateString()}{' '}
                    {new Date(record.recordedAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                  <Text style={styles.historyPrice}>
                    ${record.price.toFixed(2)}
                  </Text>
                </View>
              ))}
          </View>
        )}

        {/* SVG Price Chart */}
<PriceChart
  history={history}
  averagePrice={averagePrice}
/>

        {/* Simulate Button */}
        <TouchableOpacity
          style={styles.simulateButton}
          onPress={handleSimulate}
          disabled={isSimulating}
        >
          <Text style={styles.simulateText}>🎲 Simulate Price Change</Text>
        </TouchableOpacity>

        {/* Wishlist Button */}
        <TouchableOpacity
          style={[
            styles.wishlistButton,
            wishlisted && styles.wishlistButtonActive,
          ]}
          onPress={toggleWishlist}
        >
          <Text style={[
  styles.wishlistButtonText,
  wishlisted && styles.wishlistButtonTextActive,
]}>
  {wishlisted ? '❤️ Remove from Wishlist' : '🤍 Add to Wishlist'}
</Text>
        </TouchableOpacity>

        {/* Notifications Button */}
        <TouchableOpacity
          style={styles.notifButton}
          onPress={() => router.push('/(modals)/notifications')}
        >
          <Text style={styles.notifButtonText}>🔔 View Alerts</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  image: { width: '100%', height: 260, backgroundColor: COLORS.border },
  badge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: COLORS.danger,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: { color: COLORS.surface, fontWeight: 'bold', fontSize: 13 },
  content: { padding: 20 },
  category: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 12,
    lineHeight: 32,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  currentPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  originalPrice: {
    fontSize: 18,
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 4,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  noHistory: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  historyList: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  historyDate: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  historyPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  chartPlaceholder: {
    backgroundColor: COLORS.border,
    borderRadius: 12,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartText: { color: COLORS.textSecondary, fontSize: 14 },
  simulateButton: {
    backgroundColor: COLORS.warning,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  simulateText: {
    color: COLORS.surface,
    fontWeight: 'bold',
    fontSize: 15,
  },
  wishlistButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  wishlistButtonActive: { backgroundColor: COLORS.secondary },
  wishlistButtonText: {
  color: COLORS.secondary,
  fontWeight: 'bold',
  fontSize: 16,
},
wishlistButtonTextActive: {
  color: COLORS.surface,
  fontWeight: 'bold',
  fontSize: 16,
},
  notifButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
  },
  notifButtonText: {
    color: COLORS.surface,
    fontWeight: 'bold',
    fontSize: 16,
  },
});