export type Subject = 'Physics' | 'Chemistry' | 'Biology' | 'English';

export const ALL_SUBJECTS: Subject[] = ['Physics', 'Chemistry', 'Biology', 'English'];

export interface UploadedFile {
  id: string;
  name: string;
  subject: Subject;
  content: string;
  size: number;
}

export interface MCQ {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface ParsedMCQ extends MCQ {
  id: string;
  userAnswer?: string;
}

export interface TestResult {
  id: string;
  date: string;
  type: 'Practice' | 'Grand';
  mcqs: ParsedMCQ[];
  userAnswers: (string | undefined)[];
  results: SubjectResult[];
  overall: {
    score: number;
    correct: number;
    incorrect: number;
    percentage: number;
  };
  weakestTopics: string;
}

export interface SubjectResult {
  subject: Subject;
  score: number;
  correct: number;
  incorrect: number;
  total: number;
  percentage: number;
}
