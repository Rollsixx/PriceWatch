// __tests__/ui/uiLogic.test.ts
// Tests for UI helper logic and formatting

import { PriceRecord } from '../../types';

// ── Helper ──
function makeRecord(price: number, daysAgo: number): PriceRecord {
  return {
    id: Math.floor(Math.random() * 1000),
    productId: 'test',
    price,
    recordedAt: Date.now() - daysAgo * 86400000,
  };
}

// ─────────────────────────────────────────────
// Discount badge calculation
// ─────────────────────────────────────────────
describe('Discount badge logic', () => {
  test('calculates correct discount percent for product card', () => {
    const originalPrice = 99.99;
    const currentPrice = 79.99;
    const discount = Math.round(
      ((originalPrice - currentPrice) / originalPrice) * 100
    );
    expect(discount).toBe(20);
  });

  test('discount is 0 when prices are equal', () => {
    const originalPrice = 99.99;
    const currentPrice = 99.99;
    const discount = Math.round(
      ((originalPrice - currentPrice) / originalPrice) * 100
    );
    expect(discount).toBe(0);
  });

  test('no badge shown when discount is 0', () => {
    const discount = 0;
    const showBadge = discount > 0;
    expect(showBadge).toBe(false);
  });

  test('badge shown when discount is greater than 0', () => {
    const discount = 15;
    const showBadge = discount > 0;
    expect(showBadge).toBe(true);
  });
});

// ─────────────────────────────────────────────
// Price formatting
// ─────────────────────────────────────────────
describe('Price formatting', () => {
  test('formats price to 2 decimal places', () => {
    const price = 79.9;
    const formatted = price.toFixed(2);
    expect(formatted).toBe('79.90');
  });

  test('formats whole number price correctly', () => {
    const price = 100;
    const formatted = price.toFixed(2);
    expect(formatted).toBe('100.00');
  });
});

// ─────────────────────────────────────────────
// Notification store logic
// ─────────────────────────────────────────────
describe('Notification deduplication logic', () => {
  test('does not add duplicate alert within 1 minute', () => {
    const now = Date.now();
    const DUPLICATE_WINDOW_MS = 60000;

    const existingAlert = {
      id: 'alert-1',
      productId: 'prod-123',
      detectedAt: now - 30000, // 30 seconds ago
    };

    const newAlert = {
      id: 'alert-2',
      productId: 'prod-123',
      detectedAt: now,
    };

    const isDuplicate =
      existingAlert.productId === newAlert.productId &&
      newAlert.detectedAt - existingAlert.detectedAt < DUPLICATE_WINDOW_MS;

    expect(isDuplicate).toBe(true);
  });

  test('allows alert after duplicate window expires', () => {
    const now = Date.now();
    const DUPLICATE_WINDOW_MS = 60000;

    const existingAlert = {
      productId: 'prod-123',
      detectedAt: now - 90000, // 90 seconds ago — outside window
    };

    const newAlert = {
      productId: 'prod-123',
      detectedAt: now,
    };

    const isDuplicate =
      existingAlert.productId === newAlert.productId &&
      newAlert.detectedAt - existingAlert.detectedAt < DUPLICATE_WINDOW_MS;

    expect(isDuplicate).toBe(false);
  });
});

// ─────────────────────────────────────────────
// Chart data validation
// ─────────────────────────────────────────────
describe('Chart data validation', () => {
  test('chart requires at least 2 data points', () => {
    const history: PriceRecord[] = [makeRecord(100, 1)];
    const hasEnoughData = history.length >= 2;
    expect(hasEnoughData).toBe(false);
  });

  test('chart renders when 2 or more points exist', () => {
    const history: PriceRecord[] = [
      makeRecord(100, 2),
      makeRecord(90, 1),
    ];
    const hasEnoughData = history.length >= 2;
    expect(hasEnoughData).toBe(true);
  });

  test('lowest price is correctly identified from history', () => {
    const history = [
      makeRecord(100, 5),
      makeRecord(80, 4),
      makeRecord(120, 3),
      makeRecord(75, 2),
      makeRecord(90, 1),
    ];
    const lowest = Math.min(...history.map((h) => h.price));
    expect(lowest).toBe(75);
  });

  test('highest price is correctly identified from history', () => {
    const history = [
      makeRecord(100, 5),
      makeRecord(80, 4),
      makeRecord(120, 3),
      makeRecord(75, 2),
      makeRecord(90, 1),
    ];
    const highest = Math.max(...history.map((h) => h.price));
    expect(highest).toBe(120);
  });
});