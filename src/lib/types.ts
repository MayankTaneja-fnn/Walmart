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
