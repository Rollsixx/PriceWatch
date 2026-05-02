// services/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyC-e881BTpn_4nSQzu57wAgprUp3EdQd0g",
  authDomain: "wishlist-app-67fad.firebaseapp.com",
  projectId: "wishlist-app-67fad",
  storageBucket: "wishlist-app-67fad.firebasestorage.app",
  messagingSenderId: "1048164707556",
  appId: "1:1048164707556:web:311f93531bf8989bf4d0f1"
};

// Only initialize if no app exists yet
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);

// initializeAuth only on first load — getApps() is checked BEFORE initializeApp above
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export default app;