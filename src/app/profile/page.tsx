'use client';

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Leaf, Gift, Package, Recycle, Users, History, LogOut, Loader2, ArrowRight } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { clientLogOut } from '@/lib/auth-client';
import { getGroupCartsForUser } from '../cart/actions';
import type { GroupCart, CartItem } from '@/lib/types';


const ecoHistory = [
  { action: 'Joined Community Cart', points: '+50', date: '2023-10-26' },
  { action: 'Returned packaging', points: '+15', date: '2023-10-24' },
  { action: 'Opted-out of plastic', points: '+10', date: '2023-10-24' },
  { action: 'Smart Packaging Opt-in', points: '+25', date: '2023-10-22' },
];

const rewards = [
  { title: '5% Off Next Order', points: 500, icon: <Gift /> },
  { title: 'Free Eco-Friendly Tote Bag', points: 1000, icon: <Award /> },
  { title: 'Plant a Tree in Your Name', points: 2500, icon: <Leaf /> },
];

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [groupCarts, setGroupCarts] = useState<GroupCart[]>([]);
  const [loadingCarts, setLoadingCarts] = useState(true);

  const handleLogout = async () => {
    try {
      await clientLogOut();
      router.push('/login');
      router.refresh(); // Force a refresh to update server-side state
    } catch (e) {
      console.error('Logout failed:', e);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
    if (user) {
      setLoadingCarts(true);
      getGroupCartsForUser(user.uid)
        .then(setGroupCarts)
        .finally(() => setLoadingCarts(false));
    }
  }, [user, loading, router]);


  if (loading || !user) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-headline text-4xl font-bold">My Account</h1>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      <Tabs defaultValue="eco" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="account">Account Details</TabsTrigger>
          <TabsTrigger value="eco">
            <Leaf className="w-4 h-4 mr-2" /> Eco Hub
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your account details.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">Email:</p>
              <p>{user.email}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="eco" className="space-y-8">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="col-span-1 flex flex-col justify-center items-center text-center shadow-lg">
              <CardHeader>
                <div className="mx-auto bg-accent/20 rounded-full p-4 w-fit">
                  <Award className="w-10 h-10 text-accent-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Eco-Points Balance</p>
                <p className="text-5xl font-bold text-primary">1,250</p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Recent Eco-Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Points</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ecoHistory.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium flex items-center gap-2">
                          {index % 2 === 0 ? <Package className="w-4 h-4 text-primary" /> : <Recycle className="w-4 h-4 text-primary" />}
                          {item.action}
                        </TableCell>
                        <TableCell>{item.date}</TableCell>
                        <TableCell className="text-right text-primary font-bold">{item.points}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
             <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Family & Community Carts
                </CardTitle>
                <CardDescription>Manage your shared shopping groups.</CardDescription>
              </CardHeader>
              <CardContent>
                 {loadingCarts ? (
                     <Loader2 className="h-6 w-6 animate-spin text-primary" />
                 ) : groupCarts.length > 0 ? (
                    <div className="space-y-4">
                        {groupCarts.slice(0, 2).map(cart => (
                             <div key={cart.id} className="p-3 bg-secondary/30 rounded-lg">
                                <p className="font-semibold">{cart.name}</p>
                                <p className="text-sm text-muted-foreground">{cart.members.length} members &bull; {cart.items.reduce((acc, item: CartItem) => acc + item.quantity, 0)} items</p>
                            </div>
                        ))}
                         <Button asChild className="mt-4">
                            <Link href="/carts">Manage All Carts <ArrowRight className="ml-2 h-4 w-4"/></Link>
                        </Button>
                    </div>
                 ) : (
                    <div className="text-center">
                        <p className="text-muted-foreground">You haven't joined any group carts yet.</p>
                        <Button asChild className="mt-4">
                            <Link href="/carts">Create or Join a Cart</Link>
                        </Button>
                    </div>
                 )}
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Rewards Store
                </CardTitle>
                <CardDescription>Redeem your Eco-Points for great rewards.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {rewards.map((reward, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-primary">{reward.icon}</div>
                      <span className="font-medium">{reward.title}</span>
                    </div>
                    <Button size="sm" disabled={1250 < reward.points}>
                      {reward.points} pts
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
