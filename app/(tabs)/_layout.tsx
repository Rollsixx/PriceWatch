import { Tabs, router } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWishlistStore } from '../../store/useWishlistStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { COLORS } from '../../constants';
import { floatingTabBarStyle } from '../../components/ui/FloatingTabBar';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({ name, color, size }: { name: IoniconsName; color: string; size: number }) {
  return <Ionicons name={name} color={color} size={size} />;
}

function WishlistIcon({ color, size }: { color: string; size: number }) {
  const count = useWishlistStore((state) => state.items.length);
  return (
    <View>
      <Ionicons name="heart" color={color} size={size} />
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
        </View>
      )}
    </View>
  );
}

function HomeHeaderRight() {
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  return (
    <TouchableOpacity
      style={styles.bellButton}
      onPress={() => router.push('/(modals)/notifications')}
    >
      <Ionicons name="notifications" size={22} color={COLORS.textPrimary} />
      {unreadCount > 0 && (
        <View style={styles.bellBadge}>
          <Text style={styles.bellBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: floatingTabBarStyle,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        headerStyle: { backgroundColor: COLORS.background },
        headerTintColor: COLORS.textPrimary,
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitle: 'PriceWatch',
          headerRight: () => <HomeHeaderRight />,
          tabBarIcon: ({ color, size }) => <TabIcon name="home" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: 'Wishlist',
          headerTitle: 'Wishlist',
          tabBarIcon: ({ color, size }) => <WishlistIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerTitle: 'Profile',
          tabBarIcon: ({ color, size }) => <TabIcon name="person" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: '#000', fontSize: 9, fontWeight: 'bold' },
  bellButton: { marginRight: 16, padding: 4 },
  bellBadge: {
    position: 'absolute',
    top: -2,
    right: -4,
    backgroundColor: COLORS.secondary,
    borderRadius: 7,
    minWidth: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  bellBadgeText: { color: '#000', fontSize: 8, fontWeight: 'bold' },
});
