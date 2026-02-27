'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Target,
  Plus,
  TrendingUp,
  Calendar,
  MoreHorizontal,
  Edit2,
  Trash2,
  CheckCircle2,
  Car,
  Home,
  Plane,
  GraduationCap,
  Heart,
  Briefcase,
  Gift,
  Zap,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FinancialGoal } from '@/types';
import { listGoals, createGoal, updateGoal, deleteGoal, addFundsToGoal, type GoalRow } from '@/lib/db/goals';

const goalIcons: Record<string, React.ElementType> = {
  shield: Target,
  car: Car,
  plane: Plane,
  graduation: GraduationCap,
  home: Home,
  health: Heart,
  work: Briefcase,
  gift: Gift,
  lightning: Zap,
};

const iconOptions = [
  { value: 'shield', label: 'General', Icon: Target },
  { value: 'car', label: 'Car', Icon: Car },
  { value: 'home', label: 'Home', Icon: Home },
  { value: 'plane', label: 'Travel', Icon: Plane },
  { value: 'graduation', label: 'Education', Icon: GraduationCap },
  { value: 'health', label: 'Health', Icon: Heart },
  { value: 'work', label: 'Career', Icon: Briefcase },
  { value: 'gift', label: 'Gift', Icon: Gift },
  { value: 'lightning', label: 'Emergency', Icon: Zap },
];

const colorOptions = [
  { value: '#6366f1', label: 'Indigo' },
  { value: '#10b981', label: 'Emerald' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#ef4444', label: 'Red' },
  { value: '#8b5cf6', label: 'Violet' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#84cc16', label: 'Lime' },
];

const getIconComponent = (iconName: string) => {
  return goalIcons[iconName] || Target;
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<FinancialGoal | null>(null);
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [fundsAmount, setFundsAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    deadline: '',
    category: 'Goal',
    icon: 'shield',
    color: '#6366f1',
  });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    const rows = await listGoals();
    const mapped: FinancialGoal[] = rows.map((g: GoalRow) => ({
      id: g.id,
      userId: g.user_id,
      name: g.name,
      targetAmount: Number(g.target_amount),
      currentAmount: Number(g.current_amount),
      deadline: g.deadline ? new Date(g.deadline) : new Date(),
      category: g.category ?? 'Goal',
      icon: g.icon ?? 'shield',
      color: g.color ?? '#6366f1',
      status: (g.status as any) ?? 'active',
    }));
    setGoals(mapped);
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.name || !newGoal.targetAmount || !newGoal.deadline) return;

    setIsSubmitting(true);
    try {
      await createGoal(
        newGoal.name,
        Number(newGoal.targetAmount),
        newGoal.deadline,
        newGoal.category,
        newGoal.icon,
        newGoal.color
      );
      await loadGoals();
      setShowAddModal(false);
      setNewGoal({
        name: '',
        targetAmount: '',
        deadline: '',
        category: 'Goal',
        icon: 'shield',
        color: '#6366f1',
      });
    } catch (error) {
      console.error('Failed to create goal:', error);
      alert('Failed to create goal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal || !fundsAmount) return;

    const amount = Number(fundsAmount);
    const remaining = selectedGoal.targetAmount - selectedGoal.currentAmount;

    // Validation: Check if amount is positive
    if (amount <= 0) {
      alert('Please enter a valid amount greater than 0');
      return;
    }

    // Validation: Check if amount exceeds remaining goal amount
    if (amount > remaining) {
      alert(`Cannot add ₹${amount.toFixed(2)}. Only ₹${remaining.toFixed(2)} remaining to reach your goal of ₹${selectedGoal.targetAmount.toFixed(2)}.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await addFundsToGoal(selectedGoal.id, amount);
      await loadGoals();
      setShowAddFundsModal(false);
      setFundsAmount('');
      setSelectedGoal(null);
    } catch (error) {
      console.error('Failed to add funds:', error);
      alert('Failed to add funds. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal) return;

    setIsSubmitting(true);
    try {
      await updateGoal(selectedGoal.id, {
        name: selectedGoal.name,
        target_amount: selectedGoal.targetAmount,
        deadline: selectedGoal.deadline.toISOString().split('T')[0],
        category: selectedGoal.category,
        icon: selectedGoal.icon,
        color: selectedGoal.color,
      });
      await loadGoals();
      setShowEditModal(false);
      setSelectedGoal(null);
    } catch (error) {
      console.error('Failed to update goal:', error);
      alert('Failed to update goal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGoal = async () => {
    if (!selectedGoal) return;

    setIsSubmitting(true);
    try {
      await deleteGoal(selectedGoal.id);
      await loadGoals();
      setShowDeleteConfirm(false);
      setSelectedGoal(null);
    } catch (error) {
      console.error('Failed to delete goal:', error);
      alert('Failed to delete goal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalSaved = goals.reduce((acc, goal) => acc + goal.currentAmount, 0);
  const totalTarget = goals.reduce((acc, goal) => acc + goal.targetAmount, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Financial Goals</h1>
          <p className="text-[var(--muted-text)]">
            Track and achieve your financial dreams
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          New Goal
        </button>
      </div>

      {/* Overall Progress */}
      <div className="card-glass p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h2 className="font-semibold">Overall Progress</h2>
            </div>
            <p className="text-[var(--muted-text)] text-sm mb-4">
              You've saved {formatCurrency(totalSaved)} out of {formatCurrency(totalTarget)} across all goals
            </p>
            <div className="h-3 bg-[var(--glass-bg)] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${overallProgress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
              />
            </div>
            <p className="text-sm text-[var(--muted-text)] mt-2">
              {overallProgress.toFixed(1)}% completed
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:w-64 shrink-0">
            <div className="p-4 rounded-xl bg-[var(--glass-bg)] text-center">
              <p className="text-2xl font-bold text-emerald-400">{goals.length}</p>
              <p className="text-xs text-[var(--muted-text)]">Active Goals</p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--glass-bg)] text-center">
              <p className="text-2xl font-bold text-indigo-400">{formatCurrency(totalSaved)}</p>
              <p className="text-xs text-[var(--muted-text)]">Total Saved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal, index) => {
          const Icon = getIconComponent(goal.icon);
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="card-glass p-5 hover:border-indigo-500/30 transition-all duration-300 group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${goal.color}20` }}
                >
                  <Icon className="w-6 h-6" style={{ color: goal.color }} />
                </div>
                <button
                  onClick={() => setShowMenu(showMenu === goal.id ? null : goal.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-[var(--glass-bg)] transition-all"
                >
                  <MoreHorizontal className="w-4 h-4 text-[var(--muted-text)]" />
                </button>

                {/* Dropdown Menu */}
                {showMenu === goal.id && (
                  <div className="absolute right-0 mt-2 w-48 card-glass rounded-lg shadow-xl z-10 overflow-hidden">
                    <button
                      onClick={() => {
                        setSelectedGoal(goal);
                        setShowEditModal(true);
                        setShowMenu(null);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-[var(--glass-bg)] transition-colors flex items-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit Goal
                    </button>
                    <button
                      onClick={() => {
                        setSelectedGoal(goal);
                        setShowDeleteConfirm(true);
                        setShowMenu(null);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-rose-500/10 text-rose-400 transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Goal
                    </button>
                  </div>
                )}
              </div>

              {/* Goal Info */}
              <h3 className="font-semibold text-lg mb-1">{goal.name}</h3>
              <p className="text-sm text-[var(--muted-text)] mb-4">{goal.category}</p>

              {/* Progress */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{formatCurrency(goal.currentAmount)}</span>
                  <span className="text-[var(--muted-text)]">of {formatCurrency(goal.targetAmount)}</span>
                </div>
                <div className="h-2 bg-[var(--glass-bg)] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: goal.color }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: goal.color }}>{progress.toFixed(0)}% completed</span>
                  <span className="text-[var(--muted-text)]">{daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center gap-2 text-xs text-[var(--muted-text)]">
                <Calendar className="w-3 h-3" />
                <span>Target: {formatDate(goal.deadline)}</span>
              </div>

              {/* Quick Actions */}
              <div className="mt-4 pt-4 border-t border-[var(--glass-border)] flex gap-2">
                <button
                  onClick={() => {
                    setSelectedGoal(goal);
                    setShowAddFundsModal(true);
                  }}
                  className="flex-1 py-2 rounded-lg bg-[var(--glass-bg)] hover:bg-indigo-500/20 hover:text-indigo-400 transition-colors text-sm font-medium"
                >
                  Add Funds
                </button>
                <button
                  onClick={() => {
                    setSelectedGoal(goal);
                    setShowEditModal(true);
                  }}
                  className="p-2 rounded-lg bg-[var(--glass-bg)] hover:bg-[var(--elevated-bg)] transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}

        {/* Add New Goal Card */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: goals.length * 0.1 }}
          onClick={() => setShowAddModal(true)}
          className="card-glass p-5 border-dashed border-2 border-[var(--glass-border)] hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all duration-300 flex flex-col items-center justify-center min-h-[280px] group"
        >
          <div className="w-16 h-16 rounded-full bg-[var(--glass-bg)] flex items-center justify-center mb-4 group-hover:bg-indigo-500/20 transition-colors">
            <Plus className="w-8 h-8 text-[var(--muted-text)] group-hover:text-indigo-400 transition-colors" />
          </div>
          <p className="font-medium text-[var(--muted-text)] group-hover:text-[var(--foreground)] transition-colors">
            Create New Goal
          </p>
        </motion.button>
      </div>

      {/* Add Goal Modal - Full Form */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md card-glass rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Create New Goal</h2>
                  <p className="text-sm text-[var(--muted-text)]">Set a financial target</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-lg hover:bg-[var(--glass-bg)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              {/* Goal Name */}
              <div>
                <label className="block text-sm font-medium mb-2">Goal Name</label>
                <input
                  type="text"
                  placeholder="e.g., New Car, Vacation, Emergency Fund"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  className="input-premium w-full"
                  required
                />
              </div>

              {/* Target Amount */}
              <div>
                <label className="block text-sm font-medium mb-2">Target Amount</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={newGoal.targetAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                  className="input-premium w-full"
                  required
                />
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-sm font-medium mb-2">Target Date</label>
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  className="input-premium w-full"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <input
                  type="text"
                  placeholder="e.g., Travel, Savings, Emergency"
                  value={newGoal.category}
                  onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                  className="input-premium w-full"
                />
              </div>

              {/* Icon Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Icon</label>
                <div className="grid grid-cols-5 gap-2">
                  {iconOptions.map(({ value, Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setNewGoal({ ...newGoal, icon: value })}
                      className={cn(
                        'p-3 rounded-xl transition-all',
                        newGoal.icon === value
                          ? 'bg-indigo-500/20 border-2 border-indigo-500'
                          : 'bg-[var(--glass-bg)] border-2 border-transparent hover:border-indigo-500/30'
                      )}
                    >
                      <Icon className={cn(
                        'w-5 h-5 mx-auto',
                        newGoal.icon === value ? 'text-indigo-400' : 'text-[var(--muted-text)]'
                      )} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setNewGoal({ ...newGoal, color: value })}
                      className={cn(
                        'w-8 h-8 rounded-full transition-all',
                        newGoal.color === value ? 'ring-2 ring-offset-2 ring-offset-[var(--background)] ring-white' : ''
                      )}
                      style={{ backgroundColor: value }}
                      title={label}
                    />
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !newGoal.name || !newGoal.targetAmount || !newGoal.deadline}
                className="btn-primary w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Goal'}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Add Funds Modal */}
      {showAddFundsModal && selectedGoal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md card-glass rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Add Funds to {selectedGoal.name}</h2>
              <button
                onClick={() => {
                  setShowAddFundsModal(false);
                  setFundsAmount('');
                }}
                className="p-2 rounded-lg hover:bg-[var(--glass-bg)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Goal Progress Info */}
            <div className="mb-4 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[var(--muted-text)]">Current Progress</span>
                <span className="text-sm font-medium">
                  {formatCurrency(selectedGoal.currentAmount)} / {formatCurrency(selectedGoal.targetAmount)}
                </span>
              </div>
              <div className="h-2 bg-[var(--glass-bg)] rounded-full overflow-hidden mb-2">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  style={{ width: `${(selectedGoal.currentAmount / selectedGoal.targetAmount) * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-indigo-400">
                  {((selectedGoal.currentAmount / selectedGoal.targetAmount) * 100).toFixed(1)}% completed
                </span>
                <span className="text-xs font-medium text-emerald-400">
                  {formatCurrency(selectedGoal.targetAmount - selectedGoal.currentAmount)} remaining
                </span>
              </div>
            </div>

            <form onSubmit={handleAddFunds} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Amount to Add</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={selectedGoal.targetAmount - selectedGoal.currentAmount}
                  placeholder="0.00"
                  value={fundsAmount}
                  onChange={(e) => setFundsAmount(e.target.value)}
                  className="input-premium w-full"
                  required
                  autoFocus
                />
                <p className="text-xs text-[var(--muted-text)] mt-2">
                  Maximum you can add: {formatCurrency(selectedGoal.targetAmount - selectedGoal.currentAmount)}
                </p>
              </div>

              {/* Preview */}
              {fundsAmount && Number(fundsAmount) > 0 && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-sm text-emerald-400">
                    New balance: {formatCurrency(selectedGoal.currentAmount + Number(fundsAmount))}
                  </p>
                  <p className="text-xs text-[var(--muted-text)] mt-1">
                    {Number(fundsAmount) > (selectedGoal.targetAmount - selectedGoal.currentAmount)
                      ? '⚠️ Amount exceeds remaining goal amount'
                      : `✓ ${(((selectedGoal.currentAmount + Number(fundsAmount)) / selectedGoal.targetAmount) * 100).toFixed(1)}% of goal`
                    }
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !fundsAmount || Number(fundsAmount) <= 0}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Adding...' : 'Add Funds'}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Goal Modal */}
      {showEditModal && selectedGoal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md card-glass rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Edit Goal</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedGoal(null);
                }}
                className="p-2 rounded-lg hover:bg-[var(--glass-bg)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditGoal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Goal Name</label>
                <input
                  type="text"
                  value={selectedGoal.name}
                  onChange={(e) => setSelectedGoal({ ...selectedGoal, name: e.target.value })}
                  className="input-premium w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Target Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={selectedGoal.targetAmount}
                  onChange={(e) => setSelectedGoal({ ...selectedGoal, targetAmount: Number(e.target.value) })}
                  className="input-premium w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Target Date</label>
                <input
                  type="date"
                  value={selectedGoal.deadline.toISOString().split('T')[0]}
                  onChange={(e) => setSelectedGoal({ ...selectedGoal, deadline: new Date(e.target.value) })}
                  className="input-premium w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <input
                  type="text"
                  value={selectedGoal.category}
                  onChange={(e) => setSelectedGoal({ ...selectedGoal, category: e.target.value })}
                  className="input-premium w-full"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedGoal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md card-glass rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Delete Goal?</h2>
                <p className="text-sm text-[var(--muted-text)]">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-[var(--muted-text)] mb-6">
              Are you sure you want to delete "{selectedGoal.name}"? All progress will be lost.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedGoal(null);
                }}
                className="flex-1 py-2 rounded-lg bg-[var(--glass-bg)] hover:bg-[var(--elevated-bg)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteGoal}
                disabled={isSubmitting}
                className="flex-1 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

