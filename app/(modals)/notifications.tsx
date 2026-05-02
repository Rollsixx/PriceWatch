// app/(modals)/notifications.tsx
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { useNotificationStore } from '../../store/useNotificationStore';
import EmptyState from '../../components/ui/EmptyState';
import { PriceDropAlert } from '../../types';
import { COLORS } from '../../constants';

export default function NotificationsModal() {
  const { alerts, unreadCount, markAllRead, clearAlerts } =
    useNotificationStore();

  function renderAlert({ item }: { item: PriceDropAlert }) {
    return (
      <View style={[styles.card, !item.read && styles.cardUnread]}>
        {/* Unread dot */}
        {!item.read && <View style={styles.unreadDot} />}

        <Text style={styles.productName}>{item.productName}</Text>

        <View style={styles.priceRow}>
          <Text style={styles.oldPrice}>${item.oldPrice.toFixed(2)}</Text>
          <Text style={styles.arrow}> → </Text>
          <Text style={styles.newPrice}>${item.newPrice.toFixed(2)}</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              ↓ {item.dropPercent.toFixed(1)}% DROP
            </Text>
          </View>
          <Text style={styles.time}>
            {new Date(item.detectedAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Price Drop Alerts</Text>
          {unreadCount > 0 && (
            <Text style={styles.unreadText}>
              {unreadCount} new alert{unreadCount > 1 ? 's' : ''}
            </Text>
          )}
        </View>
        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllRead} style={styles.actionBtn}>
              <Text style={styles.actionText}>Mark Read</Text>
            </TouchableOpacity>
          )}
          {alerts.length > 0 && (
            <TouchableOpacity onPress={clearAlerts} style={styles.actionBtn}>
              <Text style={[styles.actionText, { color: COLORS.danger }]}>
                Clear
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Alert List */}
      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        renderItem={renderAlert}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="🔔"
            title="No alerts yet"
            message="Simulate price changes on any product to trigger alerts."
          />
        }
      />

      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => router.back()}
      >
        <Text style={styles.closeText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  unreadText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  list: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardUnread: {
    borderLeftColor: COLORS.primary,
    backgroundColor: '#F0EEFF',
  },
  unreadDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  oldPrice: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
  },
  arrow: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  newPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#E8F8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: COLORS.success,
    fontWeight: 'bold',
    fontSize: 11,
  },
  time: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  closeButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  closeText: {
    color: COLORS.surface,
    fontWeight: 'bold',
    fontSize: 16,
  },
});