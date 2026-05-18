import {
  collection,
  getDoc,
  writeBatch,
  doc,
} from 'firebase/firestore';
import { db } from './firebase';
import { COLLECTIONS } from '../constants';
import { SEED_PRODUCTS } from '../constants/productsSeedData';

function makeDocId(category: string, name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${category.toLowerCase()}-${slug}`;
}

export async function seedProducts(): Promise<{ count: number }> {
  const firstProduct = SEED_PRODUCTS[0];
  const firstDocId = makeDocId(firstProduct.category, firstProduct.name);
  const firstDoc = await getDoc(doc(db, COLLECTIONS.PRODUCTS, firstDocId));

  if (firstDoc.exists()) {
    return { count: 0 };
  }

  const batch = writeBatch(db);

  for (const product of SEED_PRODUCTS) {
    const docId = makeDocId(product.category, product.name);
    const docRef = doc(db, COLLECTIONS.PRODUCTS, docId);
    batch.set(docRef, product);
  }

  await batch.commit();
  return { count: SEED_PRODUCTS.length };
}
