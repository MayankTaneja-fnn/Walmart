import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, PlusCircle } from "lucide-react";
import Link from "next/link";

export default function CartsPage() {
    return (
        <div className="container mx-auto max-w-4xl py-12 px-4">
            <div className="text-center mb-12">
                <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">
                    Family & Community Carts
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    Shop together to save money, reduce packaging, and lower your carbon footprint.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <Card className="shadow-lg">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <PlusCircle className="w-8 h-8 text-primary" />
                            <CardTitle className="font-headline text-2xl">Create a New Cart</CardTitle>
                        </div>
                        <CardDescription>Start a new group with your family, friends, or neighbors.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                            As the creator, you can invite members, set a delivery address, and manage the group.
                        </p>
                        <Button className="w-full">Create a Cart</Button>
                    </CardContent>
                </Card>

                <Card className="shadow-lg">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Users className="w-8 h-8 text-primary" />
                            <CardTitle className="font-headline text-2xl">Join an Existing Cart</CardTitle>
                        </div>
                        <CardDescription>Already have an invite code? Join a group here.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                            Enter the invite code from a friend to start shopping together.
                        </p>
                        <Button variant="secondary" className="w-full">Join with Code</Button>
                    </CardContent>
                </Card>
            </div>

             <div className="text-center mt-16">
                <h2 className="font-headline text-2xl font-bold">Your Carts</h2>
                <p className="text-muted-foreground mt-2 mb-6">You are not currently a member of any carts.</p>
                <Button variant="outline" asChild>
                    <Link href="/profile">Back to My Eco Hub</Link>
                </Button>
            </div>
        </div>
    )
}
