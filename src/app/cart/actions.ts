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

const sampleProduct: Product = {
  id: 'prod_1',
  name: 'Fresh Organic Apples',
  price: 3.99,
  image: 'https://placehold.co/100x100.png',
  hint: 'organic apples'
};

export async function addToCart(productId: string, userId: string): Promise<{ success: boolean; message: string }> {
  if (!userId) return { success: false, message: 'You must be logged in to add items to your cart.' };
  if (productId !== 'prod_1') return { success: false, message: 'This product cannot be added to the cart.' };

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
      const newCart: Cart = { userId, items: [newItem] };
      await setDoc(cartRef, newCart);
    }
    revalidatePath('/checkout');
    return { success: true, message: 'Item added to personal cart!' };
  } catch (error) {
    console.error("Error adding to cart:", error);
    return { success: false, message: 'Could not add item to cart. Please try again.' };
  }
}

export async function addToGroupCart(productId: string, cartId: string, userId: string): Promise<{ success: boolean; message: string }> {
  if (!userId) return { success: false, message: 'You must be logged in to add items to a cart.' };
  if (productId !== 'prod_1') return { success: false, message: 'This product cannot be added to the cart.' };

  const cartRef = doc(db, 'groupCarts', cartId);
  const cartSnap = await getDoc(cartRef);
  if (!cartSnap.exists()) return { success: false, message: 'Group cart not found.' };

  const cartData = cartSnap.data() as GroupCart;
  if (!cartData.members.includes(userId)) return { success: false, message: 'You are not a member of this cart.' };

  try {
    const itemIndex = cartData.items.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
      const newItems = [...cartData.items];
      newItems[itemIndex].quantity += 1;
      await updateDoc(cartRef, { items: newItems });
    } else {
      const newItem: CartItem = { ...sampleProduct, quantity: 1 };
      await updateDoc(cartRef, { items: [...cartData.items, newItem] });
    }
    revalidatePath('/checkout');
    revalidatePath('/carts');
    return { success: true, message: `Item added to ${cartData.name}!` };
  } catch (error) {
    console.error("Error adding to group cart:", error);
    return { success: false, message: 'Could not add item to group cart. Please try again.' };
  }
}

export async function getCart(userId: string): Promise<CartItem[]> {
  if (!userId) return [];
  try {
    const cartRef = doc(db, 'carts', userId);
    const cartSnap = await getDoc(cartRef);
    if (cartSnap.exists()) return (cartSnap.data() as Cart).items;
  } catch (error) {
    console.error("Error fetching cart:", error);
  }
  return [];
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
