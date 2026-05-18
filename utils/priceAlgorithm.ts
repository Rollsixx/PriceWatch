// utils/priceAlgorithm.ts
// Core price drop detection algorithm using Z-score anomaly detection
// This file is independently testable — no React Native dependencies

import { PriceRecord } from '../types';
import { Z_SCORE_THRESHOLD, MIN_HISTORY_FOR_ZSCORE } from '../constants';

// ─────────────────────────────────────────────
// 1. CALCULATE MEAN (AVERAGE) PRICE
// ─────────────────────────────────────────────
export function calculateMean(history: PriceRecord[]): number {
  if (history.length === 0) return 0;
  const total = history.reduce((sum, record) => sum + record.price, 0);
  return Math.round((total / history.length) * 100) / 100;
}

// ─────────────────────────────────────────────
// 2. CALCULATE STANDARD DEVIATION
// ─────────────────────────────────────────────
// Population standard deviation (not sample) since we have the full set.
export function calculateStdDev(history: PriceRecord[]): number {
  if (history.length < 2) return 0;
  const mean = calculateMean(history);
  const squaredDiffs = history.reduce(
    (sum, record) => sum + (record.price - mean) ** 2,
    0
  );
  return Math.round(Math.sqrt(squaredDiffs / history.length) * 100) / 100;
}

// ─────────────────────────────────────────────
// 3. CALCULATE Z-SCORE
// ─────────────────────────────────────────────
// Z = (currentPrice - mean) / stdDev
// A negative Z-score means price is below the mean.
// Z < -1.5 → significant drop (anomaly)
export function calculateZScore(
  currentPrice: number,
  mean: number,
  stdDev: number
): number {
  if (stdDev <= 0) return 0;
  return Math.round(((currentPrice - mean) / stdDev) * 100) / 100;
}

// ─────────────────────────────────────────────
// 4. DETECT ANOMALOUS PRICE DROP (Z-SCORE METHOD)
// ─────────────────────────────────────────────
// Flags a drop when the current price is more than Z_SCORE_THRESHOLD
// standard deviations below the rolling mean.
//
// Requirements:
//   a) Must have at least MIN_HISTORY_FOR_ZSCORE records
//   b) Current price must be below the mean
//   c) |Z-score| must exceed Z_SCORE_THRESHOLD (default: 1.5)
export function detectPriceDrop(
  history: PriceRecord[],
  currentPrice: number,
  zThreshold: number = Z_SCORE_THRESHOLD
): boolean {
  if (history.length < MIN_HISTORY_FOR_ZSCORE) return false;
  if (currentPrice <= 0) return false;

  const mean = calculateMean(history);
  const stdDev = calculateStdDev(history);

  if (stdDev <= 0) return false;

  const zScore = calculateZScore(currentPrice, mean, stdDev);

  // Negative Z-score = below mean; must exceed threshold
  return zScore < -zThreshold;
}

// ─────────────────────────────────────────────
// 5. CALCULATE DROP PERCENTAGE (for display)
// ─────────────────────────────────────────────
// How much has the price dropped compared to the mean?
// Positive number = drop, negative = increase.
export function calculateDropPercent(
  meanPrice: number,
  currentPrice: number
): number {
  if (meanPrice <= 0) return 0;
  const drop = ((meanPrice - currentPrice) / meanPrice) * 100;
  return Math.round(drop * 100) / 100;
}

// ─────────────────────────────────────────────
// 6. BUILD ALERT OBJECT
// ─────────────────────────────────────────────
// Creates a structured alert when Z-score anomaly is detected.
// Returns null if no significant drop found.
export function buildPriceDropAlert(
  productId: string,
  productName: string,
  history: PriceRecord[],
  currentPrice: number,
  zThreshold: number = Z_SCORE_THRESHOLD
): {
  productId: string;
  productName: string;
  oldPrice: number;
  newPrice: number;
  dropPercent: number;
  detectedAt: number;
  zScore: number;
} | null {
  if (history.length < MIN_HISTORY_FOR_ZSCORE) return null;
  if (currentPrice <= 0) return null;

  const mean = calculateMean(history);
  const stdDev = calculateStdDev(history);
  const zScore = calculateZScore(currentPrice, mean, stdDev);

  if (zScore >= -zThreshold) return null;

  const dropPercent = calculateDropPercent(mean, currentPrice);

  return {
    productId,
    productName,
    oldPrice: mean,
    newPrice: currentPrice,
    dropPercent,
    detectedAt: Date.now(),
    zScore,
  };
}

// ─────────────────────────────────────────────
// 7. ANALYZE PRICE TREND
// ─────────────────────────────────────────────
export function analyzePriceTrend(
  history: PriceRecord[]
): 'rising' | 'falling' | 'stable' {
  if (history.length < 2) return 'stable';

  const midpoint = Math.floor(history.length / 2);
  const firstHalf = history.slice(0, midpoint);
  const secondHalf = history.slice(midpoint);

  const firstMean = calculateMean(firstHalf);
  const secondMean = calculateMean(secondHalf);

  if (firstMean <= 0) return 'stable';
  const changePercent = ((firstMean - secondMean) / firstMean) * 100;

  if (changePercent >= 3) return 'falling';
  if (changePercent <= -3) return 'rising';
  return 'stable';
}

// ─────────────────────────────────────────────
// 8. TIME-WINDOW FILTERING (circular buffer query)
// ─────────────────────────────────────────────
// Given price history, return only records within the last N hours.
export function filterHistoryLastNHours(
  history: PriceRecord[],
  hours: number
): PriceRecord[] {
  const cutoff = Date.now() - hours * 60 * 60 * 1000;
  return history.filter((record) => record.recordedAt >= cutoff);
}

// ─────────────────────────────────────────────
// 9. CHECK IF DROPPED IN LAST N HOURS
// ─────────────────────────────────────────────
// Returns true if the latest price in the window is a Z-score anomaly.
export function hasDroppedInLastNHours(
  history: PriceRecord[],
  hours: number,
  zThreshold: number = Z_SCORE_THRESHOLD
): boolean {
  const windowHistory = filterHistoryLastNHours(history, hours);
  if (windowHistory.length < MIN_HISTORY_FOR_ZSCORE) return false;

  const latestPrice = windowHistory[windowHistory.length - 1].price;
  return detectPriceDrop(windowHistory, latestPrice, zThreshold);
}