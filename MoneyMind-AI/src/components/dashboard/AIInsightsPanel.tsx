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
  Zap,
  Heart,
  PiggyBank,
  TrendingUp,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AIInsight } from '@/types';
import { mlClient, SavingsAnalysisResponse } from '@/lib/ml/client';
import { createClient } from '@/lib/supabase/client';

const getInsightIcon = (type: string) => {
  switch (type) {
    case 'savings':
      return PiggyBank;
    case 'overspending':
      return TrendingDown;
    case 'anomaly':
      return AlertTriangle;
    case 'forecast':
      return TrendingUp;
    case 'tip':
      return Zap;
    case 'health':
      return Heart;
    case 'debt':
      return Shield;
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
  const [savingsData, setSavingsData] = useState<SavingsAnalysisResponse | null>(null);

  useEffect(() => {
    const loadInsights = async () => {
      try {
        setLoading(true);
        
        // Get user's transactions from Supabase
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

        // Calculate metrics for savings insights
        let totalIncome = 0;
        let totalExpense = 0;
        let foodSpending = 0;
        let subscriptionSpending = 0;
        let emiSpending = 0;
        let investmentSpending = 0;

        // Calculate last 30 days for recent metrics
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentTransactions = transactions.filter(
          t => new Date(t.occurred_at) >= thirtyDaysAgo
        );

        recentTransactions.forEach((t) => {
          const amount = Number(t.amount);
          const category = (t.category || '').toLowerCase();

          if (t.type === 'income') {
            totalIncome += amount;
          } else {
            totalExpense += amount;
            
            if (category.includes('food')) foodSpending += amount;
            if (category.includes('subscription')) subscriptionSpending += amount;
            if (category.includes('emi') || category.includes('loan')) emiSpending += amount;
            if (category.includes('invest')) investmentSpending += amount;
          }
        });

        // Calculate volatility
        const monthlyExpenseMap = new Map<string, number>();
        transactions.filter(t => t.type === 'expense').forEach((t) => {
          const date = new Date(t.occurred_at);
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          monthlyExpenseMap.set(key, (monthlyExpenseMap.get(key) || 0) + Number(t.amount));
        });

        const monthlyExpenses = Array.from(monthlyExpenseMap.values());
        const mean = monthlyExpenses.length
          ? monthlyExpenses.reduce((s, v) => s + v, 0) / monthlyExpenses.length
          : 0;
        const variance = monthlyExpenses.length
          ? monthlyExpenses.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / monthlyExpenses.length
          : 0;
        const std = Math.sqrt(variance);
        const volatility = mean > 0 ? Math.min(1, std / mean) : 0.05;

        // Call Savings Insights API (Port 8003)
        const savingsResult = await mlClient.getSavingsInsights({
          income: totalIncome,
          expense: totalExpense,
          savings: totalIncome - totalExpense,
          food_spending: foodSpending,
          subscription_spending: subscriptionSpending,
          emi_spending: emiSpending,
          investment_spending: investmentSpending,
          volatility: volatility,
        });

        if (savingsResult) {
          setSavingsData(savingsResult);
          
          // Convert savings insights to AIInsight format
          const formattedInsights: AIInsight[] = [];

          // Add financial health score insight
          formattedInsights.push({
            id: 'health-score',
            type: 'tip',
            title: `Financial Health: ${savingsResult.score_interpretation}`,
            description: savingsResult.score_message,
            severity: savingsResult.financial_health_score >= 70 ? 'success' :
                     savingsResult.financial_health_score >= 50 ? 'warning' : 'alert',
            timestamp: new Date(),
            actionRequired: savingsResult.financial_health_score < 70,
            actionText: 'Improve Score',
          });

          // Add risk level insight
          if (savingsResult.risk_level !== 'Low') {
            formattedInsights.push({
              id: 'risk-level',
              type: 'overspending',
              title: `${savingsResult.risk_level} Risk Detected`,
              description: `Your financial behavior shows ${savingsResult.risk_level.toLowerCase()} risk patterns. Review your spending habits.`,
              severity: savingsResult.risk_level === 'High' ? 'alert' : 'warning',
              timestamp: new Date(),
              actionRequired: true,
              actionText: 'View Details',
            });
          }

          // Add recommendations as individual insights
          savingsResult.recommendations?.slice(0, 3).forEach((rec, index) => {
            formattedInsights.push({
              id: `rec-${index}`,
              type: 'savings',
              title: 'AI Recommendation',
              description: rec,
              severity: 'info',
              timestamp: new Date(),
              actionRequired: true,
              actionText: 'Learn More',
            });
          });

          // Add behavior class insight
          formattedInsights.push({
            id: 'behavior',
            type: 'tip',
            title: `Spending Profile: ${savingsResult.behavior_class}`,
            description: `You're classified as "${savingsResult.behavior_class}" based on your spending patterns.`,
            severity: 'info',
            timestamp: new Date(),
          });

          setInsights(formattedInsights);
        } else {
          throw new Error('Failed to get savings insights');
        }
      } catch (error) {
        console.error('Error loading ML insights:', error);
        setInsights([
          {
            id: '1',
            type: 'tip',
            title: 'AI Insights',
            description: 'Add transactions to get personalized insights. Make sure ML service is running on port 8003.',
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
          <div className="flex-1">
            <h3 className="font-semibold text-lg">AI Savings Insights</h3>
            <p className="text-sm text-[var(--muted-text)]">
              {loading ? 'Loading...' : `${insights.length} personalized recommendations`}
            </p>
          </div>
          {savingsData && (
            <div className={cn(
              'px-3 py-1.5 rounded-full text-sm font-bold',
              savingsData.financial_health_score >= 70 ? 'bg-emerald-500/10 text-emerald-400' :
              savingsData.financial_health_score >= 50 ? 'bg-amber-500/10 text-amber-400' :
              'bg-rose-500/10 text-rose-400'
            )}>
              Score: {savingsData.financial_health_score}
            </div>
          )}
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
        <div className="flex items-center justify-between">
          <p className="text-xs text-[var(--muted-text)]">
            Powered by ML Port 8003
          </p>
          <button className="flex items-center gap-1 text-sm text-[var(--muted-text)] hover:text-[var(--foreground)] transition-colors">
            View All Insights
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
