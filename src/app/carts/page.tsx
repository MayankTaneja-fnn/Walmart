'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, PlusCircle, Loader2, Pencil, Trash2, LogOut } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import {
  getGroupCartsForUser,
  leaveCart,
  deleteCart,
  updateCart
} from "../cart/actions";
import type { GroupCart, GroupCartItem } from "@/lib/types";
import { CreateCartDialog } from "./create-cart-dialog";
import { JoinCartDialog } from "./join-cart-dialog";
import { Timestamp } from "firebase/firestore";
import { useToast } from '@/hooks/use-toast';

export default function CartsPage() {
  const { user, loading: authLoading } = useAuth();
  const [carts, setCarts] = useState<GroupCart[]>([]);
  const [loadingCarts, setLoadingCarts] = useState(true);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [isJoinDialogOpen, setJoinDialogOpen] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setLoadingCarts(true);
      getGroupCartsForUser(user.uid)
        .then(setCarts)
        .finally(() => setLoadingCarts(false));
    } else if (!authLoading) {
      setLoadingCarts(false);
    }
  }, [user, authLoading, isCreateDialogOpen, isJoinDialogOpen]);

  const handleLeaveCart = async (cartId: string) => {
    if (!user) return;
    const res = await leaveCart(cartId, user.uid);
    if (res.success) {
      setCarts((prev) => prev.filter((cart) => cart.id !== cartId));
    } else {
      toast({ variant: 'destructive', title: "Leave Failed", description: res.error });
    }
  };

  const handleDeleteCart = async (cartId: string, ownerId: string) => {
    if (!user) return;
    const res = await deleteCart(cartId, ownerId, user.uid);
    if (res.success) {
      setCarts((prev) => prev.filter((cart) => cart.id !== cartId));
    } else {
      toast({ variant: 'destructive', title: "Delete Failed", description: res.error });
    }
  };

  const handleUpdateCart = async (cartId: string, name: string, address: string, ownerId: string) => {
    if (!user) return;
    const res = await updateCart(cartId, name, address, user.uid);
    if (res.success) {
      setCarts((prev) =>
        prev.map((cart) =>
          cart.id === cartId ? { ...cart, name, address } : cart
        )
      );
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
          ) : carts.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              {carts.map((cart) => (
                <Card key={cart.id} className="shadow-md">
                  <CardHeader>
                    <CardTitle>{cart.name}</CardTitle>
                    <CardDescription>
                      Type: <span className="capitalize font-medium text-primary">{cart.type}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Invite Code: <span className="font-mono bg-muted px-2 py-1 rounded">{cart.inviteCode}</span>
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Members: {cart.members.length}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Items: {cart.items.reduce((acc: number, i: GroupCartItem) => acc + i.quantity, 0)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Created At: {(cart.createdAt as Timestamp).toDate().toLocaleDateString()}
                    </p>

                    {user && cart.ownerId === user.uid ? (
                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          onClick={() =>
                            handleUpdateCart(
                              cart.id,
                              prompt("New name", cart.name) || cart.name,
                              prompt("New address", cart.address) || cart.address,
                              cart.ownerId
                            )
                          }
                        >
                          <Pencil className="w-4 h-4 mr-1" /> Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteCart(cart.id, cart.ownerId)}>
                          <Trash2 className="w-4 h-4 mr-1" /> Delete
                        </Button>
                      </div>
                    ) : (
                      <div className="mt-4">
                        <Button size="sm" variant="outline" onClick={() => handleLeaveCart(cart.id)}>
                          <LogOut className="w-4 h-4 mr-1" /> Leave Cart
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center mt-6">
              <p className="text-muted-foreground">You are not currently a member of any carts.</p>
              {/* <Image src="https://placehold.co/400x300.png" width={400} height={300} alt="Empty Carts" className="mx-auto mt-4 rounded-lg" /> */}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
