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
    // image: 'https://images.unsplash.com/photo-1587825045434-2b99338a74e4',
    image:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSaDrdYxJZJpHyuZtF-UYE0cbgcR9ACcYymow&s',
    hint: 'avocados fruit',
    category: 'Produce',
  },
  {
    id: '2',
    name: 'Great Value Whole Vitamin D Milk, Gallon',
    price: 3.89,
    image: 'https://images.unsplash.com/photo-1628087989381-34a3b1d374f6',
    // image:'data:image/jpeg;base64,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',
    hint: 'milk gallon',
    category: 'Dairy & Eggs',
  },
  {
    id: '3',
    name: 'Marketside Fresh Spinach, 10 oz',
    price: 2.78,
    image: 'https://images.unsplash.com/photo-1576045057995-568f58d0c2b5',
    // image:'data:image/jpeg;base64,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',
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
