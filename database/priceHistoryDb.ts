// database/priceHistoryDb.ts
// All SQLite operations for the price_history table

import db from './db';
import { PriceRecord } from '../types';
import { MAX_PRICE_HISTORY_RECORDS } from '../constants';

// --- ADD A PRICE RECORD ---
export function addPriceRecord(productId: string, price: number): void {
  // Insert new record
  db.runSync(
    `INSERT INTO price_history (productId, price, recordedAt)
     VALUES (?, ?, ?)`,
    [productId, price, Date.now()]
  );

  // Keep only the last N records per product (prevents DB from growing forever)
  db.runSync(
    `DELETE FROM price_history
     WHERE productId = ?
     AND id NOT IN (
       SELECT id FROM price_history
       WHERE productId = ?
       ORDER BY recordedAt DESC
       LIMIT ?
     )`,
    [productId, productId, MAX_PRICE_HISTORY_RECORDS]
  );
}

// --- GET PRICE HISTORY FOR A PRODUCT ---
export function getPriceHistory(productId: string): PriceRecord[] {
  return db.getAllSync<PriceRecord>(
    `SELECT * FROM price_history
     WHERE productId = ?
     ORDER BY recordedAt ASC`,
    [productId]
  );
}

// --- GET LATEST PRICE FOR A PRODUCT ---
export function getLatestPrice(productId: string): PriceRecord | null {
  return db.getFirstSync<PriceRecord>(
    `SELECT * FROM price_history
     WHERE productId = ?
     ORDER BY recordedAt DESC
     LIMIT 1`,
    [productId]
  );
}

// --- GET AVERAGE PRICE FOR A PRODUCT ---
export function getAveragePrice(productId: string): number {
  const result = db.getFirstSync<{ avg: number }>(
    `SELECT AVG(price) as avg FROM price_history
     WHERE productId = ?`,
    [productId]
  );
  return result?.avg ?? 0;
}

// --- DELETE ALL HISTORY FOR A PRODUCT ---
export function clearPriceHistory(productId: string): void {
  db.runSync(
    'DELETE FROM price_history WHERE productId = ?',
    [productId]
  );
}

// --- SEED INITIAL PRICE HISTORY ---
// Call this when a product is first loaded to populate history
export function seedPriceHistory(
  productId: string,
  currentPrice: number,
  originalPrice: number
): void {
  // Check if history already exists
  const existing = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM price_history WHERE productId = ?',
    [productId]
  );

  if ((existing?.count ?? 0) > 0) return; // Already seeded

  // Generate 7 days of fake history going backwards
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;

  // Start at original price, gradually move toward current price
  for (let i = 7; i >= 0; i--) {
    const progress = (7 - i) / 7; // 0 to 1
    const price = originalPrice - (originalPrice - currentPrice) * progress;
    // Add small random noise ±3%
    const noise = price * (Math.random() * 0.06 - 0.03);
    const finalPrice = Math.round((price + noise) * 100) / 100;

    db.runSync(
      `INSERT INTO price_history (productId, price, recordedAt)
       VALUES (?, ?, ?)`,
      [productId, finalPrice, now - i * oneDayMs]
    );
  }
}