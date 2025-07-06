import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Gift, Package, ThumbsUp, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const categories = [
  { name: 'Groceries', href: '/product', image: 'https://placehold.co/300x300.png', hint: 'groceries shelf' },
  { name: 'Household', href: '/product', image: 'https://placehold.co/300x300.png', hint: 'cleaning supplies' },
  { name: 'Electronics', href: '/product', image: 'https://placehold.co/300x300.png', hint: 'modern electronics' },
  { name: 'Apparel', href: '/product', image: 'https://placehold.co/300x300.png', hint: 'clothing rack' },
];

const featuredProducts = [
  { name: 'Organic Bananas', price: '$1.29', image: 'https://placehold.co/300x300.png', hint: 'organic bananas' },
  { name: 'Recycled Paper Towels', price: '$5.99', image: 'https://placehold.co/300x300.png', hint: 'paper towels' },
  { name: 'Fair-Trade Coffee', price: '$12.49', image: 'https://placehold.co/300x300.png', hint: 'coffee beans' },
  { name: 'Bamboo Toothbrush Set', price: '$8.99', image: 'https://placehold.co/300x300.png', hint: 'bamboo toothbrush' },
];

const ecoFeatures = [
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "Community Carts",
      description: "Share orders with neighbors to reduce deliveries and packaging waste.",
      href: "/carts"
    },
    {
      icon: <Package className="w-8 h-8 text-primary" />,
      title: "Smart Packaging",
      description: "Our AI finds opportunities to combine packaging for nearby orders.",
      href: "/smart-packaging"
    },
    {
      icon: <Gift className="w-8 h-8 text-primary" />,
      title: "Eco-Points Rewards",
      description: "Earn points for sustainable choices and redeem them for discounts.",
      href: "/profile"
    },
    {
      icon: <ThumbsUp className="w-8 h-8 text-primary" />,
      title: "Sustainable Brands",
      description: "Shop from a curated selection of brands committed to the planet.",
      href: "/product"
    }
]

export default function Home() {
  return (
    <div className="flex flex-col items-center bg-muted/20">
      <section className="w-full">
        <div className="container mx-auto px-4 pt-8 pb-12">
          <div className="relative rounded-lg overflow-hidden">
            <Image
              src="https://placehold.co/1200x400.png"
              alt="Eco-friendly products banner"
              width={1200}
              height={400}
              className="w-full h-auto object-cover"
              data-ai-hint="sustainable products nature"
            />
            <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-center p-4">
                <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight font-headline">
                    Save Money. Live Better. Sustainably.
                </h1>
                <p className="mt-4 text-lg md:text-xl text-white/90 max-w-3xl">
                    Great value and eco-friendly choices all in one place.
                </p>
                <Button asChild size="lg" className="mt-8 bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Link href="/product">Shop All Deals</Link>
                </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 font-headline">Shop by Department</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {categories.map((category) => (
              <Link href={category.href} key={category.name}>
                <div className="group text-center">
                    <div className="rounded-full overflow-hidden w-32 h-32 md:w-48 md:h-48 mx-auto border-2 border-transparent group-hover:border-primary transition-all">
                        <Image
                            src={category.image}
                            alt={category.name}
                            width={200}
                            height={200}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            data-ai-hint={category.hint}
                        />
                    </div>
                    <p className="mt-4 font-semibold text-lg">{category.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 font-headline">Featured Eco-Friendly Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Card key={product.name} className="overflow-hidden group">
                <CardContent className="p-0">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={300}
                    height={300}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                    data-ai-hint={product.hint}
                  />
                </CardContent>
                <div className="p-4">
                    <h3 className="font-semibold truncate">{product.name}</h3>
                    <div className="flex justify-between items-center mt-2">
                        <p className="text-lg font-bold text-primary">{product.price}</p>
                        <Button size="sm" variant="secondary">Add</Button>
                    </div>
                </div>
              </Card>
            ))}
          </div>
           <div className="text-center mt-12">
                <Button asChild size="lg" variant="outline">
                    <Link href="/product">Shop All Products</Link>
                </Button>
            </div>
        </div>
      </section>
      
      <section className="w-full py-16 bg-background">
        <div className="container mx-auto px-4">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold font-headline">Shop Green, Live Full</h2>
                <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">EcoCart makes it easy to make a positive impact. Here’s how we help you and the planet.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {ecoFeatures.map(feature => (
                    <div key={feature.title} className="text-center">
                        <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit mb-4">
                           {feature.icon}
                        </div>
                        <h3 className="font-bold text-lg">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                         <Button asChild variant="link" size="sm" className="mt-2">
                            <Link href={feature.href}>Learn More <ArrowRight className="ml-1 h-4 w-4" /></Link>
                        </Button>
                    </div>
                ))}
            </div>
        </div>
      </section>

    </div>
  );
}
