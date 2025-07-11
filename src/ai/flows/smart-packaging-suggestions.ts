// This file is generated by Firebase Genkit.
'use server';

/**
 * @fileOverview A flow that suggests community cart pairings based on user location to reduce packaging waste.
 *
 * - smartPackagingSuggestions - A function that handles the suggestion of community cart pairings.
 * - SmartPackagingSuggestionsInput - The input type for the smartPackagingSuggestions function.
 * - SmartPackagingSuggestionsOutput - The return type for the smartPackagingSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartPackagingSuggestionsInputSchema = z.object({
  userLocation: z
    .string()
    .describe(
      'The user location, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Corrected typo here
    ),
});
export type SmartPackagingSuggestionsInput = z.infer<
  typeof SmartPackagingSuggestionsInputSchema
>;

const SmartPackagingSuggestionsOutputSchema = z.object({
  suggestedPairings: z
    .array(z.string())
    .describe(
      'An array of user IDs or identifiers that are suggested as potential community cart pairings.'
    ),
  analysis: z
    .string()
    .describe(
      'An analysis of the user\u2019s location and potential for community cart pairings.'
    ),
});

export type SmartPackagingSuggestionsOutput = z.infer<
  typeof SmartPackagingSuggestionsOutputSchema
>;

export async function smartPackagingSuggestions(
  input: SmartPackagingSuggestionsInput
): Promise<SmartPackagingSuggestionsOutput> {
  return smartPackagingSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartPackagingSuggestionsPrompt',
  input: {schema: SmartPackagingSuggestionsInputSchema},
  output: {schema: SmartPackagingSuggestionsOutputSchema},
  prompt: `You are an AI assistant designed to analyze user locations and suggest potential community cart pairings to reduce packaging waste.

Analyze the following user location:

Location: {{media url=userLocation}}

Based on this location, suggest potential community cart pairings and provide an analysis of the potential for community cart pairings in this area.

{{#if suggestedPairings}}
  Suggested Pairings:
  {{#each suggestedPairings}}
  - {{{this}}}
  {{/each}}
{{else}}
  No pairings suggested.
{{/if}}

Analysis: {{{analysis}}}
`,
});

const smartPackagingSuggestionsFlow = ai.defineFlow(
  {
    name: 'smartPackagingSuggestionsFlow',
    inputSchema: SmartPackagingSuggestionsInputSchema,
    outputSchema: SmartPackagingSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
