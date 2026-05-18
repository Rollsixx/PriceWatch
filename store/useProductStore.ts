// store/useProductStore.ts
// Manages product list and selected product

import { create } from 'zustand';
import { Product } from '../types';

interface ProductState {
  products: Product[];
  selectedProduct: Product | null;
  isLoading: boolean;
  error: string | null;

  setProducts: (products: Product[]) => void;
  setSelectedProduct: (product: Product | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  products: [],
  selectedProduct: null,
  isLoading: false,
  error: null,
};

export const useProductStore = create<ProductState>((set) => ({
  ...initialState,

  setProducts: (products) => set({ products }),

  setSelectedProduct: (selectedProduct) => set({ selectedProduct }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));
