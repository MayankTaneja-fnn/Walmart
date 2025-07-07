'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { getSmartPackagingSuggestions } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Users, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

const initialState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Analyzing...' : 'Get Suggestions'}
    </Button>
  );
}

export function SmartPackagingForm() {
  const [state, formAction] = useActionState(getSmartPackagingSuggestions, initialState);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (state.error) {
        toast({
            variant: "destructive",
            title: "Error",
            description: state.error,
        });
    }
  }, [state, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        toast({
          variant: 'destructive',
          title: 'File too large',
          description: 'Please upload an image smaller than 4MB.',
        });
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        setPreview(null);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
        setPreview(null);
    }
  };

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="location-image">Location Map Image</Label>
        <Input
          id="location-image"
          name="location-image-visible" // this is for the user to select
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          required
        />
        {/* Hidden input to hold the data URI for the server action */}
        <input type="hidden" name="locationImage" value={preview || ''} />
      </div>
      
      {preview && (
        <div className="border rounded-md p-2">
             <Image src={preview} alt="Location preview" width={500} height={300} className="rounded-md w-full h-auto object-contain max-h-64" />
        </div>
      )}

      <SubmitButton />

      {state.data && (
        <Alert variant="default" className="bg-primary/5 border-primary/20">
          <CheckCircle className="h-4 w-4 text-primary" />
          <AlertTitle className="font-headline text-lg text-primary">Analysis Complete</AlertTitle>
          <AlertDescription className="space-y-4 mt-2">
            <div>
              <h3 className="font-semibold flex items-center gap-2"><Terminal className="w-4 h-4" /> AI Analysis:</h3>
              <p className="text-muted-foreground">{state.data.analysis}</p>
            </div>
             <div>
              <h3 className="font-semibold flex items-center gap-2"><Users className="w-4 h-4" /> Suggested Pairings:</h3>
                {state.data.suggestedPairings && state.data.suggestedPairings.length > 0 ? (
                    <ul className="list-disc list-inside text-muted-foreground">
                        {state.data.suggestedPairings.map((pairing, index) => (
                            <li key={index}>{pairing}</li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-muted-foreground">No specific pairings suggested at this time.</p>
                )}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </form>
  );
}
