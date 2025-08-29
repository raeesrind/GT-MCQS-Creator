'use server';

/**
 * @fileOverview This file defines a Genkit flow to suggest the weakest topics for a student based on their test history.
 *
 * - suggestWeakestTopics - An async function that takes test history as input and returns suggested weakest topics.
 * - SuggestWeakestTopicsInput - The input type for the suggestWeakestTopics function.
 * - SuggestWeakestTopicsOutput - The return type for the suggestWeakestTopics function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestWeakestTopicsInputSchema = z.object({
  testHistory: z.string().describe('A string containing the test history of the student.'),
});
export type SuggestWeakestTopicsInput = z.infer<typeof SuggestWeakestTopicsInputSchema>;

const SuggestWeakestTopicsOutputSchema = z.object({
  weakestTopics: z.string().describe('A string containing a list of the weakest topics for the student.'),
});
export type SuggestWeakestTopicsOutput = z.infer<typeof SuggestWeakestTopicsOutputSchema>;

export async function suggestWeakestTopics(input: SuggestWeakestTopicsInput): Promise<SuggestWeakestTopicsOutput> {
  return suggestWeakestTopicsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestWeakestTopicsPrompt',
  input: {schema: SuggestWeakestTopicsInputSchema},
  output: {schema: SuggestWeakestTopicsOutputSchema},
  prompt: `You are an AI assistant designed to identify the weakest topics for a student based on their test history.

  Analyze the following test history and identify the topics where the student consistently scores low.

  Test History: {{{testHistory}}}

  Provide a list of the weakest topics, separated by commas.
  `,
});

const suggestWeakestTopicsFlow = ai.defineFlow(
  {
    name: 'suggestWeakestTopicsFlow',
    inputSchema: SuggestWeakestTopicsInputSchema,
    outputSchema: SuggestWeakestTopicsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
