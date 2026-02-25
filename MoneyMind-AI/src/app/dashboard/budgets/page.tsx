'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, Edit2, Trash2, AlertTriangle, X, IndianRupee } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface Budget {
    id: string;
    category: string;
    "limit": number;
    spent: number;
    period: 'monthly' | 'weekly';
    created_at?: string;
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
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingBudget, setDeletingBudget] = useState<Budget | null>(null);
    const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
    const [newBudget, setNewBudget] = useState({
        category: categories[0],
        limit: 0,
        period: 'monthly' as 'monthly' | 'weekly',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUserId(user.id);
            loadBudgets(user.id);
        }
    };

    const loadBudgets = async (uid: string) => {
        setIsLoading(true);
        const supabase = createClient();

        // Get user's budgets from Supabase
        const { data: budgetsData, error: budgetsError } = await supabase
            .from('budgets')
            .select('*')
            .eq('user_id', uid)
            .order('created_at', { ascending: false });

        if (budgetsError) {
            console.error('Failed to load budgets', budgetsError);
            setIsLoading(false);
            return;
        }

        // Get current month spending by category
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const { data: transactions } = await supabase
            .from('transactions')
            .select('category, amount')
            .eq('user_id', uid)
            .eq('type', 'expense')
            .gte('occurred_at', startOfMonth.toISOString());

        const spending: Record<string, number> = {};
        transactions?.forEach((t) => {
            const cat = t.category || 'Other';
            spending[cat] = (spending[cat] || 0) + Number(t.amount);
        });

        // Merge budgets with spending data
        const budgetsWithSpending: Budget[] = (budgetsData || []).map((b) => ({
            id: b.id,
            category: b.category,
            limit: b.limit,
            spent: spending[b.category] || 0,
            period: b.period,
            created_at: b.created_at,
        }));

        setBudgets(budgetsWithSpending);
        setIsLoading(false);
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

    const handleAddBudget = async () => {
        if (!userId) {
            console.error('Please log in to add a budget');
            return;
        }

        if (newBudget.limit <= 0) {
            console.error('Please enter a valid budget limit');
            return;
        }

        // Check if budget already exists for this category
        const existingBudget = budgets.find(b => b.category === newBudget.category);
        if (existingBudget) {
            console.error(`A budget for ${newBudget.category} already exists. Please edit it instead.`);
            return;
        }

        const supabase = createClient();
        const { error } = await supabase
            .from('budgets')
            .insert({
                user_id: userId,
                category: newBudget.category,
                limit: newBudget.limit,
                period: newBudget.period,
            });

        if (error) {
            console.error('Failed to add budget', error);
            return;
        }

        setShowAddModal(false);
        setNewBudget({ category: categories[0], limit: 0, period: 'monthly' });
        loadBudgets(userId);
    };

    const handleEditBudget = async () => {
        if (!userId || !editingBudget) return;

        if (editingBudget.limit <= 0) {
            console.error('Please enter a valid budget limit');
            return;
        }

        const supabase = createClient();
        const { error } = await supabase
            .from('budgets')
            .update({
                limit: editingBudget.limit,
                period: editingBudget.period,
            })
            .eq('id', editingBudget.id)
            .eq('user_id', userId);

        if (error) {
            console.error('Failed to update budget', error);
            return;
        }

        setShowEditModal(false);
        setEditingBudget(null);
        loadBudgets(userId);
    };

    const handleDeleteBudget = async () => {
        if (!userId || !deletingBudget) return;

        const supabase = createClient();
        const { error } = await supabase
            .from('budgets')
            .delete()
            .eq('id', deletingBudget.id)
            .eq('user_id', userId);

        if (error) {
            console.error('Failed to delete budget', error);
            return;
        }

        setShowDeleteModal(false);
        setDeletingBudget(null);
        loadBudgets(userId);
    };

    const openDeleteModal = (budget: Budget) => {
        setDeletingBudget(budget);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setDeletingBudget(null);
    };

    const openEditModal = (budget: Budget) => {
        setEditingBudget(budget);
        setShowEditModal(true);
    };

    const resetForm = () => {
        setNewBudget({ category: categories[0], limit: 0, period: 'monthly' });
    };

    const closeAddModal = () => {
        setShowAddModal(false);
        resetForm();
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
                {isLoading ? (
                    <div className="card-glass p-12 text-center">
                        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-[var(--muted-text)]">Loading budgets...</p>
                    </div>
                ) : budgets.length === 0 ? (
                    <div className="card-glass p-12 text-center">
                        <Target className="w-16 h-16 text-[var(--muted-text)] mx-auto mb-4" />
                        <h3 className="font-semibold text-lg mb-2">No budgets set</h3>
                        <p className="text-[var(--muted-text)] mb-4">
                            Create budgets to track your spending and stay on target
                        </p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="btn-primary inline-flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Create Your First Budget
                        </button>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {budgets.map((budget) => {
                            const percent = (budget.spent / budget.limit) * 100;
                            const isOverBudget = percent >= 100;
                            const isWarning = percent >= 80 && percent < 100;

                            return (
                                <motion.div
                                    key={budget.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
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
                                            <button 
                                                onClick={() => openEditModal(budget)}
                                                className="p-2 rounded-lg hover:bg-[var(--glass-bg)] transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => openDeleteModal(budget)}
                                                className="p-2 rounded-lg hover:bg-[var(--glass-bg)] transition-colors text-rose-400"
                                            >
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
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(percent, 100)}%` }}
                                                transition={{ duration: 0.5, delay: 0.1 }}
                                                className={cn('h-full', getProgressColor(budget.spent, budget.limit))}
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
                        })}
                    </AnimatePresence>
                )}
            </div>

            {/* Add Budget Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="card-glass p-6 max-w-md w-full"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold">Add Budget</h3>
                                <button
                                    onClick={closeAddModal}
                                    className="p-1 rounded-lg hover:bg-[var(--glass-bg)] transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
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
                                    <label className="block text-sm font-medium mb-2">Budget Limit</label>
                                    <div className="relative">
                                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
                                        <input
                                            type="number"
                                            value={newBudget.limit || ''}
                                            onChange={(e) => setNewBudget({ ...newBudget, limit: Number(e.target.value) })}
                                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:border-indigo-500 outline-none"
                                            placeholder="10000"
                                            min="1"
                                        />
                                    </div>
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
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={closeAddModal}
                                        className="flex-1 px-4 py-2 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:border-indigo-500/30 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddBudget}
                                        disabled={!newBudget.limit || newBudget.limit <= 0}
                                        className="flex-1 btn-primary disabled:opacity-50"
                                    >
                                        Add Budget
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit Budget Modal */}
            <AnimatePresence>
                {showEditModal && editingBudget && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="card-glass p-6 max-w-md w-full"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold">Edit Budget</h3>
                                <button
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setEditingBudget(null);
                                    }}
                                    className="p-1 rounded-lg hover:bg-[var(--glass-bg)] transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Category</label>
                                    <input
                                        type="text"
                                        value={editingBudget.category}
                                        disabled
                                        className="w-full px-4 py-2 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] opacity-50 cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Budget Limit</label>
                                    <div className="relative">
                                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
                                        <input
                                            type="number"
                                            value={editingBudget.limit || ''}
                                            onChange={(e) => setEditingBudget({ ...editingBudget, limit: Number(e.target.value) })}
                                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:border-indigo-500 outline-none"
                                            placeholder="10000"
                                            min="1"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Period</label>
                                    <select
                                        value={editingBudget.period}
                                        onChange={(e) => setEditingBudget({ ...editingBudget, period: e.target.value as 'monthly' | 'weekly' })}
                                        className="w-full px-4 py-2 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:border-indigo-500 outline-none"
                                    >
                                        <option value="monthly">Monthly</option>
                                        <option value="weekly">Weekly</option>
                                    </select>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setEditingBudget(null);
                                        }}
                                        className="flex-1 px-4 py-2 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:border-indigo-500/30 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleEditBudget}
                                        disabled={!editingBudget.limit || editingBudget.limit <= 0}
                                        className="flex-1 btn-primary disabled:opacity-50"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && deletingBudget && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="card-glass p-6 max-w-md w-full"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold">Delete Budget</h3>
                                <button
                                    onClick={closeDeleteModal}
                                    className="p-1 rounded-lg hover:bg-[var(--glass-bg)] transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <p className="text-[var(--muted-text)]">
                                    Are you sure you want to delete the budget for <strong className="text-[var(--foreground)]">{deletingBudget.category}</strong>?
                                    This action cannot be undone.
                                </p>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={closeDeleteModal}
                                        className="flex-1 px-4 py-2 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:border-indigo-500/30 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDeleteBudget}
                                        className="flex-1 px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white transition-all"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
