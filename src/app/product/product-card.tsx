'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import { ChevronDown, Leaf, Users, ShoppingCart, Loader2, User } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { addToCart, addToGroupCart, getGroupCartsForUser } from '@/app/cart/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { GroupCart, Product } from '@/lib/types';

export function ProductCard({ product }: { product: Product }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const [groupCarts, setGroupCarts] = useState<GroupCart[]>([]);
  const [loadingGroupCarts, setLoadingGroupCarts] = useState(false);

  useEffect(() => {
    if (user) {
        setLoadingGroupCarts(true);
        getGroupCartsForUser(user.uid)
            .then(setGroupCarts)
            .finally(() => setLoadingGroupCarts(false));
    }
  }, [user]);


  const handleAddToCart = async (cartType: 'personal' | string) => {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Not logged in",
            description: "Please log in to add items to your cart.",
        });
        router.push('/login');
        return;
    }

    setIsAdding(cartType);
    let result;

    if (cartType === 'personal') {
        result = await addToCart(product.id, user.uid);
    } else {
        result = await addToGroupCart(product.id, cartType, user.uid);
    }
    
    setIsAdding(null);

    if (result.success) {
        toast({
            title: "Success!",
            description: result.message,
        });
    } else {
        toast({
            variant: "destructive",
            title: "Error",
            description: result.message,
        });
    }
  };

  return (
    <Card key={product.id} className="overflow-hidden group flex flex-col">
      <div className="relative w-full h-48">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform"
          data-ai-hint={product.hint}
        />
      </div>
      <CardContent className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold truncate flex-grow">{product.name}</h3>
        <div className="flex justify-between items-end mt-2">
          <p className="text-lg font-bold text-primary">${product.price.toFixed(2)}</p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="secondary" disabled={!!isAdding}>
                 {isAdding ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <ShoppingCart className="mr-1 h-4 w-4" />}
                Add
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuLabel>Choose a Cart</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleAddToCart('personal')} disabled={!!isAdding}>
                <User className="mr-2 h-4 w-4" />
                <span>Personal Cart</span>
                <span className="ml-auto text-sm font-semibold">${product.price.toFixed(2)}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
               <DropdownMenuLabel>Your Group Carts</DropdownMenuLabel>
               {loadingGroupCarts ? (
                  <DropdownMenuItem disabled>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Loading...</span>
                  </DropdownMenuItem>
               ) : groupCarts.length > 0 ? (
                  groupCarts.map(cart => {
                      const discount = cart.type === 'community' ? 0.95 : 0.98;
                      const newPrice = (product.price * discount).toFixed(2);
                      return (
                          <DropdownMenuItem key={cart.id} onClick={() => handleAddToCart(cart.id)} disabled={!!isAdding}>
                              {cart.type === 'family' ? <Users className="mr-2 h-4 w-4" /> : <Leaf className="mr-2 h-4 w-4" />}
                              <span>{cart.name}</span>
                              <span className="ml-auto text-sm text-primary font-bold">${newPrice}</span>
                          </DropdownMenuItem>
                      )
                  })
               ) : (
                  <DropdownMenuItem disabled>
                      <span>No group carts found.</span>
                  </DropdownMenuItem>
               )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
