'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2,
  XCircle,
  Brain,
  Clock,
  ArrowRight,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { mlClient, FraudDetectionResponse } from '@/lib/ml/client';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface TransactionWithRisk {
  id: number;
  description: string;
  amount: number;
  date: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  anomalyScore: number;
  reasonFlags: string[];
}

export default function FraudDetectionPanel() {
  const [transactions, setTransactions] = useState<TransactionWithRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionWithRisk | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const loadFraudDetection = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if user is logged in
        if (!user) {
          setTransactions([]);
          setLoading(false);
          return;
        }

        // Get recent transactions from Supabase for CURRENT USER ONLY
        const supabase = createClient();
        const { data: recentTransactions, error: txError } = await supabase
          .from('transactions')
          .select('id, description, amount, type, category, occurred_at, user_id')
          .eq('user_id', user.id)
          .order('occurred_at', { ascending: false })
          .limit(10);

        if (txError) {
          console.error('Error fetching transactions:', txError);
          setError('Failed to load your transactions');
          setLoading(false);
          return;
        }

        if (!recentTransactions || recentTransactions.length === 0) {
          setTransactions([]);
          setLoading(false);
          return;
        }

        // Analyze each transaction for fraud
        const analyzedTransactions: TransactionWithRisk[] = [];

        for (const tx of recentTransactions) {
          try {
            const fraudResult = await mlClient.detectFraud({
              id: tx.id,
              date: new Date(tx.occurred_at).toISOString().split('T')[0],
              description: tx.description,
              amount: tx.amount,
              category: tx.category || 'others',
            });

            if (fraudResult) {
              analyzedTransactions.push({
                id: tx.id,
                description: tx.description,
                amount: tx.amount,
                date: new Date(tx.occurred_at).toLocaleDateString('en-IN'),
                riskLevel: fraudResult.risk_level,
                anomalyScore: fraudResult.anomaly_score,
                reasonFlags: fraudResult.reason_flags,
              });
            } else {
              // If fraud detection fails, assume low risk
              analyzedTransactions.push({
                id: tx.id,
                description: tx.description,
                amount: tx.amount,
                date: new Date(tx.occurred_at).toLocaleDateString('en-IN'),
                riskLevel: 'Low',
                anomalyScore: 0,
                reasonFlags: [],
              });
            }
          } catch (err) {
            console.log(`Fraud API unavailable for transaction ${tx.id}, marking as Low Risk`);
            analyzedTransactions.push({
              id: tx.id,
              description: tx.description,
              amount: tx.amount,
              date: new Date(tx.occurred_at).toLocaleDateString('en-IN'),
              riskLevel: 'Low',
              anomalyScore: 0,
              reasonFlags: [],
            });
          }
        }

        // Sort by risk level (High > Medium > Low)
        const riskOrder = { High: 0, Medium: 1, Low: 2 };
        analyzedTransactions.sort((a, b) => riskOrder[a.riskLevel] - riskOrder[b.riskLevel]);

        setTransactions(analyzedTransactions);
      } catch (err) {
        console.error('Error loading fraud detection:', err);
        setError('ML service unavailable on port 8002');
      } finally {
        setLoading(false);
      }
    };

    loadFraudDetection();
    const interval = setInterval(loadFraudDetection, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRiskConfig = (riskLevel: string) => {
    switch (riskLevel) {
      case 'High':
        return {
          icon: AlertTriangle,
          color: 'text-rose-400',
          bgColor: 'bg-rose-500/10',
          borderColor: 'border-rose-500/30',
          progressColor: 'bg-rose-500',
        };
      case 'Medium':
        return {
          icon: AlertTriangle,
          color: 'text-amber-400',
          bgColor: 'bg-amber-500/10',
          borderColor: 'border-amber-500/30',
          progressColor: 'bg-amber-500',
        };
      default:
        return {
          icon: CheckCircle2,
          color: 'text-emerald-400',
          bgColor: 'bg-emerald-500/10',
          borderColor: 'border-emerald-500/30',
          progressColor: 'bg-emerald-500',
        };
    }
  };

  const highRiskCount = transactions.filter(t => t.riskLevel === 'High').length;
  const mediumRiskCount = transactions.filter(t => t.riskLevel === 'Medium').length;

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-glass p-6 rounded-2xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-rose-400 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold">AI Fraud Detection</h3>
            <p className="text-xs text-[var(--muted-text)]">Analyzing transactions...</p>
          </div>
        </div>
        <div className="h-48 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-glass p-6 rounded-2xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
            <XCircle className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h3 className="font-semibold">AI Fraud Detection</h3>
            <p className="text-xs text-[var(--muted-text)]">Service unavailable</p>
          </div>
        </div>
        <p className="text-sm text-[var(--muted-text)] text-center py-4">
          {error}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card-glass p-6 rounded-2xl"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">AI Fraud Detection</h3>
          <p className="text-xs text-[var(--muted-text)]">
            {user?.email ? `Analyzing ${user.email}'s transactions` : 'Transaction risk analysis'}
          </p>
        </div>
        {(highRiskCount > 0 || mediumRiskCount > 0) && (
          <div className="flex gap-2">
            {highRiskCount > 0 && (
              <span className="px-2 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-medium">
                {highRiskCount} High Risk
              </span>
            )}
            {mediumRiskCount > 0 && (
              <span className="px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium">
                {mediumRiskCount} Medium
              </span>
            )}
          </div>
        )}
      </div>

      {/* Risk Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-emerald-500/10 rounded-xl p-3 text-center border border-emerald-500/20">
          <p className="text-2xl font-bold text-emerald-400">
            {transactions.filter(t => t.riskLevel === 'Low').length}
          </p>
          <p className="text-xs text-[var(--muted-text)]">Low Risk</p>
        </div>
        <div className="bg-amber-500/10 rounded-xl p-3 text-center border border-amber-500/20">
          <p className="text-2xl font-bold text-amber-400">{mediumRiskCount}</p>
          <p className="text-xs text-[var(--muted-text)]">Medium</p>
        </div>
        <div className="bg-rose-500/10 rounded-xl p-3 text-center border border-rose-500/20">
          <p className="text-2xl font-bold text-rose-400">{highRiskCount}</p>
          <p className="text-xs text-[var(--muted-text)]">High Risk</p>
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        <AnimatePresence>
          {transactions.map((tx, index) => {
            const config = getRiskConfig(tx.riskLevel);
            const Icon = config.icon;

            return (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedTransaction(tx)}
                className={cn(
                  'p-3 rounded-xl border cursor-pointer transition-all hover:scale-[1.02]',
                  config.bgColor,
                  config.borderColor
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', config.bgColor)}>
                    <Icon className={cn('w-5 h-5', config.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm truncate">{tx.description}</p>
                      <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', config.bgColor, config.color)}>
                        {tx.riskLevel}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-[var(--muted-text)]">{tx.date}</p>
                      <p className="font-medium text-sm">{formatCurrency(tx.amount)}</p>
                    </div>
                    {/* Anomaly Score Bar */}
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-[var(--muted-text)]">Anomaly Score</span>
                        <span className={config.color}>{(tx.anomalyScore * 100).toFixed(1)}%</span>
                      </div>
                      <div className="h-1.5 bg-[var(--glass-bg)] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${tx.anomalyScore * 100}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className={cn('h-full rounded-full', config.progressColor)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {transactions.length === 0 && (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 mx-auto mb-3 text-[var(--muted-text)] opacity-50" />
            <p className="text-sm text-[var(--muted-text)]">No transactions to analyze</p>
          </div>
        )}
      </div>

      {/* Selected Transaction Details */}
      <AnimatePresence>
        {selectedTransaction && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Risk Analysis Details</h4>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="text-xs text-[var(--muted-text)] hover:text-[var(--foreground)]"
              >
                Close
              </button>
            </div>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="text-[var(--muted-text)]">Transaction:</span>{' '}
                <span className="font-medium">{selectedTransaction.description}</span>
              </p>
              <p className="text-sm">
                <span className="text-[var(--muted-text)]">Amount:</span>{' '}
                <span className="font-medium">{formatCurrency(selectedTransaction.amount)}</span>
              </p>
              <p className="text-sm">
                <span className="text-[var(--muted-text)]">Anomaly Score:</span>{' '}
                <span className={getRiskConfig(selectedTransaction.riskLevel).color}>
                  {(selectedTransaction.anomalyScore * 100).toFixed(1)}%
                </span>
              </p>
              {selectedTransaction.reasonFlags.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-[var(--muted-text)] mb-2">Risk Factors:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTransaction.reasonFlags.map((flag, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs"
                      >
                        {flag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Info */}
      <div className="mt-4 pt-4 border-t border-[var(--glass-border)]">
        <div className="flex items-start gap-2">
          <Brain className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
          <p className="text-xs text-[var(--muted-text)]">
            AI analyzes transaction patterns, amounts, timing, and merchant history to detect anomalies. 
            High-risk transactions may require manual review.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
