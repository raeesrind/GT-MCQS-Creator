'use client';

import { useApp } from '@/providers/app-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import OverallPerformanceChart from './OverallPerformanceChart';
import SubjectPerformanceChart from './SubjectPerformanceChart';
import TopicAnalysis from './TopicAnalysis';
import { FileQuestion } from 'lucide-react';

export default function PerformanceDashboard() {
  const { testResults } = useApp();
  const router = useRouter();

  if (testResults.length === 0) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 text-center">
        <FileQuestion className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold">No Performance Data Yet</h2>
        <p className="text-muted-foreground mt-2 mb-6 max-w-sm">
          Complete a test to see your performance analysis here.
        </p>
        <Button onClick={() => router.push('/dashboard/practice')}>
          Start a Practice Test
        </Button>
      </div>
    );
  }
  
  const totalTests = testResults.length;
  const avgScore = testResults.reduce((acc, curr) => acc + curr.overall.percentage, 0) / totalTests;
  const totalCorrect = testResults.reduce((acc, curr) => acc + curr.overall.correct, 0);
  const totalIncorrect = testResults.reduce((acc, curr) => acc + curr.overall.incorrect, 0);


  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl sm:text-3xl font-bold">{totalTests}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
             <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl sm:text-3xl font-bold">{avgScore.toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
             <CardTitle className="text-sm font-medium text-muted-foreground">Total Correct</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl sm:text-3xl font-bold text-green-600">{totalCorrect}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Incorrect</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl sm:text-3xl font-bold text-destructive">{totalIncorrect}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Trend</CardTitle>
          <CardDescription>Your overall test scores over time.</CardDescription>
        </CardHeader>
        <CardContent className="pl-0">
          <OverallPerformanceChart data={testResults} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Subject Performance</CardTitle>
            <CardDescription>Your average accuracy per subject.</CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <SubjectPerformanceChart data={testResults} />
          </CardContent>
        </Card>
        <TopicAnalysis data={testResults} />
      </div>
    </div>
  );
}
