// app/(tabs)/index.tsx
// Optimized FlatList with pagination, memo, and callbacks

import { useEffect, useCallback, memo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useProducts } from '../../hooks/useProducts';
import ProductCard from '../../components/product/ProductCard';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import { Product } from '../../types';
import { COLORS } from '../../constants';

// Memoized render item — prevents recreation on every render
const RenderProduct = memo(({ item }: { item: Product }) => (
  <ProductCard product={item} />
));

// Key extractor outside component — stable reference
const keyExtractor = (item: Product) => item.id;

export default function HomeScreen() {
  const {
    products,
    isLoading,
    error,
    pagination,
    loadProducts,
    loadMore,
  } = useProducts();

  useEffect(() => {
    loadProducts();
  }, []);

  // Stable callback reference — won't cause FlatList re-renders
  const handleRefresh = useCallback(() => {
    loadProducts();
  }, [loadProducts]);

  const handleLoadMore = useCallback(() => {
    loadMore();
  }, [loadMore]);

  const renderItem = useCallback(
    ({ item }: { item: Product }) => <RenderProduct item={item} />,
    []
  );

  if (isLoading && products.length === 0) {
    return <LoadingState message="Fetching products..." />;
  }

  if (error && products.length === 0) {
    return <ErrorState message={error} onRetry={loadProducts} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}

        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={10}
        initialNumToRender={5}
        updateCellsBatchingPeriod={50}

        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Featured Products</Text>
            <Text style={styles.headerSubtitle}>
              {products.length} item{products.length !== 1 ? 's' : ''} available
            </Text>
          </View>
        }

        ListEmptyComponent={
          <EmptyState
            icon="🛍️"
            title="No products yet"
            message="Products will appear here once added."
          />
        }

        ListFooterComponent={
          pagination.isLoadingMore ? (
            <ActivityIndicator
              color={COLORS.primary}
              style={styles.footerLoader}
            />
          ) : pagination.hasMore && products.length > 0 ? (
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={handleLoadMore}
            >
              <Text style={styles.loadMoreText}>Load More</Text>
            </TouchableOpacity>
          ) : products.length > 0 ? (
            <Text style={styles.endText}>
              ✓ All products loaded
            </Text>
          ) : null
        }

        onRefresh={handleRefresh}
        refreshing={isLoading && products.length > 0}
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
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  footerLoader: {
    marginVertical: 16,
  },
  loadMoreButton: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  loadMoreText: {
    color: COLORS.surface,
    fontWeight: 'bold',
    fontSize: 15,
  },
  endText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 16,
    marginBottom: 8,
  },
});