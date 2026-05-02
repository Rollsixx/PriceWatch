// utils/priceSimulator.ts
// Simulates price changes and runs the drop detection algorithm

import { addPriceRecord, getPriceHistory } from '../database/priceHistoryDb';
import { updateWishlistPrice } from '../database/wishlistDb';
import { buildPriceDropAlert } from './priceAlgorithm';
import { PriceDropAlert } from '../types';

interface SimulationResult {
  productId: string;
  oldPrice: number;
  newPrice: number;
  changePercent: number;
  alert: PriceDropAlert | null; // Non-null if a significant drop was detected
}

export function simulatePriceChange(
  productId: string,
  productName: string,
  currentPrice: number
): SimulationResult {
  // Get history BEFORE adding new price (for comparison)
  const historyBefore = getPriceHistory(productId);
  const oldPrice = historyBefore.length > 0
    ? historyBefore[historyBefore.length - 1].price
    : currentPrice;

  // Random change: -15% to +8% (biased toward drops for demo)
  const changePercent = Math.random() * 23 - 15;
  const newPrice = Math.round(oldPrice * (1 + changePercent / 100) * 100) / 100;

  // Clamp price to realistic range
  const minPrice = Math.round(currentPrice * 0.5 * 100) / 100;
  const maxPrice = Math.round(currentPrice * 1.2 * 100) / 100;
  const clampedPrice = Math.min(maxPrice, Math.max(minPrice, newPrice));

  // Save new price to SQLite
  addPriceRecord(productId, clampedPrice);

  // Update wishlist if product is saved
  updateWishlistPrice(productId, clampedPrice);

  // Get updated history (includes new price)
  const historyAfter = getPriceHistory(productId);

  // Run the drop detection algorithm
  const alertData = buildPriceDropAlert(
    productId,
    productName,
    historyAfter,
    clampedPrice
  );

  // Build full alert object if drop detected
  const alert: PriceDropAlert | null = alertData
    ? {
        id: `${productId}-${Date.now()}`,
        read: false,
        ...alertData,
      }
    : null;

  return {
    productId,
    oldPrice,
    newPrice: clampedPrice,
    changePercent: Math.round(((clampedPrice - oldPrice) / oldPrice) * 100 * 10) / 10,
    alert,
  };
}