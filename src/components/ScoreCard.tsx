'use client';

import { TestResult } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Award, Target, Book, Lightbulb } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import ReviewView from './ReviewView';

interface ScoreCardProps {
  result: TestResult;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/80 backdrop-blur-sm p-2 border rounded-lg shadow-lg">
        <p className="font-bold">{label}</p>
        <p className="text-sm text-primary">{`Accuracy: ${payload[0].value}%`}</p>
        <p className="text-xs text-muted-foreground">{`Correct: ${payload[0].payload.correct} / ${payload[0].payload.total}`}</p>
      </div>
    );
  }
  return null;
};


export default function ScoreCard({ result }: ScoreCardProps) {
  const router = useRouter();
  const chartData = result.results.map(r => ({
    name: r.subject.substring(0, 3),
    subject: r.subject,
    accuracy: r.percentage,
    correct: r.correct,
    total: r.total,
  }));

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl font-bold">Test Completed!</CardTitle>
          <CardDescription>Here's your performance summary for the {result.type} Test.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-secondary">
            <Award className="w-10 h-10 text-primary mb-2" />
            <p className="text-2xl sm:text-3xl font-bold">{result.overall.percentage.toFixed(1)}%</p>
            <p className="text-muted-foreground">Overall Score</p>
          </div>
          <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-secondary">
            <Target className="w-10 h-10 text-green-500 mb-2" />
            <p className="text-2xl sm:text-3xl font-bold">{result.overall.correct}</p>
            <p className="text-muted-foreground">Correct Answers</p>
          </div>
          <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-secondary">
            <Book className="w-10 h-10 text-destructive mb-2" />
            <p className="text-2xl sm:text-3xl font-bold">{result.overall.incorrect}</p>
            <p className="text-muted-foreground">Incorrect Answers</p>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Subject-wise Performance</CardTitle>
                <CardDescription>Your accuracy in each subject.</CardDescription>
            </CardHeader>
            <CardContent className="pl-0">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis unit="%" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--secondary))' }}/>
                  <Bar dataKey="accuracy" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="accuracy" position="top" formatter={(value: number) => `${value.toFixed(0)}%`} fontSize={12} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="text-yellow-500" />
                    Focus Areas
                </CardTitle>
                <CardDescription>AI-suggested topics to focus on based on your performance.</CardDescription>
            </CardHeader>
            <CardContent>
                {result.weakestTopics ? (
                     <div className="flex flex-wrap gap-2">
                        {result.weakestTopics.split(',').map((topic, index) => (
                            <div key={index} className="bg-amber-100 text-amber-800 text-sm font-medium px-3 py-1 rounded-full">
                                {topic.trim()}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground">Great job! No specific weak areas were identified.</p>
                )}
            </CardContent>
        </Card>
      </div>
      
      <ReviewView mcqs={result.mcqs} userAnswers={result.userAnswers} />

      <div className="text-center">
        <Button onClick={() => router.push('/dashboard/performance')}>View Detailed Performance</Button>
      </div>

    </div>
  );
}
