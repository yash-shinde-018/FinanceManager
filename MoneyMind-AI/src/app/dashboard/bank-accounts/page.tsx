'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Building2,
    Plus,
    Shield,
    CheckCircle2,
    AlertCircle,
    Link as LinkIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BankAccount {
    id: string;
    bankName: string;
    accountNumber: string;
    accountType: string;
    status: 'connected' | 'pending' | 'error';
    lastSync: Date;
}

export default function BankAccountsPage() {
    const [accounts, setAccounts] = useState<BankAccount[]>([]);
    const [showLinkModal, setShowLinkModal] = useState(false);

    const banks = [
        { name: 'State Bank of India', logo: '🏦' },
        { name: 'HDFC Bank', logo: '🏦' },
        { name: 'ICICI Bank', logo: '🏦' },
        { name: 'Axis Bank', logo: '🏦' },
        { name: 'Kotak Mahindra Bank', logo: '🏦' },
        { name: 'Punjab National Bank', logo: '🏦' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Bank Accounts</h1>
                    <p className="text-[var(--muted-text)]">Securely link your bank accounts</p>
                </div>
                <button
                    onClick={() => setShowLinkModal(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Link Bank Account
                </button>
            </div>

            {/* Security Notice */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-glass p-5 border-indigo-500/30"
            >
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
                        <Shield className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold mb-1">Bank-Level Security</h3>
                        <p className="text-sm text-[var(--muted-text)]">
                            Your data is encrypted with 256-bit SSL encryption. We never store your banking credentials.
                            All connections use secure OAuth 2.0 authentication.
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Connected Accounts */}
            {accounts.length > 0 && (
                <div className="card-glass p-6">
                    <h3 className="font-semibold mb-4">Connected Accounts</h3>
                    <div className="space-y-3">
                        {accounts.map((account) => (
                            <div
                                key={account.id}
                                className="p-4 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)]"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                                            <Building2 className="w-6 h-6 text-indigo-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">{account.bankName}</h4>
                                            <p className="text-sm text-[var(--muted-text)]">
                                                {account.accountType} •••• {account.accountNumber.slice(-4)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {account.status === 'connected' && (
                                            <span className="flex items-center gap-1 text-sm text-emerald-400">
                                                <CheckCircle2 className="w-4 h-4" />
                                                Connected
                                            </span>
                                        )}
                                        {account.status === 'error' && (
                                            <span className="flex items-center gap-1 text-sm text-rose-400">
                                                <AlertCircle className="w-4 h-4" />
                                                Error
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Available Banks */}
            <div className="card-glass p-6">
                <h3 className="font-semibold mb-4">Available Banks</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {banks.map((bank, index) => (
                        <motion.button
                            key={bank.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => setShowLinkModal(true)}
                            className="p-4 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:border-indigo-500/30 transition-all text-left"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">{bank.logo}</span>
                                <div>
                                    <h4 className="font-semibold">{bank.name}</h4>
                                    <p className="text-sm text-[var(--muted-text)] flex items-center gap-1">
                                        <LinkIcon className="w-3 h-3" />
                                        Click to connect
                                    </p>
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Link Modal */}
            {showLinkModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="card-glass p-6 max-w-md w-full"
                    >
                        <h3 className="text-xl font-bold mb-4">Link Bank Account</h3>
                        <div className="space-y-4">
                            <div className="p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                                <p className="text-sm text-indigo-400">
                                    🔒 This is a demo interface. In production, this would redirect to your bank's secure OAuth login page.
                                </p>
                            </div>
                            <p className="text-sm text-[var(--muted-text)]">
                                You'll be redirected to your bank's secure login page. MoneyMind AI will never see or store your banking credentials.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowLinkModal(false)}
                                    className="flex-1 px-4 py-2 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:border-indigo-500/30 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        alert('In production, this would initiate secure OAuth flow with your bank');
                                        setShowLinkModal(false);
                                    }}
                                    className="flex-1 btn-primary"
                                >
                                    Continue to Bank
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
