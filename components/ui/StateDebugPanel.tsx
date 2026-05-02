// components/ui/StateDebugPanel.tsx
// Shows live Zustand state — useful for defense and debugging
// Toggle visibility with the button in Profile screen

import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useProductStore } from '../../store/useProductStore';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { COLORS } from '../../constants';

export default function StateDebugPanel() {
  const [expanded, setExpanded] = useState(false);

  const auth = useAuthStore();
  const products = useProductStore();
  const wishlist = useWishlistStore();
  const notifications = useNotificationStore();

  if (!expanded) {
    return (
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setExpanded(true)}
      >
        <Text style={styles.toggleText}>🔍 Show App State (Debug)</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.panel}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => setExpanded(false)}
      >
        <Text style={styles.closeText}>✕ Close Debug Panel</Text>
      </TouchableOpacity>

      <ScrollView>
        {/* Auth Store */}
        <Text style={styles.storeTitle}>🔐 useAuthStore</Text>
        <View style={styles.storeBox}>
          <Row label="isAuthenticated" value={String(auth.isAuthenticated)} />
          <Row label="isLoading" value={String(auth.isLoading)} />
          <Row label="user.email" value={auth.user?.email ?? 'null'} />
          <Row label="user.displayName" value={auth.user?.displayName ?? 'null'} />
        </View>

        {/* Product Store */}
        <Text style={styles.storeTitle}>📦 useProductStore</Text>
        <View style={styles.storeBox}>
          <Row label="products.length" value={String(products.products.length)} />
          <Row label="isLoading" value={String(products.isLoading)} />
          <Row label="error" value={products.error ?? 'null'} />
          <Row label="hasMore" value={String(products.pagination.hasMore)} />
          <Row label="isLoadingMore" value={String(products.pagination.isLoadingMore)} />
          <Row
            label="selectedProduct"
            value={products.selectedProduct?.name ?? 'null'}
          />
        </View>

        {/* Wishlist Store */}
        <Text style={styles.storeTitle}>❤️ useWishlistStore</Text>
        <View style={styles.storeBox}>
          <Row label="items.length" value={String(wishlist.items.length)} />
          {wishlist.items.map((item) => (
            <Row
              key={item.productId}
              label={item.name.slice(0, 20)}
              value={`$${item.currentPrice.toFixed(2)}`}
            />
          ))}
        </View>

        {/* Notification Store */}
        <Text style={styles.storeTitle}>🔔 useNotificationStore</Text>
        <View style={styles.storeBox}>
          <Row label="alerts.length" value={String(notifications.alerts.length)} />
          <Row label="unreadCount" value={String(notifications.unreadCount)} />
          {notifications.alerts.slice(0, 3).map((alert) => (
            <Row
              key={alert.id}
              label={alert.productName.slice(0, 16)}
              value={`↓${alert.dropPercent.toFixed(1)}% ${alert.read ? '(read)' : '(unread)'}`}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  toggleButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  toggleText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  panel: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxHeight: 400,
  },
  closeButton: {
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  closeText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  storeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 12,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  storeBox: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 10,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  rowLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: 'monospace',
  },
  rowValue: {
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
});