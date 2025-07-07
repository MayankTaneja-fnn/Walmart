'use server';

import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, collection, addDoc, serverTimestamp, query, where, getDocs, arrayUnion } from 'firebase/firestore';
import type { Cart, CartItem, Product, GroupCart } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

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
// you should get the user from the server-side auth state.
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
        return { success: true, message: 'Item added to personal cart!' };
    } catch(error) {
        console.error("Error adding to cart:", error);
        return { success: false, message: 'Could not add item to cart. Please try again.' };
    }
}

export async function addToGroupCart(productId: string, cartId: string, userId: string): Promise<{success: boolean, message: string}> {
    if (!userId) {
        return { success: false, message: 'You must be logged in to add items to a cart.' };
    }
     if (productId !== 'prod_1') {
        return { success: false, message: 'This product cannot be added to the cart.' };
    }

    const cartRef = doc(db, 'groupCarts', cartId);
    const cartSnap = await getDoc(cartRef);

    if (!cartSnap.exists()) {
        return { success: false, message: 'Group cart not found.' };
    }

    const cartData = cartSnap.data() as GroupCart;
    if (!cartData.members.includes(userId)) {
        return { success: false, message: 'You are not a member of this cart.' };
    }

    const productToAdd = sampleProduct;
     try {
        const itemIndex = cartData.items.findIndex(item => item.id === productId);

        if (itemIndex > -1) {
            const newItems = [...cartData.items];
            newItems[itemIndex].quantity += 1;
            await updateDoc(cartRef, { items: newItems });
        } else {
            const newItem: CartItem = { ...productToAdd, quantity: 1 };
            await updateDoc(cartRef, { items: [...cartData.items, newItem] });
        }
        
        revalidatePath('/checkout');
        revalidatePath('/carts');
        return { success: true, message: `Item added to ${cartData.name}!` };

    } catch(error) {
        console.error("Error adding to group cart:", error);
        return { success: false, message: 'Could not add item to group cart. Please try again.' };
    }
}


export async function getCart(userId: string): Promise<CartItem[]> {
    if (!userId) {
        return [];
    }
    try {
        const cartRef = doc(db, 'carts', userId);
        const cartSnap = await getDoc(cartRef);

        if (cartSnap.exists()) {
            return (cartSnap.data() as Cart).items;
        }
    } catch (error) {
        console.error("Error fetching cart:", error);
    }
    return [];
}


function generateInviteCode(length = 6) {
    const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

const CreateCartSchema = z.object({
  name: z.string().min(3, "Nickname must be at least 3 characters.").max(50),
  address: z.string().min(10, "Address must be at least 10 characters.").max(100),
  type: z.enum(['family', 'community']),
});

export async function createGroupCart(
    prevState: { error?: string; success?: boolean }, 
    formData: FormData
): Promise<{ error?: string; success?: boolean }> {
    const user = auth.currentUser;
    if (!user) {
        return { error: "You must be logged in to create a cart." };
    }

    const validatedFields = CreateCartSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { error: validatedFields.error.errors[0].message };
    }

    const { name, address, type } = validatedFields.data;

    try {
        const newCart: Omit<GroupCart, 'id'> = {
            name,
            address,
            type,
            ownerId: user.uid,
            members: [user.uid],
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
        return { error: "Failed to create group cart. Please try again." };
    }
}

const JoinCartSchema = z.object({
  inviteCode: z.string().length(6, "Invite code must be 6 characters long."),
});

export async function joinGroupCart(
    prevState: { error?: string; success?: boolean },
    formData: FormData
): Promise<{ error?: string; success?: boolean }> {
    const user = auth.currentUser;
    if (!user) {
        return { error: "You must be logged in to join a cart." };
    }

    const validatedFields = JoinCartSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return { error: validatedFields.error.errors[0].message };
    }

    const { inviteCode } = validatedFields.data;

    try {
        const q = query(collection(db, "groupCarts"), where("inviteCode", "==", inviteCode.toUpperCase()));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return { error: "Invalid invite code." };
        }

        const cartDoc = querySnapshot.docs[0];
        const cartData = cartDoc.data() as GroupCart;

        if (cartData.members.includes(user.uid)) {
            return { error: "You are already a member of this cart." };
        }

        await updateDoc(cartDoc.ref, {
            members: arrayUnion(user.uid)
        });

        revalidatePath('/carts');
        revalidatePath('/profile');
        return { success: true };

    } catch (e) {
        console.error("Error joining cart:", e);
        return { error: "Failed to join cart. Please try again." };
    }
}

export async function getGroupCartsForUser(userId: string): Promise<GroupCart[]> {
    if (!userId) return [];

    try {
        const q = query(collection(db, "groupCarts"), where("members", "array-contains", userId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GroupCart));
    } catch(e) {
        console.error("Error fetching group carts:", e);
        return [];
    }
}
