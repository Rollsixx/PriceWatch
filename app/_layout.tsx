// app/_layout.tsx
import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { subscribeToAuthChanges } from '../services/authService';
import { useAuthStore } from '../store/useAuthStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { initDatabase } from '../database/db';
import ToastManager from '../components/ui/ToastManager';
import { COLORS } from '../constants';
import { User as FirebaseUser } from 'firebase/auth';
import { User } from '../types';

export default function RootLayout() {
  const { setUser } = useAuthStore();
  const { loadWishlist } = useWishlistStore();

  useEffect(() => {
    // Initialize SQLite tables
    initDatabase();

    // Load wishlist from SQLite
    loadWishlist();

    // Listen for Firebase auth state
    const unsubscribe = subscribeToAuthChanges(
      (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          const user: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          };
          setUser(user);
        } else {
          setUser(null);
        }
      }
    );

    return unsubscribe;
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.surface,
          headerTitleStyle: { fontWeight: 'bold' },
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(stack)/product/[id]"
          options={{
            title: 'Product Details',
            headerBackTitle: 'Back',
          }}
        />
        <Stack.Screen
          name="(modals)/notifications"
          options={{
            presentation: 'modal',
            title: '🔔 Notifications',
            headerStyle: { backgroundColor: COLORS.surface },
            headerTintColor: COLORS.textPrimary,
          }}
        />
      </Stack>

      {/* Global toast — sits above everything */}
      <ToastManager />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});