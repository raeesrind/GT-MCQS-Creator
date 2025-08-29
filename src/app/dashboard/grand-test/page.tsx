'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/providers/app-provider';
import { generateMCQs } from '@/ai/flows/generate-mcqs-from-notes';
import { parseMCQs, shuffleArray } from '@/lib/utils';
import { ALL_SUBJECTS, ParsedMCQ, Subject } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function GrandTestPage() {
  const router = useRouter();
  const { uploadedFiles, setCurrentTest, setTestType } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const subjectsWithNotes = new Set(uploadedFiles.map(f => f.subject));
  const requiredSubjects: Subject[] = ['Physics', 'Chemistry', 'Biology'];
  const missingSubjects = requiredSubjects.filter(s => !subjectsWithNotes.has(s));
  const canStartTest = missingSubjects.length === 0;

  const handleStartTest = async () => {
    if (!canStartTest) {
      toast({ title: 'Missing Notes', description: `Please upload notes for: ${missingSubjects.join(', ')}.`, variant: 'destructive' });
      return;
    }

    setIsLoading(true);

    try {
      const notesContent = uploadedFiles
        .map(f => `--- Notes for ${f.subject} ---\n${f.content}`)
        .join('\n\n');
      
      const mcqParams = {
        notes: notesContent,
        numPhysics: 30,
        numChemistry: 30,
        numBiology: 30,
        numEnglish: 10, // Assuming English notes might also be uploaded
      };

      const result = await generateMCQs(mcqParams);
      const parsed = parseMCQs(result.mcqs);
      
      if (parsed.length < 90) { // Check if we got a reasonable number of questions
        toast({ title: 'Failed to generate enough questions.', description: 'The AI could not generate a full test. Please try with more comprehensive notes.', variant: 'destructive' });
        setIsLoading(false);
        return;
      }
      
      const testMCQs = parsed.map((mcq, index) => ({
        ...mcq,
        id: `grand-${index}`,
        options: shuffleArray(mcq.options),
      }));

      setCurrentTest(testMCQs);
      setTestType('Grand');
      router.push('/dashboard/test');
    } catch (error) {
      console.error("Failed to generate MCQs:", error);
      toast({ title: 'An error occurred.', description: 'Could not generate the grand test. Please try again later.', variant: 'destructive' });
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Grand Test</CardTitle>
          <CardDescription>
            Take a full-length mock test with 100 questions: 30 each from Physics, Chemistry, and Biology, plus 10 from English.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!canStartTest ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Missing Notes</AlertTitle>
              <AlertDescription>
                You need to upload notes for the following subjects to start a Grand Test: <strong>{missingSubjects.join(', ')}</strong>.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Ready to Go!</AlertTitle>
              <AlertDescription>
                You have uploaded notes for all required subjects. You can now start the Grand Test.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleStartTest} disabled={isLoading || !canStartTest}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Generating Grand Test...' : 'Start Grand Test'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
