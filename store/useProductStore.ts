// store/useProductStore.ts
// Manages product list, pagination, and selected product

import { create } from 'zustand';
import { Product, PaginationState } from '../types';
import { DocumentSnapshot } from 'firebase/firestore';

interface ProductState {
  // Data
  products: Product[];
  selectedProduct: Product | null;
  pagination: PaginationState;
  isLoading: boolean;
  error: string | null;

  // Actions
  setProducts: (products: Product[]) => void;
  appendProducts: (products: Product[]) => void;
  setSelectedProduct: (product: Product | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPagination: (pagination: Partial<PaginationState>) => void;
  setLastDoc: (doc: DocumentSnapshot | null) => void;
  reset: () => void;
}

// Firestore DocumentSnapshot cannot be stored in Zustand
// (it's a class instance, not a plain object)
// So we store it in a module-level variable instead
let _lastDoc: DocumentSnapshot | null = null;
export function getLastDoc() { return _lastDoc; }
export function setLastDoc(doc: DocumentSnapshot | null) { _lastDoc = doc; }

const initialPagination: PaginationState = {
  lastDocId: null,
  hasMore: true,
  isLoadingMore: false,
};

export const useProductStore = create<ProductState>((set) => ({
  // Initial state
  products: [],
  selectedProduct: null,
  pagination: initialPagination,
  isLoading: false,
  error: null,

  // Replace entire product list (first page load)
  setProducts: (products) => set({ products }),

  // Append to existing list (pagination)
  appendProducts: (products) =>
    set((state) => ({
      products: [...state.products, ...products],
    })),

  // Set product being viewed in details screen
  setSelectedProduct: (selectedProduct) => set({ selectedProduct }),

  // Toggle loading spinner
  setLoading: (isLoading) => set({ isLoading }),

  // Set error message (null to clear)
  setError: (error) => set({ error }),

  // Partial pagination update
  setPagination: (pagination) =>
    set((state) => ({
      pagination: { ...state.pagination, ...pagination },
    })),

  // Update both module variable and Zustand pagination state
  setLastDoc: (doc) => {
    setLastDoc(doc);
    set((state) => ({
      pagination: {
        ...state.pagination,
        lastDocId: doc?.id ?? null,
        hasMore: doc !== null,
      },
    }));
  },

  // Full reset — called before fresh fetch
  reset: () => {
    setLastDoc(null);
    set({
      products: [],
      isLoading: false,
      error: null,
      pagination: initialPagination,
    });
  },
}));