'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { UploadedFile, TestResult, ParsedMCQ } from '@/lib/types';
import useLocalStorage from '@/hooks/use-local-storage';
import ClientOnly from '@/components/ClientOnly';

interface AppContextValue {
  isLoaded: boolean;
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

const AppContext = createContext<AppContextValue | undefined>(undefined);

function AppProviderContent({ children }: { children: ReactNode }) {
  const [uploadedFiles, setUploadedFiles, filesLoaded] = useLocalStorage<UploadedFile[]>('uploadedFiles', []);
  const [testResults, setTestResults, resultsLoaded] = useLocalStorage<TestResult[]>('testResults', []);
  const [currentTest, setCurrentTest, testLoaded] = useLocalStorage<ParsedMCQ[]>('currentTest', []);
  const [testType, setTestType, typeLoaded] = useLocalStorage<'Practice' | 'Grand' | null>('testType', null);

  const isLoaded = filesLoaded && resultsLoaded && testLoaded && typeLoaded;

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
    isLoaded,
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

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}


export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <ClientOnly>
      <AppProviderContent>{children}</AppProviderContent>
    </ClientOnly>
  )
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
