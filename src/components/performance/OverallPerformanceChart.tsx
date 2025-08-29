'use client';

import { TestResult } from '@/lib/types';
import { format } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface OverallPerformanceChartProps {
  data: TestResult[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/80 backdrop-blur-sm p-2 border rounded-lg shadow-lg">
        <p className="font-bold">{`Test on ${label}`}</p>
        <p className="text-sm text-primary">{`Overall Score: ${payload[0].value.toFixed(1)}%`}</p>
        <p className="text-xs text-muted-foreground">{`Type: ${payload[0].payload.type}`}</p>
      </div>
    );
  }
  return null;
};

export default function OverallPerformanceChart({ data }: OverallPerformanceChartProps) {
  const chartData = data.map(result => ({
    date: format(new Date(result.date), 'MMM d'),
    percentage: result.overall.percentage,
    type: result.type,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false}/>
        <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis unit="%" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{fontSize: "14px", paddingTop: "20px"}}/>
        <Line
          type="monotone"
          dataKey="percentage"
          name="Overall Accuracy"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{ r: 4, fill: 'hsl(var(--primary))' }}
          activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
