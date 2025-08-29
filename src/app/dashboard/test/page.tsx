'use client';

import { useApp } from '@/providers/app-provider';
import TestView from '@/components/TestView';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TestPage() {
  const { currentTest } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!currentTest || currentTest.length === 0) {
      // Redirect if there's no active test, maybe to the practice page
      router.replace('/dashboard/practice');
    }
  }, [currentTest, router]);

  if (!currentTest || currentTest.length === 0) {
    return (
        <div className="flex items-center justify-center h-full">
            <Card className="max-w-md text-center">
                <CardHeader>
                    <CardTitle>No Active Test</CardTitle>
                    <CardDescription>It looks like you haven't started a test yet.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={() => router.push('/dashboard/practice')}>Start a Practice Test</Button>
                </CardContent>
            </Card>
        </div>
    );
  }

  return <TestView />;
}
