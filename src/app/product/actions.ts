'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import type { Product } from '@/lib/types';

// Mock data to ensure the application is populated even if the database is not.
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Organic Hass Avocados, 3 Count',
    price: 4.99,
    image: 'https://images.unsplash.com/photo-1587825045434-2b99338a74e4',
    hint: 'avocados fruit',
    category: 'Produce',
  },
  {
    id: '2',
    name: 'Great Value Whole Vitamin D Milk, Gallon',
    price: 3.89,
    image: 'https://images.unsplash.com/photo-1628087989381-34a3b1d374f6',
    hint: 'milk gallon',
    category: 'Dairy & Eggs',
  },
  {
    id: '3',
    name: 'Marketside Fresh Spinach, 10 oz',
    price: 2.78,
    image: 'https://images.unsplash.com/photo-1576045057995-568f58d0c2b5',
    hint: 'spinach greens',
    category: 'Produce',
  },
  {
    id: '4',
    name: 'All Natural 93% Lean/7% Fat Ground Beef',
    price: 5.48,
    image: 'https://images.unsplash.com/photo-1620921204849-509292809a70',
    hint: 'ground beef',
    category: 'Meat & Seafood',
  },
  {
    id: '5',
    name: 'Great Value Large White Eggs, 12 Count',
    price: 2.24,
    image: 'https://images.unsplash.com/photo-1587486913049-53fc889c0cfc',
    hint: 'eggs carton',
    category: 'Dairy & Eggs',
  },
  {
    id: '6',
    name: 'Brawny Tear-A-Square Paper Towels, 6 Double Rolls',
    price: 15.98,
    image: 'https://images.unsplash.com/photo-1607598041922-a69022415143',
    hint: 'paper towels',
    category: 'Household',
  },
  {
    id: '7',
    name: 'Coca-Cola Classic Soda, 12 Fl Oz, 12 Pack',
    price: 8.98,
    image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7',
    hint: 'coca cola',
    category: 'Beverages',
  },
  {
    id: '8',
    name: 'Frito-Lay Doritos & Cheetos Mix Variety Pack, 18 Count',
    price: 12.98,
    image: 'https://images.unsplash.com/photo-1599490659213-42065873a874',
    hint: 'chips snacks',
    category: 'Snacks',
  },
];


export async function getProducts(): Promise<Product[]> {
  try {
    const productsCollection = collection(db, 'products');
    const snapshot = await getDocs(productsCollection);
    if (snapshot.empty) {
      console.log('No products found in the database. Using mock data.');
      return mockProducts;
    }
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
    return products.length > 0 ? products : mockProducts;
  } catch (error) {
    console.error("Error fetching products, returning mock data:", error);
    return mockProducts;
  }
}

export async function getProductById(productId: string): Promise<Product | null> {
    if (!productId) return null;
    try {
        const productRef = doc(db, 'products', productId);
        const productSnap = await getDoc(productRef);
        if (productSnap.exists()) {
            return { id: productSnap.id, ...productSnap.data() } as Product;
        }
        // Fallback to mock data if not found in DB
        const mockProduct = mockProducts.find(p => p.id === productId);
        if (mockProduct) {
            console.warn(`Product with ID "${productId}" not found in DB. Using mock data.`);
            return mockProduct;
        }
        console.warn(`Product with ID "${productId}" not found in DB or mock data.`);
        return null;
    } catch (error) {
        console.error("Error fetching product by ID, trying mock data:", error);
        const mockProduct = mockProducts.find(p => p.id === productId);
        return mockProduct || null;
    }
}
