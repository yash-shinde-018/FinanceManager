'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface SpendingChartProps {
  data?: { month: string; expense: number; income: number }[];
}

const defaultData = [
  { month: 'Jan', expense: 3200, income: 4500 },
  { month: 'Feb', expense: 3800, income: 4500 },
  { month: 'Mar', expense: 3500, income: 4800 },
  { month: 'Apr', expense: 2900, income: 4500 },
  { month: 'May', expense: 4100, income: 4800 },
  { month: 'Jun', expense: 3840, income: 5000 },
];

export default function SpendingChart({ data = defaultData }: SpendingChartProps) {
  const CustomTooltip = useMemo(() => {
    return ({ active, payload, label }: {
      active?: boolean;
      payload?: Array<{ color: string; name: string; value: number }>;
      label?: string;
    }) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-[var(--card-bg)] border border-[var(--glass-border)] rounded-lg p-3 shadow-xl">
            <p className="font-medium mb-2">{label}</p>
            {payload.map((entry, index) => (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                {entry.name}: ₹{entry.value.toLocaleString('en-IN')}
              </p>
            ))}
          </div>
        );
      }
      return null;
    };
  }, []);

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
          <XAxis 
            dataKey="month" 
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
            tickFormatter={(value) => `₹${value / 1000}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="spending"
            name="Spending"
            stroke="#6366f1"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorSpending)"
          />
          <Area
            type="monotone"
            dataKey="income"
            name="Income"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorIncome)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
