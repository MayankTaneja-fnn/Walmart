import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Leaf, Package, QrCode, Sparkles, Users } from 'lucide-react';
import Link from 'next/link';

export default function EcoFeaturesPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">
          Our Sustainability Features
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Learn how you can make a difference with every order you place on EcoCart.
        </p>
      </div>

      <Card className="shadow-lg">
        <CardContent className="p-8">
          <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1">
              <AccordionTrigger className="font-headline text-xl">
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-primary" />
                  Family & Community Accounts
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground pt-2">
                Combine orders with family or neighbors into a shared cart. This reduces the number of delivery trips, cuts down on packaging materials, and minimizes transportation emissions. It’s a simple way to make a big impact, together.
                <Button asChild className="mt-4">
                    <Link href="/carts">Create or Join a Cart</Link>
                </Button>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="font-headline text-xl">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-primary" />
                  Eco-Points System
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground pt-2">
                Our gamified rewards system for your sustainable actions. Earn points for using community carts, returning packaging, opting out of plastics, and more. Redeem your Eco-Points for exclusive rewards and discounts, making green choices even more satisfying.
                 <Button asChild className="mt-4">
                    <Link href="/profile">View My Eco-Points</Link>
                </Button>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="font-headline text-xl">
                <div className="flex items-center gap-3">
                  <QrCode className="w-6 h-6 text-primary" />
                   Eco-QR for Products
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground pt-2">
                Scan the Eco-QR code on any product page or packaging to unlock a world of information. You'll find details on the product's carbon footprint, its journey from origin to you, and clear instructions for proper disposal or recycling. Knowledge is power—the power to consume responsibly.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger className="font-headline text-xl">
                <div className="flex items-center gap-3">
                  <Package className="w-6 h-6 text-primary" />
                  Smart Packaging Opt-In
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground pt-2">
                During checkout, you can choose to combine your order's packaging with neighbors' orders. Our system intelligently groups nearby deliveries, significantly reducing cardboard waste and the number of delivery trips. It’s community-led waste reduction, powered by smart technology.
                 <Button asChild className="mt-4">
                    <Link href="/smart-packaging">Learn about Smart Packaging</Link>
                </Button>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
