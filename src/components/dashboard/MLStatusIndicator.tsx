'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { mlClient } from '@/lib/ml/client';
import { cn } from '@/lib/utils';

export default function MLStatusIndicator() {
    const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        const checkStatus = async () => {
            const isHealthy = await mlClient.healthCheck();
            setStatus(isHealthy ? 'connected' : 'disconnected');
        };

        checkStatus();
        const interval = setInterval(checkStatus, 30000); // Check every 30 seconds

        return () => clearInterval(interval);
    }, []);

    const getStatusConfig = () => {
        switch (status) {
            case 'connected':
                return {
                    icon: CheckCircle2,
                    text: 'AI Connected',
                    color: 'text-emerald-400',
                    bgColor: 'bg-emerald-500/10',
                    borderColor: 'border-emerald-500/30',
                    description: 'ML models are active and ready',
                };
            case 'disconnected':
                return {
                    icon: XCircle,
                    text: 'AI Offline',
                    color: 'text-rose-400',
                    bgColor: 'bg-rose-500/10',
                    borderColor: 'border-rose-500/30',
                    description: 'Start ML API: python ml_api_v2.py',
                };
            case 'checking':
                return {
                    icon: AlertCircle,
                    text: 'Checking...',
                    color: 'text-amber-400',
                    bgColor: 'bg-amber-500/10',
                    borderColor: 'border-amber-500/30',
                    description: 'Connecting to ML service',
                };
        }
    };

    const config = getStatusConfig();
    const Icon = config.icon;

    return (
        <div className="relative">
            <motion.button
                onClick={() => setShowDetails(!showDetails)}
                className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all',
                    config.bgColor,
                    config.borderColor,
                    config.color,
                    'hover:scale-105'
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <Icon className="w-3.5 h-3.5" />
                <span>{config.text}</span>
                {status === 'checking' && (
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                        <Brain className="w-3.5 h-3.5" />
                    </motion.div>
                )}
            </motion.button>

            <AnimatePresence>
                {showDetails && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full right-0 mt-2 w-64 card-glass p-4 rounded-xl shadow-xl z-50"
                    >
                        <div className="flex items-start gap-3 mb-3">
                            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', config.bgColor)}>
                                <Icon className={cn('w-4 h-4', config.color)} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-sm mb-1">ML Service Status</h4>
                                <p className="text-xs text-[var(--muted-text)]">{config.description}</p>
                            </div>
                        </div>

                        {status === 'disconnected' && (
                            <div className="mt-3 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg">
                                <p className="text-xs text-rose-400 mb-2">
                                    <strong>To enable AI features:</strong>
                                </p>
                                <ol className="text-xs text-[var(--muted-text)] space-y-1 ml-4 list-decimal">
                                    <li>Open terminal in MoneyMind-ML folder</li>
                                    <li>Run: <code className="text-rose-400">python ml_api_v2.py</code></li>
                                    <li>Refresh this page</li>
                                </ol>
                            </div>
                        )}

                        {status === 'connected' && (
                            <div className="mt-3 space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-[var(--muted-text)]">Auto-categorization</span>
                                    <span className="text-emerald-400">✓ Active</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-[var(--muted-text)]">Anomaly detection</span>
                                    <span className="text-emerald-400">✓ Active</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-[var(--muted-text)]">Spending forecast</span>
                                    <span className="text-emerald-400">✓ Active</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-[var(--muted-text)]">AI insights</span>
                                    <span className="text-emerald-400">✓ Active</span>
                                </div>
                            </div>
                        )}

                        <div className="mt-3 pt-3 border-t border-[var(--glass-border)]">
                            <a
                                href="http://localhost:8000/docs"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                                View API Documentation →
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
