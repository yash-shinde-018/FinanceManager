'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, TrendingUp, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface Alert {
    id: string;
    type: 'budget' | 'anomaly' | 'goal';
    title: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
    timestamp: Date;
}

export default function SpendingAlerts() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [dismissed, setDismissed] = useState<string[]>([]);

    useEffect(() => {
        loadAlerts();
    }, []);

    const loadAlerts = async () => {
        const supabase = createClient();
        const newAlerts: Alert[] = [];

        // Check for budget alerts
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

        // Mock budget limits
        const budgets = {
            'Food & Dining': 15000,
            'Shopping': 10000,
            'Transportation': 5000,
        };

        Object.entries(budgets).forEach(([category, limit]) => {
            const spent = spending[category] || 0;
            const percent = (spent / limit) * 100;

            if (percent >= 100) {
                newAlerts.push({
                    id: `budget-${category}`,
                    type: 'budget',
                    title: `${category} Budget Exceeded`,
                    message: `You've spent ₹${spent.toFixed(0)} of ₹${limit} (${percent.toFixed(0)}%)`,
                    severity: 'high',
                    timestamp: new Date(),
                });
            } else if (percent >= 80) {
                newAlerts.push({
                    id: `budget-${category}`,
                    type: 'budget',
                    title: `${category} Budget Warning`,
                    message: `You've spent ₹${spent.toFixed(0)} of ₹${limit} (${percent.toFixed(0)}%)`,
                    severity: 'medium',
                    timestamp: new Date(),
                });
            }
        });

        // Check for anomalies
        const { data: anomalies } = await supabase
            .from('transactions')
            .select('*')
            .eq('is_anomaly', true)
            .gte('occurred_at', startOfMonth.toISOString())
            .limit(3);

        anomalies?.forEach((anomaly, index) => {
            newAlerts.push({
                id: `anomaly-${index}`,
                type: 'anomaly',
                title: 'Unusual Transaction Detected',
                message: `₹${Math.abs(anomaly.amount).toFixed(0)} at "${anomaly.description}"`,
                severity: 'medium',
                timestamp: new Date(anomaly.occurred_at),
            });
        });

        setAlerts(newAlerts);
    };

    const dismissAlert = (id: string) => {
        setDismissed([...dismissed, id]);
    };

    const visibleAlerts = alerts.filter(a => !dismissed.includes(a.id));

    if (visibleAlerts.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 space-y-3 max-w-md">
            <AnimatePresence>
                {visibleAlerts.slice(0, 3).map((alert) => (
                    <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        className={cn(
                            'card-glass p-4 border-l-4',
                            alert.severity === 'high' && 'border-rose-500',
                            alert.severity === 'medium' && 'border-amber-500',
                            alert.severity === 'low' && 'border-indigo-500'
                        )}
                    >
                        <div className="flex items-start gap-3">
                            <div className={cn(
                                'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                                alert.severity === 'high' && 'bg-rose-500/20',
                                alert.severity === 'medium' && 'bg-amber-500/20',
                                alert.severity === 'low' && 'bg-indigo-500/20'
                            )}>
                                {alert.type === 'budget' && (
                                    <Target className={cn(
                                        'w-5 h-5',
                                        alert.severity === 'high' && 'text-rose-400',
                                        alert.severity === 'medium' && 'text-amber-400',
                                        alert.severity === 'low' && 'text-indigo-400'
                                    )} />
                                )}
                                {alert.type === 'anomaly' && (
                                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                                )}
                                {alert.type === 'goal' && (
                                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm mb-1">{alert.title}</h4>
                                <p className="text-xs text-[var(--muted-text)]">{alert.message}</p>
                            </div>
                            <button
                                onClick={() => dismissAlert(alert.id)}
                                className="p-1 rounded-lg hover:bg-[var(--glass-bg)] transition-colors shrink-0"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
