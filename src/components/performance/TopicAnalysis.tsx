'use client';

import { TestResult } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useMemo } from 'react';

interface TopicAnalysisProps {
  data: TestResult[];
}

export default function TopicAnalysis({ data }: TopicAnalysisProps) {
  const topicFrequency = useMemo(() => {
    const frequency: Record<string, number> = {};
    data.forEach(test => {
      if (test.weakestTopics) {
        test.weakestTopics.split(',').forEach(topic => {
          const trimmedTopic = topic.trim();
          if(trimmedTopic) {
            frequency[trimmedTopic] = (frequency[trimmedTopic] || 0) + 1;
          }
        });
      }
    });
    return frequency;
  }, [data]);

  const sortedTopics = useMemo(() => {
    return Object.entries(topicFrequency).sort(([, a], [, b]) => b - a);
  }, [topicFrequency]);

  const weakestTopics = sortedTopics.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Lightbulb className="text-yellow-500"/>
            Topic Analysis
        </CardTitle>
        <CardDescription>
          Your most frequently suggested topics to focus on across all tests.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {weakestTopics.length > 0 ? (
          <ul className="space-y-3">
            {weakestTopics.map(([topic, count]) => (
              <li key={topic} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    <span className="font-medium">{topic}</span>
                </div>
                <span className="text-sm font-semibold text-destructive bg-destructive/10 px-2 py-1 rounded-md">
                  {count} {count > 1 ? 'times' : 'time'}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-6 text-muted-foreground flex flex-col items-center gap-3">
            <ShieldCheck className="w-10 h-10 text-green-500" />
            <p className="font-medium">No recurring weak topics found!</p>
            <p className="text-sm">Keep up the great work.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
