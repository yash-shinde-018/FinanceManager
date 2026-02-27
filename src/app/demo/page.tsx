'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, TrendingUp, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { mlClient } from '@/lib/ml/client';

export default function DemoPage() {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('450');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [mlStatus, setMlStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

    // Check ML API status on mount
    useEffect(() => {
        const checkStatus = async () => {
            const isHealthy = await mlClient.healthCheck();
            setMlStatus(isHealthy ? 'connected' : 'disconnected');
        };
        checkStatus();
    }, []);

    const testCategorization = async () => {
        if (!description) return;

        setLoading(true);
        try {
            const response = await mlClient.categorizeTransaction({
                date: new Date().toISOString().split('T')[0],
                description,
                amount: -parseFloat(amount),
            });

            setResult(response);
        } catch (error) {
            console.error('Error:', error);
            alert('Error connecting to ML API. Make sure it\'s running on port 8000.');
        } finally {
            setLoading(false);
        }
    };

    const examples = [
        { desc: 'swiggy biryani order', amount: '450' },
        { desc: 'uber ride to airport', amount: '850' },
        { desc: 'flipkart electronics purchase', amount: '45999' },
        { desc: 'dmart groceries shopping', amount: '2500' },
        { desc: 'netflix subscription', amount: '649' },
    ];

    return (
        <div className="min-h-screen bg-[var(--background)] p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-[var(--muted-text)] hover:text-[var(--foreground)] mb-4">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                    <h1 className="text-4xl font-bold mb-2">
                        <span className="text-gradient">AI Demo</span> - Test ML Features
                    </h1>
                    <p className="text-[var(--muted-text)]">
                        Try out the AI categorization and anomaly detection without signing up!
                    </p>
                </div>

                {/* ML Status */}
                <div className={`card-glass p-4 mb-6 border-l-4 ${mlStatus === 'connected' ? 'border-emerald-500' :
                    mlStatus === 'disconnected' ? 'border-rose-500' :
                        'border-amber-500'
                    }`}>
                    <div className="flex items-center gap-3">
                        <Brain className={`w-6 h-6 ${mlStatus === 'connected' ? 'text-emerald-400' :
                            mlStatus === 'disconnected' ? 'text-rose-400' :
                                'text-amber-400'
                            }`} />
                        <div>
                            <h3 className="font-semibold">
                                {mlStatus === 'connected' ? '✅ ML API Connected' :
                                    mlStatus === 'disconnected' ? '❌ ML API Offline' :
                                        '⏳ Checking ML API...'}
                            </h3>
                            <p className="text-sm text-[var(--muted-text)]">
                                {mlStatus === 'connected' ? 'All AI features are available' :
                                    mlStatus === 'disconnected' ? 'Start ML API: python ml_api_v2.py in MoneyMind-ML folder' :
                                        'Connecting to ML service...'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Demo Form */}
                <div className="card-glass p-8 mb-6">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-indigo-400" />
                        Test Transaction Categorization
                    </h2>

                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Transaction Description</label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="e.g., swiggy biryani order"
                                className="input-premium w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Amount (₹)</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="450"
                                className="input-premium w-full"
                            />
                        </div>

                        <button
                            onClick={testCategorization}
                            disabled={loading || !description || mlStatus !== 'connected'}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    >
                                        <Brain className="w-5 h-5" />
                                    </motion.div>
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    Categorize with AI
                                </>
                            )}
                        </button>
                    </div>

                    {/* Quick Examples */}
                    <div>
                        <p className="text-sm text-[var(--muted-text)] mb-3">Quick examples:</p>
                        <div className="flex flex-wrap gap-2">
                            {examples.map((ex, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setDescription(ex.desc);
                                        setAmount(ex.amount);
                                    }}
                                    className="text-xs px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20 transition-colors"
                                >
                                    {ex.desc}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Results */}
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        {/* Category Result */}
                        <div className="card-glass p-6">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-indigo-400" />
                                AI Categorization Result
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="card-gradient p-4 rounded-xl">
                                    <p className="text-sm text-[var(--muted-text)] mb-1">Category</p>
                                    <p className="text-xl font-bold text-indigo-400">{result.category}</p>
                                </div>
                                <div className="card-gradient p-4 rounded-xl">
                                    <p className="text-sm text-[var(--muted-text)] mb-1">Confidence</p>
                                    <p className="text-xl font-bold text-emerald-400">
                                        {(result.confidence * 100).toFixed(1)}%
                                    </p>
                                </div>
                                <div className="card-gradient p-4 rounded-xl">
                                    <p className="text-sm text-[var(--muted-text)] mb-1">Anomaly Status</p>
                                    <p className={`text-xl font-bold ${result.is_anomaly ? 'text-rose-400' : 'text-emerald-400'}`}>
                                        {result.is_anomaly ? '⚠️ Unusual' : '✓ Normal'}
                                    </p>
                                </div>
                            </div>

                            {/* Top 3 Predictions */}
                            <div className="mb-6">
                                <h4 className="font-semibold mb-3">Top 3 Predictions:</h4>
                                <div className="space-y-2">
                                    {result.top_3_predictions.map(([category, confidence]: [string, number], i: number) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <span className="text-sm font-medium w-32">{category}</span>
                                            <div className="flex-1 h-2 bg-[var(--glass-bg)] rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                                    style={{ width: `${confidence * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-sm text-[var(--muted-text)] w-16 text-right">
                                                {(confidence * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Anomaly Details */}
                        {result.is_anomaly && result.anomaly_explanation && (
                            <div className="card-glass p-6 border-l-4 border-rose-500">
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                                    Anomaly Detection Details
                                </h3>

                                <div className="mb-4">
                                    <p className="text-sm text-[var(--muted-text)] mb-2">Severity:</p>
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${result.anomaly_severity === 'high' ? 'bg-rose-500/20 text-rose-400' :
                                        result.anomaly_severity === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                                            'bg-emerald-500/20 text-emerald-400'
                                        }`}>
                                        {result.anomaly_severity?.toUpperCase()}
                                    </span>
                                </div>

                                <div className="mb-4">
                                    <p className="text-sm text-[var(--muted-text)] mb-2">Why is this flagged?</p>
                                    <ul className="space-y-2">
                                        {result.anomaly_explanation.explanations.map((exp: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2 text-sm">
                                                <span className="text-rose-400 mt-1">•</span>
                                                <span>{exp}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <p className="text-sm text-[var(--muted-text)] mb-2">Flags:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {result.anomaly_explanation.flags.map((flag: string, i: number) => (
                                            <span
                                                key={i}
                                                className="px-2 py-1 rounded text-xs bg-rose-500/10 border border-rose-500/30 text-rose-400"
                                            >
                                                {flag.replace(/_/g, ' ')}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Raw JSON */}
                        <details className="card-glass p-6">
                            <summary className="cursor-pointer font-semibold mb-4">View Raw JSON Response</summary>
                            <pre className="bg-[var(--glass-bg)] p-4 rounded-lg overflow-x-auto text-xs">
                                {JSON.stringify(result, null, 2)}
                            </pre>
                        </details>
                    </motion.div>
                )}

                {/* Info Box */}
                <div className="card-glass p-6 mt-6 bg-indigo-500/5 border-indigo-500/30">
                    <h3 className="font-semibold mb-2">💡 About This Demo</h3>
                    <p className="text-sm text-[var(--muted-text)] mb-3">
                        This demo uses the same ML models that power the full application:
                    </p>
                    <ul className="text-sm text-[var(--muted-text)] space-y-1 ml-4">
                        <li>• Random Forest classifier for categorization</li>
                        <li>• Isolation Forest for anomaly detection</li>
                        <li>• 15+ engineered features for analysis</li>
                        <li>• Trained on 5,000 synthetic transactions</li>
                    </ul>
                    <p className="text-sm text-[var(--muted-text)] mt-3">
                        To use the full application with transaction history, forecasts, and insights, you'll need to set up Supabase credentials.
                    </p>
                </div>
            </div>
        </div>
    );
}
