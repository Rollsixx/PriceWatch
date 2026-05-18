# PriceWatch - Wishlist & Price Drop Notifier

A React Native (Expo) mobile app that lets users track products, detect price drops using Z-score anomaly detection, and receive real-time alerts.

## Members

- **Rolly Boy Ryan Pionilla**
- **Jhonn Lee Maning**

## Features

- **Product Browsing** — Search, filter by category, trending products strip
- **Wishlist** — Save products with a 2-column grid view and long-press to remove
- **Price Drop Detection** — Z-score algorithm adaptively detects statistically significant price drops
- **48-Hour Time Window** — Toggle to show only items that dropped in the last 48 hours
- **Price Charts** — SVG-based line chart showing price history with average overlay
- **Price Simulation** — Simulate price changes to test detection and alerts
- **Notifications** — In-app alert system for detected price drops
- **Background Polling** — Automatic 30-second polling for wishlist price updates
- **Authentication** — Email/password and Google Sign-In via Firebase
- **Navigation** — 4 navigation patterns: tabs, stack, modal, deep link (`pricewatch://about`)
- **Dark Premium Theme** — Midnight blue palette with glassmorphism effects

## Tech Stack

| Layer    | Technology |
|----------|-----------|
| Framework | React Native (Expo SDK 54) |
| Router   | Expo Router v6 (file-based) |
| State    | Zustand (4 stores) |
| Database | SQLite (expo-sqlite) + Firebase Firestore |
| Auth     | Firebase Auth (email + Google) |
| Charts   | react-native-svg (custom SVG line chart) |
| Testing  | Jest (59 unit tests) |
| Alerts   | Z-score anomaly detection (custom algorithm) |

## Navigation Patterns

1. **Bottom Tabs** — Home, Wishlist, Profile (floating pill-style tab bar)
2. **Stack** — Product detail screen
3. **Modal** — Notifications screen
4. **Deep Link** — `pricewatch://about` → About screen

## Screens

| Screen   | Description |
|----------|-------------|
| Home     | Search bar + category filter + trending strip + 2-column product grid |
| Wishlist | 2-column grid with long-press delete, 48h drop filter, total value |
| Product Detail | Collapsible sections, price chart, sticky bottom action bar |
| Profile  | User dashboard with metrics, quick actions grid, auth forms |
| Notifications | Modal with price drop alerts |
| About    | Deep-linkable app info screen |

## Running the App

```bash
npx expo start
# Scan QR with Expo Go
```

## Testing

```bash
npx jest
# 59 tests across 4 suites
```

## Building

```bash
npx expo export --platform android
```
