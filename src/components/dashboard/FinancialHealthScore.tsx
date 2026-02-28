'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, TrendingUp, Shield, Wallet, Target, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { mlClient } from '@/lib/ml/client';

interface FinancialHealthScoreProps {
  score?: number;
}

interface HealthFactors {
  spendingControl: number;
  goalProgress: number;
  savingsRate: number;
  debtRatio: number;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-amber-400';
  return 'text-rose-400';
};

const getScoreGradient = (score: number) => {
  if (score >= 80) return 'from-emerald-500 to-teal-500';
  if (score >= 60) return 'from-amber-500 to-orange-500';
  return 'from-rose-500 to-pink-500';
};

const getScoreLabel = (score: number) => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Improvement';
};

export default function FinancialHealthScore({ score: propScore }: FinancialHealthScoreProps) {
  const [calculatedScore, setCalculatedScore] = useState(propScore ?? 0);
  const [hasData, setHasData] = useState(false);
  const [factors, setFactors] = useState<HealthFactors>({
    spendingControl: 0,
    goalProgress: 0,
    savingsRate: 0,
    debtRatio: 0,
  });
  const [aiInsight, setAiInsight] = useState('Add transactions to get personalized AI insights.');

  useEffect(() => {
    calculateHealthScore();
  }, []);

  const calculateHealthScore = async () => {
    const supabase = createClient();

    try {
      // Get all transactions
      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, type, occurred_at, category');

      if (!transactions || transactions.length === 0) {
        setHasData(false);
        setCalculatedScore(0);
        setFactors({
          spendingControl: 0,
          goalProgress: 0,
          savingsRate: 0,
          debtRatio: 0,
        });
        setAiInsight('Start adding transactions to calculate your financial health score!');
        return;
      }

      setHasData(true);

      // Calculate total income and expenses
      let totalIncome = 0;
      let totalExpense = 0;
      transactions.forEach((t) => {
        if (t.type === 'income') totalIncome += Number(t.amount);
        if (t.type === 'expense') totalExpense += Number(t.amount);
      });

      // Calculate last 30 days spending
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentTransactions = transactions.filter(
        t => new Date(t.occurred_at) >= thirtyDaysAgo
      );

      let recentIncome = 0;
      let recentExpense = 0;
      recentTransactions.forEach((t) => {
        if (t.type === 'income') recentIncome += Number(t.amount);
        if (t.type === 'expense') recentExpense += Number(t.amount);
      });

      // 1. Spending Control (0-100): Lower spending relative to income is better
      let spendingControl = 50;
      if (recentIncome > 0) {
        const spendingRatio = recentExpense / recentIncome;
        spendingControl = Math.max(0, Math.min(100, 100 - (spendingRatio * 100)));
      }

      // 2. Savings Rate (0-100): Higher savings is better
      let savingsRate = 50;
      if (totalIncome > 0) {
        const savings = totalIncome - totalExpense;
        savingsRate = Math.max(0, Math.min(100, (savings / totalIncome) * 100));
      }

      // 3. Goal Progress (0-100) - 0 if no goals set
      const { data: goals } = await supabase
        .from('goals')
        .select('target_amount, current_amount');

      let goalProgress = 0;
      if (goals && goals.length > 0) {
        const totalProgress = goals.reduce((sum, g) => {
          const progress = (Number(g.current_amount) / Number(g.target_amount)) * 100;
          return sum + Math.min(100, progress);
        }, 0);
        goalProgress = totalProgress / goals.length;
      }

      // 4. Debt Ratio (0-100): Assuming no debt data, use expense/income ratio
      let debtRatio = 50;
      if (totalIncome > 0) {
        const ratio = totalExpense / totalIncome;
        debtRatio = Math.max(0, Math.min(100, 100 - (ratio * 50)));
      }

      // Calculate overall score (weighted average)
      const overallScore = Math.round(
        (spendingControl * 0.3) +
        (savingsRate * 0.3) +
        (goalProgress * 0.2) +
        (debtRatio * 0.2)
      );

      setCalculatedScore(overallScore);
      setFactors({
        spendingControl: Math.round(spendingControl),
        goalProgress: Math.round(goalProgress),
        savingsRate: Math.round(savingsRate),
        debtRatio: Math.round(debtRatio),
      });

      // Generate AI insight
      try {
        const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

        const monthlyExpenseMap = new Map<string, number>();
        (transactions ?? []).forEach((t) => {
          if (t.type !== 'expense') return;
          const dt = new Date(t.occurred_at);
          const key = monthKey(dt);
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

        const food_spending = (recentTransactions ?? []).reduce((sum, t) => {
          const cat = String((t as any).category || '').toLowerCase();
          return cat.includes('food') ? sum + Number(t.amount) : sum;
        }, 0);

        const subscription_spending = (recentTransactions ?? []).reduce((sum, t) => {
          const cat = String((t as any).category || '').toLowerCase();
          return cat.includes('subscription') ? sum + Number(t.amount) : sum;
        }, 0);

        const emi_spending = (recentTransactions ?? []).reduce((sum, t) => {
          const cat = String((t as any).category || '').toLowerCase();
          return cat.includes('emi') ? sum + Number(t.amount) : sum;
        }, 0);

        const investment_spending = (recentTransactions ?? []).reduce((sum, t) => {
          const cat = String((t as any).category || '').toLowerCase();
          return cat.includes('invest') ? sum + Number(t.amount) : sum;
        }, 0);

        const savingsResult = await mlClient.getSavingsInsights({
          income: recentIncome,
          expense: recentExpense,
          savings: recentIncome - recentExpense,
          food_spending,
          subscription_spending,
          emi_spending,
          investment_spending,
          volatility,
        });

        if (savingsResult) {
          setAiInsight(
            savingsResult.score_message || savingsResult.recommendations?.[0] || aiInsight
          );
        } else {
          generateAIInsight(overallScore, {
            spendingControl: Math.round(spendingControl),
            goalProgress: Math.round(goalProgress),
            savingsRate: Math.round(savingsRate),
            debtRatio: Math.round(debtRatio),
          });
        }
      } catch (e) {
        console.error('Error getting savings insights:', e);
        generateAIInsight(overallScore, {
          spendingControl: Math.round(spendingControl),
          goalProgress: Math.round(goalProgress),
          savingsRate: Math.round(savingsRate),
          debtRatio: Math.round(debtRatio),
        });
      }

    } catch (error) {
      console.error('Error calculating health score:', error);
    }
  };

  const generateAIInsight = (score: number, factors: HealthFactors) => {
    const insights: string[] = [];

    if (factors.savingsRate < 60) {
      insights.push('Increase your savings rate by 10% to improve your financial health.');
    }
    if (factors.spendingControl < 60) {
      insights.push('Try reducing discretionary spending like dining out and entertainment.');
    }
    if (factors.goalProgress < 60) {
      insights.push('Set up automatic transfers to your savings goals to stay on track.');
    }
    if (score >= 80) {
      insights.push('Excellent work! Keep maintaining your healthy financial habits.');
    }

    setAiInsight(insights[0] || 'Keep tracking your expenses to get personalized insights!');
  };

  const score = propScore ?? calculatedScore;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = hasData ? circumference - (score / 100) * circumference : circumference;

  const factorsList = [
    { icon: Wallet, label: 'Spending Control', score: factors.spendingControl },
    { icon: Target, label: 'Goal Progress', score: factors.goalProgress },
    { icon: Shield, label: 'Savings Rate', score: factors.savingsRate },
    { icon: TrendingUp, label: 'Debt Ratio', score: factors.debtRatio },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card-glass p-6"
    >
      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Score Circle */}
        <div className="relative w-40 h-40 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-[var(--glass-bg)]"
            />
            {/* Progress Circle */}
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#scoreGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" className={cn('text-indigo-500', getScoreColor(score).replace('text-', 'stop-color: text-'))} />
                <stop offset="100%" className={cn('text-purple-500', getScoreColor(score).replace('text-', 'stop-color: text-'))} />
              </linearGradient>
            </defs>
          </svg>

          {/* Score Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn('text-4xl font-bold', getScoreColor(score))}>
              {score}
            </span>
            <span className="text-xs text-[var(--muted-text)]">/ 100</span>
          </div>
        </div>

        {/* Score Details */}
        <div className="flex-1 w-full">
          <div className="flex items-center gap-3 mb-2">
            <Heart className={cn('w-5 h-5', getScoreColor(score))} />
            <h3 className="font-semibold text-lg">Financial Health Score</h3>
            <span className={cn(
              'px-2 py-0.5 rounded-full text-xs font-medium',
              'bg-gradient-to-r',
              getScoreGradient(score),
              'text-white'
            )}>
              {getScoreLabel(score)}
            </span>
          </div>

          <p className="text-sm text-[var(--muted-text)] mb-4">
            Your financial health is {getScoreLabel(score).toLowerCase()}.
            {score >= 80
              ? ' Keep up the great work maintaining your financial wellness!'
              : score >= 60
                ? ' There\'s room for improvement. Check our AI insights for recommendations.'
                : ' Consider reviewing your spending habits and setting up a budget.'}
          </p>

          {/* Factor Bars */}
          <div className="grid grid-cols-2 gap-4">
            {factorsList.map((factor, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <factor.icon className="w-4 h-4 text-[var(--muted-text)]" />
                  <span className="text-[var(--muted-text)]">{factor.label}</span>
                </div>
                <div className="h-2 bg-[var(--glass-bg)] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${factor.score}%` }}
                    transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                    className={cn(
                      'h-full rounded-full bg-gradient-to-r',
                      factor.score >= 80 ? 'from-emerald-500 to-teal-500' :
                        factor.score >= 60 ? 'from-amber-500 to-orange-500' :
                          'from-rose-500 to-pink-500'
                    )}
                  />
                </div>
                <span className="text-xs font-medium">{factor.score}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Tip */}
        <div className="md:w-64 shrink-0 p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium text-indigo-400">AI Insight</span>
          </div>
          <p className="text-sm text-[var(--muted-text)]">
            {aiInsight}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
