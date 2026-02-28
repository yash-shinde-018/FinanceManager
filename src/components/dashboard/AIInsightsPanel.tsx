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

        // Calculate financial metrics for savings recommendation
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const currentMonthTransactions = transactions.filter(t => {
          const tDate = new Date(t.occurred_at);
          return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
        });

        const income = currentMonthTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        const expense = currentMonthTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        const savings = income - expense;

        const foodSpending = currentMonthTransactions
          .filter(t => t.type === 'expense' && (t.category === 'food' || t.category === 'food_dining'))
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        const subscriptionSpending = currentMonthTransactions
          .filter(t => t.type === 'expense' && t.category === 'subscription')
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        const emiSpending = currentMonthTransactions
          .filter(t => t.type === 'expense' && t.category === 'emi')
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        const investmentSpending = currentMonthTransactions
          .filter(t => t.type === 'expense' && t.category === 'investment')
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        // Calculate volatility (standard deviation of daily expenses)
        const dailyExpenses = new Map<string, number>();
        currentMonthTransactions
          .filter(t => t.type === 'expense')
          .forEach(t => {
            const date = new Date(t.occurred_at).toISOString().split('T')[0];
            dailyExpenses.set(date, (dailyExpenses.get(date) || 0) + Math.abs(t.amount));
          });
        
        const expenseValues = Array.from(dailyExpenses.values());
        const avgExpense = expenseValues.reduce((a, b) => a + b, 0) / (expenseValues.length || 1);
        const variance = expenseValues.reduce((sum, val) => sum + Math.pow(val - avgExpense, 2), 0) / (expenseValues.length || 1);
        const volatility = Math.sqrt(variance) / (avgExpense || 1);

        // Get savings insights from ML API
        const savingsData = await mlClient.getSavingsInsights({
          income: income || 50000,
          expense: expense || 30000,
          savings: savings || 20000,
          food_spending: foodSpending || 5000,
          subscription_spending: subscriptionSpending || 1000,
          emi_spending: emiSpending || 5000,
          investment_spending: investmentSpending || 3000,
          volatility: Math.min(volatility, 1) || 0.15,
        });

        if (savingsData && savingsData.recommendations) {
          // Convert ML recommendations to AIInsight format
          const formattedInsights: AIInsight[] = savingsData.recommendations.map((rec: string, index: number) => ({
            id: `ml-${index}`,
            type: rec.toLowerCase().includes('save') ? 'savings' :
                  rec.toLowerCase().includes('reduce') || rec.toLowerCase().includes('cut') ? 'overspending' :
                  rec.toLowerCase().includes('invest') ? 'forecast' : 'tip',
            title: savingsData.behavior_class || 'Financial Insight',
            description: rec,
            severity: savingsData.risk_level === 'High' ? 'alert' :
                      savingsData.risk_level === 'Medium' ? 'warning' : 'success',
            timestamp: new Date(),
            actionRequired: true,
            actionText: 'View Details',
          }));

          // Add financial health score insight
          formattedInsights.unshift({
            id: 'health-score',
            type: 'forecast',
            title: `Financial Health: ${savingsData.financial_health_score}/100`,
            description: savingsData.score_message || savingsData.score_interpretation,
            severity: savingsData.financial_health_score >= 70 ? 'success' :
                      savingsData.financial_health_score >= 50 ? 'warning' : 'alert',
            timestamp: new Date(),
          });

          setInsights(formattedInsights);
        } else {
          throw new Error('No recommendations received');
        }
      } catch (error) {
        console.error('Failed to get insights', error);
        setInsights([
          {
            id: '1',
            type: 'tip',
            title: 'AI Insights',
            description: 'Add more transactions to get personalized AI-powered insights and recommendations.',
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
