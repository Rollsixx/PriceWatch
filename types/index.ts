export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  currentPrice: number;
  originalPrice: number;
  currency: string;
  createdAt: number;
}

export interface PriceRecord {
  id?: number;
  productId: string;
  price: number;
  recordedAt: number;
}

export interface WishlistItem {
  id?: number;
  productId: string;
  name: string;
  imageUrl: string;
  currentPrice: number;
  currency: string;
  addedAt: number;
}

export interface PriceDropAlert {
  id: string;
  productId: string;
  productName: string;
  oldPrice: number;
  newPrice: number;
  dropPercent: number;
  zScore: number;
  detectedAt: number;
  read: boolean;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface PaginationState {
  lastDocId: string | null;
  hasMore: boolean;
  isLoadingMore: boolean;
}