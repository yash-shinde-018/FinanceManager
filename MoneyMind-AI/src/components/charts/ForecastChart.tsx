'use client';

import { useMemo, useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { mlClient } from '@/lib/ml/client';

interface ForecastData {
  day: string;
  predicted: number;
  confidenceLow: number;
  confidenceHigh: number;
  actual?: number;
}

export default function ForecastChart() {
  const [data, setData] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(true);

  const CustomTooltip = useMemo(() => {
    return ({ active, payload, label }: {
      active?: boolean;
      payload?: Array<{ dataKey: string; value: number; color: string }>;
      label?: string;
    }) => {
      if (active && payload && payload.length) {
        const predicted = payload.find(p => p.dataKey === 'predicted');
        const actual = payload.find(p => p.dataKey === 'actual');

        return (
          <div className="bg-[var(--card-bg)] border border-[var(--glass-border)] rounded-lg p-3 shadow-xl">
            <p className="font-medium mb-2">Day {label}</p>
            {actual && (
              <p className="text-sm text-emerald-400">
                Actual: ₹{actual.value}
              </p>
            )}
            {predicted && (
              <p className="text-sm text-indigo-400">
                Predicted: ₹{predicted.value}
              </p>
            )}
          </div>
        );
      }
      return null;
    };
  }, []);

  useEffect(() => {
    const loadForecast = async () => {
      try {
        const forecast = await mlClient.getForecast(30);
        if (forecast) {
          // Sample every 5 days for cleaner visualization
          const sampledData: ForecastData[] = [];
          for (let i = 0; i < forecast.dates.length; i += 5) {
            sampledData.push({
              day: (i + 1).toString(),
              predicted: Math.abs(forecast.forecast[i]),
              confidenceLow: Math.abs(forecast.lower_bound[i]),
              confidenceHigh: Math.abs(forecast.upper_bound[i]),
            });
          }
          setData(sampledData);
        } else {
          // Fallback data if ML API is unavailable
          setData([
            { day: '1', predicted: 120, confidenceLow: 100, confidenceHigh: 140 },
            { day: '5', predicted: 135, confidenceLow: 110, confidenceHigh: 160 },
            { day: '10', predicted: 150, confidenceLow: 120, confidenceHigh: 180 },
            { day: '15', predicted: 165, confidenceLow: 130, confidenceHigh: 200 },
            { day: '20', predicted: 180, confidenceLow: 140, confidenceHigh: 220 },
            { day: '25', predicted: 195, confidenceLow: 150, confidenceHigh: 240 },
            { day: '30', predicted: 210, confidenceLow: 160, confidenceHigh: 260 },
          ]);
        }
      } catch (error) {
        console.error('Error loading forecast:', error);
        // Use fallback data
        setData([
          { day: '1', predicted: 120, confidenceLow: 100, confidenceHigh: 140 },
          { day: '5', predicted: 135, confidenceLow: 110, confidenceHigh: 160 },
          { day: '10', predicted: 150, confidenceLow: 120, confidenceHigh: 180 },
          { day: '15', predicted: 165, confidenceLow: 130, confidenceHigh: 200 },
          { day: '20', predicted: 180, confidenceLow: 140, confidenceHigh: 220 },
          { day: '25', predicted: 195, confidenceLow: 150, confidenceHigh: 240 },
          { day: '30', predicted: 210, confidenceLow: 160, confidenceHigh: 260 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadForecast();
  }, []);

  if (loading) {
    return (
      <div className="h-48 flex items-center justify-center">
        <div className="text-[var(--muted-text)]">Loading forecast...</div>
      </div>
    );
  }

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
          <XAxis
            dataKey="day"
            stroke="var(--muted-text)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            label={{ value: 'Days', position: 'insideBottom', offset: -5, fill: 'var(--muted-text)', fontSize: 12 }}
          />
          <YAxis
            stroke="var(--muted-text)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `₹${value}`}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Confidence Band */}
          <Area
            type="monotone"
            dataKey="confidenceHigh"
            stroke="none"
            fill="url(#confidenceGradient)"
          />
          <Area
            type="monotone"
            dataKey="confidenceLow"
            stroke="none"
            fill="var(--card-bg)"
          />

          {/* Prediction Line */}
          <Area
            type="monotone"
            dataKey="predicted"
            stroke="#6366f1"
            strokeWidth={2}
            strokeDasharray="5 5"
            fill="url(#predictedGradient)"
          />

          {/* Actual Line */}
          <Area
            type="monotone"
            dataKey="actual"
            stroke="#10b981"
            strokeWidth={2}
            fill="none"
          />

          {/* Today Line */}
          <ReferenceLine x="10" stroke="#f59e0b" strokeDasharray="3 3" />
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-emerald-500" />
          <span className="text-[var(--muted-text)]">Actual</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-indigo-500 border-dashed" style={{ borderTop: '2px dashed #6366f1' }} />
          <span className="text-[var(--muted-text)]">Predicted</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-indigo-500/20 rounded" />
          <span className="text-[var(--muted-text)]">Confidence</span>
        </div>
      </div>
    </div>
  );
}
