'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, CheckCircle, XCircle, AlertCircle, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface AnomalyReviewModalProps {
  transaction: {
    id: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    occurred_at: string;
    is_anomaly: boolean;
  };
  confidence: number;
  onClose: () => void;
  onConfirm: (isActuallyAnomaly: boolean, notes?: string) => void;
}

export default function AnomalyReviewModal({
  transaction,
  confidence,
  onClose,
  onConfirm,
}: AnomalyReviewModalProps) {
  const [selectedOption, setSelectedOption] = useState<boolean | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (selectedOption === null) return;
    
    setIsSubmitting(true);
    try {
      await onConfirm(selectedOption, notes);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number, type: string) => {
    const sign = type === 'expense' ? '-' : '+';
    return `${sign}₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-[#1a1a2e] border border-[var(--glass-border)] rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-[var(--glass-border)]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Unusual Transaction Detected</h2>
              <p className="text-sm text-[var(--muted-text)]">
                AI flagged this transaction as potentially unusual
              </p>
            </div>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="p-6 space-y-4">
          <div className="p-4 bg-[#252545] rounded-xl border border-[var(--glass-border)]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[var(--muted-text)]">Description</span>
              <span className="font-medium">{transaction.description}</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[var(--muted-text)]">Amount</span>
              <span className={cn(
                "font-semibold text-lg",
                transaction.type === 'expense' ? 'text-red-400' : 'text-emerald-400'
              )}>
                {formatCurrency(transaction.amount, transaction.type)}
              </span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[var(--muted-text)]">Category</span>
              <span className="px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs">
                {transaction.category}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--muted-text)]">Date</span>
              <span>{new Date(transaction.occurred_at).toLocaleDateString('en-IN')}</span>
            </div>
          </div>

          {/* AI Confidence */}
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4 text-indigo-400" />
            <span className="text-[var(--muted-text)]">
              AI Confidence: <span className="text-indigo-400 font-medium">{Math.round(confidence * 100)}%</span>
            </span>
          </div>

          {/* Question */}
          <div className="pt-4">
            <p className="text-lg font-medium mb-4">Is this transaction actually unusual?</p>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedOption(false)}
                className={cn(
                  'p-4 rounded-xl border-2 transition-all text-left',
                  selectedOption === false
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-[var(--glass-border)] hover:border-emerald-500/50'
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className={cn(
                    'w-5 h-5',
                    selectedOption === false ? 'text-emerald-400' : 'text-[var(--muted-text)]'
                  )} />
                  <span className="font-medium">No, it's normal</span>
                </div>
                <p className="text-sm text-[var(--muted-text)]">
                  This is a regular transaction for me
                </p>
              </button>

              <button
                onClick={() => setSelectedOption(true)}
                className={cn(
                  'p-4 rounded-xl border-2 transition-all text-left',
                  selectedOption === true
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-[var(--glass-border)] hover:border-amber-500/50'
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className={cn(
                    'w-5 h-5',
                    selectedOption === true ? 'text-amber-400' : 'text-[var(--muted-text)]'
                  )} />
                  <span className="font-medium">Yes, it's unusual</span>
                </div>
                <p className="text-sm text-[var(--muted-text)]">
                  This transaction looks suspicious
                </p>
              </button>
            </div>
          </div>

          {/* Optional Notes */}
          <div className="pt-2">
            <label className="block text-sm font-medium mb-2">
              Additional Notes (Optional)
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-5 h-5 text-[var(--muted-text)]" />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Why is this normal or unusual? This helps improve our AI..."
                className="w-full bg-[#252545] border border-[var(--glass-border)] rounded-xl pl-10 pr-4 py-3 min-h-[80px] resize-none focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[var(--glass-border)] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[var(--muted-text)] hover:text-[var(--foreground)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedOption === null || isSubmitting}
            className={cn(
              'px-6 py-2 rounded-xl font-medium transition-all',
              selectedOption === null
                ? 'bg-[var(--glass-bg)] text-[var(--muted-text)] cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:opacity-90'
            )}
          >
            {isSubmitting ? 'Saving...' : 'Confirm'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
