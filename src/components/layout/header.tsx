'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Leaf, Menu, Search, ShoppingCart, User, Grid3X3, Heart } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/product', label: 'All Products' },
  { href: '/eco-features', label: 'Eco Features' },
  { href: '/smart-packaging', label: 'Smart Packaging' },
  { href: '/carts', label: 'Community Carts' },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 max-w-screen-2xl items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mr-4">
          <Button variant="ghost" size="icon" className="w-12 h-12 bg-primary hover:bg-primary/90 text-primary-foreground hover:text-primary-foreground rounded-full">
            <Leaf className="h-6 w-6" />
          </Button>
          <span className="font-bold text-2xl hidden md:block text-primary font-headline">EcoCart</span>
        </Link>
        
        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="flex flex-col gap-6 text-lg font-medium mt-8">
                <Link href="/" className="flex items-center gap-2 text-lg font-semibold mb-4">
                    <Leaf className="h-6 w-6 text-primary" />
                    <span className="font-bold font-headline">EcoCart</span>
                </Link>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'transition-colors hover:text-primary',
                       pathname === link.href ? 'text-primary' : 'text-muted-foreground'
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                 <Link
                    href={'/profile'}
                    className={cn(
                      'transition-colors hover:text-primary',
                       pathname === '/profile' ? 'text-primary' : 'text-muted-foreground'
                    )}
                  >
                    Account
                  </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-xl relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input placeholder="Search everything at EcoCart online..." className="pl-10 h-11" />
           <Button type="submit" className="absolute right-0 top-0 h-11 rounded-l-none bg-accent hover:bg-accent/90 text-accent-foreground">
              Search
           </Button>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="hidden md:flex flex-col h-auto p-2">
            <Heart className="h-6 w-6" />
            <span className="text-xs">Lists</span>
          </Button>
          <Button variant="ghost" asChild className="hidden md:flex flex-col h-auto p-2">
            <Link href="/profile">
              <User className="h-6 w-6" />
              <span className="text-xs">Account</span>
            </Link>
          </Button>
          <Button variant="ghost" asChild className="flex flex-col h-auto p-2">
            <Link href="/checkout">
              <ShoppingCart className="h-6 w-6" />
              <span className="text-xs">Cart</span>
            </Link>
          </Button>
        </div>
      </div>
      
      <nav className="hidden md:flex border-t border-border/40">
        <div className="container flex h-12 max-w-screen-2xl items-center gap-6 text-sm font-medium">
            <Button variant="ghost" size="sm" className="font-bold">
                <Grid3X3 className="mr-2 h-4 w-4"/>
                Departments
            </Button>
            {navLinks.map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                        'transition-colors hover:text-primary',
                        pathname === link.href ? 'text-primary' : 'text-muted-foreground'
                    )}
                >
                    {link.label}
                </Link>
            ))}
        </div>
      </nav>
    </header>
  );
}
