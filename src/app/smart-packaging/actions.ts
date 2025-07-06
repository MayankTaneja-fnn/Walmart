'use server';

import { smartPackagingSuggestions, type SmartPackagingSuggestionsOutput } from '@/ai/flows/smart-packaging-suggestions';
import { z } from 'zod';

const formSchema = z.object({
  locationImage: z.string({ required_error: 'Image is required.' }).startsWith('data:image/', { message: 'Invalid image format.' }),
});

type State = {
    message?: string;
    data?: SmartPackagingSuggestionsOutput;
    error?: string;
};

export async function getSmartPackagingSuggestions(
  prevState: State,
  formData: FormData
): Promise<State> {
  const validatedFields = formSchema.safeParse({
    locationImage: formData.get('locationImage'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.locationImage?.[0]
    };
  }

  try {
    const result = await smartPackagingSuggestions({
      userLocation: validatedFields.data.locationImage,
    });
    return { message: 'Success', data: result };
  } catch (e: any) {
    console.error(e);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}
