'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { UploadedFile, TestResult, ParsedMCQ } from '@/lib/types';
import useLocalStorage from '@/hooks/use-local-storage';

interface AppState {
  uploadedFiles: UploadedFile[];
  setUploadedFiles: (files: UploadedFile[]) => void;
  addFile: (file: UploadedFile) => void;
  removeFile: (id: string) => void;
  testResults: TestResult[];
  addTestResult: (result: TestResult) => void;
  currentTest: ParsedMCQ[];
  setCurrentTest: (mcqs: ParsedMCQ[]) => void;
  testType: 'Practice' | 'Grand' | null;
  setTestType: (type: 'Practice' | 'Grand' | null) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [testResults, setTestResults] = useLocalStorage<TestResult[]>('testResults', []);
  const [currentTest, setCurrentTest] = useState<ParsedMCQ[]>([]);
  const [testType, setTestType] = useState<'Practice' | 'Grand' | null>(null);

  const addFile = (file: UploadedFile) => {
    setUploadedFiles((prev) => [...prev.filter(f => f.subject !== file.subject), file]);
  };

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const addTestResult = (result: TestResult) => {
    setTestResults((prev) => [...prev, result]);
  };

  const value = {
    uploadedFiles,
    setUploadedFiles,
    addFile,
    removeFile,
    testResults,
    addTestResult,
    currentTest,
    setCurrentTest,
    testType,
    setTestType,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
