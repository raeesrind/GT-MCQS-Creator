'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/providers/app-provider';
import { generateMCQs } from '@/ai/flows/generate-mcqs-from-notes';
import { parseMCQs, shuffleArray } from '@/lib/utils';
import type { Subject, UploadedFile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function PracticeTestPage() {
  const router = useRouter();
  const { uploadedFiles, setCurrentTest, setTestType } = useApp();
  const [selectedSubject, setSelectedSubject] = useState<Subject | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleStartTest = async () => {
    if (!selectedSubject) {
      toast({ title: 'Please select a subject.', variant: 'destructive' });
      return;
    }

    const fileForSubject = uploadedFiles.find(f => f.subject === selectedSubject);
    if (!fileForSubject) {
      toast({ title: 'No notes uploaded for the selected subject.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);

    try {
      const mcqParams = {
        notes: fileForSubject.content,
        numPhysics: selectedSubject === 'Physics' ? 20 : 0,
        numChemistry: selectedSubject === 'Chemistry' ? 20 : 0,
        numBiology: selectedSubject === 'Biology' ? 20 : 0,
        numEnglish: selectedSubject === 'English' ? 20 : 0,
      };

      const result = await generateMCQs(mcqParams);
      const parsed = parseMCQs(result.mcqs);

      if (parsed.length === 0) {
        toast({ title: 'Failed to generate questions.', description: 'The AI could not generate MCQs from the provided notes. Please try with a different file.', variant: 'destructive' });
        setIsLoading(false);
        return;
      }

      const testMCQs = parsed.map((mcq, index) => ({
        ...mcq,
        id: `${selectedSubject}-${index}`,
        options: shuffleArray(mcq.options),
      }));
      
      setCurrentTest(testMCQs);
      setTestType('Practice');
      router.push('/dashboard/test');
    } catch (error) {
      console.error("Failed to generate MCQs:", error);
      toast({ title: 'An error occurred.', description: 'Could not generate the test. Please try again later.', variant: 'destructive' });
      setIsLoading(false);
    }
  };

  const availableSubjects = uploadedFiles.map(f => f.subject);

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Chapter Test</CardTitle>
          <CardDescription>Generate a 20-question test from one of your uploaded subject notes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {availableSubjects.length === 0 ? (
             <Alert variant="default">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Notes Uploaded</AlertTitle>
                <AlertDescription>
                  Please upload some notes on the 'Upload Notes' page before starting a test.
                </AlertDescription>
            </Alert>
          ) : (
            <Select onValueChange={(value) => setSelectedSubject(value as Subject)} value={selectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Select a subject to test" />
              </SelectTrigger>
              <SelectContent>
                {availableSubjects.map(subject => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleStartTest} disabled={isLoading || !selectedSubject}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Generating Test...' : 'Start Test'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
