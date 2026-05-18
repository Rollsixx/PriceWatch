// services/authService.ts
// All authentication functions in one place

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { COLLECTIONS } from '../constants';

// --- REGISTER ---
export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  
  // Add display name to Firebase Auth profile
  await updateProfile(credential.user, { displayName });

  // Save user to Firestore users collection
  await setDoc(doc(db, COLLECTIONS.USERS, credential.user.uid), {
    uid: credential.user.uid,
    email,
    displayName,
    photoURL: null,
    createdAt: Date.now(),
  });

  return credential.user;
}

// --- LOGIN ---
export async function loginWithEmail(
  email: string,
  password: string
): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

// --- LOGOUT ---
export async function logout(): Promise<void> {
  await signOut(auth);
}

// --- GET USER PROFILE FROM FIRESTORE ---
export async function getUserProfile(uid: string) {
  const docRef = doc(db, COLLECTIONS.USERS, uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
}

// --- GOOGLE SIGN-IN ---
// Call this after receiving the ID token from expo-auth-session
export async function signInWithGoogle(idToken: string) {
  const credential = GoogleAuthProvider.credential(idToken);
  const result = await signInWithCredential(auth, credential);

  // Save/update user in Firestore
  await setDoc(doc(db, COLLECTIONS.USERS, result.user.uid), {
    uid: result.user.uid,
    email: result.user.email,
    displayName: result.user.displayName,
    photoURL: result.user.photoURL,
    createdAt: Date.now(),
  }, { merge: true });

  return result.user;
}

// --- LISTEN TO AUTH STATE CHANGES ---
// Call this once at app startup to know if user is logged in
export function subscribeToAuthChanges(
  callback: (user: User | null) => void
) {
  return onAuthStateChanged(auth, callback);
}