// __tests__/algorithm/priceAlgorithm.test.ts
// Tests for the core price drop detection algorithm

import {
  calculateAveragePrice,
  calculateDropPercent,
  detectPriceDrop,
  buildPriceDropAlert,
  analyzePriceTrend,
} from '../../utils/priceAlgorithm';
import { PriceRecord } from '../../types';

// ── Helper to create fake price records ──
function makeHistory(prices: number[]): PriceRecord[] {
  return prices.map((price, i) => ({
    id: i + 1,
    productId: 'test-product',
    price,
    recordedAt: Date.now() - (prices.length - i) * 86400000,
  }));
}

// ─────────────────────────────────────────────
// TEST 1 — calculateAveragePrice (CORE)
// ─────────────────────────────────────────────
describe('calculateAveragePrice', () => {
  test('calculates correct average from price history', () => {
    const history = makeHistory([100, 90, 80, 110, 120]);
    const avg = calculateAveragePrice(history);
    expect(avg).toBe(100); // (100+90+80+110+120)/5 = 100
  });

  test('returns 0 for empty history', () => {
    const avg = calculateAveragePrice([]);
    expect(avg).toBe(0);
  });

  test('handles single price record', () => {
    const history = makeHistory([75.50]);
    const avg = calculateAveragePrice(history);
    expect(avg).toBe(75.50);
  });
});

// ─────────────────────────────────────────────
// TEST 2 — calculateDropPercent (CORE)
// ─────────────────────────────────────────────
describe('calculateDropPercent', () => {
  test('calculates correct drop percentage', () => {
    // avg=$100, current=$80 → 20% drop
    const drop = calculateDropPercent(100, 80);
    expect(drop).toBe(20);
  });

  test('returns negative when price increases', () => {
    // avg=$100, current=$110 → -10% (price went UP)
    const drop = calculateDropPercent(100, 110);
    expect(drop).toBe(-10);
  });

  test('returns 0 when average is 0', () => {
    const drop = calculateDropPercent(0, 80);
    expect(drop).toBe(0);
  });

  test('returns 0 when prices are equal', () => {
    const drop = calculateDropPercent(100, 100);
    expect(drop).toBe(0);
  });
});

// ─────────────────────────────────────────────
// TEST 3 — detectPriceDrop (CORE)
// ─────────────────────────────────────────────
describe('detectPriceDrop', () => {
  test('detects significant price drop above threshold', () => {
    // avg = $100, current = $80 → 20% drop → should trigger (threshold=10%)
    const history = makeHistory([100, 100, 100, 100]);
    const result = detectPriceDrop(history, 80, 10);
    expect(result).toBe(true);
  });

  test('does not trigger when drop is below threshold', () => {
    // avg = $100, current = $95 → only 5% drop → should NOT trigger
    const history = makeHistory([100, 100, 100, 100]);
    const result = detectPriceDrop(history, 95, 10);
    expect(result).toBe(false);
  });

  test('does not trigger when price is exactly at threshold', () => {
    // avg = $100, current = $90 → exactly 10% → SHOULD trigger (>= threshold)
    const history = makeHistory([100, 100, 100, 100]);
    const result = detectPriceDrop(history, 90, 10);
    expect(result).toBe(true);
  });

  test('does not trigger with less than 2 records', () => {
    // Not enough history to make a comparison
    const history = makeHistory([100]);
    const result = detectPriceDrop(history, 70, 10);
    expect(result).toBe(false);
  });

  test('does not trigger when price increases', () => {
    // avg = $100, current = $120 → price went UP
    const history = makeHistory([100, 100, 100, 100]);
    const result = detectPriceDrop(history, 120, 10);
    expect(result).toBe(false);
  });
});

// ─────────────────────────────────────────────
// EDGE CASE 1 — Zero and negative prices
// ─────────────────────────────────────────────
describe('Edge cases — invalid prices', () => {
  test('detectPriceDrop returns false for zero current price', () => {
    const history = makeHistory([100, 100, 100]);
    const result = detectPriceDrop(history, 0, 10);
    expect(result).toBe(false);
  });

  test('calculateDropPercent handles negative average gracefully', () => {
    const result = calculateDropPercent(-10, 80);
    // Negative average is invalid — should return 0
    expect(result).toBe(0);
  });
});

// ─────────────────────────────────────────────
// EDGE CASE 2 — buildPriceDropAlert
// ─────────────────────────────────────────────
describe('buildPriceDropAlert', () => {
  test('returns alert object when drop is significant', () => {
    const history = makeHistory([100, 100, 100, 100]);
    const alert = buildPriceDropAlert(
      'prod-1',
      'Test Product',
      history,
      75, // 25% below average
      10
    );
    expect(alert).not.toBeNull();
    expect(alert?.productId).toBe('prod-1');
    expect(alert?.productName).toBe('Test Product');
    expect(alert?.dropPercent).toBeGreaterThanOrEqual(10);
    expect(alert?.newPrice).toBe(75);
  });

  test('returns null when drop is not significant', () => {
    const history = makeHistory([100, 100, 100, 100]);
    const alert = buildPriceDropAlert(
      'prod-1',
      'Test Product',
      history,
      97, // Only 3% drop — below threshold
      10
    );
    expect(alert).toBeNull();
  });
});

// ─────────────────────────────────────────────
// analyzePriceTrend
// ─────────────────────────────────────────────
describe('analyzePriceTrend', () => {
  test('detects falling trend', () => {
    const history = makeHistory([120, 110, 100, 90, 80, 70]);
    const trend = analyzePriceTrend(history);
    expect(trend).toBe('falling');
  });

  test('detects rising trend', () => {
    const history = makeHistory([70, 80, 90, 100, 110, 120]);
    const trend = analyzePriceTrend(history);
    expect(trend).toBe('rising');
  });

  test('detects stable trend', () => {
    const history = makeHistory([100, 101, 99, 100, 101, 100]);
    const trend = analyzePriceTrend(history);
    expect(trend).toBe('stable');
  });

  test('returns stable for insufficient history', () => {
    const history = makeHistory([100]);
    const trend = analyzePriceTrend(history);
    expect(trend).toBe('stable');
  });
});