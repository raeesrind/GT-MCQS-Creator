import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-weakest-topics.ts';
import '@/ai/flows/generate-mcqs-from-notes.ts';
import '@/ai/flows/extract-text-from-image-flow.ts';
