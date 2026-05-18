import { useEffect, useCallback, useState, useMemo, memo } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useProducts } from '../../hooks/useProducts';
import SearchBar from '../../components/ui/SearchBar';
import CategoryFilter from '../../components/ui/CategoryFilter';
import CompactProductCard from '../../components/product/CompactProductCard';
import ProductGridCard from '../../components/product/ProductGridCard';
import { ProductCardSkeleton } from '../../components/ui/SkeletonShimmer';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import { Product } from '../../types';
import { COLORS } from '../../constants';

const keyExtractor = (item: Product) => item.id;

export default function HomeScreen() {
  const { products, isLoading, error, pagination, loadProducts, loadMore } = useProducts();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    loadProducts();
  }, []);

  const filtered = useMemo(() => {
    let result = products;
    if (category !== 'All') {
      result = result.filter((p) => p.category === category);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [products, category, search]);

  const trending = useMemo(() => {
    const shuffled = [...products].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 6);
  }, [products]);

  const handleRefresh = useCallback(() => {
    loadProducts();
  }, [loadProducts]);

  const handleLoadMore = useCallback(() => {
    loadMore();
  }, [loadMore]);

  if (isLoading && products.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.sectionPad}>
          <ProductCardSkeleton />
          <ProductCardSkeleton />
        </View>
      </View>
    );
  }

  if (error && products.length === 0) {
    return <ErrorState message={error} onRetry={loadProducts} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={keyExtractor}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        renderItem={({ item }) => <View style={styles.gridCol}><ProductGridCard product={item} /></View>}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={4}
        windowSize={8}
        initialNumToRender={4}

        ListHeaderComponent={
          <View>
            <View style={styles.sectionPad}>
              <SearchBar onSearch={setSearch} />
            </View>
            <View style={styles.sectionPad}>
              <CategoryFilter selected={category} onSelect={setCategory} />
            </View>

            {trending.length > 0 && (
              <View style={styles.sectionPad}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Trending Now</Text>
                  <Text style={styles.sectionSub}>Based on recent views</Text>
                </View>
                <FlatList
                  data={trending}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => <CompactProductCard product={item} />}
                />
              </View>
            )}

            <View style={styles.sectionPad}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>All Products</Text>
                <Text style={styles.sectionSub}>
                  {filtered.length} item{filtered.length !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>
          </View>
        }

        ListEmptyComponent={
          <View style={{ paddingHorizontal: 16 }}>
            <EmptyState
              icon="🛍️"
              title={search || category !== 'All' ? 'No matches' : 'No products yet'}
              message={
                search || category !== 'All'
                  ? 'Try a different search or category.'
                  : 'Products will appear here once added.'
              }
            />
          </View>
        }

        ListFooterComponent={
          pagination.isLoadingMore ? (
            <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 16 }} />
          ) : null
        }

        onRefresh={handleRefresh}
        refreshing={isLoading && products.length > 0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  listContent: { paddingBottom: 80 },
  sectionPad: { paddingHorizontal: 16, marginBottom: 4 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  sectionSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  gridRow: {
    paddingHorizontal: 12,
    gap: 10,
  },
  gridCol: {
    flex: 1,
  },
});
