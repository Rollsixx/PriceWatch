// database/wishlistDb.ts
// All SQLite CRUD operations for the wishlist table

import db from './db';
import { WishlistItem } from '../types';

// --- ADD ITEM ---
export function addToWishlist(item: Omit<WishlistItem, 'id'>): void {
  db.runSync(
    `INSERT OR IGNORE INTO wishlist 
     (productId, name, imageUrl, currentPrice, currency, addedAt)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      item.productId,
      item.name,
      item.imageUrl,
      item.currentPrice,
      item.currency,
      item.addedAt,
    ]
  );
}

// --- REMOVE ITEM ---
export function removeFromWishlist(productId: string): void {
  db.runSync(
    'DELETE FROM wishlist WHERE productId = ?',
    [productId]
  );
}

// --- GET ALL WISHLIST ITEMS ---
export function getWishlistItems(): WishlistItem[] {
  return db.getAllSync<WishlistItem>(
    'SELECT * FROM wishlist ORDER BY addedAt DESC'
  );
}

// --- CHECK IF ITEM IS IN WISHLIST ---
export function isInWishlist(productId: string): boolean {
  const result = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM wishlist WHERE productId = ?',
    [productId]
  );
  return (result?.count ?? 0) > 0;
}

// --- UPDATE PRICE (when product price changes) ---
export function updateWishlistPrice(
  productId: string,
  newPrice: number
): void {
  db.runSync(
    'UPDATE wishlist SET currentPrice = ? WHERE productId = ?',
    [newPrice, productId]
  );
}

// --- CLEAR ALL ---
export function clearWishlist(): void {
  db.runSync('DELETE FROM wishlist');
}