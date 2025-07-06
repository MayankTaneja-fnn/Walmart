import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Leaf, Gift, Package, Recycle, Users, History } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

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
]

export default function ProfilePage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="font-headline text-4xl font-bold mb-8">My Account</h1>
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
              <CardDescription>This is a placeholder for account settings.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>User account details and settings will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="eco" className="space-y-8">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="col-span-1 md:col-span-1 flex flex-col justify-center items-center text-center shadow-lg">
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
                <CardTitle className="flex items-center gap-2"><History className="w-5 h-5"/>Recent Eco-Activity</CardTitle>
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
                <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5"/>Family & Community Cart</CardTitle>
                <CardDescription>Manage your shared shopping groups.</CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="space-y-4">
                    <h3 className="font-semibold">The Hillside Neighbors</h3>
                    <div className="flex items-center gap-4">
                        <Avatar>
                            <AvatarImage src="https://placehold.co/40x40.png" />
                            <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <Avatar>
                            <AvatarImage src="https://placehold.co/40x40.png" />
                            <AvatarFallback>AS</AvatarFallback>
                        </Avatar>
                         <Avatar>
                            <AvatarImage src="https://placehold.co/40x40.png" />
                            <AvatarFallback>ME</AvatarFallback>
                        </Avatar>
                        <p className="text-sm text-muted-foreground">+ 2 others</p>
                    </div>
                    <Button asChild>
                        <Link href="/carts">Manage Carts</Link>
                    </Button>
                 </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Gift className="w-5 h-5"/>Rewards Store</CardTitle>
                <CardDescription>Redeem your Eco-Points for great rewards.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {rewards.map((reward, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="text-primary">{reward.icon}</div>
                            <span className="font-medium">{reward.title}</span>
                        </div>
                        <Button size="sm" disabled={1250 < reward.points}>{reward.points} pts</Button>
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
