'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Leaf, Package, Recycle, ShoppingBag, Loader2, Trash2, User, Users } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, Suspense } from "react";
import { useAuth } from "@/context/auth-context";
import { getPersonalCart, getGroupCart, updateItemQuantity, getGroupCartsForUser } from "../cart/actions";
import type { AnyCart, CartItem } from "@/lib/types";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ecoOptions = [
    { id: 'return-packaging', label: 'Return packaging to delivery agent', points: 15, icon: <Recycle className="w-5 h-5 text-primary" /> },
    { id: 'no-plastic', label: 'Opt-out of plastic packaging', points: 10, icon: <Leaf className="w-5 h-5 text-primary" /> },
    { id: 'own-bag', label: 'Bring own carry bag (for in-store pickup)', points: 5, icon: <ShoppingBag className="w-5 h-5 text-primary" /> },
    { id: 'club-packaging', label: 'Club my packaging with nearby orders (Smart Packaging)', points: 25, icon: <Package className="w-5 h-5 text-primary" /> },
];

function CheckoutCore() {
    const { user, loading: authLoading } = useAuth();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const [allCarts, setAllCarts] = useState<AnyCart[]>([]);
    const [selectedCartId, setSelectedCartId] = useState<string | null>(null);
    const [loadingCarts, setLoadingCarts] = useState(true);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            setLoadingCarts(true);
            Promise.all([
                getPersonalCart(user.uid),
                getGroupCartsForUser(user.uid)
            ]).then(([personalCart, groupCarts]) => {
                const cartsToShow: AnyCart[] = [];
                // only add carts with items
                if (personalCart && personalCart.items.length > 0) {
                    cartsToShow.push(personalCart);
                }
                cartsToShow.push(...groupCarts.filter(c => c.items.length > 0));

                setAllCarts(cartsToShow);

                const initialCartId = searchParams.get('cartId');
                if (initialCartId && cartsToShow.some(c => c.id === initialCartId)) {
                    setSelectedCartId(initialCartId);
                } else if (cartsToShow.length > 0) {
                    setSelectedCartId(cartsToShow[0].id);
                } else {
                    setSelectedCartId(null);
                }
                
            }).finally(() => setLoadingCarts(false));
        } else if (!authLoading) {
            setLoadingCarts(false);
        }
    }, [user, authLoading, searchParams]);

    const selectedCart = allCarts.find(cart => cart.id === selectedCartId);

    const handleRemoveItem = async (itemId: string) => {
        if (!selectedCart || !user) return;
        setIsUpdating(itemId);
        
        const result = await updateItemQuantity(selectedCart.id, selectedCart.type, itemId, 0, user.uid);

        if (result.success) {
            setAllCarts(prevCarts => {
                const updatedCarts = prevCarts.map(cart => {
                    if (cart.id === selectedCart.id) {
                        const updatedItems = cart.items.filter(item => item.id !== itemId);
                        return { ...cart, items: updatedItems };
                    }
                    return cart;
                }).filter(c => c.items.length > 0);

                if (!updatedCarts.find(c => c.id === selectedCartId)) {
                    setSelectedCartId(updatedCarts.length > 0 ? updatedCarts[0].id : null);
                }

                return updatedCarts;
            });
            toast({
                title: 'Item removed',
                description: 'The item has been removed from your cart.',
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: result.message,
            });
        }
        setIsUpdating(null);
    };

    const cartItems = selectedCart?.items || [];
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    let discount = 0;
    let discountPercentText = '';
    if (selectedCart?.type === 'family') {
        discount = subtotal * 0.02; // 2% discount
        discountPercentText = 'Family Cart Discount (2%)';
    } else if (selectedCart?.type === 'community') {
        discount = subtotal * 0.05; // 5% discount
        discountPercentText = 'Community Cart Discount (5%)';
    }
    
    const discountedSubtotal = subtotal - discount;
    const tax = discountedSubtotal * 0.08;
    const total = discountedSubtotal + tax;

    if (loadingCarts || authLoading) {
        return (
            <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-12 px-4">
            <h1 className="font-headline text-4xl font-bold mb-8 text-center">Checkout</h1>
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle>Eco-Friendly Options</CardTitle>
                            <CardDescription>Select actions to earn Eco-Points and help the planet.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {ecoOptions.map((option) => (
                                <div key={option.id} className="flex items-center space-x-4 p-4 rounded-lg bg-secondary/30">
                                    <Checkbox id={option.id} className="h-5 w-5" />
                                    <div className="flex-grow flex items-center gap-3">
                                        {option.icon}
                                        <Label htmlFor={option.id} className="text-base cursor-pointer">
                                            {option.label}
                                        </Label>
                                    </div>
                                    <span className="font-bold text-primary whitespace-nowrap">+{option.points} pts</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1">
                    <Card className="shadow-lg sticky top-24">
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                             <CardDescription>
                                {allCarts.length > 0 ? "Select a cart to checkout from." : "You have no items to check out."}
                             </CardDescription>
                             {allCarts.length > 0 && (
                                <Select value={selectedCartId ?? ''} onValueChange={setSelectedCartId}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a cart..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {allCarts.map((cart) => (
                                            <SelectItem key={cart.id} value={cart.id}>
                                                <div className="flex items-center gap-2">
                                                    {cart.type === 'personal' ? <User className="w-4 h-4"/> : <Users className="w-4 h-4"/>}
                                                    <span>{cart.name} ({cart.items.reduce((acc, i: CartItem) => acc + i.quantity, 0)} items)</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                             )}
                        </CardHeader>
                        <CardContent>
                             {selectedCart && cartItems.length > 0 ? (
                                <>
                                    <div className="space-y-4">
                                        {cartItems.map(item => (
                                            <div key={item.id} className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <Image src={item.image} alt={item.name} width={50} height={50} className="rounded-md" data-ai-hint={item.hint} />
                                                    <div>
                                                        <p className="font-medium">{item.name}</p>
                                                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                                                    <Button 
                                                        size="icon" 
                                                        variant="ghost" 
                                                        className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                                        onClick={() => handleRemoveItem(item.id)}
                                                        disabled={!!isUpdating}
                                                        aria-label="Remove item"
                                                    >
                                                        {isUpdating === item.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <Separator className="my-6" />
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <p className="text-muted-foreground">Subtotal</p>
                                            <p className="font-medium">${subtotal.toFixed(2)}</p>
                                        </div>
                                        {discount > 0 && (
                                            <div className="flex justify-between text-primary">
                                                <p>{discountPercentText}</p>
                                                <p className="font-medium">-${discount.toFixed(2)}</p>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <p className="text-muted-foreground">Taxes (8%)</p>
                                            <p className="font-medium">${tax.toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <Separator className="my-6" />
                                    <div className="flex justify-between font-bold text-xl">
                                        <p>Total</p>
                                        <p>${total.toFixed(2)}</p>
                                    </div>
                                    <Button size="lg" className="w-full mt-6">
                                        Proceed to Payment
                                    </Button>
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">Select a cart with items to check out.</p>
                                    <Button asChild variant="link" className="mt-2">
                                        <Link href="/product">Start Shopping</Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
            <CheckoutCore />
        </Suspense>
    )
}
