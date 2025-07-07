'use server';

import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import type { Cart, CartItem, Product } from '@/lib/types';
import { revalidatePath } from 'next/cache';

// This is a placeholder product. In a real app, you'd fetch this from your DB
// or receive the full product details from the client.
const sampleProduct: Product = {
    id: 'prod_1',
    name: 'Fresh Organic Apples',
    price: 3.99,
    image: 'https://placehold.co/100x100.png',
    hint: 'organic apples'
};

// NOTE: For simplicity, this action takes a userId. In a production app, 
// you should verify user identity on the server using Firebase Admin SDK 
// to prevent users from modifying other users' carts.
export async function addToCart(productId: string, userId: string): Promise<{success: boolean, message: string}> {
    if (!userId) {
        return { success: false, message: 'You must be logged in to add items to your cart.' };
    }
    if (productId !== 'prod_1') {
        return { success: false, message: 'This product cannot be added to the cart.' };
    }

    const cartRef = doc(db, 'carts', userId);
    const cartSnap = await getDoc(cartRef);

    const productToAdd = sampleProduct;

    try {
        if (cartSnap.exists()) {
            const cartData = cartSnap.data() as Cart;
            const itemIndex = cartData.items.findIndex(item => item.id === productId);

            if (itemIndex > -1) {
                const newItems = [...cartData.items];
                newItems[itemIndex].quantity += 1;
                await updateDoc(cartRef, { items: newItems });
            } else {
                const newItem: CartItem = { ...productToAdd, quantity: 1 };
                await updateDoc(cartRef, { items: [...cartData.items, newItem] });
            }
        } else {
            const newItem: CartItem = { ...productToAdd, quantity: 1 };
            const newCart: Cart = {
                userId: userId,
                items: [newItem]
            };
            await setDoc(cartRef, newCart);
        }
        
        revalidatePath('/checkout');
        return { success: true, message: 'Item added to cart!' };
    } catch(error) {
        console.error("Error adding to cart:", error);
        return { success: false, message: 'Could not add item to cart. Please try again.' };
    }
}

// NOTE: See security note on addToCart.
export async function getCart(userId: string): Promise<CartItem[]> {
    if (!userId) {
        return [];
    }

    try {
        const cartRef = doc(db, 'carts', userId);
        const cartSnap = await getDoc(cartRef);

        if (cartSnap.exists()) {
            const cartData = cartSnap.data() as Cart;
            return cartData.items;
        }
    } catch (error) {
        console.error("Error fetching cart:", error);
    }


    return [];
}
