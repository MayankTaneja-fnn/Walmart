import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Leaf, Package, Recycle, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const cartItems = [
    { name: 'Fresh Organic Apples', price: 3.99, quantity: 2, image: 'https://placehold.co/100x100.png', hint: 'organic apples' },
    { name: 'Whole Grain Bread', price: 4.50, quantity: 1, image: 'https://placehold.co/100x100.png', hint: 'bread' },
];

const ecoOptions = [
    { id: 'return-packaging', label: 'Return packaging to delivery agent', points: 15, icon: <Recycle className="w-5 h-5 text-primary" /> },
    { id: 'no-plastic', label: 'Opt-out of plastic packaging', points: 10, icon: <Leaf className="w-5 h-5 text-primary" /> },
    { id: 'own-bag', label: 'Bring own carry bag (for in-store pickup)', points: 5, icon: <ShoppingBag className="w-5 h-5 text-primary" /> },
    { id: 'club-packaging', label: 'Club my packaging with nearby orders (Smart Packaging)', points: 25, icon: <Package className="w-5 h-5 text-primary" /> },
];

export default function CheckoutPage() {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    return (
        <div className="container mx-auto py-12 px-4">
            <h1 className="font-headline text-4xl font-bold mb-8 text-center">Checkout</h1>
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle>Eco-Friendly Options</CardTitle>
                            <CardDescription>Select actions to earn Eco-Points and help the planet.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {ecoOptions.map((option, index) => (
                                <div key={option.id} className="flex items-center space-x-4 p-4 rounded-lg bg-secondary/30">
                                    <Checkbox id={option.id} className="h-5 w-5" />
                                    <div className="flex-grow flex items-center gap-3">
                                        {option.icon}
                                        <Label htmlFor={option.id} className="text-base cursor-pointer">
                                            {option.label}
                                        </Label>
                                    </div>
                                    <span className="font-bold text-primary whitespace-nowrap">+{option.points} pts</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1">
                    <Card className="shadow-lg sticky top-24">
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {cartItems.map(item => (
                                    <div key={item.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <Image src={item.image} alt={item.name} width={50} height={50} className="rounded-md" data-ai-hint={item.hint} />
                                            <div>
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                            </div>
                                        </div>
                                        <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                            <Separator className="my-6" />
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <p className="text-muted-foreground">Subtotal</p>
                                    <p className="font-medium">${subtotal.toFixed(2)}</p>
                                </div>
                                <div className="flex justify-between">
                                    <p className="text-muted-foreground">Taxes</p>
                                    <p className="font-medium">${tax.toFixed(2)}</p>
                                </div>
                            </div>
                            <Separator className="my-6" />
                            <div className="flex justify-between font-bold text-xl">
                                <p>Total</p>
                                <p>${total.toFixed(2)}</p>
                            </div>
                             <Button size="lg" className="w-full mt-6">
                                Proceed to Payment
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
