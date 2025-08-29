'use client';

import { TestResult, Subject, ALL_SUBJECTS } from '@/lib/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface SubjectPerformanceChartProps {
  data: TestResult[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/80 backdrop-blur-sm p-2 border rounded-lg shadow-lg">
        <p className="font-bold">{label}</p>
        <p className="text-sm text-primary">{`Average Accuracy: ${payload[0].value.toFixed(1)}%`}</p>
      </div>
    );
  }
  return null;
};


export default function SubjectPerformanceChart({ data }: SubjectPerformanceChartProps) {
  const subjectData: Record<Subject, { totalCorrect: number; totalQuestions: number }> = {
    Physics: { totalCorrect: 0, totalQuestions: 0 },
    Chemistry: { totalCorrect: 0, totalQuestions: 0 },
    Biology: { totalCorrect: 0, totalQuestions: 0 },
    English: { totalCorrect: 0, totalQuestions: 0 },
  };

  data.forEach(test => {
    test.results.forEach(subjectResult => {
      subjectData[subjectResult.subject].totalCorrect += subjectResult.correct;
      subjectData[subjectResult.subject].totalQuestions += subjectResult.total;
    });
  });

  const chartData = ALL_SUBJECTS.map(subject => {
      const { totalCorrect, totalQuestions } = subjectData[subject];
      return {
          subject,
          accuracy: totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0
      };
  }).filter(d => d.accuracy > 0);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="subject" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis unit="%" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--secondary))' }}/>
        <Legend wrapperStyle={{fontSize: "14px", paddingTop: "20px"}}/>
        <Bar dataKey="accuracy" name="Average Accuracy" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}
