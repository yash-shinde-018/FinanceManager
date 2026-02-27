'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  Sparkles,
  TrendingDown,
  AlertTriangle,
  Brain,
  ChevronRight,
  Lightbulb,
  Target,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AIInsight } from '@/types';
import { mlClient } from '@/lib/ml/client';

const getInsightIcon = (type: string) => {
  switch (type) {
    case 'savings':
      return Lightbulb;
    case 'overspending':
      return TrendingDown;
    case 'anomaly':
      return AlertTriangle;
    case 'forecast':
      return Brain;
    case 'tip':
      return Zap;
    default:
      return Sparkles;
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'success':
      return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400';
    case 'warning':
      return 'border-amber-500/30 bg-amber-500/10 text-amber-400';
    case 'alert':
      return 'border-rose-500/30 bg-rose-500/10 text-rose-400';
    case 'info':
      return 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400';
    default:
      return 'border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--muted-text)]';
  }
};

const getTypeLabel = (type: string) => {
  return type.charAt(0).toUpperCase() + type.slice(1);
};

export default function AIInsightsPanel() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInsights = async () => {
      try {
        // Get user's transactions from Supabase
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();

        const { data: transactions } = await supabase
          .from('transactions')
          .select('description, amount, type, category, occurred_at')
          .order('occurred_at', { ascending: false })
          .limit(100);

        if (!transactions || transactions.length === 0) {
          setInsights([
            {
              id: '1',
              type: 'tip',
              title: 'Get Started',
              description: 'Add your first transaction to start receiving personalized AI insights about your spending patterns!',
              severity: 'info',
              timestamp: new Date(),
            },
          ]);
          setLoading(false);
          return;
        }

        // Format transactions for ML API
        const mlTransactions = transactions.map(t => ({
          date: new Date(t.occurred_at).toISOString().split('T')[0],
          description: t.description,
          amount: t.type === 'expense' ? -Math.abs(t.amount) : Math.abs(t.amount),
          category: t.category,
        }));

        // Get insights from ML API
        const response = await fetch('http://localhost:8000/insights/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mlTransactions),
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.insights) {
            // Convert ML insights to AIInsight format
            const formattedInsights: AIInsight[] = data.insights.map((insight: any, index: number) => {
              // Map insight types correctly
              let insightType = insight.type || 'tip';

              return {
                id: `ml-${index}`,
                type: insightType,
                title: insight.type === 'summary' ? 'Spending Summary' :
                  insight.type === 'category' ? 'Top Category' :
                    insight.type === 'overspending' ? 'Spending Alert' :
                      insight.type === 'forecast' ? 'AI Forecast' :
                        insight.type === 'pattern' ? 'Spending Pattern' :
                          insight.type === 'recommendation' ? 'AI Recommendation' : 'Insight',
                description: insight.message,
                severity: insight.severity === 'high' ? 'alert' :
                  insight.severity === 'medium' ? 'warning' :
                    insight.severity === 'low' ? 'success' : 'info',
                timestamp: new Date(),
                actionRequired: insight.type === 'overspending' || insight.type === 'recommendation',
                actionText: insight.type === 'overspending' ? 'Set Budget' : 'View Details',
              };
            });
            setInsights(formattedInsights);
          }
        } else {
          throw new Error('Failed to get insights');
        }
      } catch (error) {
        console.error('Error loading ML insights:', error);
        setInsights([
          {
            id: '1',
            type: 'tip',
            title: 'AI Insights',
            description: 'Add transactions to get personalized insights. Make sure ML API is running on port 8000.',
            severity: 'info',
            timestamp: new Date(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadInsights();
  }, []);

  return (
    <div className="card-glass overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-[var(--glass-border)] bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center animate-pulse">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">AI Insights</h3>
            <p className="text-sm text-[var(--muted-text)]">
              {loading ? 'Loading...' : `${insights.length} new recommendations`}
            </p>
          </div>
        </div>
      </div>

      {/* Insights List */}
      <div className="max-h-[500px] overflow-y-auto">
        {insights.map((insight, index) => {
          const Icon = getInsightIcon(insight.type);

          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={cn(
                'p-4 border-b border-[var(--glass-border)] last:border-0',
                'hover:bg-[var(--glass-bg)] transition-colors group cursor-pointer'
              )}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border',
                  getSeverityColor(insight.severity)
                )}>
                  <Icon className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      'text-xs font-medium px-2 py-0.5 rounded-full',
                      getSeverityColor(insight.severity)
                    )}>
                      {getTypeLabel(insight.type)}
                    </span>
                    <span className="text-xs text-[var(--muted-text)]">
                      {new Date(insight.timestamp).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <h4 className="font-medium text-sm mb-1 group-hover:text-indigo-400 transition-colors">
                    {insight.title}
                  </h4>
                  <p className="text-sm text-[var(--muted-text)] line-clamp-2">
                    {insight.description}
                  </p>

                  {/* Action Button */}
                  {insight.actionRequired && (
                    <button className="mt-3 flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                      {insight.actionText}
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        {insights.length === 0 && !loading && (
          <div className="p-8 text-center text-[var(--muted-text)]">
            <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No insights available yet.</p>
            <p className="text-sm mt-1">Add more transactions to get AI-powered recommendations.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--glass-border)] bg-[var(--glass-bg)]">
        <button className="w-full flex items-center justify-center gap-2 text-sm text-[var(--muted-text)] hover:text-[var(--foreground)] transition-colors">
          View All Insights
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
