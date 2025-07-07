'use client';

import { useEffect } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { createGroupCart } from '@/app/cart/actions';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';

interface CreateCartState {
  error?: string;
  success?: boolean;
}

const initialState: CreateCartState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Creating...' : 'Create Cart'}
    </Button>
  );
}

export function CreateCartDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [state, formAction] = useActionState<CreateCartState, FormData>(createGroupCart, initialState);
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user && open) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'Please log in to create a cart.',
      });
      onOpenChange(false);
      router.push('/login');
    }
  }, [user, open, toast, onOpenChange, router]);

  useEffect(() => {
    if (state?.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.error,
      });
    }
    if (state?.success) {
      toast({
        title: 'Success!',
        description: 'Your new group cart has been created.',
      });
      onOpenChange(false);
    }
  }, [state, toast, onOpenChange]);


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>Create a New Group Cart</DialogTitle>
            <DialogDescription>
              Start a shared cart with family or friends to save together.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Cart Nickname</Label>
              <Input id="name" name="name" placeholder="e.g., The Hillside Neighbors" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Delivery Address</Label>
              <Textarea
                id="address"
                name="address"
                placeholder="Enter the main delivery address for this group."
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Cart Type</Label>
              <RadioGroup defaultValue="family" name="type" className="flex gap-4">
                <div>
                  <RadioGroupItem value="family" id="family" />
                  <Label htmlFor="family" className="ml-2">Family</Label>
                </div>
                <div>
                  <RadioGroupItem value="community" id="community" />
                  <Label htmlFor="community" className="ml-2">Community</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {state?.error && (
            <Alert variant="destructive" className="mb-4">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Oops!</AlertTitle>
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
