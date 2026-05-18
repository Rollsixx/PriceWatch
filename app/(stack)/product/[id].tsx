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
import StickyBottomBar from '../../../components/ui/StickyBottomBar';
import CollapsibleSection from '../../../components/ui/CollapsibleSection';
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

    if (result.alert) {
      addAlert(result.alert);
    }

    loadHistory();

    const dropDetected = result.alert !== null;
    Alert.alert(
      dropDetected ? 'Price Drop Detected!' : 'Price Updated',
      `Old: $${result.oldPrice.toFixed(2)}\n` +
        `New: $${result.newPrice.toFixed(2)}\n` +
        `Change: ${result.changePercent > 0 ? '+' : ''}${result.changePercent}%` +
        (dropDetected ? '\n\nAlert added to notifications!' : ''),
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

  const latestPrice =
    history.length > 0
      ? history[history.length - 1].price
      : product.currentPrice;

  const lowestPrice = history.length > 0
    ? Math.min(...history.map((h) => h.price))
    : product.currentPrice;

  const highestPrice = history.length > 0
    ? Math.max(...history.map((h) => h.price))
    : product.originalPrice;

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay} />
          {discountPercent > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>-{discountPercent}% OFF</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.category}>{product.category}</Text>
          <Text style={styles.name}>{product.name}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceCurrencySymbol}>$</Text>
            <Text style={styles.currentPrice}>{latestPrice.toFixed(2)}</Text>
            {discountPercent > 0 && (
              <Text style={styles.originalPrice}>
                ${product.originalPrice.toFixed(2)}
              </Text>
            )}
          </View>

          <CollapsibleSection title="Description" defaultOpen>
            <Text style={styles.description}>{product.description}</Text>
          </CollapsibleSection>

          <CollapsibleSection title="Price Stats">
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Average</Text>
                <View style={styles.statValueRow}>
                  <Text style={styles.statCurrency}>$</Text>
                  <Text style={styles.statValue}>{averagePrice.toFixed(2)}</Text>
                </View>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Lowest</Text>
                <View style={styles.statValueRow}>
                  <Text style={[styles.statCurrency, { color: COLORS.primary }]}>$</Text>
                  <Text style={[styles.statValue, { color: COLORS.primary }]}>
                    {lowestPrice.toFixed(2)}
                  </Text>
                </View>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Highest</Text>
                <View style={styles.statValueRow}>
                  <Text style={[styles.statCurrency, { color: COLORS.secondary }]}>$</Text>
                  <Text style={[styles.statValue, { color: COLORS.secondary }]}>
                    {highestPrice.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          </CollapsibleSection>

          <CollapsibleSection
            title={`Price History (${history.length} records)`}
            defaultOpen
          >
            {history.length === 0 ? (
              <Text style={styles.noHistory}>No price history yet</Text>
            ) : (
              <>
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
                <PriceChart history={history} averagePrice={averagePrice} />
              </>
            )}
          </CollapsibleSection>

          <TouchableOpacity
            style={styles.simulateButton}
            onPress={handleSimulate}
            disabled={isSimulating}
          >
            <Text style={styles.simulateText}>
              {isSimulating ? 'Simulating...' : 'Simulate Price Change'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <StickyBottomBar
        actions={[
          {
            label: wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist',
            variant: wishlisted ? 'danger' : 'primary',
            onPress: toggleWishlist,
          },
          {
            label: 'Alerts',
            variant: 'secondary',
            onPress: () => router.push('/(modals)/notifications'),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  imageWrapper: { position: 'relative' as const },
  image: { width: '100%', height: 260, backgroundColor: COLORS.border },
  imageOverlay: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  badge: {
    position: 'absolute' as const,
    top: 16,
    right: 16,
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: { color: '#000', fontWeight: 'bold', fontSize: 13 },
  content: { padding: 20, paddingBottom: 0 },
  category: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    textTransform: 'uppercase' as const,
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
    gap: 8,
    marginBottom: 20,
  },
  priceCurrencySymbol: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.accent,
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
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.glass,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 6,
    fontWeight: '500',
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  statCurrency: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  statValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  noHistory: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  historyList: {
    backgroundColor: COLORS.glass,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
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
    color: COLORS.primary,
  },
  simulateButton: {
    backgroundColor: COLORS.accent,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  simulateText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
