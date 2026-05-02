// hooks/useWishlist.ts
// Clean interface for wishlist actions used in screens

import { useWishlistStore } from '../store/useWishlistStore';
import { Product } from '../types';

export function useWishlist(product?: Product) {
  const { items, addItem, removeItem, isWishlisted } = useWishlistStore();

  // Check if current product is wishlisted
  const wishlisted = product ? isWishlisted(product.id) : false;

  // Toggle wishlist for current product
  function toggleWishlist() {
    if (!product) return;

    if (wishlisted) {
      removeItem(product.id);
    } else {
      addItem({
        productId: product.id,
        name: product.name,
        imageUrl: product.imageUrl,
        currentPrice: product.currentPrice,
        currency: product.currency,
        addedAt: Date.now(),
      });
    }
  }

  return {
    items,           // All wishlist items
    wishlisted,      // Is current product wishlisted?
    toggleWishlist,  // Add or remove current product
    count: items.length,
  };
}