import type {FieldValue, Timestamp } from "firebase/firestore";

export interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    hint: string;
}

export interface CartItem extends Product {
    quantity: number;
}

export interface Cart {
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

export interface GroupCartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    hint?: string;
  }
  