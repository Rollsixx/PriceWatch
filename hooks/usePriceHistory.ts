// hooks/usePriceHistory.ts
import { useState, useCallback } from 'react';
import { PriceRecord } from '../types';
import {
  getPriceHistory,
  getAveragePrice,
  seedPriceHistory,
} from '../database/priceHistoryDb';
import { simulatePriceChange } from '../utils/priceSimulator';

export function usePriceHistory(productId: string) {
  const [history, setHistory] = useState<PriceRecord[]>([]);
  const [averagePrice, setAveragePrice] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState(false);

  // Load history from SQLite into state
  const loadHistory = useCallback(() => {
    if (!productId) return;
    const records = getPriceHistory(productId);
    const avg = getAveragePrice(productId);
    setHistory(records);
    setAveragePrice(avg);
  }, [productId]);

  // Seed initial history if none exists, then load
  const initHistory = useCallback(
    (currentPrice: number, originalPrice: number) => {
      if (!productId) return;
      seedPriceHistory(productId, currentPrice, originalPrice);
      loadHistory();
    },
    [productId, loadHistory]
  );

  // Simulate a price change using the simulator
  // Note: full simulation with algorithm is handled in [id].tsx
  // This hook just reloads history after a change
  const simulatePrice = useCallback(
    (currentPrice: number) => {
      if (!productId) return null;
      setIsSimulating(true);
      try {
        const result = simulatePriceChange(productId, '', currentPrice);
        loadHistory();
        return result;
      } finally {
        setIsSimulating(false);
      }
    },
    [productId, loadHistory]
  );

  return {
    history,
    averagePrice,
    isSimulating,
    loadHistory,
    initHistory,
    simulatePrice,
  };
}