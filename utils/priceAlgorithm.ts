// utils/priceAlgorithm.ts
// Core price drop detection algorithm
// This file is independently testable — no React Native dependencies

import { PriceRecord } from '../types';
import { PRICE_DROP_THRESHOLD_PERCENT } from '../constants';

// ─────────────────────────────────────────────
// 1. CALCULATE AVERAGE PRICE
// ─────────────────────────────────────────────
// Takes an array of price records and returns the mean price.
// Returns 0 if no records exist (edge case protection).
//
// Why average and not just previous price?
// → Average is more stable. A single spike won't cause false alerts.
export function calculateAveragePrice(history: PriceRecord[]): number {
  if (history.length === 0) return 0;

  const total = history.reduce((sum, record) => sum + record.price, 0);
  return Math.round((total / history.length) * 100) / 100;
}

// ─────────────────────────────────────────────
// 2. CALCULATE DROP PERCENTAGE
// ─────────────────────────────────────────────
// How much has the price dropped compared to the average?
// Returns a positive number for drops, negative for increases.
//
// Formula: ((average - current) / average) × 100
// Example: avg=$100, current=$80 → drop = 20%
export function calculateDropPercent(
  averagePrice: number,
  currentPrice: number
): number {
  if (averagePrice <= 0) return 0;

  const drop = ((averagePrice - currentPrice) / averagePrice) * 100;
  return Math.round(drop * 100) / 100; // Round to 2 decimal places
}

// ─────────────────────────────────────────────
// 3. DETECT SIGNIFICANT PRICE DROP
// ─────────────────────────────────────────────
// Main detection function — returns true if drop exceeds threshold.
//
// Requirements to trigger:
//   a) Must have at least 2 price records (need history to compare)
//   b) Drop percentage must meet or exceed threshold (default: 10%)
//   c) Current price must actually be below average (not just equal)
export function detectPriceDrop(
  history: PriceRecord[],
  currentPrice: number,
  thresholdPercent: number = PRICE_DROP_THRESHOLD_PERCENT
): boolean {
  // Edge case: not enough history to make a comparison
  if (history.length < 2) return false;

  // Edge case: invalid price
  if (currentPrice <= 0) return false;

  const average = calculateAveragePrice(history);

  // Edge case: no valid average
  if (average <= 0) return false;

  const dropPercent = calculateDropPercent(average, currentPrice);

  // Only trigger if price is BELOW average by threshold amount
  return dropPercent >= thresholdPercent;
}

// ─────────────────────────────────────────────
// 4. BUILD ALERT OBJECT
// ─────────────────────────────────────────────
// Creates a structured alert when a drop is detected.
// Returns null if no significant drop found.
export function buildPriceDropAlert(
  productId: string,
  productName: string,
  history: PriceRecord[],
  currentPrice: number,
  thresholdPercent: number = PRICE_DROP_THRESHOLD_PERCENT
): {
  productId: string;
  productName: string;
  oldPrice: number;
  newPrice: number;
  dropPercent: number;
  detectedAt: number;
} | null {
  const isDropDetected = detectPriceDrop(history, currentPrice, thresholdPercent);

  if (!isDropDetected) return null;

  const average = calculateAveragePrice(history);
  const dropPercent = calculateDropPercent(average, currentPrice);

  return {
    productId,
    productName,
    oldPrice: average,      // We compare against average, not previous price
    newPrice: currentPrice,
    dropPercent,
    detectedAt: Date.now(),
  };
}

// ─────────────────────────────────────────────
// 5. ANALYZE PRICE TREND
// ─────────────────────────────────────────────
// Helper to understand if prices are going up, down, or stable.
// Used for display purposes in the chart and product details.
export function analyzePriceTrend(
  history: PriceRecord[]
): 'rising' | 'falling' | 'stable' {
  if (history.length < 2) return 'stable';

  // Compare first half average to second half average
  const midpoint = Math.floor(history.length / 2);
  const firstHalf = history.slice(0, midpoint);
  const secondHalf = history.slice(midpoint);

  const firstAvg = calculateAveragePrice(firstHalf);
  const secondAvg = calculateAveragePrice(secondHalf);

  const changePercent = calculateDropPercent(firstAvg, secondAvg);

  if (changePercent >= 3) return 'falling';   // Dropped 3%+ → falling
  if (changePercent <= -3) return 'rising';   // Rose 3%+ → rising
  return 'stable';
}