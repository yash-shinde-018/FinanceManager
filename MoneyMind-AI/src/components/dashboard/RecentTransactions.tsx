'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertTriangle,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Transaction } from '@/types';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    'Salary': 'bg-emerald-500/20 text-emerald-400',
    'Food & Dining': 'bg-orange-500/20 text-orange-400',
    'Shopping': 'bg-purple-500/20 text-purple-400',
    'Entertainment': 'bg-pink-500/20 text-pink-400',
    'Transportation': 'bg-blue-500/20 text-blue-400',
    'Housing': 'bg-cyan-500/20 text-cyan-400',
    'Utilities': 'bg-yellow-500/20 text-yellow-400',
  };
  return colors[category] || 'bg-[var(--glass-bg)] text-[var(--muted-text)]';
};

const formatDate = (date: Date) => {
  const now = new Date();
  const transactionDate = new Date(date);
  const diff = now.getTime() - transactionDate.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return transactionDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
};

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <div className="card-glass overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-[var(--glass-border)] flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Recent Transactions</h3>
          <p className="text-sm text-[var(--muted-text)]">
            Your latest financial activity
          </p>
        </div>
        <Link 
          href="/dashboard/transactions"
          className="flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Transactions List */}
      <div className="divide-y divide-[var(--glass-border)]">
        {transactions.map((transaction, index) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="p-4 hover:bg-[var(--glass-bg)] transition-colors group"
          >
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                getCategoryColor(transaction.category)
              )}>
                {transaction.type === 'income' ? (
                  <ArrowUpRight className="w-5 h-5" />
                ) : (
                  <ArrowDownRight className="w-5 h-5" />
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{transaction.description}</p>
                  {transaction.isAnomaly && (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-[var(--muted-text)]">
                  <span>{transaction.category}</span>
                  <span>•</span>
                  <span>{formatDate(transaction.date)}</span>
                </div>
              </div>

              {/* Amount */}
              <div className="text-right shrink-0">
                <p className={cn(
                  'font-semibold',
                  transaction.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                )}>
                  {transaction.type === 'income' ? '+' : '-'}
                  ₹{transaction.amount.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-[var(--muted-text)]">
                  {transaction.paymentMethod}
                </p>
              </div>

              {/* More Options */}
              <button className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-[var(--glass-bg)] transition-all shrink-0">
                <MoreHorizontal className="w-4 h-4 text-[var(--muted-text)]" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--glass-border)] bg-[var(--glass-bg)]">
        <Link 
          href="/dashboard/transactions"
          className="w-full flex items-center justify-center gap-2 text-sm text-[var(--muted-text)] hover:text-[var(--foreground)] transition-colors py-2"
        >
          View All Transactions
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
