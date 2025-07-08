'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Copy,
  Globe,
  Home,
  Loader2,
  Minus,
  Plus,
  Settings,
  ShoppingCart,
  Trash2,
  User,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { getGroupCartsForUser, getPersonalCart, updateItemQuantity, leaveCart, deleteCart } from '../cart/actions';
import type { AnyCart, CartItem, GroupCart } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { CreateCartDialog } from './create-cart-dialog';
import { JoinCartDialog } from './join-cart-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function CartsPage() {
  const { user, loading: authLoading } = useAuth();
  const [personalCart, setPersonalCart] = useState<AnyCart | null>(null);
  const [groupCarts, setGroupCarts] = useState<GroupCart[]>([]);
  const [loadingCarts, setLoadingCarts] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null); // itemId
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [isJoinDialogOpen, setJoinDialogOpen] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setLoadingCarts(true);
      Promise.all([getPersonalCart(user.uid), getGroupCartsForUser(user.uid)])
        .then(([pCart, gCarts]) => {
          setPersonalCart(pCart);
          setGroupCarts(gCarts);
        })
        .finally(() => setLoadingCarts(false));
    } else if (!authLoading) {
      setLoadingCarts(false);
    }
  }, [user, authLoading, isCreateDialogOpen, isJoinDialogOpen]); // Re-fetch on dialog close

  const handleQuantityChange = async (
    cart: AnyCart,
    itemId: string,
    newQuantity: number
  ) => {
    if (!user) return;
    setIsUpdating(`${cart.id}-${itemId}`);

    const result = await updateItemQuantity(
      cart.id,
      cart.type,
      itemId,
      newQuantity,
      user.uid
    );

    if (result.success) {
      if (cart.type === 'personal') {
        setPersonalCart((prev) => {
          if (!prev) return null;
          const updatedItems =
            newQuantity > 0
              ? prev.items.map((item) =>
                  item.id === itemId ? { ...item, quantity: newQuantity } : item
                )
              : prev.items.filter((item) => item.id !== itemId);
          return { ...prev, items: updatedItems };
        });
      } else {
        setGroupCarts((prev) =>
          prev.map((gc) => {
            if (gc.id === cart.id) {
              const updatedItems =
                newQuantity > 0
                  ? gc.items.map((item) =>
                      item.id === itemId
                        ? { ...item, quantity: newQuantity }
                        : item
                    )
                  : gc.items.filter((item) => item.id !== itemId);
              return { ...gc, items: updatedItems };
            }
            return gc;
          })
        );
      }
      toast({ title: 'Cart updated!' });
    } else {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: result.message,
      });
    }
    setIsUpdating(null);
  };

  const handleCopyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: 'Copied!', description: 'Invite code copied to clipboard.' });
  };
  
  const handleLeaveCart = async (cartId: string) => {
    if (!user) return;
    const result = await leaveCart(cartId, user.uid);
     if (result.success) {
        setGroupCarts(prev => prev.filter(c => c.id !== cartId));
        toast({ title: "You've left the cart." });
    } else {
        toast({ variant: "destructive", title: "Error", description: result.error });
    }
  }

  const handleDeleteCart = async (cart: GroupCart) => {
    if (!user || user.uid !== cart.ownerId) return;
     const result = await deleteCart(cart.id, cart.ownerId, user.uid);
     if (result.success) {
        setGroupCarts(prev => prev.filter(c => c.id !== cart.id));
        toast({ title: "Cart deleted." });
    } else {
        toast({ variant: "destructive", title: "Error", description: result.error });
    }
  }


  if (loadingCarts || authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="container mx-auto max-w-5xl py-12 px-4 text-center">
        <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
        <h1 className="mt-4 text-2xl font-bold">Please Log In</h1>
        <p className="text-muted-foreground">You need to be logged in to manage your carts.</p>
        <Button asChild className="mt-4">
          <Link href="/login">Log In</Link>
        </Button>
      </div>
    );
  }

  const allCarts = [personalCart, ...groupCarts].filter(Boolean) as AnyCart[];

  return (
    <>
      <CreateCartDialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen} />
      <JoinCartDialog open={isJoinDialogOpen} onOpenChange={setJoinDialogOpen} />
      <div className="container mx-auto max-w-5xl py-12 px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="font-headline text-4xl font-bold">Community Carts</h1>
            <p className="mt-2 text-muted-foreground">
              Manage your personal and group shopping carts.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setCreateDialogOpen(true)}>Create Cart</Button>
            <Button variant="secondary" onClick={() => setJoinDialogOpen(true)}>Join Cart</Button>
          </div>
        </div>

        {allCarts.length > 0 ? (
          <Accordion type="single" collapsible className="w-full space-y-4">
            {allCarts.map((cart) => (
              <AccordionItem value={cart.id} key={cart.id} className="border rounded-lg shadow-sm bg-card">
                <AccordionTrigger className="p-4 hover:no-underline">
                  <div className="flex justify-between w-full items-center">
                    <div className="flex items-center gap-4 text-left">
                        {cart.type === 'personal' ? (
                            <User className="w-6 h-6 text-primary" />
                        ) : cart.type === 'family' ? (
                            <Home className="w-6 h-6 text-primary" />
                        ) : (
                            <Globe className="w-6 h-6 text-primary" />
                        )}
                        <div>
                            <p className="font-bold text-lg">{cart.name}</p>
                             <p className="text-sm text-muted-foreground">
                                {cart.items.reduce((acc, i) => acc + i.quantity, 0)} items
                                {cart.type !== 'personal' && ` • ${cart.members.length} members`}
                             </p>
                        </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 pt-0">
                    <Separator className="mb-4" />
                    {cart.type !== 'personal' && (
                        <Card className="mb-4 bg-secondary/30">
                            <CardHeader>
                                <CardTitle className="text-base">Cart Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <p><strong>Address:</strong> {cart.address}</p>
                                <div className="flex items-center gap-2">
                                  <strong>Invite Code:</strong> 
                                  <span className="font-mono bg-muted p-1 rounded">{cart.inviteCode}</span>
                                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleCopyInviteCode(cart.inviteCode)}><Copy className="w-3 h-3"/></Button>
                                </div>
                                <details className="mt-2">
                                    <summary className="cursor-pointer font-semibold">Members ({cart.members.length})</summary>
                                    <ul className="list-disc list-inside pl-4 mt-1 text-muted-foreground">
                                        {cart.members.map(m => <li key={m}>{m === user.uid ? `${m.substring(0,6)}... (You)`: `${m.substring(0,6)}...`}</li>)}
                                    </ul>
                                </details>
                                <div className="pt-4 flex gap-2">
                                {user.uid === cart.ownerId ? (
                                    <>
                                        <Button variant="outline" size="sm" disabled>
                                            <Settings className="w-4 h-4 mr-2" />
                                            Settings
                                        </Button>
                                         <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm"><Trash2 className="w-4 h-4 mr-2" /> Delete</Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will permanently delete the cart for everyone. This action cannot be undone.
                                                </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteCart(cart as GroupCart)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </>
                                 ) : (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="sm">Leave Cart</Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                            <AlertDialogTitle>Leave this cart?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                You can always rejoin later with the invite code if you change your mind.
                                            </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleLeaveCart(cart.id)}>Leave Cart</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                 )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    
                  {cart.items.length > 0 ? (
                    <div className="space-y-4">
                      {cart.items.map((item) => {
                          const updatingId = `${cart.id}-${item.id}`;
                          return (
                            <div key={item.id} className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    width={64}
                                    height={64}
                                    className="rounded-md border"
                                    data-ai-hint={item.hint}
                                />
                                <div>
                                    <p className="font-semibold">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                    ${item.price.toFixed(2)}
                                    </p>
                                </div>
                                </div>
                                <div className="flex items-center gap-2">
                                <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleQuantityChange(cart, item.id, item.quantity - 1)} disabled={isUpdating === updatingId}>
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <span className="font-bold w-4 text-center">
                                    {item.quantity}
                                </span>
                                <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleQuantityChange(cart, item.id, item.quantity + 1)} disabled={isUpdating === updatingId}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={() => handleQuantityChange(cart, item.id, 0)} disabled={isUpdating === updatingId}>
                                    {isUpdating === updatingId ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                    <Trash2 className="h-4 w-4" />
                                    )}
                                </Button>
                                </div>
                            </div>
                         )
                      })}
                      <Separator className="my-4" />
                      <Button asChild>
                        <Link href={`/checkout?cartId=${cart.id}`}>
                            <ShoppingCart className="mr-2 h-4 w-4" /> Proceed to Checkout
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>This cart is empty.</p>
                       <Button asChild variant="link" className="mt-2">
                            <Link href="/product">Start Shopping</Link>
                        </Button>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
           <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-4 text-muted-foreground text-xl font-semibold">
                    You don't have any carts yet.
                </p>
                <p className="mt-1 text-muted-foreground">Create or join one to get started!</p>
            </div>
        )}
      </div>
    </>
  );
}
