// __tests__/algorithm/priceAlgorithm.test.ts
// Tests for the core Z-score price drop detection algorithm

import {
  calculateMean,
  calculateStdDev,
  calculateZScore,
  calculateDropPercent,
  detectPriceDrop,
  buildPriceDropAlert,
  analyzePriceTrend,
  filterHistoryLastNHours,
  hasDroppedInLastNHours,
} from '../../utils/priceAlgorithm';
import { PriceRecord } from '../../types';

function makeHistory(prices: number[], daysOffset?: number[]): PriceRecord[] {
  return prices.map((price, i) => ({
    id: i + 1,
    productId: 'test-product',
    price,
    recordedAt: daysOffset
      ? Date.now() - daysOffset[i] * 86400000
      : Date.now() - (prices.length - i) * 86400000,
  }));
}

// ── 1. calculateMean (CORE) ──
describe('calculateMean', () => {
  test('calculates correct mean from price history', () => {
    const history = makeHistory([100, 90, 80, 110, 120]);
    expect(calculateMean(history)).toBe(100);
  });

  test('returns 0 for empty history', () => {
    expect(calculateMean([])).toBe(0);
  });

  test('handles single price record', () => {
    expect(calculateMean(makeHistory([75.50]))).toBe(75.50);
  });
});

// ── 2. calculateStdDev (CORE) ──
describe('calculateStdDev', () => {
  test('calculates standard deviation correctly', () => {
    expect(calculateStdDev(makeHistory([100, 100, 100, 100]))).toBe(0);
  });

  test('returns 0 for less than 2 records', () => {
    expect(calculateStdDev(makeHistory([100]))).toBe(0);
  });

  test('returns positive stddev for varying prices', () => {
    const history = makeHistory([90, 100, 110]);
    const std = calculateStdDev(history);
    expect(std).toBeGreaterThan(0);
  });

  test('returns 0 for empty history', () => {
    expect(calculateStdDev([])).toBe(0);
  });
});

// ── 3. calculateZScore (CORE) ──
describe('calculateZScore', () => {
  test('returns 0 when stdDev is 0', () => {
    expect(calculateZScore(80, 100, 0)).toBe(0);
  });

  test('negative z-score when price is below mean', () => {
    expect(calculateZScore(80, 100, 10)).toBe(-2);
  });

  test('positive z-score when price is above mean', () => {
    expect(calculateZScore(120, 100, 10)).toBe(2);
  });

  test('z-score of 0 when price equals mean', () => {
    expect(calculateZScore(100, 100, 10)).toBe(0);
  });
});

// ── 4. detectPriceDrop with Z-score (CORE) ──
describe('detectPriceDrop (Z-score method)', () => {
  test('detects drop when Z < -1.5', () => {
    // mean=100, std~8.16, price=75 → z≈-3.06 → anomaly
    const history = makeHistory([100, 110, 90, 100, 105, 95]);
    expect(detectPriceDrop(history, 75, 1.5)).toBe(true);
  });

  test('does not trigger when drop is mild (Z > -1.5)', () => {
    // [102, 98, 101, 99] → mean=100, std~1.58, price=98 → z≈-1.26 → not anomaly
    const history = makeHistory([102, 98, 101, 99]);
    expect(detectPriceDrop(history, 98, 1.5)).toBe(false);
  });

  test('requires at least 3 records (MIN_HISTORY_FOR_ZSCORE)', () => {
    expect(detectPriceDrop(makeHistory([100, 100]), 80, 1.5)).toBe(false);
  });

  test('returns false for zero current price', () => {
    expect(detectPriceDrop(makeHistory([100, 100, 100]), 0, 1.5)).toBe(false);
  });

  test('returns false when price is above mean', () => {
    const history = makeHistory([100, 100, 100, 100]);
    expect(detectPriceDrop(history, 120, 1.5)).toBe(false);
  });
});

// ── 5. calculateDropPercent ──
describe('calculateDropPercent', () => {
  test('calculates correct drop percentage', () => {
    expect(calculateDropPercent(100, 80)).toBe(20);
  });

  test('returns negative when price increased', () => {
    expect(calculateDropPercent(100, 110)).toBe(-10);
  });

  test('returns 0 when mean is 0', () => {
    expect(calculateDropPercent(0, 80)).toBe(0);
  });

  test('returns 0 when prices are equal', () => {
    expect(calculateDropPercent(100, 100)).toBe(0);
  });
});

// ── 6. buildPriceDropAlert (EDGE CASE) ──
describe('buildPriceDropAlert', () => {
  test('returns alert when Z-score anomaly detected', () => {
    // mean=100, std~7.07, price=75 → z≈-3.54 → anomaly
    const history = makeHistory([100, 110, 90, 100, 105, 95]);
    const alert = buildPriceDropAlert('prod-1', 'Test', history, 75, 1.5);
    expect(alert).not.toBeNull();
    expect(alert?.productId).toBe('prod-1');
    expect(alert?.zScore).toBeLessThan(-1.5);
  });

  test('returns null when no anomaly', () => {
    // [102, 98, 101, 99] → mean=100, std~1.58, price=98 → z≈-1.26 → no alert
    const history = makeHistory([102, 98, 101, 99]);
    const alert = buildPriceDropAlert('prod-1', 'Test', history, 98, 1.5);
    expect(alert).toBeNull();
  });

  test('returns null with insufficient history', () => {
    const alert = buildPriceDropAlert('prod-1', 'Test', makeHistory([100, 100]), 80, 1.5);
    expect(alert).toBeNull();
  });

  test('includes zScore in alert object', () => {
    const history = makeHistory([100, 110, 90, 100, 105, 95]);
    const alert = buildPriceDropAlert('prod-1', 'Test', history, 70, 1.5);
    expect(alert?.zScore).toBeDefined();
    expect(typeof alert?.zScore).toBe('number');
    expect(alert?.zScore).toBeLessThan(-1.5);
  });
});

// ── 7. analyzePriceTrend ──
describe('analyzePriceTrend', () => {
  test('detects falling trend', () => {
    expect(analyzePriceTrend(makeHistory([120, 110, 100, 90, 80, 70]))).toBe('falling');
  });

  test('detects rising trend', () => {
    expect(analyzePriceTrend(makeHistory([70, 80, 90, 100, 110, 120]))).toBe('rising');
  });

  test('detects stable trend', () => {
    expect(analyzePriceTrend(makeHistory([100, 101, 99, 100, 101, 100]))).toBe('stable');
  });

  test('returns stable for insufficient history', () => {
    expect(analyzePriceTrend(makeHistory([100]))).toBe('stable');
  });
});

// ── 8. filterHistoryLastNHours (EDGE CASE) ──
describe('filterHistoryLastNHours', () => {
  test('filters records within time window', () => {
    const now = Date.now();
    const history: PriceRecord[] = [
      { id: 1, productId: 'p1', price: 100, recordedAt: now - 48 * 3600000 },
      { id: 2, productId: 'p1', price: 90, recordedAt: now - 12 * 3600000 },
      { id: 3, productId: 'p1', price: 80, recordedAt: now - 2 * 3600000 },
    ];
    const filtered = filterHistoryLastNHours(history, 24);
    // Within last 24h: IDs 2 and 3 (48h old is outside)
    expect(filtered.length).toBe(2);
    expect(filtered[0].id).toBe(2);
    expect(filtered[1].id).toBe(3);
  });

  test('returns empty when all records are outside window', () => {
    const now = Date.now();
    const history: PriceRecord[] = [
      { id: 1, productId: 'p1', price: 100, recordedAt: now - 72 * 3600000 },
    ];
    expect(filterHistoryLastNHours(history, 24).length).toBe(0);
  });
});

// ── 9. hasDroppedInLastNHours ──
describe('hasDroppedInLastNHours', () => {
  test('detects drop within window when history has anomaly', () => {
    const now = Date.now();
    const history: PriceRecord[] = [
      { id: 1, productId: 'p1', price: 100, recordedAt: now - 40 * 3600000 },
      { id: 2, productId: 'p1', price: 102, recordedAt: now - 30 * 3600000 },
      { id: 3, productId: 'p1', price: 98, recordedAt: now - 20 * 3600000 },
      { id: 4, productId: 'p1', price: 75, recordedAt: now - 2 * 3600000 },
    ];
    expect(hasDroppedInLastNHours(history, 48, 1.5)).toBe(true);
  });

  test('returns false when no drop in window', () => {
    const now = Date.now();
    const history: PriceRecord[] = [
      { id: 1, productId: 'p1', price: 100, recordedAt: now - 40 * 3600000 },
      { id: 2, productId: 'p1', price: 100, recordedAt: now - 30 * 3600000 },
      { id: 3, productId: 'p1', price: 99, recordedAt: now - 20 * 3600000 },
      { id: 4, productId: 'p1', price: 99, recordedAt: now - 2 * 3600000 },
    ];
    expect(hasDroppedInLastNHours(history, 48, 1.5)).toBe(false);
  });
});
