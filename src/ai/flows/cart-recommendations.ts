'use server';
/**
 * @fileOverview A flow that suggests recommended products based on cart items.
 *
 * - getCartRecommendations - A function that provides product recommendations.
 * - CartRecommendationsInput - The input type for the getCartRecommendations function.
 * - CartRecommendationsOutput - The return type for the getCartRecommendations function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CartRecommendationsInputSchema = z.object({
  items: z
    .array(
      z.object({
        name: z.string(),
      })
    )
    .describe("A list of items currently in the user's shopping cart."),
});
export type CartRecommendationsInput = z.infer<
  typeof CartRecommendationsInputSchema
>;

const CartRecommendationsOutputSchema = z.object({
  recommendations: z
    .array(z.string())
    .describe('An array of 3 product names to recommend to the user.'),
  reason: z
    .string()
    .describe('A short, friendly sentence explaining why these items were recommended.'),
});
export type CartRecommendationsOutput = z.infer<
  typeof CartRecommendationsOutputSchema
>;

export async function getCartRecommendations(
  input: CartRecommendationsInput
): Promise<CartRecommendationsOutput> {
  return cartRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'cartRecommendationsPrompt',
  input: { schema: CartRecommendationsInputSchema },
  output: { schema: CartRecommendationsOutputSchema },
  prompt: `You are a helpful shopping assistant for Walmart. A user has the following items in their cart:
{{#each items}}
- {{{this.name}}}
{{/each}}

Based on these items, suggest 3 other complementary products they might like. The recommendations should be products that are commonly sold at Walmart.

Also provide a short, friendly reason for your suggestions.
`,
});

const cartRecommendationsFlow = ai.defineFlow(
  {
    name: 'cartRecommendationsFlow',
    inputSchema: CartRecommendationsInputSchema,
    outputSchema: CartRecommendationsOutputSchema,
  },
  async (input) => {
    // If the cart is empty, return empty recommendations
    if (input.items.length === 0) {
      return {
        recommendations: [],
        reason: 'Add some items to your cart to get personalized recommendations!',
      };
    }
    const { output } = await prompt(input);
    return output!;
  }
);
