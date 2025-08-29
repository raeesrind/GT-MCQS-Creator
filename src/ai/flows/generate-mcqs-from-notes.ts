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
  notes: z.string().describe('The notes to generate MCQs from. Can include specific topics like "Thermodynamics" or "Genetics".'),
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
  prompt: `You are an AI that generates exam-style multiple-choice questions (MCQs) from extracted study material. Your task is to generate tricky, indirect, and rephrased questions based *only* on the content provided in the notes. If a specific topic (e.g., Thermodynamics, Genetics) is mentioned, all questions should be from that topic.

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

Question: [Your question here]
A; [Option A text]
B; [Option B text]
C; [Option C text]
D; [Option D text]
Correct Answer: [Letter] - [A brief, clear explanation of why this is the correct answer]

Instructions for options:
- Sometimes, instead of only single-answer choices, include combined answers such as "Both A and B", "B and C", or "A and D".
- Sometimes, include a special option: "NOT" or "AOT", which means "None of the above".
- Ensure at least one option is correct. The correct answer should be derived from the provided notes.
- Options should be plausible but not too obvious.
- The difficulty should vary (easy, medium, hard).

Example 1:
Question: What is the chemical formula of water?
A; H₂O
B; CO₂
C; O₂
D; Both A and C
Correct Answer: A - H₂O is the chemical formula for water.

Example 2:
Question: Which of the following are noble gases?
A; Helium
B; Neon
C; Oxygen
D; Both A and B
Correct Answer: D - Helium and Neon are both noble gases.

Example 3:
Question: Mitosis is a process of:
A; Cell division
B; Protein synthesis
C; Both A and B
D; NOT
Correct Answer: A - Mitosis is a type of cell division.
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
