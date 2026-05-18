// hooks/useProducts.ts
// Handles all product fetching logic — keeps screens clean

import { useCallback } from 'react';
import { fetchProducts } from '../services/productService';
import {
  useProductStore,
} from '../store/useProductStore';

export function useProducts() {
  const {
    products,
    isLoading,
    error,
    setProducts,
    setLoading,
    setError,
    reset,
  } = useProductStore();

  const loadProducts = useCallback(async () => {
    reset();
    setLoading(true);
    try {
      const products = await fetchProducts();
      setProducts(products);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    products,
    isLoading,
    error,
    loadProducts,
  };
}
