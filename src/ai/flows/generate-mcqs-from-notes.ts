'use server';
/**
 * @fileOverview Generates challenging MCQs from uploaded notes using AI.
 *
 * - generateMCQs - A function that generates MCQs from notes.
 * - GenerateMCQsInput - The input type for the generateMCQs function.
 * - GenerateMCQsOutput - The return type for the generateMCQs function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMCQsInputSchema = z.object({
  notes: z.string().describe('The notes to generate MCQs from.'),
  numPhysics: z.number().describe('The number of Physics MCQs to generate.').default(0),
  numChemistry: z.number().describe('The number of Chemistry MCQs to generate.').default(0),
  numBiology: z.number().describe('The number of Biology MCQs to generate.').default(0),
  numEnglish: z.number().describe('The number of English MCQs to generate.').default(0),
});
export type GenerateMCQsInput = z.infer<typeof GenerateMCQsInputSchema>;

const GenerateMCQsOutputSchema = z.object({
  mcqs: z.array(z.string()).describe('The generated MCQs.'),
});
export type GenerateMCQsOutput = z.infer<typeof GenerateMCQsOutputSchema>;

export async function generateMCQs(input: GenerateMCQsInput): Promise<GenerateMCQsOutput> {
  return generateMCQsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMCQsPrompt',
  input: {schema: GenerateMCQsInputSchema},
  output: {schema: GenerateMCQsOutputSchema},
  prompt: `You are an expert educator specializing in generating challenging multiple-choice questions (MCQs).  The MCQs should be rephrased, indirect, and tricky, not exact sentences from the provided notes. Use only the content from the notes. Generate questions for the following subjects and number of questions:

Physics: {{{numPhysics}}}
Chemistry: {{{numChemistry}}}
Biology: {{{numBiology}}}
English: {{{numEnglish}}}

Notes: {{{notes}}}

Format each question as follows:

Question
Option A
Option B
Option C
Option D
Correct Answer: [Letter] - [Short Explanation]

Ensure the options are shuffled to avoid memorization of the answer locations.
`,
});

const generateMCQsFlow = ai.defineFlow(
  {
    name: 'generateMCQsFlow',
    inputSchema: GenerateMCQsInputSchema,
    outputSchema: GenerateMCQsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
