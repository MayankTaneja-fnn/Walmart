'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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

export default function CartsPage() {
  const { user, loading: authLoading } = useAuth();
  const [allCarts, setAllCarts] = useState<AnyCart[]>([]);
  const [loadingCarts, setLoadingCarts] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null); // "cartId-itemId"
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
        // Only show carts with items
        setAllCarts(cartsToShow.filter(c => c.items.length > 0).sort((a,b) => a.type === 'personal' ? -1 : 1));
      }).finally(() => setLoadingCarts(false));
    } else if (!authLoading) {
      setLoadingCarts(false);
    }
  }, [user, authLoading]);

  const handleQuantityChange = async (cartId: string, cartType: 'personal' | 'group', itemId: string, newQuantity: number) => {
    if (!user) return;
    setIsUpdating(`${cartId}-${itemId}`);

    const result = await updateItemQuantity(cartId, cartType, itemId, newQuantity, user.uid);

    if (result.success) {
      setAllCarts(prevCarts => {
        return prevCarts.map(cart => {
          if (cart.id === cartId) {
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
        }).filter(c => c.items.length > 0); // Also filter out carts that become empty
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
    <div className="container mx-auto max-w-4xl py-12 px-4">
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
        <div className="space-y-8">
            <Accordion type="multiple" className="w-full space-y-4">
                {allCarts.map((cart) => (
                    <AccordionItem value={cart.id} key={cart.id} className="border rounded-lg shadow-md bg-card">
                        <AccordionTrigger className="px-6 py-4 hover:no-underline">
                             <div className="flex items-center gap-3">
                                {cart.type === 'personal' ? <User className="w-6 h-6 text-primary"/> : <Users className="w-6 h-6 text-primary"/>}
                                <div>
                                    <h2 className="font-headline text-xl text-left">{cart.name}</h2>
                                    <p className="text-sm text-muted-foreground text-left">
                                        {cart.items.reduce((acc: number, i: CartItem) => acc + i.quantity, 0)} items &bull; Type: <span className="capitalize font-medium text-primary">{cart.type}</span>
                                    </p>
                                </div>
                             </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-4">
                           <div className="space-y-4 pt-4 border-t">
                             {cart.items.map(item => (
                               <div key={item.id} className="flex items-center justify-between gap-4">
                                 <div className="flex items-center gap-4">
                                   <Image src={item.image} alt={item.name} width={64} height={64} className="rounded-md border" data-ai-hint={item.hint}/>
                                   <div>
                                     <p className="font-semibold">{item.name}</p>
                                     <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
                                   </div>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleQuantityChange(cart.id, cart.type, item.id, item.quantity - 1)} disabled={isUpdating === `${cart.id}-${item.id}`}>
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="font-bold w-4 text-center">{item.quantity}</span>
                                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleQuantityChange(cart.id, cart.type, item.id, item.quantity + 1)} disabled={isUpdating === `${cart.id}-${item.id}`}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={() => handleQuantityChange(cart.id, cart.type, item.id, 0)} disabled={isUpdating === `${cart.id}-${item.id}`}>
                                        {isUpdating === `${cart.id}-${item.id}` ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4"/>}
                                    </Button>
                                 </div>
                               </div>
                             ))}
                           </div>
                           <Button asChild className="mt-6 w-full sm:w-auto float-right">
                               <Link href={`/checkout?cartId=${cart.id}&type=${cart.type}`}>
                                <ShoppingCart className="w-4 h-4 mr-1"/> Proceed to Checkout
                               </Link>
                           </Button>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
            
            {totalItemsInAllCarts > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-primary" />
                    AI Recommendations
                  </CardTitle>
                  <CardDescription>
                    Discover products you might also like based on what's in your carts.
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
                        Get AI Recommendations
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-xl">
            All your carts are currently empty.
          </p>
          <p className="text-muted-foreground mt-2">
            Add some products or <Link href="/carts/create-cart-dialog" className="underline text-primary">create a new cart</Link> to get started.
          </p>
          <Button asChild className="mt-4">
            <Link href="/product">Start Shopping</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
