'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface Budget {
    id: string;
    category: string;
    limit: number;
    spent: number;
    period: 'monthly' | 'weekly';
}

const categories = [
    'Food & Dining',
    'Shopping',
    'Transportation',
    'Bills & Utilities',
    'Entertainment',
    'Healthcare',
    'Groceries',
    'Travel',
    'Education',
    'Other',
];

export default function BudgetsPage() {
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newBudget, setNewBudget] = useState({
        category: categories[0],
        limit: 0,
        period: 'monthly' as 'monthly' | 'weekly',
    });

    useEffect(() => {
        loadBudgets();
    }, []);

    const loadBudgets = async () => {
        const supabase = createClient();

        // Get current month spending by category
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { data: transactions } = await supabase
            .from('transactions')
            .select('category, amount')
            .eq('type', 'expense')
            .gte('occurred_at', startOfMonth.toISOString());

        const spending: Record<string, number> = {};
        transactions?.forEach((t) => {
            const cat = t.category || 'Other';
            spending[cat] = (spending[cat] || 0) + Number(t.amount);
        });

        // Mock budgets for demo
        const mockBudgets: Budget[] = [
            { id: '1', category: 'Food & Dining', limit: 15000, spent: spending['Food & Dining'] || 0, period: 'monthly' },
            { id: '2', category: 'Shopping', limit: 10000, spent: spending['Shopping'] || 0, period: 'monthly' },
            { id: '3', category: 'Transportation', limit: 5000, spent: spending['Transportation'] || 0, period: 'monthly' },
        ];

        setBudgets(mockBudgets);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount);
    };

    const getProgressColor = (spent: number, limit: number) => {
        const percent = (spent / limit) * 100;
        if (percent >= 100) return 'bg-rose-500';
        if (percent >= 80) return 'bg-amber-500';
        return 'bg-emerald-500';
    };

    const handleAddBudget = () => {
        const budget: Budget = {
            id: Date.now().toString(),
            category: newBudget.category,
            limit: newBudget.limit,
            spent: 0,
            period: newBudget.period,
        };
        setBudgets([...budgets, budget]);
        setShowAddModal(false);
        setNewBudget({ category: categories[0], limit: 0, period: 'monthly' });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Budget Management</h1>
                    <p className="text-[var(--muted-text)]">Set and track spending limits by category</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Add Budget
                </button>
            </div>

            {/* Budgets List */}
            <div className="space-y-4">
                {budgets.length === 0 ? (
                    <div className="card-glass p-12 text-center">
                        <Target className="w-16 h-16 text-[var(--muted-text)] mx-auto mb-4" />
                        <h3 className="font-semibold text-lg mb-2">No budgets set</h3>
                        <p className="text-[var(--muted-text)] mb-4">
                            Create budgets to track your spending and stay on target
                        </p>
                    </div>
                ) : (
                    budgets.map((budget, index) => {
                        const percent = (budget.spent / budget.limit) * 100;
                        const isOverBudget = percent >= 100;
                        const isWarning = percent >= 80 && percent < 100;

                        return (
                            <motion.div
                                key={budget.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={cn(
                                    'card-glass p-5',
                                    isOverBudget && 'border-rose-500/30',
                                    isWarning && 'border-amber-500/30'
                                )}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="font-semibold text-lg">{budget.category}</h3>
                                        <p className="text-sm text-[var(--muted-text)] capitalize">{budget.period} budget</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isOverBudget && (
                                            <AlertTriangle className="w-5 h-5 text-rose-400" />
                                        )}
                                        <button className="p-2 rounded-lg hover:bg-[var(--glass-bg)] transition-colors">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 rounded-lg hover:bg-[var(--glass-bg)] transition-colors text-rose-400">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-[var(--muted-text)]">
                                            {formatCurrency(budget.spent)} of {formatCurrency(budget.limit)}
                                        </span>
                                        <span className={cn(
                                            'font-semibold',
                                            isOverBudget && 'text-rose-400',
                                            isWarning && 'text-amber-400',
                                            !isOverBudget && !isWarning && 'text-emerald-400'
                                        )}>
                                            {percent.toFixed(0)}%
                                        </span>
                                    </div>
                                    <div className="h-2 bg-[var(--glass-bg)] rounded-full overflow-hidden">
                                        <div
                                            className={cn('h-full transition-all', getProgressColor(budget.spent, budget.limit))}
                                            style={{ width: `${Math.min(percent, 100)}%` }}
                                        />
                                    </div>
                                    {isOverBudget && (
                                        <p className="text-sm text-rose-400">
                                            Over budget by {formatCurrency(budget.spent - budget.limit)}
                                        </p>
                                    )}
                                    {isWarning && (
                                        <p className="text-sm text-amber-400">
                                            {formatCurrency(budget.limit - budget.spent)} remaining
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* Add Budget Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="card-glass p-6 max-w-md w-full"
                    >
                        <h3 className="text-xl font-bold mb-4">Add Budget</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Category</label>
                                <select
                                    value={newBudget.category}
                                    onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:border-indigo-500 outline-none"
                                >
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Budget Limit (₹)</label>
                                <input
                                    type="number"
                                    value={newBudget.limit || ''}
                                    onChange={(e) => setNewBudget({ ...newBudget, limit: Number(e.target.value) })}
                                    className="w-full px-4 py-2 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:border-indigo-500 outline-none"
                                    placeholder="10000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Period</label>
                                <select
                                    value={newBudget.period}
                                    onChange={(e) => setNewBudget({ ...newBudget, period: e.target.value as 'monthly' | 'weekly' })}
                                    className="w-full px-4 py-2 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:border-indigo-500 outline-none"
                                >
                                    <option value="monthly">Monthly</option>
                                    <option value="weekly">Weekly</option>
                                </select>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-2 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:border-indigo-500/30 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddBudget}
                                    disabled={!newBudget.limit}
                                    className="flex-1 btn-primary disabled:opacity-50"
                                >
                                    Add Budget
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
