'use server';

import { auth, db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  arrayUnion,
  arrayRemove,
  type Timestamp
} from 'firebase/firestore';
import type { Cart, CartItem, Product, GroupCart } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getProductById } from '../product/actions';


export async function addToCart(productId: string, userId: string): Promise<{ success: boolean; message: string }> {
  if (!userId) return { success: false, message: 'You must be logged in to add items to your cart.' };
  
  const productToAdd = await getProductById(productId);
  if (!productToAdd) return { success: false, message: 'Product not found.' };

  const cartRef = doc(db, 'carts', userId);
  const cartSnap = await getDoc(cartRef);

  try {
    if (cartSnap.exists()) {
      const cartData = cartSnap.data();
      const items = (cartData.items || []) as CartItem[];
      const itemIndex = items.findIndex(item => item.id === productId);

      if (itemIndex > -1) {
        const newItems = [...items];
        newItems[itemIndex].quantity += 1;
        await updateDoc(cartRef, { items: newItems });
      } else {
        const newItem: CartItem = { ...productToAdd, quantity: 1 };
        await updateDoc(cartRef, { items: arrayUnion(newItem) });
      }
    } else {
      const newItem: CartItem = { ...productToAdd, quantity: 1 };
      const newCart = { userId, items: [newItem] };
      await setDoc(cartRef, newCart);
    }
    revalidatePath('/checkout');
    revalidatePath('/carts');
    return { success: true, message: 'Item added to personal cart!' };
  } catch (error) {
    console.error("Error adding to cart:", error);
    return { success: false, message: 'Could not add item to cart. Please try again.' };
  }
}

export async function addToGroupCart(productId: string, cartId: string, userId: string): Promise<{ success: boolean; message: string }> {
  if (!userId) return { success: false, message: 'You must be logged in to add items to a cart.' };
  
  const productToAdd = await getProductById(productId);
  if (!productToAdd) return { success: false, message: 'Product not found.' };

  const cartRef = doc(db, 'groupCarts', cartId);
  const cartSnap = await getDoc(cartRef);
  if (!cartSnap.exists()) return { success: false, message: 'Group cart not found.' };

  const cartData = cartSnap.data() as GroupCart;
  if (!cartData.members.includes(userId)) return { success: false, message: 'You are not a member of this cart.' };

  try {
    const items = cartData.items || [];
    const itemIndex = items.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
      const newItems = [...items];
      newItems[itemIndex].quantity += 1;
      await updateDoc(cartRef, { items: newItems });
    } else {
      const newItem: CartItem = { ...productToAdd, quantity: 1 };
      await updateDoc(cartRef, { items: arrayUnion(newItem) });
    }
    revalidatePath('/checkout');
    revalidatePath('/carts');
    return { success: true, message: `Item added to ${cartData.name}!` };
  } catch (error) {
    console.error("Error adding to group cart:", error);
    return { success: false, message: 'Could not add item to group cart. Please try again.' };
  }
}

export async function getPersonalCart(userId: string): Promise<Cart | null> {
  if (!userId) return null;
  try {
    const cartRef = doc(db, 'carts', userId);
    const cartSnap = await getDoc(cartRef);

    if (cartSnap.exists()) {
      const cartData = cartSnap.data();
      return {
        id: userId,
        userId: userId,
        items: cartData.items || [],
        type: 'personal',
        name: 'Personal Cart',
      };
    } else {
      // Return a default empty personal cart if one doesn't exist in the database
      return {
        id: userId,
        userId: userId,
        items: [],
        type: 'personal',
        name: 'Personal Cart',
      };
    }
  } catch (error) {
    console.error("Error fetching personal cart:", error);
    return null;
  }
}

export async function getGroupCart(cartId: string): Promise<GroupCart | null> {
    if (!cartId) return null;
    try {
        const cartRef = doc(db, 'groupCarts', cartId);
        const cartSnap = await getDoc(cartRef);
        if (cartSnap.exists()) {
            const data = cartSnap.data();
            const createdAt = data.createdAt as Timestamp;
            return {
                ...data,
                id: cartSnap.id,
                createdAt: createdAt ? createdAt.toDate().toISOString() : new Date().toISOString()
            } as GroupCart;
        }
        return null;
    } catch(e) {
        console.error("Error fetching group cart:", e);
        return null;
    }
}


function generateInviteCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
  return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
}

const CreateCartSchema = z.object({
  name: z.string().min(3).max(50),
  address: z.string().min(10).max(100),
  type: z.enum(['family', 'community']),
  userId: z.string().min(1, { message: 'You must be logged in to create a cart.' })
});

export async function createGroupCart(prev: { error?: string; success?: boolean }, formData: FormData) {
  const parsed = CreateCartSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    const firstError = parsed.error.errors[0].message;
    return { error: firstError };
  }

  const { name, address, type, userId } = parsed.data;
  try {
    const newCart: Omit<GroupCart, 'id' | 'createdAt'> & {createdAt: any} = {
      name,
      address,
      type,
      ownerId: userId,
      members: [userId],
      inviteCode: generateInviteCode(),
      createdAt: serverTimestamp(),
      items: []
    };
    await addDoc(collection(db, 'groupCarts'), newCart);
    revalidatePath('/carts');
    revalidatePath('/profile');
    return { success: true };
  } catch (e) {
    console.error("Error creating group cart:", e);
    return { error: 'Failed to create group cart. Please try again.' };
  }
}

const JoinCartSchema = z.object({ 
  inviteCode: z.string().length(6),
  userId: z.string().min(1, { message: 'You must be logged in to join a cart.' })
});

export async function joinGroupCart(prev: { error?: string; success?: boolean }, formData: FormData) {
  const parsed = JoinCartSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    const firstError = parsed.error.errors[0].message;
    return { error: firstError };
  }

  const { inviteCode, userId } = parsed.data;

  try {
    const q = query(collection(db, 'groupCarts'), where('inviteCode', '==', inviteCode.toUpperCase()));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return { error: 'Invalid invite code.' };

    const cartDoc = snapshot.docs[0];
    const cartData = cartDoc.data() as GroupCart;
    if (cartData.members.includes(userId)) return { error: 'You are already a member of this cart.' };

    await updateDoc(cartDoc.ref, { members: arrayUnion(userId) });
    revalidatePath('/carts');
    revalidatePath('/profile');
    return { success: true };
  } catch (e) {
    console.error("Error joining cart:", e);
    return { error: 'Failed to join cart. Please try again.' };
  }
}

export async function leaveCart(cartId: string, userId: string) {
  if (!userId) return { error: 'You must be logged in to leave a cart.' };
  try {
    await updateDoc(doc(db, 'groupCarts', cartId), {
      members: arrayRemove(userId)
    });
    revalidatePath('/carts');
    return { success: true };
  } catch (e) {
    console.error("Error leaving group cart:", e);
    return { error: 'Failed to leave the group cart.' };
  }
}

export async function deleteCart(cartId: string, ownerId: string, currentUserId: string) {
  if (ownerId !== currentUserId) return { error: 'Only the cart owner can delete this cart.' };
  try {
    await deleteDoc(doc(db, 'groupCarts', cartId));
    revalidatePath('/carts');
    return { success: true };
  } catch (e) {
    console.error("Error deleting cart:", e);
    return { error: 'Failed to delete the cart.' };
  }
}

export async function updateCart(cartId: string, name: string, address: string, currentUserId: string) {
  const cartRef = doc(db, 'groupCarts', cartId);
  const cartSnap = await getDoc(cartRef);
  if (!cartSnap.exists()) return { error: 'Cart not found.' };

  const cartData = cartSnap.data() as GroupCart;
  if (cartData.ownerId !== currentUserId) return { error: 'Only the owner can update the cart.' };

  try {
    await updateDoc(cartRef, { name, address });
    revalidatePath('/carts');
    return { success: true };
  } catch (e) {
    console.error("Error updating group cart:", e);
    return { error: 'Failed to update cart.' };
  }
}

export async function getGroupCartsForUser(userId: string): Promise<GroupCart[]> {
  if (!userId) return [];
  try {
    const q = query(collection(db, 'groupCarts'), where('members', 'array-contains', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      const createdAt = data.createdAt as Timestamp;
      return { 
        ...data,
        id: doc.id, 
        createdAt: createdAt ? createdAt.toDate().toISOString() : new Date().toISOString()
      } as GroupCart;
    });
  } catch (e) {
    console.error("Error fetching group carts:", e);
    return [];
  }
}
