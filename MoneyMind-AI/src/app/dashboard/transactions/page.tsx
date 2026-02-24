'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Download, 
  ArrowUpRight, 
  ArrowDownRight,
  AlertTriangle,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AddTransactionModal from '@/components/dashboard/AddTransactionModal';
import type { Transaction } from '@/types';
import { listTransactions, type TransactionRow } from '@/lib/db/transactions';

const categories = ['All', 'Income', 'Food & Dining', 'Shopping', 'Entertainment', 'Transportation', 'Housing', 'Utilities', 'Investment'];

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    'Salary': 'bg-emerald-500/20 text-emerald-400',
    'Investment': 'bg-teal-500/20 text-teal-400',
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
  return new Date(date).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const itemsPerPage = 10;

  const reload = async () => {
    const rows = await listTransactions(250);
    const mapped: Transaction[] = rows.map((t: TransactionRow) => ({
      id: t.id,
      userId: t.user_id,
      amount: Number(t.amount),
      type: t.type,
      category: t.category,
      description: t.description,
      date: new Date(t.occurred_at),
      status: (t.status as any) ?? 'completed',
      paymentMethod: t.payment_method ?? '—',
      merchant: t.merchant ?? undefined,
      isAnomaly: t.is_anomaly,
    }));
    setTransactions(mapped);
  };

  useEffect(() => {
    reload();
  }, []);

  // Filter transactions
  const filteredTransactions = useMemo(() => transactions.filter((transaction) => {
    const matchesSearch = 
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.merchant?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || 
      (selectedCategory === 'Income' ? transaction.type === 'income' : transaction.category === selectedCategory);
    
    const matchesType = selectedType === 'all' || transaction.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  }), [transactions, searchQuery, selectedCategory, selectedType]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-[var(--muted-text)]">
            Manage and track all your financial activity
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card-glass p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-text)]" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-premium pl-10 w-full"
            />
          </div>

          {/* Type Filter */}
          <div className="flex p-1 bg-[var(--glass-bg)] rounded-lg">
            {(['all', 'income', 'expense'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-all capitalize',
                  selectedType === type
                    ? 'bg-[var(--card-bg)] text-[var(--foreground)] shadow-sm'
                    : 'text-[var(--muted-text)] hover:text-[var(--foreground)]'
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-[var(--muted-text)]" />
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                selectedCategory === category
                  ? 'bg-indigo-500 text-white'
                  : 'bg-[var(--glass-bg)] text-[var(--muted-text)] hover:text-[var(--foreground)]'
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card-glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--glass-bg)]">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--muted-text)]">Transaction</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--muted-text)]">Category</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--muted-text)]">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--muted-text)]">Payment Method</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-[var(--muted-text)]">Amount</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-[var(--muted-text)]">Status</th>
                <th className="text-center py-3 px-4 text-sm font-medium text-[var(--muted-text)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--glass-border)]">
              {paginatedTransactions.map((transaction, index) => (
                <motion.tr
                  key={transaction.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-[var(--glass-bg)] transition-colors group"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center',
                        getCategoryColor(transaction.category)
                      )}>
                        {transaction.type === 'income' ? (
                          <ArrowUpRight className="w-5 h-5" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        {transaction.isAnomaly && (
                          <div className="flex items-center gap-1 text-amber-400 text-xs">
                            <AlertTriangle className="w-3 h-3" />
                            Anomaly detected
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      getCategoryColor(transaction.category)
                    )}>
                      {transaction.category}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-[var(--muted-text)]">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="py-4 px-4 text-sm">
                    {transaction.paymentMethod}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className={cn(
                      'font-semibold',
                      transaction.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                    )}>
                      {transaction.type === 'income' ? '+' : '-'}
                      ₹{transaction.amount.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
                      {transaction.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-[var(--glass-bg)] transition-all">
                      <MoreHorizontal className="w-4 h-4 text-[var(--muted-text)]" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-[var(--glass-border)] flex items-center justify-between">
          <p className="text-sm text-[var(--muted-text)]">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-[var(--glass-bg)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={cn(
                  'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                  currentPage === page
                    ? 'bg-indigo-500 text-white'
                    : 'hover:bg-[var(--glass-bg)] text-[var(--muted-text)]'
                )}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-[var(--glass-bg)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <AddTransactionModal onClose={() => {
          setShowAddModal(false);
          reload();
        }} />
      )}
    </div>
  );
}
