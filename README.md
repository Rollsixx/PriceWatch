# PriceWatch - Wishlist & Price Drop Notifier

A React Native (Expo) mobile app that lets users track products, detect price drops using Z-score anomaly detection, and receive real-time alerts.

## Members

- **Rolly Boy Ryan Pionilla**
- **Jhonn Lee Maning**

## Features

- **Splash Screen** — Animated branded splash on every app open with logo scale-in and tagline fade
- **Product Browsing** — Search bar, category filter (Electronics, Fashion, Home, Sports, Beauty, Books), trending strip, and 2-column grid with 48 seeded products
- **Wishlist** — Save products with SQLite persistence, 2-column grid, long-press to remove, total value, and 48-hour drop filter
- **Price Drop Detection** — Z-score anomaly detection algorithm (threshold: 1.5σ) detects statistically significant price drops
- **Price History Chart** — Hand-coded SVG line chart with average overlay, gradient fill, and interactive dots — no charting library used
- **Price Simulation** — Tap to simulate a random price change and see real-time Z-score analysis
- **Notifications** — In-app alert system with deduplication (1-min window) and unread badge count
- **Background Polling** — Automatic 30-second polling for wishlist price updates
- **Authentication** — Email/password registration and Google Sign-In via Firebase Auth
- **Navigation** — 4 navigation patterns: bottom tabs, stack, modal, and deep link (`pricewatch://about`)
- **Dark Premium Theme** — Midnight blue palette with glassmorphism effects

## Tech Stack

| Layer    | Technology |
|----------|-----------|
| Framework | React Native (Expo SDK 54) |
| Router   | Expo Router v6 (file-based routing) |
| State    | Zustand (4 stores: auth, products, wishlist, notifications) |
| Database | SQLite (expo-sqlite) for local persistence + Firebase Firestore for remote |
| Auth     | Firebase Auth (email/password + Google OAuth) |
| Charts   | react-native-svg (custom SVG line chart from scratch) |
| Testing  | Jest (59 unit tests across 4 suites) |
| Algorithm | Z-score anomaly detection with circular buffer (max 30 records) |

## Navigation Patterns

1. **Bottom Tabs** — Home, Wishlist, Profile (floating pill-style tab bar)
2. **Stack** — Product detail screen `(stack)/product/[id]`
3. **Modal** — Notifications screen `(modals)/notifications`
4. **Deep Link** — `pricewatch://about` → About screen

## Screens

| Screen   | Description |
|----------|-------------|
| Splash   | Animated logo with spring scale-in, tagline reveal, and smooth fade-out transition |
| Home     | Search bar + category filter + trending strip + 2-column product grid (FlatList with virtualization) |
| Wishlist | 2-column grid with long-press delete, 48h drop filter toggle, total value |
| Product Detail | Collapsible sections (description, price stats, price history), SVG chart, simulate button, sticky bottom bar |
| Profile  | User dashboard with metrics, quick actions grid, email/password form, Google Sign-In |
| Notifications | Modal with price drop alerts list, mark all read, clear all |
| About    | Deep-linkable app info and tech stack summary |

## Running the App

```bash
npx expo start
# Scan QR code with Expo Go on your phone
```

## Testing

```bash
npx jest
# 59 tests across 4 suites (algorithm, integration, UI logic, wishlist logic)
```

## Building a Standalone APK

```bash
# Preview APK (sideload):
npx eas build -p android --profile preview

# Production APK:
npx eas build -p android --profile production
```

Ensure you are logged in to Expo:
```bash
npx eas login
npx eas whoami
```

## Project Structure

```
PriceWatch/
├── app/                    # Expo Router file-based screens
│   ├── (tabs)/             # Home, Wishlist, Profile
│   ├── (stack)/            # Product detail, About
│   └── (modals)/           # Notifications
├── components/             # Reusable UI components
│   ├── chart/              # SVG price chart
│   ├── product/            # Product cards
│   └── ui/                 # Shared UI (search, filters, states, toast, splash)
├── services/               # Firebase Auth, Firestore, seeding, polling
├── store/                  # Zustand state stores
├── database/               # SQLite operations (wishlist, price history)
├── hooks/                  # Custom React hooks
├── constants/              # Colors, thresholds, seed data
├── utils/                  # Price algorithm, simulator
└── __tests__/              # Jest test suites
```
