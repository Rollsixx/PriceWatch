// services/productService.ts
// All Firestore product fetching functions

import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import { Product } from '../types';
import { COLLECTIONS, PRODUCTS_PER_PAGE } from '../constants';

// --- FETCH FIRST PAGE OF PRODUCTS ---
export async function fetchProducts(): Promise<{
  products: Product[];
  lastDoc: DocumentSnapshot | null;
}> {
  const q = query(
    collection(db, COLLECTIONS.PRODUCTS),
    orderBy('createdAt', 'desc'),
    limit(PRODUCTS_PER_PAGE)
  );

  const snapshot = await getDocs(q);
  const products = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[];

  const lastDoc = snapshot.docs[snapshot.docs.length - 1] ?? null;

  return { products, lastDoc };
}

// --- FETCH NEXT PAGE (PAGINATION) ---
export async function fetchMoreProducts(
  lastDoc: DocumentSnapshot
): Promise<{
  products: Product[];
  lastDoc: DocumentSnapshot | null;
}> {
  const q = query(
    collection(db, COLLECTIONS.PRODUCTS),
    orderBy('createdAt', 'desc'),
    startAfter(lastDoc),
    limit(PRODUCTS_PER_PAGE)
  );

  const snapshot = await getDocs(q);
  const products = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Product[];

  const newLastDoc = snapshot.docs[snapshot.docs.length - 1] ?? null;

  return { products, lastDoc: newLastDoc };
}

// --- FETCH SINGLE PRODUCT BY ID ---
export async function fetchProductById(id: string): Promise<Product | null> {
  const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  return { id: docSnap.id, ...docSnap.data() } as Product;
}