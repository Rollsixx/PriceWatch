// store/useNotificationStore.ts
// Manages in-app price drop alerts — in memory only (no persistence needed)

import { create } from 'zustand';
import { PriceDropAlert } from '../types';

interface NotificationState {
  // Data
  alerts: PriceDropAlert[];
  unreadCount: number;

  // Actions
  addAlert: (alert: PriceDropAlert) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAlerts: () => void;
}

const MAX_ALERTS = 50;
const DUPLICATE_WINDOW_MS = 60000; // 1 minute

export const useNotificationStore = create<NotificationState>((set, get) => ({
  alerts: [],
  unreadCount: 0,

  addAlert: (alert) => {
    const existing = get().alerts.find(
      (a) =>
        a.productId === alert.productId &&
        alert.detectedAt - a.detectedAt < DUPLICATE_WINDOW_MS
    );

    // Silently ignore duplicate alerts
    if (existing) return;

    set((state) => ({
      // Prepend new alert, cap at MAX_ALERTS
      alerts: [alert, ...state.alerts].slice(0, MAX_ALERTS),
      unreadCount: state.unreadCount + 1,
    }));
  },

  markRead: (id) => {
    const alert = get().alerts.find((a) => a.id === id);
    if (!alert || alert.read) return; // Already read

    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === id ? { ...a, read: true } : a
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllRead: () => {
    set((state) => ({
      alerts: state.alerts.map((a) => ({ ...a, read: true })),
      unreadCount: 0,
    }));
  },

  clearAlerts: () => set({ alerts: [], unreadCount: 0 }),
}));