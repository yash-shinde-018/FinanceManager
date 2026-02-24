'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, DollarSign, Calendar, Tag, CreditCard, FileText, Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createTransactionWithML } from '@/lib/db/ml-transactions';

const transactionSchema = z.object({
  amount: z.string().min(1, 'Amount is required'),
  description: z.string().min(2, 'Description must be at least 2 characters'),
  category: z.string().optional(), // Made optional - ML will categorize
  type: z.enum(['income', 'expense']),
  date: z.string().min(1, 'Date is required'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  merchant: z.string().optional(),
  notes: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface AddTransactionModalProps {
  onClose: () => void;
}

const categories = [
  { value: 'food', label: 'Food & Dining', color: 'bg-orange-500' },
  { value: 'transportation', label: 'Transportation', color: 'bg-blue-500' },
  { value: 'shopping', label: 'Shopping', color: 'bg-purple-500' },
  { value: 'entertainment', label: 'Entertainment', color: 'bg-pink-500' },
  { value: 'housing', label: 'Housing', color: 'bg-cyan-500' },
  { value: 'utilities', label: 'Utilities', color: 'bg-yellow-500' },
  { value: 'healthcare', label: 'Healthcare', color: 'bg-red-500' },
  { value: 'education', label: 'Education', color: 'bg-indigo-500' },
  { value: 'salary', label: 'Salary', color: 'bg-emerald-500' },
  { value: 'investment', label: 'Investment', color: 'bg-teal-500' },
  { value: 'other', label: 'Other', color: 'bg-gray-500' },
];

const paymentMethods = [
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'digital_wallet', label: 'Digital Wallet' },
];

export default function AddTransactionModal({ onClose }: AddTransactionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');
  const [suggestedCategory, setSuggestedCategory] = useState<string | null>(null);
  const [categoryConfidence, setCategoryConfidence] = useState<number>(0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
    },
  });

  const selectedCategory = watch('category');
  const description = watch('description');

  // Auto-suggest category based on description using ML
  useEffect(() => {
    const suggestCategory = async () => {
      if (description && description.length > 3) {
        try {
          const { mlClient, formatTransactionForML } = await import('@/lib/ml/client');
          const result = await mlClient.categorizeTransaction(
            formatTransactionForML({
              date: new Date(),
              description,
              amount: -100, // dummy amount for categorization
            })
          );

          if (result) {
            setSuggestedCategory(result.category);
            setCategoryConfidence(result.confidence);

            // Auto-fill category
            setValue('category', result.category.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_'));
          }
        } catch (error) {
          console.error('Error suggesting category:', error);
        }
      }
    };

    const debounce = setTimeout(suggestCategory, 500);
    return () => clearTimeout(debounce);
  }, [description, setValue]);

  const handleTypeChange = (type: 'income' | 'expense') => {
    setTransactionType(type);
    setValue('type', type);
  };

  const onSubmit = async (data: TransactionFormData) => {
    setIsSubmitting(true);

    try {
      const amount = data.type === 'expense' ? -Number(data.amount) : Number(data.amount);

      await createTransactionWithML({
        description: data.description,
        amount,
        date: new Date(data.date),
        paymentMethod: data.paymentMethod,
        merchant: data.merchant,
      });

      setIsSuccess(true);
      setTimeout(() => {
        window.location.reload(); // Refresh to show new transaction
      }, 1500);
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert('Failed to create transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-lg card-glass rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        {!isSuccess ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-[var(--glass-border)] flex items-center justify-between sticky top-0 bg-[var(--card-bg)] z-10">
              <h2 className="text-xl font-bold">Add Transaction</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-[var(--glass-bg)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
              {/* Transaction Type Toggle */}
              <div className="flex p-1 bg-[var(--glass-bg)] rounded-xl">
                <button
                  type="button"
                  onClick={() => handleTypeChange('expense')}
                  className={cn(
                    'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all',
                    transactionType === 'expense'
                      ? 'bg-rose-500 text-white'
                      : 'text-[var(--muted-text)] hover:text-[var(--foreground)]'
                  )}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('income')}
                  className={cn(
                    'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all',
                    transactionType === 'income'
                      ? 'bg-emerald-500 text-white'
                      : 'text-[var(--muted-text)] hover:text-[var(--foreground)]'
                  )}
                >
                  Income
                </button>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium mb-2">Amount</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-text)]" />
                  <input
                    {...register('amount')}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="input-premium input-with-left-icon text-lg"
                  />
                </div>
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-400">{errors.amount.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-text)]" />
                  <input
                    {...register('description')}
                    type="text"
                    placeholder="What was this for?"
                    className="input-premium input-with-left-icon"
                  />
                </div>
                {errors.description && (
                  <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>
                )}
              </div>

              {/* Category - AI Auto-filled */}
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  Category
                  <span className="text-xs text-indigo-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    AI Auto-categorized
                  </span>
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-text)]" />
                  <select
                    {...register('category')}
                    className="input-premium input-with-left-icon appearance-none cursor-pointer"
                  >
                    <option value="">Type description to auto-categorize...</option>
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                {suggestedCategory && categoryConfidence > 0 && (
                  <div className="mt-2 p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30">
                    <div className="flex items-center gap-2 text-xs text-indigo-400">
                      <Sparkles className="w-3 h-3" />
                      <span>AI categorized as: <strong>{suggestedCategory}</strong> ({(categoryConfidence * 100).toFixed(0)}% confidence)</span>
                    </div>
                  </div>
                )}
                {errors.category && (
                  <p className="mt-1 text-sm text-red-400">{errors.category.message}</p>
                )}
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-text)]" />
                  <input
                    {...register('date')}
                    type="date"
                    className="input-premium input-with-left-icon"
                  />
                </div>
                {errors.date && (
                  <p className="mt-1 text-sm text-red-400">{errors.date.message}</p>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium mb-2">Payment Method</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-text)]" />
                  <select
                    {...register('paymentMethod')}
                    className="input-premium input-with-left-icon appearance-none cursor-pointer"
                  >
                    <option value="">Select payment method</option>
                    {paymentMethods.map((method) => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.paymentMethod && (
                  <p className="mt-1 text-sm text-red-400">{errors.paymentMethod.message}</p>
                )}
              </div>

              {/* Merchant (Optional) */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Merchant <span className="text-[var(--muted-text)]">(Optional)</span>
                </label>
                <input
                  {...register('merchant')}
                  type="text"
                  placeholder="Where did you make this purchase?"
                  className="input-premium"
                />
              </div>

              {/* Notes (Optional) */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Notes <span className="text-[var(--muted-text)]">(Optional)</span>
                </label>
                <textarea
                  {...register('notes')}
                  rows={3}
                  placeholder="Add any additional details..."
                  className="input-premium resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  'btn-primary w-full flex items-center justify-center gap-2',
                  isSubmitting && 'opacity-70 cursor-not-allowed'
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Add Transaction'
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="p-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </motion.div>
            <h3 className="text-xl font-bold mb-2">Transaction Added!</h3>
            <p className="text-[var(--muted-text)]">
              Your transaction has been recorded successfully.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
