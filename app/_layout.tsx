// app/_layout.tsx
import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { subscribeToAuthChanges } from '../services/authService';
import { useAuthStore } from '../store/useAuthStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { initDatabase } from '../database/db';
import { seedProducts } from '../services/seedService';
import ToastManager from '../components/ui/ToastManager';
import SplashScreen from '../components/ui/SplashScreen';
import { COLORS } from '../constants';
import { User as FirebaseUser } from 'firebase/auth';
import { User } from '../types';

export default function RootLayout() {
  const { setUser } = useAuthStore();
  const { loadWishlist } = useWishlistStore();
  const [isSplashDone, setIsSplashDone] = useState(false);
  const [isSeeded, setIsSeeded] = useState(false);

  useEffect(() => {
    initDatabase();
    loadWishlist();

    seedProducts()
      .catch(() => {})
      .finally(() => setIsSeeded(true));

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

  if (!isSplashDone || !isSeeded) {
    return <SplashScreen onFinish={() => setIsSplashDone(true)} />;
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.background },
          headerTintColor: COLORS.textPrimary,
          headerShadowVisible: false,
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
            name="(stack)/about"
            options={{
              title: 'About',
              headerBackTitle: 'Back',
            }}
          />
        <Stack.Screen
          name="(modals)/notifications"
          options={{
            presentation: 'modal',
            title: 'Notifications',
            headerStyle: { backgroundColor: COLORS.background },
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
