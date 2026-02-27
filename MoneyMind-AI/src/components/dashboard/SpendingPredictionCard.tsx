'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Brain, 
  AlertCircle,
  Calendar,
  IndianRupee,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { mlClient, MonthlyData } from '@/lib/ml/client';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface SpendingPrediction {
  predictedAmount: number;
  confidenceInterval: { lower: number; upper: number };
  mape: number;
  modelAccuracy: string;
  modelUsed: string;
  hasEnoughData: boolean;
  monthsOfData: number;
}

export default function SpendingPredictionCard() {
  const [prediction, setPrediction] = useState<SpendingPrediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const loadPrediction = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if user is logged in
        if (!user) {
          setPrediction({
            predictedAmount: 0,
            confidenceInterval: { lower: 0, upper: 0 },
            mape: 0,
            modelAccuracy: 'N/A',
            modelUsed: 'No User',
            hasEnoughData: false,
            monthsOfData: 0,
          });
          setLoading(false);
          return;
        }

        // Get transactions from Supabase for CURRENT USER ONLY
        const supabase = createClient();
        const { data: transactions, error: txError } = await supabase
          .from('transactions')
          .select('amount, type, occurred_at, category, user_id')
          .eq('user_id', user.id)
          .order('occurred_at', { ascending: true });

        if (txError) {
          console.error('Error fetching transactions:', txError);
          setError('Failed to load your transactions');
          setLoading(false);
          return;
        }

        if (!transactions || transactions.length === 0) {
          setPrediction({
            predictedAmount: 0,
            confidenceInterval: { lower: 0, upper: 0 },
            mape: 0,
            modelAccuracy: 'N/A',
            modelUsed: 'No Data',
            hasEnoughData: false,
            monthsOfData: 0,
          });
          setLoading(false);
          return;
        }

        // Group transactions by month
        const monthlyData = new Map<string, MonthlyData>();
        
        transactions.forEach((t) => {
          const date = new Date(t.occurred_at);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
          if (!monthlyData.has(monthKey)) {
            monthlyData.set(monthKey, {
              date: monthKey,
              total_expense: 0,
              total_income: 0,
              expense_food: 0,
              expense_travel: 0,
              expense_bills: 0,
              expense_emi: 0,
              expense_shopping: 0,
              expense_investment: 0,
              expense_healthcare: 0,
              expense_entertainment: 0,
              expense_subscription: 0,
              expense_transfer: 0,
              expense_others: 0,
            });
          }

          const month = monthlyData.get(monthKey)!;
          const amount = Number(t.amount);
          const category = (t.category || 'others').toLowerCase();

          if (t.type === 'expense') {
            month.total_expense += amount;
            
            // Categorize expenses
            if (category.includes('food')) month.expense_food += amount;
            else if (category.includes('travel') || category.includes('transport')) month.expense_travel += amount;
            else if (category.includes('bill') || category.includes('utility')) month.expense_bills += amount;
            else if (category.includes('emi') || category.includes('loan')) month.expense_emi += amount;
            else if (category.includes('shop') || category.includes('purchase')) month.expense_shopping += amount;
            else if (category.includes('invest')) month.expense_investment += amount;
            else if (category.includes('health') || category.includes('medical')) month.expense_healthcare += amount;
            else if (category.includes('entertain')) month.expense_entertainment += amount;
            else if (category.includes('subscription')) month.expense_subscription += amount;
            else if (category.includes('transfer')) month.expense_transfer += amount;
            else month.expense_others += amount;
          } else if (t.type === 'income') {
            month.total_income += amount;
          }
        });

        const monthlyArray = Array.from(monthlyData.values());
        
        // Need at least 12 months for prediction
        if (monthlyArray.length < 12) {
          setPrediction({
            predictedAmount: 0,
            confidenceInterval: { lower: 0, upper: 0 },
            mape: 0,
            modelAccuracy: 'N/A',
            modelUsed: 'Insufficient Data',
            hasEnoughData: false,
            monthsOfData: monthlyArray.length,
          });
          setLoading(false);
          return;
        }

        // Call ML API
        const result = await mlClient.predictSpending(monthlyArray);
        
        if (result && result.prediction) {
          setPrediction({
            predictedAmount: result.prediction,
            confidenceInterval: Array.isArray(result.confidence_interval) 
              ? { lower: result.confidence_interval[0], upper: result.confidence_interval[1] }
              : result.confidence_interval,
            mape: result.mape || 0,
            modelAccuracy: result.model_accuracy || 'N/A',
            modelUsed: result.model_used || 'LinearRegression',
            hasEnoughData: true,
            monthsOfData: monthlyArray.length,
          });
        } else {
          setError('Failed to get prediction from ML service');
        }
      } catch (err) {
        console.error('Error loading spending prediction:', err);
        setError('ML service unavailable');
      } finally {
        setLoading(false);
      }
    };

    loadPrediction();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-glass p-6 rounded-2xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
            <Brain className="w-5 h-5 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold">AI Spending Prediction</h3>
            <p className="text-xs text-[var(--muted-text)]">Loading...</p>
          </div>
        </div>
        <div className="h-32 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        </div>
      </motion.div>
    );
  }

  if (error || !prediction) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-glass p-6 rounded-2xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h3 className="font-semibold">AI Spending Prediction</h3>
            <p className="text-xs text-[var(--muted-text)]">Service unavailable</p>
          </div>
        </div>
        <p className="text-sm text-[var(--muted-text)] text-center py-4">
          {error || 'Unable to load prediction. Make sure ML service is running on port 8001.'}
        </p>
      </motion.div>
    );
  }

  if (!prediction.hasEnoughData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-glass p-6 rounded-2xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="font-semibold">AI Spending Prediction</h3>
            <p className="text-xs text-[var(--muted-text)]">{prediction.monthsOfData}/12 months needed</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <p className="text-sm text-[var(--muted-text)]">
            Need 12 months of transaction history for accurate predictions. Keep adding transactions!
          </p>
          <div className="h-2 bg-[var(--glass-bg)] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(prediction.monthsOfData / 12) * 100}%` }}
              transition={{ duration: 1 }}
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
            />
          </div>
          <p className="text-xs text-[var(--muted-text)] text-right">
            {Math.round((prediction.monthsOfData / 12) * 100)}% complete
          </p>
        </div>
      </motion.div>
    );
  }

  const variance = prediction.confidenceInterval.upper - prediction.confidenceInterval.lower;
  const variancePercent = prediction.predictedAmount > 0 
    ? (variance / prediction.predictedAmount) * 100 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card-glass p-6 rounded-2xl"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">AI Spending Prediction</h3>
          <p className="text-xs text-[var(--muted-text)]">
            {user?.email ? `Personalized for ${user.email}` : 'Next month forecast'}
          </p>
        </div>
        <div className="text-right">
          <span className={cn(
            'text-xs px-2 py-1 rounded-full font-medium',
            prediction.mape <= 5 ? 'bg-emerald-500/10 text-emerald-400' :
            prediction.mape <= 10 ? 'bg-amber-500/10 text-amber-400' :
            'bg-rose-500/10 text-rose-400'
          )}>
            {(100 - prediction.mape).toFixed(1)}% accuracy
          </span>
        </div>
      </div>

      {/* Prediction Amount */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <IndianRupee className="w-8 h-8 text-indigo-400" />
          <span className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            {formatCurrency(prediction.predictedAmount).replace('₹', '')}
          </span>
        </div>
        <p className="text-sm text-[var(--muted-text)]">
          Predicted spending for next month
        </p>
      </div>

      {/* Confidence Interval */}
      <div className="bg-[var(--glass-bg)] rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[var(--muted-text)]">Confidence Interval (95%)</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400">
            ±{variancePercent.toFixed(1)}%
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-center">
            <p className="text-xs text-[var(--muted-text)] mb-1">Lower</p>
            <p className="font-medium text-emerald-400">{formatCurrency(prediction.confidenceInterval.lower)}</p>
          </div>
          <div className="flex-1 mx-4 h-2 bg-[var(--glass-bg)] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 via-indigo-500 to-rose-500 rounded-full" />
          </div>
          <div className="text-center">
            <p className="text-xs text-[var(--muted-text)] mb-1">Upper</p>
            <p className="font-medium text-rose-400">{formatCurrency(prediction.confidenceInterval.upper)}</p>
          </div>
        </div>
      </div>

      {/* Model Details */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[var(--glass-bg)] rounded-lg p-3">
          <p className="text-xs text-[var(--muted-text)] mb-1">Model</p>
          <p className="font-medium text-sm">{prediction.modelUsed}</p>
        </div>
        <div className="bg-[var(--glass-bg)] rounded-lg p-3">
          <p className="text-xs text-[var(--muted-text)] mb-1">MAPE</p>
          <p className="font-medium text-sm">{prediction.mape.toFixed(2)}%</p>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
        <div className="flex items-start gap-2">
          <Brain className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
          <p className="text-xs text-[var(--muted-text)]">
            Based on {prediction.monthsOfData} months of your spending patterns. 
            The model predicts with {prediction.modelAccuracy} confidence.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
