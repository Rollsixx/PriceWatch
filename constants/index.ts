export const COLORS = {
  primary: '#00D68F',
  secondary: '#FF6B6B',
  accent: '#FFD93D',
  success: '#00D68F',
  danger: '#FF6B6B',
  warning: '#FF9F43',
  background: '#0D0D1A',
  surface: '#1A1A2E',
  surfaceLight: '#22223A',
  textPrimary: '#FFFFFF',
  textSecondary: '#8E8EA0',
  border: '#2A2A3E',
  glass: 'rgba(255,255,255,0.05)',
  glassBorder: 'rgba(255,255,255,0.08)',
};

export const PRICE_DROP_THRESHOLD_PERCENT = 10; // kept for backward compat
export const Z_SCORE_THRESHOLD = 1.5;
export const MIN_HISTORY_FOR_ZSCORE = 3;
export const MAX_PRICE_HISTORY_RECORDS = 30;

export const COLLECTIONS = {
  PRODUCTS: 'products',
  USERS: 'users',
};

export const PRODUCTS_PER_PAGE = 10;

// Get this from Firebase Console → Authentication → Sign-in method → Google
// Copy the "Web client ID" value
export const GOOGLE_WEB_CLIENT_ID =
  '246953806241-3f2pqv41ldrmsl6gicjssu6bl5q0h40h.apps.googleusercontent.com';

// iOS client ID (optional, for iOS Google sign-in)
export const GOOGLE_IOS_CLIENT_ID = '';