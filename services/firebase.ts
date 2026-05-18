// services/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyAWx3Qe3FCXUSNCmkXDvOuR0W1PCEZ_F9s",
  authDomain: "pricewatch-app-c7a3f.firebaseapp.com",
  projectId: "pricewatch-app-c7a3f",
  storageBucket: "pricewatch-app-c7a3f.firebasestorage.app",
  messagingSenderId: "246953806241",
  appId: "1:246953806241:web:be6ac959f6ebd4d05063e0"
};

// Only initialize if no app exists yet
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);

// initializeAuth only on first load — getApps() is checked BEFORE initializeApp above
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export default app;