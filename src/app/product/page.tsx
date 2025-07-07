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
import { ChevronDown, Leaf, Users, ShoppingCart, QrCode, Truck, Recycle, MapPin, Loader2, User } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/context/auth-context';
import { addToCart, addToGroupCart, getGroupCartsForUser } from '@/app/cart/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { GroupCart } from '@/lib/types';

export default function ProductPage() {
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
    // In a real app, you'd get the product ID from the product data.
    const productId = 'prod_1';

    if (cartType === 'personal') {
        result = await addToCart(productId, user.uid);
    } else {
        result = await addToGroupCart(productId, cartType, user.uid);
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
    <div className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <Image
                src="https://placehold.co/600x600.png"
                alt="Organic Apples"
                width={600}
                height={600}
                className="w-full h-auto object-cover"
                data-ai-hint="organic apples"
              />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <h1 className="font-headline text-4xl font-bold">Fresh Organic Apples</h1>
          <p className="text-2xl font-semibold text-primary">$3.99 / lb</p>
          <p className="text-muted-foreground leading-relaxed">
            Crisp, juicy, and sustainably grown. These organic apples are perfect for a healthy snack, baking, or adding to your favorite salads. Sourced from local farms committed to eco-friendly practices.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="lg" className="w-full sm:w-auto" disabled={!!isAdding}>
                  {isAdding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
                  {isAdding ? 'Adding...' : 'Add to Cart'} <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-72">
                <DropdownMenuLabel>Choose a Cart</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleAddToCart('personal')} disabled={!!isAdding}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Personal Cart</span>
                  <span className="ml-auto text-sm font-semibold">$3.99</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                 <DropdownMenuLabel>Your Group Carts</DropdownMenuLabel>
                 {loadingGroupCarts ? (
                    <DropdownMenuItem disabled>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Loading carts...</span>
                    </DropdownMenuItem>
                 ) : groupCarts.length > 0 ? (
                    groupCarts.map(cart => {
                        const discount = cart.type === 'community' ? 0.95 : 0.98;
                        const newPrice = (3.99 * discount).toFixed(2);
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

            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <QrCode className="mr-2 h-4 w-4" />
                  View Eco-QR Info
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="font-headline text-2xl flex items-center gap-2"><Leaf className="text-primary"/>Eco-QR Details</DialogTitle>
                  <DialogDescription>
                    Transparency from farm to your table.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 text-sm">
                  <InfoRow icon={<Truck className="w-5 h-5 text-primary"/>} label="Carbon Footprint" value="0.2 kg CO2e / lb" />
                  <InfoRow icon={<MapPin className="w-5 h-5 text-primary"/>} label="Product Journey" value="Sourced from Green Valley Farms, 50 miles away." />
                  <InfoRow icon={<Recycle className="w-5 h-5 text-primary"/>} label="Disposal Info" value="Packaging is 100% compostable. Apples can be composted." />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({icon, label, value}: {icon: React.ReactNode, label: string, value: string}) {
    return (
        <div className="flex items-start gap-4">
            <div className="flex-shrink-0">{icon}</div>
            <div>
                <p className="font-semibold">{label}</p>
                <p className="text-muted-foreground">{value}</p>
            </div>
        </div>
    )
}
