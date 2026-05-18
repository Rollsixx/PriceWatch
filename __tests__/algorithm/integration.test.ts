// __tests__/algorithm/integration.test.ts
// Full pipeline integration tests: simulate → detect → alert

import { calculateMean, calculateStdDev, calculateZScore, buildPriceDropAlert } from '../../utils/priceAlgorithm';
import { PriceRecord } from '../../types';

function makeHistory(prices: number[]): PriceRecord[] {
  return prices.map((price, i) => ({
    id: i + 1,
    productId: 'test-product',
    price,
    recordedAt: Date.now() - (prices.length - i) * 86400000,
  }));
}

describe('Full Pipeline: Simulate → Detect → Alert', () => {
  test('large price drop triggers Z-score anomaly alert', () => {
    // Varied history gives a non-zero stdDev
    const history = makeHistory([100, 102, 98, 101, 99]);
    // Price drops to $70 — well below 1.5σ threshold
    const alert = buildPriceDropAlert('prod-1', 'Test Product', history, 70, 1.5);
    expect(alert).not.toBeNull();
    expect(alert!.productId).toBe('prod-1');
    expect(alert!.newPrice).toBe(70);
    expect(alert!.zScore).toBeLessThan(-1.5);
  });

  test('tiny fluctuation does not trigger alert', () => {
    // [102, 98, 101, 99] → mean=100, std~1.58
    const history = makeHistory([102, 98, 101, 99]);
    // Price at $98 → z≈-1.26 → within threshold
    const alert = buildPriceDropAlert('prod-1', 'Test', history, 98, 1.5);
    expect(alert).toBeNull();
  });

  test('multiple alerts for different products are independent', () => {
    const history1 = makeHistory([100, 102, 98, 101, 99]);
    const history2 = makeHistory([50, 51, 49, 50, 52]);

    const alert1 = buildPriceDropAlert('prod-1', 'Product A', history1, 70, 1.5);
    const alert2 = buildPriceDropAlert('prod-2', 'Product B', history2, 50, 1.5);

    expect(alert1).not.toBeNull();
    expect(alert2).toBeNull(); // stable around 50
  });

  test('alert contains all required fields', () => {
    const history = makeHistory([100, 102, 98, 101, 99]);
    const alert = buildPriceDropAlert('prod-1', 'Test', history, 70, 1.5);

    expect(alert).not.toBeNull();
    expect(alert!.productId).toBe('prod-1');
    expect(alert!.productName).toBe('Test');
    expect(typeof alert!.oldPrice).toBe('number');
    expect(typeof alert!.newPrice).toBe('number');
    expect(typeof alert!.dropPercent).toBe('number');
    expect(typeof alert!.zScore).toBe('number');
    expect(alert!.zScore).toBeLessThan(-1.5);
    expect(alert!.detectedAt).toBeGreaterThan(0);
  });

  test('larger drop produces more extreme (lower) Z-score', () => {
    const history = makeHistory([100, 101, 99, 100, 100]);
    const mean = calculateMean(history);
    const std = calculateStdDev(history);

    const z1 = calculateZScore(80, mean, std); // bigger drop
    const z2 = calculateZScore(90, mean, std); // smaller drop
    expect(z1).toBeLessThan(z2);
  });
});
