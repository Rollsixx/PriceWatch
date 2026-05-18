// services/productService.ts
// All Firestore product fetching functions

import {
  collection,
  getDocs,
  getDoc,
  doc,
} from 'firebase/firestore';
import { db } from './firebase';
import { Product } from '../types';
import { COLLECTIONS } from '../constants';

// --- FETCH ALL PRODUCTS (no ordering to avoid Firestore index issues) ---
export async function fetchProducts(): Promise<Product[]> {
  const snapshot = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[];
}

// --- FETCH SINGLE PRODUCT BY ID ---
export async function fetchProductById(id: string): Promise<Product | null> {
  const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  return { id: docSnap.id, ...docSnap.data() } as Product;
}
