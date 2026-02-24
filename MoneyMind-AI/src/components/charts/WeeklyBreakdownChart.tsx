'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface WeeklyBreakdownChartProps {
  data?: { day: string; amount: number }[];
}

const defaultData = [
  { day: 'Mon', amount: 125 },
  { day: 'Tue', amount: 180 },
  { day: 'Wed', amount: 95 },
  { day: 'Thu', amount: 210 },
  { day: 'Fri', amount: 285 },
  { day: 'Sat', amount: 340 },
  { day: 'Sun', amount: 150 },
];

export default function WeeklyBreakdownChart({ data = defaultData }: WeeklyBreakdownChartProps) {
  const CustomTooltip = useMemo(() => {
    return ({ active, payload, label }: {
      active?: boolean;
      payload?: Array<{ value: number }>;
      label?: string;
    }) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-[var(--card-bg)] border border-[var(--glass-border)] rounded-lg p-3 shadow-xl">
            <p className="font-medium mb-1">{label}</p>
            <p className="text-sm text-indigo-400">
              ₹{payload[0].value.toLocaleString('en-IN')}
            </p>
          </div>
        );
      }
      return null;
    };
  }, []);

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="weeklyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8}/>
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.4}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
          <XAxis 
            dataKey="day" 
            stroke="var(--muted-text)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="var(--muted-text)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `₹${value}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--glass-bg)', opacity: 0.5 }} />
          <Bar 
            dataKey="amount" 
            fill="url(#weeklyGradient)" 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
