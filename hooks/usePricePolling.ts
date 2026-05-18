// hooks/usePricePolling.ts
// Starts/stops background price polling for wishlist items

import { useEffect } from 'react';
import { useWishlistStore } from '../store/useWishlistStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { startPolling, stopPolling } from '../services/pricePollingService';

export function usePricePolling() {
  const items = useWishlistStore((s) => s.items);
  const addAlert = useNotificationStore((s) => s.addAlert);

  useEffect(() => {
    if (items.length === 0) return;
    startPolling(items, addAlert);
    return () => stopPolling();
  }, [items.length > 0]);
}
