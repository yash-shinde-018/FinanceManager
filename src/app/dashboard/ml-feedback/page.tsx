'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown, Brain, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface Transaction {
    id: string;
    description: string;
    amount: number;
    category: string;
    predicted_category?: string;
    is_anomaly: boolean;
    occurred_at: string;
}

export default function MLFeedbackPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [feedback, setFeedback] = useState<Record<string, 'correct' | 'incorrect'>>({});
    const [corrections, setCorrections] = useState<Record<string, string>>({});

    useEffect(() => {
        loadTransactions();
    }, []);

    const loadTransactions = async () => {
        const supabase = createClient();

        // Get recent transactions with ML predictions
        const { data } = await supabase
            .from('transactions')
            .select('*')
            .order('occurred_at', { ascending: false })
            .limit(20);

        if (data) {
            setTransactions(data as Transaction[]);
        }
    };

    const handleFeedback = async (transactionId: string, isCorrect: boolean) => {
        setFeedback({ ...feedback, [transactionId]: isCorrect ? 'correct' : 'incorrect' });

        // In production, send feedback to ML API for model retraining
        console.log('Feedback submitted:', { transactionId, isCorrect });
    };

    const handleCorrection = async (transactionId: string, correctCategory: string) => {
        setCorrections({ ...corrections, [transactionId]: correctCategory });

        const supabase = createClient();
        await supabase
            .from('transactions')
            .update({ category: correctCategory })
            .eq('id', transactionId);

        // In production, send correction to ML API
        console.log('Correction submitted:', { transactionId, correctCategory });

        loadTransactions();
    };

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

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">ML Model Feedback</h1>
                <p className="text-[var(--muted-text)]">
                    Help improve AI accuracy by providing feedback on categorization and anomaly detection
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card-glass p-5"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                            <Brain className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{transactions.length}</p>
                            <p className="text-sm text-[var(--muted-text)]">Transactions Reviewed</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="card-glass p-5"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">
                                {Object.values(feedback).filter(f => f === 'correct').length}
                            </p>
                            <p className="text-sm text-[var(--muted-text)]">Correct Predictions</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="card-glass p-5"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-rose-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">
                                {Object.values(feedback).filter(f => f === 'incorrect').length}
                            </p>
                            <p className="text-sm text-[var(--muted-text)]">Corrections Made</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Transactions List */}
            <div className="space-y-3">
                {transactions.map((transaction, index) => (
                    <motion.div
                        key={transaction.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="card-glass p-5"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-semibold">{transaction.description}</h4>
                                    {transaction.is_anomaly && (
                                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs">
                                            Anomaly
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-[var(--muted-text)]">
                                    <span>₹{Math.abs(transaction.amount).toFixed(2)}</span>
                                    <span>•</span>
                                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400">
                                        {transaction.category}
                                    </span>
                                    <span>•</span>
                                    <span>{new Date(transaction.occurred_at).toLocaleDateString()}</span>
                                </div>

                                {/* Feedback Section */}
                                {!feedback[transaction.id] && (
                                    <div className="mt-4 flex items-center gap-3">
                                        <p className="text-sm text-[var(--muted-text)]">Is this categorization correct?</p>
                                        <button
                                            onClick={() => handleFeedback(transaction.id, true)}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors text-sm"
                                        >
                                            <ThumbsUp className="w-4 h-4" />
                                            Yes
                                        </button>
                                        <button
                                            onClick={() => handleFeedback(transaction.id, false)}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-colors text-sm"
                                        >
                                            <ThumbsDown className="w-4 h-4" />
                                            No
                                        </button>
                                    </div>
                                )}

                                {/* Correction Section */}
                                {feedback[transaction.id] === 'incorrect' && !corrections[transaction.id] && (
                                    <div className="mt-4">
                                        <p className="text-sm text-[var(--muted-text)] mb-2">Select the correct category:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {categories.map((cat) => (
                                                <button
                                                    key={cat}
                                                    onClick={() => handleCorrection(transaction.id, cat)}
                                                    className={cn(
                                                        'px-3 py-1.5 rounded-lg text-sm transition-colors',
                                                        cat === transaction.category
                                                            ? 'bg-[var(--glass-bg)] text-[var(--muted-text)]'
                                                            : 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30'
                                                    )}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Success Message */}
                                {feedback[transaction.id] === 'correct' && (
                                    <div className="mt-4 flex items-center gap-2 text-sm text-emerald-400">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Thank you for your feedback!
                                    </div>
                                )}

                                {corrections[transaction.id] && (
                                    <div className="mt-4 flex items-center gap-2 text-sm text-emerald-400">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Correction saved! This will help improve our AI model.
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {transactions.length === 0 && (
                <div className="card-glass p-12 text-center">
                    <Brain className="w-16 h-16 text-[var(--muted-text)] mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">No transactions to review</h3>
                    <p className="text-[var(--muted-text)]">
                        Add transactions to start providing feedback and improve AI accuracy
                    </p>
                </div>
            )}
        </div>
    );
}
