import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { type MCQ } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function parseMCQs(mcqStrings: string[]): MCQ[] {
  const mcqs: MCQ[] = [];

  for (const mcqString of mcqStrings) {
    const lines = mcqString.trim().split('\n').filter(line => line.trim() !== '');
    if (lines.length < 6) continue;

    try {
      const question = lines[0];
      const options = lines.slice(1, 5);
      const answerLine = lines.slice(5).join('\n');
      
      const answerMatch = answerLine.match(/Correct Answer:.*?\[(A|B|C|D)\]\s*-\s*(.*)/is);

      if (!answerMatch) {
        console.warn("Could not parse answer line:", answerLine);
        continue;
      };

      const [_, correctLetter, explanation] = answerMatch;
      
      const optionMap: { [key: string]: number } = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
      const correctIndex = optionMap[correctLetter.toUpperCase() as 'A' | 'B' | 'C' | 'D'];
      const correctAnswer = options[correctIndex]?.replace(/^[A-D]\)\s*/, '');

      if (!correctAnswer) {
        console.warn("Could not find correct answer for letter:", correctLetter);
        continue;
      }
      
      mcqs.push({
        question,
        options: options.map(opt => opt.replace(/^[A-D]\)\s*/, '')),
        correctAnswer: correctAnswer,
        explanation: explanation.trim(),
      });
    } catch (error) {
      console.error("Failed to parse MCQ string:", mcqString, error);
    }
  }

  return mcqs;
}

export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
