import { WalmartLogo } from '@/components/icons/walmart-logo';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-muted/30 border-t border-border/40">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-2 rounded-full">
                <WalmartLogo className="h-6 w-6" />
            </div>
            <span className="font-bold text-xl text-primary font-headline">Walmart</span>
          </Link>
          <p className="max-w-md mx-auto mt-4 text-sm text-muted-foreground">
            Making sustainable shopping simple, rewarding, and accessible for everyone.
          </p>
          <div className="flex flex-wrap justify-center mt-6 -mx-4">
            <Link href="/eco-features" className="mx-4 text-sm text-muted-foreground hover:text-primary">
              Features
            </Link>
            <Link href="/profile" className="mx-4 text-sm text-muted-foreground hover:text-primary">
              My Account
            </Link>
             <Link href="/product" className="mx-4 text-sm text-muted-foreground hover:text-primary">
              Products
            </Link>
            <Link href="#" className="mx-4 text-sm text-muted-foreground hover:text-primary">
              Privacy Policy
            </Link>
          </div>
        </div>
        <hr className="my-6 border-border" />
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Walmart. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
