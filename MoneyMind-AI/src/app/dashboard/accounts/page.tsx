'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Building2, 
  CreditCard, 
  TrendingUp,
  CheckCircle2,
  RefreshCw,
  MoreHorizontal,
  Shield,
  Lock,
  Link as LinkIcon,
  IndianRupee,
  Wallet,
  ArrowUpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Account } from '@/types';
import { listAccounts, type AccountRow } from '@/lib/db/accounts';
import { createClient } from '@/lib/supabase/client';

const accountTypes = [
  { id: 'bank', label: 'Bank Accounts', icon: Building2 },
  { id: 'card', label: 'Credit Cards', icon: CreditCard },
  { id: 'investment', label: 'Investments', icon: TrendingUp },
];

const popularInstitutions = [
  { name: 'State Bank of India', logo: '�' },
  { name: 'HDFC Bank', logo: '🏦' },
  { name: 'ICICI Bank', logo: '🏦' },
  { name: 'Axis Bank', logo: '🏦' },
  { name: 'Kotak Mahindra Bank', logo: '🏦' },
  { name: 'Punjab National Bank', logo: '🏦' },
];

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceNote, setBalanceNote] = useState('');
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isAddingBalance, setIsAddingBalance] = useState(false);

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

  const handleAddBalance = async () => {
    if (!selectedAccount || !balanceAmount || Number(balanceAmount) <= 0) return;

    setIsAddingBalance(true);
    const supabase = createClient();

    try {
      const newBalance = selectedAccount.balance + Number(balanceAmount);
      const { error } = await supabase
        .from('accounts')
        .update({ balance: newBalance })
        .eq('id', selectedAccount.id);

      if (error) throw error;

      const { error: transError } = await supabase
        .from('transactions')
        .insert({
          user_id: selectedAccount.userId,
          account_id: selectedAccount.id,
          amount: Number(balanceAmount),
          type: 'income',
          category: 'balance_adjustment',
          description: balanceNote || 'Balance added manually',
          occurred_at: new Date().toISOString(),
          payment_method: 'manual',
          status: 'completed',
        });

      if (transError) throw transError;

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

      setShowBalanceModal(false);
      setSelectedAccount(null);
      setBalanceAmount('');
      setBalanceNote('');
    } catch (error) {
      console.error('Error adding balance:', error);
      alert('Failed to add balance');
    } finally {
      setIsAddingBalance(false);
    }
  };

  const handleCreateAccount = async (bankName: string, type: 'bank' | 'card' | 'investment' = 'bank') => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert('Not authenticated');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('accounts')
        .insert({
          user_id: user.id,
          name: bankName,
          type: type,
          institution: bankName,
          balance: 0,
          currency: 'INR',
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh accounts list
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

      setShowConnectModal(false);
      setShowBankModal(false);
      setSelectedBank(null);
      setSelectedType(null);

      // Show success message
      alert(`${bankName} account created successfully! You can now add balance to this account.`);
    } catch (error) {
      console.error('Error creating account:', error);
      alert('Failed to create account');
    }
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
          <h1 className="text-2xl font-bold">Bank Accounts</h1>
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
            Your data is encrypted with 256-bit SSL. We never store your banking credentials.
            All connections use secure OAuth 2.0 authentication.
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

      {/* My Accounts with Add Balance */}
      {accounts.length > 0 && (
        <div className="card-glass p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Wallet className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-semibold">My Accounts</h2>
            </div>
          </div>
          <div className="space-y-3">
            {accounts.map((account) => (
              <motion.div
                key={account.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                    {account.type === 'bank' && <Building2 className="w-5 h-5 text-indigo-400" />}
                    {account.type === 'card' && <CreditCard className="w-5 h-5 text-indigo-400" />}
                    {account.type === 'investment' && <TrendingUp className="w-5 h-5 text-indigo-400" />}
                  </div>
                  <div>
                    <p className="font-medium">{account.name}</p>
                    <p className="text-sm text-[var(--muted-text)]">
                      {account.institution || 'Manual Account'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(account.balance)}</p>
                    <p className="text-xs text-[var(--muted-text)]">Current Balance</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedAccount(account);
                      setShowBalanceModal(true);
                    }}
                    className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                    title="Add Balance"
                  >
                    <ArrowUpCircle className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Popular Banks */}
      <div className="card-glass p-6">
        <div className="flex items-center gap-3 mb-4">
          <Building2 className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-semibold">Popular Banks</h2>
          <span className="px-2 py-0.5 rounded-full bg-[var(--glass-bg)] text-xs text-[var(--muted-text)]">
            {popularInstitutions.length}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularInstitutions.map((bank, index) => (
            <motion.button
              key={bank.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => {
                setSelectedBank(bank.name);
                setShowBankModal(true);
              }}
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
                onClick={() => {
                  setShowConnectModal(false);
                  setSelectedType(null);
                }}
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
                <p className="text-[var(--muted-text)]">Select a bank to add:</p>
                <div className="grid grid-cols-2 gap-3">
                  {popularInstitutions.map((institution) => (
                    <button
                      key={institution.name}
                      onClick={() => handleCreateAccount(institution.name, selectedType as 'bank' | 'card' | 'investment')}
                      className="p-4 rounded-xl bg-[var(--glass-bg)] hover:bg-indigo-500/10 transition-all border border-transparent hover:border-indigo-500/30 text-center"
                    >
                      <span className="text-3xl mb-2 block">{institution.logo}</span>
                      <span className="font-medium text-sm">{institution.name}</span>
                    </button>
                  ))}
                </div>
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

      {/* Bank-Specific Connect Modal */}
      {showBankModal && selectedBank && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md card-glass rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Connect {selectedBank}</h2>
              <button 
                onClick={() => {
                  setShowBankModal(false);
                  setSelectedBank(null);
                }}
                className="p-2 rounded-lg hover:bg-[var(--glass-bg)] transition-colors"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">🏦</span>
                  <div>
                    <h3 className="font-semibold">{selectedBank}</h3>
                    <p className="text-sm text-[var(--muted-text)]">Secure connection via OAuth 2.0</p>
                  </div>
                </div>
              </div>

              <p className="text-[var(--muted-text)] text-sm">
                Select the account type you want to link with {selectedBank}:
              </p>

              <div className="space-y-2">
                {accountTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleCreateAccount(selectedBank, type.id as 'bank' | 'card' | 'investment')}
                    className="w-full p-4 rounded-xl bg-[var(--glass-bg)] hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all border border-transparent flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                      <type.icon className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">{type.label}</p>
                      <p className="text-sm text-[var(--muted-text)]">
                        Create {type.label.toLowerCase()} account
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-[var(--glass-border)]">
              <div className="flex items-center gap-3 text-sm text-[var(--muted-text)]">
                <Lock className="w-4 h-4" />
                <span>Your credentials are encrypted and secure</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add Balance Modal */}
      {showBalanceModal && selectedAccount && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md card-glass rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <ArrowUpCircle className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Add Balance</h2>
                  <p className="text-sm text-[var(--muted-text)]">{selectedAccount.name}</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowBalanceModal(false);
                  setSelectedAccount(null);
                  setBalanceAmount('');
                  setBalanceNote('');
                }}
                className="p-2 rounded-lg hover:bg-[var(--glass-bg)] transition-colors"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                <p className="text-sm text-[var(--muted-text)] mb-1">Current Balance</p>
                <p className="text-2xl font-bold">{formatCurrency(selectedAccount.balance)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Amount to Add</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-text)]" />
                  <input
                    type="number"
                    value={balanceAmount}
                    onChange={(e) => setBalanceAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-emerald-500/50 transition-colors"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Note (Optional)</label>
                <input
                  type="text"
                  value={balanceNote}
                  onChange={(e) => setBalanceNote(e.target.value)}
                  placeholder="e.g., Salary, Cash deposit..."
                  className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>

              {balanceAmount && Number(balanceAmount) > 0 && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <p className="text-sm text-emerald-400">
                    New Balance: {formatCurrency(selectedAccount.balance + Number(balanceAmount))}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowBalanceModal(false);
                  setSelectedAccount(null);
                  setBalanceAmount('');
                  setBalanceNote('');
                }}
                className="flex-1 px-4 py-3 rounded-xl border border-[var(--glass-border)] hover:bg-[var(--glass-bg)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddBalance}
                disabled={!balanceAmount || Number(balanceAmount) <= 0 || isAddingBalance}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingBalance ? 'Adding...' : 'Add Balance'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
