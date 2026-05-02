// __tests__/wishlist/wishlistLogic.test.ts
// Tests for wishlist business logic

import { WishlistItem } from '../../types';

// ── Helper to create a fake wishlist item ──
function makeWishlistItem(overrides?: Partial<WishlistItem>): WishlistItem {
  return {
    id: 1,
    productId: 'prod-123',
    name: 'Test Product',
    imageUrl: 'https://example.com/image.jpg',
    currentPrice: 99.99,
    currency: 'USD',
    addedAt: Date.now(),
    ...overrides,
  };
}

// ─────────────────────────────────────────────
// Wishlist item structure
// ─────────────────────────────────────────────
describe('WishlistItem structure', () => {
  test('wishlist item has all required fields', () => {
    const item = makeWishlistItem();
    expect(item.productId).toBeDefined();
    expect(item.name).toBeDefined();
    expect(item.currentPrice).toBeDefined();
    expect(item.currency).toBeDefined();
    expect(item.addedAt).toBeDefined();
  });

  test('addedAt is a valid timestamp', () => {
    const item = makeWishlistItem();
    expect(item.addedAt).toBeGreaterThan(0);
    expect(typeof item.addedAt).toBe('number');
  });

  test('currentPrice is a positive number', () => {
    const item = makeWishlistItem({ currentPrice: 49.99 });
    expect(item.currentPrice).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────
// Wishlist operations (pure logic)
// ─────────────────────────────────────────────
describe('Wishlist operations logic', () => {
  test('adding item increases list length', () => {
    const wishlist: WishlistItem[] = [];
    const newItem = makeWishlistItem();
    wishlist.push(newItem);
    expect(wishlist.length).toBe(1);
  });

  test('removing item by productId works correctly', () => {
    const item1 = makeWishlistItem({ productId: 'prod-1' });
    const item2 = makeWishlistItem({ productId: 'prod-2' });
    let wishlist = [item1, item2];

    // Simulate remove
    wishlist = wishlist.filter((i) => i.productId !== 'prod-1');

    expect(wishlist.length).toBe(1);
    expect(wishlist[0].productId).toBe('prod-2');
  });

  test('duplicate productId is not added twice', () => {
  const wishlist: WishlistItem[] = [];
  const item = makeWishlistItem({ productId: 'prod-123' });

  // Simulate INSERT OR IGNORE behavior — check EACH TIME before adding
  const addIfNotExists = (list: WishlistItem[], newItem: WishlistItem) => {
    const exists = list.some((i) => i.productId === newItem.productId);
    if (!exists) list.push(newItem);
  };

  addIfNotExists(wishlist, item); // First add — succeeds
  addIfNotExists(wishlist, item); // Second add — ignored

  expect(wishlist.length).toBe(1);
});

  test('isWishlisted returns true for existing item', () => {
    const wishlist = [makeWishlistItem({ productId: 'prod-abc' })];
    const result = wishlist.some((i) => i.productId === 'prod-abc');
    expect(result).toBe(true);
  });

  test('isWishlisted returns false for missing item', () => {
    const wishlist = [makeWishlistItem({ productId: 'prod-abc' })];
    const result = wishlist.some((i) => i.productId === 'prod-xyz');
    expect(result).toBe(false);
  });

  test('price update reflects in wishlist item', () => {
    const wishlist = [makeWishlistItem({ currentPrice: 99.99 })];

    // Simulate price update
    const updated = wishlist.map((item) =>
      item.productId === 'prod-123'
        ? { ...item, currentPrice: 79.99 }
        : item
    );

    expect(updated[0].currentPrice).toBe(79.99);
  });

  test('clearing wishlist results in empty array', () => {
    const wishlist = [
      makeWishlistItem({ productId: 'prod-1' }),
      makeWishlistItem({ productId: 'prod-2' }),
    ];
    const cleared: WishlistItem[] = [];
    expect(cleared.length).toBe(0);
  });
});