'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    PieChart,
    Plus,
    ArrowUpRight,
    ArrowDownRight,
    Trash2,
    X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Investment {
    id: string;
    name: string;
    type: string;
    amount: number;
    currentValue: number;
    returns: number;
    returnsPercent: number;
}

export default function InvestmentsPage() {
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newInvestment, setNewInvestment] = useState({
        name: '',
        type: 'Stocks',
        amount: 0,
        currentValue: 0,
    });

    useEffect(() => {
        loadInvestments();
    }, []);

    const loadInvestments = () => {
        // Load from localStorage for demo
        const saved = localStorage.getItem('moneymind_investments');
        if (saved) {
            try {
                setInvestments(JSON.parse(saved));
            } catch (e) {
                console.error('Error loading investments:', e);
            }
        }
    };

    const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
    const totalReturns = totalValue - totalInvested;
    const totalReturnsPercent = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount);
    };

    const handleAddInvestment = () => {
        if (!newInvestment.name || !newInvestment.amount || !newInvestment.currentValue) {
            alert('Please fill all fields');
            return;
        }

        if (newInvestment.amount <= 0 || newInvestment.currentValue <= 0) {
            alert('Amount and current value must be greater than 0');
            return;
        }

        const investment: Investment = {
            id: Date.now().toString(),
            name: newInvestment.name,
            type: newInvestment.type,
            amount: newInvestment.amount,
            currentValue: newInvestment.currentValue,
            returns: newInvestment.currentValue - newInvestment.amount,
            returnsPercent: ((newInvestment.currentValue - newInvestment.amount) / newInvestment.amount) * 100,
        };

        const updated = [...investments, investment];
        setInvestments(updated);
        localStorage.setItem('moneymind_investments', JSON.stringify(updated));

        setShowAddModal(false);
        setNewInvestment({ name: '', type: 'Stocks', amount: 0, currentValue: 0 });
    };

    const handleDeleteInvestment = (id: string) => {
        if (confirm('Are you sure you want to delete this investment?')) {
            const updated = investments.filter(inv => inv.id !== id);
            setInvestments(updated);
            localStorage.setItem('moneymind_investments', JSON.stringify(updated));
        }
    };

    const investmentTypes = ['Stocks', 'Mutual Funds', 'Fixed Deposit', 'Gold', 'Real Estate', 'Crypto', 'Bonds', 'Other'];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Investment Overview</h1>
                    <p className="text-[var(--muted-text)]">Track your investment portfolio</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Add Investment
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card-glass p-5"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-sm text-[var(--muted-text)]">Total Invested</p>
                            <p className="text-2xl font-bold">{formatCurrency(totalInvested)}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="card-glass p-5"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-sm text-[var(--muted-text)]">Current Value</p>
                            <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="card-glass p-5"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            totalReturns >= 0 ? "bg-emerald-500/20" : "bg-rose-500/20"
                        )}>
                            {totalReturns >= 0 ? (
                                <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                            ) : (
                                <ArrowDownRight className="w-5 h-5 text-rose-400" />
                            )}
                        </div>
                        <div>
                            <p className="text-sm text-[var(--muted-text)]">Total Returns</p>
                            <p className={cn(
                                "text-2xl font-bold",
                                totalReturns >= 0 ? "text-emerald-400" : "text-rose-400"
                            )}>
                                {formatCurrency(totalReturns)} ({totalReturnsPercent.toFixed(2)}%)
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Investments List */}
            <div className="card-glass p-6">
                <h3 className="font-semibold mb-4">Your Investments</h3>
                {investments.length === 0 ? (
                    <div className="text-center py-12">
                        <PieChart className="w-16 h-16 text-[var(--muted-text)] mx-auto mb-4" />
                        <p className="text-[var(--muted-text)]">No investments yet. Add your first investment to start tracking!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {investments.map((inv) => (
                            <div key={inv.id} className="p-4 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-semibold">{inv.name}</h4>
                                        <p className="text-sm text-[var(--muted-text)]">{inv.type}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="font-semibold">{formatCurrency(inv.currentValue)}</p>
                                            <p className={cn(
                                                "text-sm",
                                                inv.returns >= 0 ? "text-emerald-400" : "text-rose-400"
                                            )}>
                                                {inv.returns >= 0 ? '+' : ''}{formatCurrency(inv.returns)} ({inv.returnsPercent.toFixed(2)}%)
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteInvestment(inv.id)}
                                            className="p-2 rounded-lg hover:bg-rose-500/10 text-rose-400 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Investment Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="card-glass p-6 max-w-md w-full"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold">Add Investment</h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-2 rounded-lg hover:bg-[var(--glass-bg)] transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Investment Name</label>
                                <input
                                    type="text"
                                    value={newInvestment.name}
                                    onChange={(e) => setNewInvestment({ ...newInvestment, name: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:border-indigo-500 outline-none"
                                    placeholder="e.g., Reliance Industries"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Investment Type</label>
                                <select
                                    value={newInvestment.type}
                                    onChange={(e) => setNewInvestment({ ...newInvestment, type: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:border-indigo-500 outline-none"
                                >
                                    {investmentTypes.map((type) => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Amount Invested (₹)</label>
                                <input
                                    type="number"
                                    value={newInvestment.amount || ''}
                                    onChange={(e) => setNewInvestment({ ...newInvestment, amount: Number(e.target.value) })}
                                    className="w-full px-4 py-2 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:border-indigo-500 outline-none"
                                    placeholder="50000"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Current Value (₹)</label>
                                <input
                                    type="number"
                                    value={newInvestment.currentValue || ''}
                                    onChange={(e) => setNewInvestment({ ...newInvestment, currentValue: Number(e.target.value) })}
                                    className="w-full px-4 py-2 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] focus:border-indigo-500 outline-none"
                                    placeholder="55000"
                                />
                            </div>

                            {newInvestment.amount > 0 && newInvestment.currentValue > 0 && (
                                <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                                    <p className="text-sm text-indigo-400">
                                        Expected Returns: {formatCurrency(newInvestment.currentValue - newInvestment.amount)}
                                        ({(((newInvestment.currentValue - newInvestment.amount) / newInvestment.amount) * 100).toFixed(2)}%)
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-2 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:border-indigo-500/30 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddInvestment}
                                    disabled={!newInvestment.name || !newInvestment.amount || !newInvestment.currentValue}
                                    className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Add Investment
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
