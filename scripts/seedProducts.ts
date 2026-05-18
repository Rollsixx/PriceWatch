import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAWx3Qe3FCXUSNCmkXDvOuR0W1PCEZ_F9s",
  authDomain: "pricewatch-app-c7a3f.firebaseapp.com",
  projectId: "pricewatch-app-c7a3f",
  storageBucket: "pricewatch-app-c7a3f.firebasestorage.app",
  messagingSenderId: "246953806241",
  appId: "1:246953806241:web:be6ac959f6ebd4d05063e0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const products = [
  {
    name: 'Wireless Noise-Cancelling Headphones',
    description: 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and comfortable memory foam ear cushions.',
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    currentPrice: 249.99,
    originalPrice: 349.99,
    currency: 'USD',
    createdAt: Date.now(),
  },
  {
    name: 'Smart Watch Pro',
    description: 'Advanced fitness tracker with heart rate monitoring, GPS, sleep tracking, and 7-day battery life. Water resistant to 50m.',
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    currentPrice: 199.99,
    originalPrice: 249.99,
    currency: 'USD',
    createdAt: Date.now(),
  },
  {
    name: 'Organic Cotton Hoodie',
    description: 'Sustainable, ultra-soft organic cotton hoodie. Available in earth tones. Perfect for casual everyday wear.',
    category: 'Fashion',
    imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',
    currentPrice: 59.99,
    originalPrice: 79.99,
    currency: 'USD',
    createdAt: Date.now(),
  },
  {
    name: 'Portable Bluetooth Speaker',
    description: 'Rugged, waterproof Bluetooth speaker with 360-degree sound. 20-hour battery life and built-in microphone.',
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',
    currentPrice: 79.99,
    originalPrice: 99.99,
    currency: 'USD',
    createdAt: Date.now(),
  },
  {
    name: 'Stainless Steel Water Bottle',
    description: 'Double-wall vacuum insulated. Keeps drinks cold 24h or hot 12h. BPA-free, 750ml capacity.',
    category: 'Home & Living',
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400',
    currentPrice: 34.99,
    originalPrice: 44.99,
    currency: 'USD',
    createdAt: Date.now(),
  },
  {
    name: 'Leather Crossbody Bag',
    description: 'Genuine leather crossbody bag with adjustable strap. Multiple compartments for organization. Fits all essentials.',
    category: 'Fashion',
    imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400',
    currentPrice: 89.99,
    originalPrice: 129.99,
    currency: 'USD',
    createdAt: Date.now(),
  },
  {
    name: 'Mechanical Keyboard',
    description: 'RGB backlit mechanical keyboard with Cherry MX switches. Aluminum frame, detachable USB-C cable.',
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400',
    currentPrice: 149.99,
    originalPrice: 179.99,
    currency: 'USD',
    createdAt: Date.now(),
  },
  {
    name: 'Yoga Mat Premium',
    description: 'Extra thick 6mm eco-friendly TPE yoga mat. Non-slip surface, lightweight and comes with carrying strap.',
    category: 'Sports',
    imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400',
    currentPrice: 39.99,
    originalPrice: 54.99,
    currency: 'USD',
    createdAt: Date.now(),
  },
  {
    name: 'Coffee Maker Drip',
    description: 'Programmable 12-cup drip coffee maker with built-in grinder. Auto-shutoff and brew strength selector.',
    category: 'Home & Living',
    imageUrl: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400',
    currentPrice: 89.99,
    originalPrice: 119.99,
    currency: 'USD',
    createdAt: Date.now(),
  },
  {
    name: 'Running Shoes Ultra',
    description: 'Lightweight responsive running shoes with carbon fiber plate. Breathable mesh upper, suitable for road running.',
    category: 'Sports',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    currentPrice: 179.99,
    originalPrice: 219.99,
    currency: 'USD',
    createdAt: Date.now(),
  },
  {
    name: 'USB-C Hub 7-in-1',
    description: 'Compact USB-C hub with HDMI 4K, USB 3.0, SD card reader, and 100W PD charging passthrough.',
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1625723044797-44abc16e81b3?w=400',
    currentPrice: 44.99,
    originalPrice: 54.99,
    currency: 'USD',
    createdAt: Date.now(),
  },
  {
    name: 'Cashmere Scarf',
    description: 'Luxurious 100% cashmere scarf. Hypoallergenic, incredibly soft, and lightweight. Perfect gift choice.',
    category: 'Fashion',
    imageUrl: 'https://images.unsplash.com/photo-1520903920243-00d872d2edc4?w=400',
    currentPrice: 69.99,
    originalPrice: 99.99,
    currency: 'USD',
    createdAt: Date.now(),
  },
];

async function seed() {
  const col = collection(db, 'products');
  for (const product of products) {
    await addDoc(col, product);
    console.log(`Added: ${product.name}`);
  }
  console.log(`\n✅ Seeded ${products.length} products`);
}

seed().catch(console.error);
