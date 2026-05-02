// hooks/useProducts.ts
// Handles all product fetching logic — keeps screens clean

import { useCallback } from 'react';
import { fetchProducts, fetchMoreProducts } from '../services/productService';
import {
  useProductStore,
  getLastDoc,
  setLastDoc,
} from '../store/useProductStore';

export function useProducts() {
  const {
    products,
    isLoading,
    error,
    pagination,
    setProducts,
    appendProducts,
    setLoading,
    setError,
    setPagination,
    setLastDoc: storeSetLastDoc,
    reset,
  } = useProductStore();

  // Load first page
  const loadProducts = useCallback(async () => {
    reset();
    setLoading(true);
    try {
      const { products, lastDoc } = await fetchProducts();
      setProducts(products);
      storeSetLastDoc(lastDoc);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load next page
  const loadMore = useCallback(async () => {
    const lastDoc = getLastDoc();
    if (!lastDoc || pagination.isLoadingMore || !pagination.hasMore) return;

    setPagination({ isLoadingMore: true });
    try {
      const { products, lastDoc: newLastDoc } = await fetchMoreProducts(lastDoc);
      appendProducts(products);
      storeSetLastDoc(newLastDoc);
      if (!newLastDoc) setPagination({ hasMore: false });
    } catch (err: any) {
      setError(err.message ?? 'Failed to load more products');
    } finally {
      setPagination({ isLoadingMore: false });
    }
  }, [pagination.isLoadingMore, pagination.hasMore]);

  return {
    products,
    isLoading,
    error,
    pagination,
    loadProducts,
    loadMore,
  };
}