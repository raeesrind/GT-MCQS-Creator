'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/providers/app-provider';
import { suggestWeakestTopics } from '@/ai/flows/suggest-weakest-topics';
import { ParsedMCQ, TestResult, Subject, SubjectResult, ALL_SUBJECTS } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import ScoreCard from './ScoreCard';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function TestView() {
  const { currentTest, testType, addTestResult, uploadedFiles } = useApp();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(string | undefined)[]>(new Array(currentTest.length).fill(undefined));
  const [isFinished, setIsFinished] = useState(false);
  const [finalResult, setFinalResult] = useState<TestResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const currentMCQ = useMemo(() => currentTest[currentQuestionIndex], [currentTest, currentQuestionIndex]);

  const handleNext = () => {
    if (currentQuestionIndex < currentTest.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleAnswerSelect = (value: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = value;
    setUserAnswers(newAnswers);
  };

  const getSubjectForQuestion = (mcq: ParsedMCQ): Subject => {
    if (testType === 'Practice') {
        const subject = mcq.id.split('-')[0] as Subject;
        return subject;
    }
    // For grand test, we need a more robust way if not in ID.
    // A simple heuristic for now.
    const content = `${mcq.question} ${mcq.explanation}`.toLowerCase();
    if (content.includes('physic') || content.includes('motion') || content.includes('energy')) return 'Physics';
    if (content.includes('chemic') || content.includes('reaction') || content.includes('element')) return 'Chemistry';
    if (content.includes('biolog') || content.includes('cell') || content.includes('organism')) return 'Biology';
    return 'English';
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    let correctCount = 0;
    const subjectResults: Record<Subject, { correct: number; total: number }> = {
      Physics: { correct: 0, total: 0 },
      Chemistry: { correct: 0, total: 0 },
      Biology: { correct: 0, total: 0 },
      English: { correct: 0, total: 0 },
    };
    
    let testHistoryString = '';

    currentTest.forEach((mcq, index) => {
      const subject = getSubjectForQuestion(mcq);
      subjectResults[subject].total++;
      if (userAnswers[index] === mcq.correctAnswer) {
        correctCount++;
        subjectResults[subject].correct++;
      }
      testHistoryString += `Q${index+1} (${subject}): ${userAnswers[index] === mcq.correctAnswer ? 'Correct' : 'Incorrect'}. Correct was ${mcq.correctAnswer}. My answer: ${userAnswers[index]}. \n`;
    });

    let suggestedTopics = '';
    try {
      const result = await suggestWeakestTopics({ testHistory: testHistoryString });
      suggestedTopics = result.weakestTopics;
    } catch (error) {
      console.error("Failed to get topic suggestions:", error);
      toast({
        title: 'Could not get AI suggestions',
        description: 'There was an issue contacting the AI for topic suggestions. You can still see your score.',
        variant: 'destructive',
      });
      // Continue without suggestions
    }


    const totalQuestions = currentTest.length;
    const score = correctCount;
    const incorrect = totalQuestions - correctCount;
    const percentage = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
    
    const finalSubjectResults: SubjectResult[] = (Object.keys(subjectResults) as Subject[])
        .filter(key => subjectResults[key].total > 0)
        .map(key => {
            const subject = key as Subject;
            const res = subjectResults[subject];
            return {
                subject,
                score: res.correct,
                correct: res.correct,
                incorrect: res.total - res.correct,
                total: res.total,
                percentage: res.total > 0 ? (res.correct / res.total) * 100 : 0,
            }
        });

    const result: TestResult = {
      id: `test-${Date.now()}`,
      date: new Date().toISOString(),
      type: testType || 'Practice',
      results: finalSubjectResults,
      overall: { score, correct: correctCount, incorrect, percentage },
      weakestTopics: suggestedTopics,
    };
    
    addTestResult(result);
    setFinalResult(result);
    setIsFinished(true);
    setIsSubmitting(false);
  };

  if (isFinished && finalResult) {
    return <ScoreCard result={finalResult} />;
  }
  
  if (!currentMCQ) {
    return <div className="text-center p-8">Loading test...</div>
  }

  const progress = ((currentQuestionIndex + 1) / currentTest.length) * 100;

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>{testType} Test</CardTitle>
        <div className="flex items-center gap-4 pt-2">
            <span className="text-sm font-medium text-muted-foreground">Question {currentQuestionIndex + 1} of {currentTest.length}</span>
            <Progress value={progress} className="w-full" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-lg font-semibold leading-relaxed">{currentMCQ.question}</p>
        <RadioGroup value={userAnswers[currentQuestionIndex]} onValueChange={handleAnswerSelect}>
          {currentMCQ.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2 p-3 rounded-lg border has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
              <RadioGroupItem value={option} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-base">{option}</Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
      <CardFooter className="flex justify-end">
        {currentQuestionIndex < currentTest.length - 1 ? (
          <Button onClick={handleNext}>Next Question</Button>
        ) : (
          <Button onClick={handleFinish} disabled={isSubmitting}>
             {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
             {isSubmitting ? 'Calculating Results...' : 'Finish & View Results'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
