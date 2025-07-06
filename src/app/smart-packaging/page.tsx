import { SmartPackagingForm } from './smart-packaging-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, BrainCircuit } from 'lucide-react';

export default function SmartPackagingPage() {
  return (
    <div className="container mx-auto max-w-3xl py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">
          Smart Packaging Suggestions
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Use our AI-powered tool to see if a community-led waste reduction scheme is viable in your area and get suggestions for cart pairings.
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <BrainCircuit className="w-8 h-8 text-primary" />
            <CardTitle className="font-headline text-2xl">Location Analysis</CardTitle>
          </div>
          <CardDescription>
            Upload an image of your neighborhood map (e.g., a screenshot from Google Maps) to get started. Your exact address is not required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SmartPackagingForm />
        </CardContent>
      </Card>
    </div>
  );
}
