'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Building2, 
  CreditCard, 
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  MoreHorizontal,
  Shield,
  Lock,
  Unlink,
  Wallet
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Account } from '@/types';
import { listAccounts, type AccountRow } from '@/lib/db/accounts';

const accountTypes = [
  { id: 'bank', label: 'Bank Accounts', icon: Building2 },
  { id: 'card', label: 'Credit Cards', icon: CreditCard },
  { id: 'investment', label: 'Investments', icon: TrendingUp },
];

const popularInstitutions = [
  { name: 'State Bank of India', logo: '🏛️' },
  { name: 'HDFC Bank', logo: '🔷' },
  { name: 'ICICI Bank', logo: '🏦' },
  { name: 'Axis Bank', logo: '�' },
  { name: 'Kotak Mahindra', logo: '�' },
  { name: 'Paytm Payments Bank', logo: '�' },
];

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const rows = await listAccounts();
      const mapped: Account[] = rows.map((a: AccountRow) => ({
        id: a.id,
        userId: a.user_id,
        type: a.type,
        name: a.name,
        institution: a.institution ?? '',
        balance: Number(a.balance),
        currency: a.currency,
        lastSync: a.last_sync ? new Date(a.last_sync) : new Date(),
        status: (a.status as any) ?? 'active',
        accountNumber: a.account_number ?? undefined,
      }));
      setAccounts(mapped);
    };

    load();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(Math.abs(amount));
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getTotalBalance = (type: string) => {
    return accounts
      .filter(a => a.type === type)
      .reduce((acc, a) => acc + a.balance, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Linked Accounts</h1>
          <p className="text-[var(--muted-text)]">
            Manage your connected bank accounts, cards, and investments
          </p>
        </div>
        <button 
          onClick={() => setShowConnectModal(true)}
          className="btn-primary flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Link Account
        </button>
      </div>

      {/* Security Notice */}
      <div className="card-glass p-4 flex items-center gap-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
        <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
          <Shield className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h3 className="font-semibold text-emerald-400">Bank-Level Security</h3>
          <p className="text-sm text-[var(--muted-text)]">
            Your data is encrypted with 256-bit SSL and we never store your login credentials.
          </p>
        </div>
      </div>

      {/* Account Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {accountTypes.map((type) => {
          const total = getTotalBalance(type.id);
          const count = accounts.filter(a => a.type === type.id).length;
          
          return (
            <motion.div
              key={type.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-glass p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                  <type.icon className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm text-[var(--muted-text)]">{type.label}</p>
                  <p className="text-xl font-bold">{formatCurrency(total)}</p>
                </div>
              </div>
              <p className="text-xs text-[var(--muted-text)]">
                {count} account{count !== 1 ? 's' : ''} connected
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Accounts by Type */}
      {accountTypes.map((type) => {
        const typeAccounts = accounts.filter(a => a.type === type.id);
        
        return (
          <div key={type.id} className="space-y-4">
            <div className="flex items-center gap-3">
              <type.icon className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-semibold">{type.label}</h2>
              <span className="px-2 py-0.5 rounded-full bg-[var(--glass-bg)] text-xs text-[var(--muted-text)]">
                {typeAccounts.length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {typeAccounts.map((account, index) => (
                <motion.div
                  key={account.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="card-glass p-5 hover:border-indigo-500/30 transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[var(--glass-bg)] flex items-center justify-center">
                        <type.icon className="w-6 h-6 text-[var(--muted-text)]" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{account.name}</h3>
                        <p className="text-sm text-[var(--muted-text)]">{account.institution}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-xs text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Active</span>
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-[var(--glass-bg)] transition-all">
                        <MoreHorizontal className="w-4 h-4 text-[var(--muted-text)]" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold">
                        {formatCurrency(account.balance)}
                      </p>
                      <p className="text-sm text-[var(--muted-text)]">
                        {account.accountNumber}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--muted-text)]">
                      <RefreshCw className="w-3 h-3" />
                      <span>Synced {formatTime(account.lastSync)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Connect Account Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg card-glass rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Link an Account</h2>
              <button 
                onClick={() => setShowConnectModal(false)}
                className="p-2 rounded-lg hover:bg-[var(--glass-bg)] transition-colors"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>

            {!selectedType ? (
              <div className="space-y-3">
                <p className="text-[var(--muted-text)] mb-4">What type of account would you like to link?</p>
                {accountTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className="w-full p-4 rounded-xl bg-[var(--glass-bg)] hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all border border-transparent flex items-center gap-4"
                  >
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                      <type.icon className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">{type.label}</p>
                      <p className="text-sm text-[var(--muted-text)]">
                        Connect your {type.label.toLowerCase()} securely
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <button 
                  onClick={() => setSelectedType(null)}
                  className="text-sm text-[var(--muted-text)] hover:text-[var(--foreground)] flex items-center gap-1"
                >
                  ← Back
                </button>
                <p className="text-[var(--muted-text)]">Select your financial institution:</p>
                <div className="grid grid-cols-2 gap-3">
                  {popularInstitutions.map((institution) => (
                    <button
                      key={institution.name}
                      className="p-4 rounded-xl bg-[var(--glass-bg)] hover:bg-indigo-500/10 transition-all border border-transparent hover:border-indigo-500/30 text-center"
                    >
                      <span className="text-3xl mb-2 block">{institution.logo}</span>
                      <span className="font-medium">{institution.name}</span>
                    </button>
                  ))}
                </div>
                <button className="w-full py-3 rounded-xl border border-dashed border-[var(--glass-border)] hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all text-[var(--muted-text)]">
                  + Search for another institution
                </button>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-[var(--glass-border)]">
              <div className="flex items-center gap-3 text-sm text-[var(--muted-text)]">
                <Lock className="w-4 h-4" />
                <span>Your credentials are encrypted and secure</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
