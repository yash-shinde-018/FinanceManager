'use client';

import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface CategoryChartProps {
  data?: { name: string; value: number; color: string }[];
}

const defaultData = [
  { name: 'Housing', value: 1200, color: '#6366f1' },
  { name: 'Food & Dining', value: 600, color: '#8b5cf6' },
  { name: 'Transportation', value: 400, color: '#06b6d4' },
  { name: 'Entertainment', value: 350, color: '#10b981' },
  { name: 'Shopping', value: 300, color: '#f59e0b' },
  { name: 'Utilities', value: 250, color: '#ef4444' },
  { name: 'Other', value: 140, color: '#64748b' },
];

export default function CategoryChart({ data = defaultData }: CategoryChartProps) {
  const total = data.reduce((acc, item) => acc + item.value, 0);

  const CustomTooltip = useMemo(() => {
    return ({ active, payload }: {
      active?: boolean;
      payload?: Array<{ payload: { name: string; value: number; color: string } }>;
    }) => {
      if (active && payload && payload.length) {
        const data = payload[0].payload;
        const percentage = ((data.value / total) * 100).toFixed(1);
        return (
          <div className="bg-[var(--card-bg)] border border-[var(--glass-border)] rounded-lg p-3 shadow-xl">
            <p className="font-medium mb-1">{data.name}</p>
            <p className="text-sm" style={{ color: data.color }}>
              ₹{data.value.toLocaleString('en-IN')} ({percentage}%)
            </p>
          </div>
        );
      }
      return null;
    };
  }, [total]);

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={50}
            outerRadius={70}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Legend - 2x2 grid to fit better */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 px-2">
        {data.slice(0, 4).map((item) => (
          <div key={item.name} className="flex items-center gap-2 min-w-0">
            <div 
              className="w-2.5 h-2.5 rounded-full shrink-0" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-[var(--muted-text)] truncate">
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
