// services/pricePollingService.ts
// Background polling that checks for price drops on wishlist items

import { simulatePriceChange } from '../utils/priceSimulator';
import { WishlistItem, PriceDropAlert } from '../types';

const POLL_INTERVAL_MS = 30000; // 30 seconds

type AlertCallback = (alert: PriceDropAlert) => void;

let _intervalId: ReturnType<typeof setInterval> | null = null;
let _items: WishlistItem[] = [];
let _onAlert: AlertCallback | null = null;

function poll() {
  for (const item of _items) {
    try {
      const result = simulatePriceChange(
        item.productId,
        item.name,
        item.currentPrice
      );
      if (result.alert && _onAlert) {
        _onAlert(result.alert);
      }
    } catch {
      // Silently skip items that fail
    }
  }
}

export function startPolling(
  items: WishlistItem[],
  onAlert: AlertCallback
): void {
  _items = items;
  _onAlert = onAlert;
  if (_intervalId) return;
  poll();
  _intervalId = setInterval(poll, POLL_INTERVAL_MS);
}

export function stopPolling(): void {
  if (_intervalId) {
    clearInterval(_intervalId);
    _intervalId = null;
  }
  _items = [];
  _onAlert = null;
}

export function updatePollingItems(items: WishlistItem[]): void {
  _items = items;
}
