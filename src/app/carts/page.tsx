'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, PlusCircle, Loader2, Pencil, Trash2, LogOut, ShoppingCart, User } from "lucide-react";
import Link from 'next/link';
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import {
  getGroupCartsForUser,
  getPersonalCart,
  leaveCart,
  deleteCart,
  updateCart
} from "../cart/actions";
import type { GroupCart, Cart, CartItem } from "@/lib/types";
import { CreateCartDialog } from "./create-cart-dialog";
import { JoinCartDialog } from "./join-cart-dialog";
import { useToast } from '@/hooks/use-toast';

export default function CartsPage() {
  const { user, loading: authLoading } = useAuth();
  const [allCarts, setAllCarts] = useState<(GroupCart | Cart)[]>([]);
  const [loadingCarts, setLoadingCarts] = useState(true);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [isJoinDialogOpen, setJoinDialogOpen] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setLoadingCarts(true);
      Promise.all([
        getGroupCartsForUser(user.uid),
        getPersonalCart(user.uid)
      ]).then(([groupCarts, personalCart]) => {
        const cartsToShow: (GroupCart | Cart)[] = [];
        if (personalCart) {
          cartsToShow.push(personalCart);
        }
        cartsToShow.push(...groupCarts);
        setAllCarts(cartsToShow.sort((a,b) => a.type === 'personal' ? -1 : 1));
      }).finally(() => setLoadingCarts(false));
    } else if (!authLoading) {
      setLoadingCarts(false);
    }
  }, [user, authLoading, isCreateDialogOpen, isJoinDialogOpen]);

  const handleLeaveCart = async (cartId: string) => {
    if (!user) return;
    const res = await leaveCart(cartId, user.uid);
    if (res.success) {
      setAllCarts((prev) => prev.filter((cart) => cart.id !== cartId));
      toast({ title: "Success", description: "You have left the cart." });
    } else {
      toast({ variant: 'destructive', title: "Leave Failed", description: res.error });
    }
  };

  const handleDeleteCart = async (cartId: string, ownerId: string) => {
    if (!user) return;
    const res = await deleteCart(cartId, ownerId, user.uid);
    if (res.success) {
      setAllCarts((prev) => prev.filter((cart) => cart.id !== cartId));
      toast({ title: "Success", description: "The cart has been deleted." });
    } else {
      toast({ variant: 'destructive', title: "Delete Failed", description: res.error });
    }
  };

  const handleUpdateCart = async (cartId: string, name: string, address: string) => {
    if (!user) return;
    const res = await updateCart(cartId, name, address, user.uid);
    if (res.success) {
      setAllCarts((prev) =>
        prev.map((cart) =>
          cart.id === cartId ? { ...cart, name, address } : cart
        ) as (GroupCart | Cart)[]
      );
      toast({ title: "Success", description: "The cart has been updated." });
    } else {
      toast({ variant: 'destructive', title: "Update Failed", description: res.error });
    }
  };

  return (
    <>
      <CreateCartDialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen} />
      <JoinCartDialog open={isJoinDialogOpen} onOpenChange={setJoinDialogOpen} />
      <div className="container mx-auto max-w-4xl py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">
            Family & Community Carts
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Shop together to save money, reduce packaging, and lower your carbon footprint.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <PlusCircle className="w-8 h-8 text-primary" />
                <CardTitle className="font-headline text-2xl">Create a New Cart</CardTitle>
              </div>
              <CardDescription>
                Start a new group with your family, friends, or neighbors.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                As the creator, you can invite members, set a delivery address, and manage the group.
              </p>
              <Button className="w-full" onClick={() => setCreateDialogOpen(true)}>Create a Cart</Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-primary" />
                <CardTitle className="font-headline text-2xl">Join an Existing Cart</CardTitle>
              </div>
              <CardDescription>Already have an invite code? Join a group here.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Enter the invite code from a friend to start shopping together.
              </p>
              <Button variant="secondary" className="w-full" onClick={() => setJoinDialogOpen(true)}>Join with Code</Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16">
          <h2 className="font-headline text-2xl font-bold text-center">Your Carts</h2>
          {loadingCarts || authLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : allCarts.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              {allCarts.map((cart) => (
                <Card key={cart.id} className="shadow-md flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                       {cart.type === 'personal' ? <User className="w-5 h-5"/> : <Users className="w-5 h-5"/>} {cart.name}
                    </CardTitle>
                    <CardDescription>
                      Type: <span className="capitalize font-medium text-primary">{cart.type}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    {cart.type !== 'personal' && (
                        <>
                            <p className="text-sm text-muted-foreground">
                            Invite Code: <span className="font-mono bg-muted px-2 py-1 rounded">{cart.inviteCode}</span>
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                            Members: {cart.members.length}
                            </p>
                        </>
                    )}
                    <p className="text-sm text-muted-foreground mt-2">
                      Items: {cart.items.reduce((acc: number, i: CartItem) => acc + i.quantity, 0)}
                    </p>
                    {cart.type !== 'personal' && (
                        <p className="text-sm text-muted-foreground mt-2">
                        Created At: {new Date(cart.createdAt).toLocaleDateString()}
                        </p>
                    )}
                  </CardContent>
                  <CardContent>
                    <div className="flex gap-2 mt-4 flex-wrap">
                        <Button asChild>
                           <Link href={`/checkout?cartId=${cart.id}&type=${cart.type}`}>
                            <ShoppingCart className="w-4 h-4 mr-1"/> Checkout
                           </Link>
                        </Button>
                        {cart.type !== 'personal' && user && cart.ownerId === user.uid ? (
                        <>
                            <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                                handleUpdateCart(
                                cart.id,
                                prompt("New name", cart.name) || cart.name,
                                prompt("New address", cart.address) || cart.address
                                )
                            }
                            >
                            <Pencil className="w-4 h-4 mr-1" /> Edit
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteCart(cart.id, cart.ownerId)}>
                            <Trash2 className="w-4 h-4 mr-1" /> Delete
                            </Button>
                        </>
                        ) : cart.type !== 'personal' ? (
                        <Button size="sm" variant="outline" onClick={() => handleLeaveCart(cart.id)}>
                            <LogOut className="w-4 h-4 mr-1" /> Leave Cart
                        </Button>
                        ) : null}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center mt-6">
              <p className="text-muted-foreground">You are not currently a member of any carts.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
