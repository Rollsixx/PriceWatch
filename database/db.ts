// database/db.ts
// Central SQLite initialization — all tables created here

import * as SQLite from 'expo-sqlite';

// Open (or create) the database file on device
const db = SQLite.openDatabaseSync('pricewatch.db');

// Create all tables on app startup
export function initDatabase() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS wishlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      productId TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      imageUrl TEXT NOT NULL,
      currentPrice REAL NOT NULL,
      currency TEXT NOT NULL,
      addedAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS price_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      productId TEXT NOT NULL,
      price REAL NOT NULL,
      recordedAt INTEGER NOT NULL
    );
  `);
}

export default db;