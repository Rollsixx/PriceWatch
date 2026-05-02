// store/useWishlistStore.ts
// Manages wishlist state — backed by SQLite for persistence

import { create } from 'zustand';
import { WishlistItem } from '../types';
import {
  addToWishlist,
  removeFromWishlist,
  getWishlistItems,
  isInWishlist,
  clearWishlist,
  updateWishlistPrice,
} from '../database/wishlistDb';

interface WishlistState {
  // Data
  items: WishlistItem[];
  isLoading: boolean;

  // Actions
  loadWishlist: () => void;
  addItem: (item: Omit<WishlistItem, 'id'>) => void;
  removeItem: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  updatePrice: (productId: string, newPrice: number) => void;
  clearAll: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  isLoading: false,

  // Read all items from SQLite into Zustand memory
  loadWishlist: () => {
    const items = getWishlistItems();
    set({ items });
  },

  // Write to SQLite then sync memory
  addItem: (item) => {
    addToWishlist(item);
    set({ items: getWishlistItems() });
  },

  // Delete from SQLite then sync memory
  removeItem: (productId) => {
    removeFromWishlist(productId);
    set({ items: getWishlistItems() });
  },

  // Check SQLite directly — most accurate source
  isWishlisted: (productId) => {
    return isInWishlist(productId);
  },

  // Update price in SQLite + memory (called after price simulation)
  updatePrice: (productId, newPrice) => {
    updateWishlistPrice(productId, newPrice);
    set({ items: getWishlistItems() });
  },

  // Nuclear option — clear everything
  clearAll: () => {
    clearWishlist();
    set({ items: [] });
  },
}));