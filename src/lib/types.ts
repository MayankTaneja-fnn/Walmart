import type {FieldValue, Timestamp } from "firebase/firestore";

export interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    hint: string;
    category: string;
}

export interface CartItem extends Product {
    quantity: number;
}

export type AnyCart = Cart | GroupCart;

export interface Cart {
    id: string;
    name: string;
    type: 'personal';
    userId: string;
    items: CartItem[];
}

export interface GroupCart {
    id:string;
    name: string;
    address: string;
    type: 'family' | 'community';
    ownerId: string;
    members: string[];
    inviteCode: string;
    createdAt: any; // Can be FieldValue, Timestamp, or string after serialization
    items: CartItem[];
}
