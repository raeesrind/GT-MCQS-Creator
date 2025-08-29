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
  prompt: `You are an expert educator specializing in generating challenging multiple-choice questions (MCQs) from potentially unstructured, handwritten notes. Your task is to generate tricky, indirect, and rephrased questions. Do not use exact sentences from the notes. You must generate questions based *only* on the content provided in the notes.

Generate questions for the following subjects and quantities:

Physics: {{{numPhysics}}}
Chemistry: {{{numChemistry}}}
Biology: {{{numBiology}}}
English: {{{numEnglish}}}

Here are the notes:
--- NOTES START ---
{{{notes}}}
--- NOTES END ---

It is crucial that you adhere to the following format for *every single question*. Do not add any extra text or titles.

Question
Option A
Option B
Option C
Option D
Correct Answer: [Letter] - [A brief, clear explanation of why this is the correct answer]

Ensure the options are well-shuffled to avoid patterns. If the notes for a particular subject seem sparse, do your best to generate as many questions as possible based on the available information.
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
