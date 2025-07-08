'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Plus, Minus, Loader2, Trash2, ShoppingCart, User, Wand2 } from "lucide-react";
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useTransition } from "react";
import { useAuth } from "@/context/auth-context";
import {
  getGroupCartsForUser,
  getPersonalCart,
  updateItemQuantity,
} from "../cart/actions";
import type { AnyCart, CartItem } from "@/lib/types";
import { useToast } from '@/hooks/use-toast';
import { getCartRecommendations } from "@/ai/flows/cart-recommendations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export default function CartsPage() {
  const { user, loading: authLoading } = useAuth();
  const [allCarts, setAllCarts] = useState<AnyCart[]>([]);
  const [selectedCartId, setSelectedCartId] = useState<string | null>(null);
  const [loadingCarts, setLoadingCarts] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null); // itemId
  const [recommendations, setRecommendations] = useState<{ recommendations: string[], reason: string } | null>(null);
  const [loadingRecs, startRecsTransition] = useTransition();

  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setLoadingCarts(true);
      Promise.all([
        getPersonalCart(user.uid),
        getGroupCartsForUser(user.uid)
      ]).then(([personalCart, groupCarts]) => {
        const cartsToShow: AnyCart[] = [];
        if (personalCart) {
          cartsToShow.push(personalCart);
        }
        cartsToShow.push(...groupCarts);
        setAllCarts(cartsToShow);

        const personalCartWithItems = cartsToShow.find(c => c.type === 'personal' && c.items.length > 0);
        const firstCartWithItems = cartsToShow.find(c => c.items.length > 0);

        if (personalCartWithItems) {
            setSelectedCartId(personalCartWithItems.id);
        } else if (firstCartWithItems) {
            setSelectedCartId(firstCartWithItems.id);
        } else if (cartsToShow.length > 0) {
            setSelectedCartId(cartsToShow[0].id);
        }
        
      }).finally(() => setLoadingCarts(false));
    } else if (!authLoading) {
      setLoadingCarts(false);
    }
  }, [user, authLoading]);

  const selectedCart = allCarts.find(cart => cart.id === selectedCartId);

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (!user || !selectedCart) return;
    setIsUpdating(itemId);

    const result = await updateItemQuantity(selectedCart.id, selectedCart.type, itemId, newQuantity, user.uid);

    if (result.success) {
      setAllCarts(prevCarts => {
        return prevCarts.map(cart => {
          if (cart.id === selectedCart.id) {
            let updatedItems;
            if (newQuantity > 0) {
              updatedItems = cart.items.map(item =>
                item.id === itemId ? { ...item, quantity: newQuantity } : item
              );
            } else {
              updatedItems = cart.items.filter(item => item.id !== itemId);
            }
            return { ...cart, items: updatedItems };
          }
          return cart;
        });
      });
      toast({ title: "Cart updated!" });
    } else {
      toast({ variant: 'destructive', title: "Update Failed", description: result.message });
    }
    setIsUpdating(null);
  };
  
  const handleGetRecommendations = () => {
    const allItems = allCarts.flatMap(cart => cart.items.map(item => ({ name: item.name })));
    if (allItems.length === 0) {
      toast({ variant: "destructive", title: "Your carts are empty", description: "Add items to get recommendations." });
      return;
    }
    
    startRecsTransition(async () => {
      const result = await getCartRecommendations({ items: allItems });
      if (result) {
        setRecommendations(result);
      } else {
        toast({ variant: "destructive", title: "Could not get recommendations." });
      }
    });
  };

  const totalItemsInAllCarts = allCarts.reduce((acc, cart) => acc + cart.items.length, 0);

  return (
    <div className="container mx-auto max-w-5xl py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">
          Your Carts
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Manage your items, update quantities, and proceed to checkout.
        </p>
      </div>
      
      {loadingCarts || authLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : allCarts.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle>Your Cart Contents</CardTitle>
                        <CardDescription>Select a cart from the dropdown to see its contents.</CardDescription>
                         <Select value={selectedCartId ?? ''} onValueChange={setSelectedCartId}>
                            <SelectTrigger className="w-full md:w-[280px] mt-2">
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
                    </CardHeader>
                    <CardContent>
                        <Separator className="mb-6" />
                        {selectedCart && selectedCart.items.length > 0 ? (
                            <div className="space-y-4">
                                {selectedCart.items.map(item => (
                                   <div key={item.id} className="flex items-center justify-between gap-4">
                                     <div className="flex items-center gap-4">
                                       <Image src={item.image} alt={item.name} width={64} height={64} className="rounded-md border" data-ai-hint={item.hint}/>
                                       <div>
                                         <p className="font-semibold">{item.name}</p>
                                         <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
                                       </div>
                                     </div>
                                     <div className="flex items-center gap-2">
                                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleQuantityChange(item.id, item.quantity - 1)} disabled={isUpdating === item.id}>
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <span className="font-bold w-4 text-center">{item.quantity}</span>
                                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleQuantityChange(item.id, item.quantity + 1)} disabled={isUpdating === item.id}>
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={() => handleQuantityChange(item.id, 0)} disabled={isUpdating === item.id}>
                                            {isUpdating === item.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4"/>}
                                        </Button>
                                     </div>
                                   </div>
                                ))}
                                <Separator className="my-6" />
                                <Button asChild className="w-full sm:w-auto float-right">
                                   <Link href={`/checkout?cartId=${selectedCart.id}&type=${selectedCart.type}`}>
                                    <ShoppingCart className="w-4 h-4 mr-1"/> Proceed to Checkout
                                   </Link>
                               </Button>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                                <p className="mt-4">This cart is empty.</p>
                                <Button asChild variant="link" className="mt-2">
                                    <Link href="/product">Start Shopping</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-1 space-y-8">
                 {totalItemsInAllCarts > 0 && (
                  <Card className="shadow-md">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Wand2 className="w-5 h-5 text-primary" />
                        AI Recommendations
                      </CardTitle>
                      <CardDescription>
                        Based on all items in your carts.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loadingRecs ? (
                         <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Finding recommendations...</span>
                         </div>
                      ) : recommendations ? (
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground italic">{recommendations.reason}</p>
                            <ul className="list-disc list-inside font-semibold">
                                {recommendations.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                            </ul>
                        </div>
                      ) : (
                         <Button onClick={handleGetRecommendations} disabled={loadingRecs}>
                            Get AI Suggestions
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
            </div>
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
           <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-muted-foreground text-xl font-semibold">
            You don't have any carts yet.
          </p>
           <p className="mt-1 text-muted-foreground">Start shopping to create your first one!</p>
          <Button asChild className="mt-4">
            <Link href="/product">Browse Products</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
