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
import { ChevronDown, Leaf, Users, ShoppingCart, QrCode, Truck, Recycle, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function ProductPage() {
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
                <Button size="lg" className="w-full sm:w-auto">
                  Add to Cart <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuLabel>Choose a Cart</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  <span>Personal Cart</span>
                  <span className="ml-auto text-sm">$3.99</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Users className="mr-2 h-4 w-4" />
                  <span>Family Cart</span>
                  <span className="ml-auto text-sm text-primary font-medium">$3.79 (5% off)</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Leaf className="mr-2 h-4 w-4" />
                  <span>Community Cart</span>
                  <span className="ml-auto text-sm text-primary font-bold">$3.59 (10% off)</span>
                </DropdownMenuItem>
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
