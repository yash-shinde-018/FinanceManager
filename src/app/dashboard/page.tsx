'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Brain,
  AlertTriangle,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import FinancialHealthScore from '@/components/dashboard/FinancialHealthScore';
import AIInsightsPanel from '@/components/dashboard/AIInsightsPanel';
import MLIntegrationPanel from '@/components/dashboard/MLIntegrationPanel';
import SpendingChart from '@/components/charts/SpendingChart';
import CategoryChart from '@/components/charts/CategoryChart';
import WeeklyBreakdownChart from '@/components/charts/WeeklyBreakdownChart';
import ForecastChart from '@/components/charts/ForecastChart';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import AddTransactionModal from '@/components/dashboard/AddTransactionModal';
import OnboardingTour from '@/components/onboarding/OnboardingTour';
import type { Transaction } from '@/types';
import { getDashboardOverview, getRecentTransactions, getSpendingTrends, getSpendingByCategory, getWeeklyBreakdown } from '@/lib/db/dashboard';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [overviewData, setOverviewData] = useState({
    totalBalance: 0,
    monthlySpending: 0,
    predictedSpending: 0,
    savingsRate: 0,
    balanceChange: 0,
    spendingChange: 0,
    anomalyAlerts: 0,
    forecastStatus: 'insufficient_data' as 'insufficient_data' | 'early_stage' | 'ok',
    forecastModelUsed: 'No Data',
    daysOfData: 0,
    minDaysRequired: 14,
    fullModelDays: 21,
  });
  const [recent, setRecent] = useState<Transaction[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [spendingTrends, setSpendingTrends] = useState<{ month: string; income: number; expense: number }[]>([]);
  const [categoryData, setCategoryData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [weeklyData, setWeeklyData] = useState<{ day: string; amount: number }[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [overview, rows, trends, categories, weekly] = await Promise.all([
          getDashboardOverview(),
          getRecentTransactions(8),
          getSpendingTrends(6),
          getSpendingByCategory(),
          getWeeklyBreakdown(),
        ]);

        setOverviewData(overview);
        setSpendingTrends(trends);
        setCategoryData(categories);
        setWeeklyData(weekly);

        const mapped: Transaction[] = rows.map((t: any) => ({
          id: t.id,
          userId: t.user_id,
          amount: Number(t.amount),
          type: t.type,
          category: t.category,
          description: t.description,
          date: new Date(t.occurred_at),
          status: t.status ?? 'completed',
          paymentMethod: t.payment_method ?? '—',
          merchant: t.merchant ?? undefined,
          isAnomaly: t.is_anomaly ?? false,
        }));

        setRecent(mapped);
      } catch (e) {
        console.error('Error loading dashboard data', e);
      }
    };

    load();
  }, []);

  const overviewCards = [
    {
      title: 'Total Balance',
      value: formatCurrency(overviewData.totalBalance),
      change: `+${overviewData.balanceChange}%`,
      isPositive: true,
      icon: Wallet,
      gradient: 'from-emerald-500/20 to-teal-500/20',
      iconBg: 'bg-emerald-500/20',
      iconColor: 'text-emerald-400',
    },
    {
      title: 'Monthly Spending',
      value: formatCurrency(overviewData.monthlySpending),
      change: `${overviewData.spendingChange}%`,
      isPositive: false,
      icon: TrendingDown,
      gradient: 'from-rose-500/20 to-pink-500/20',
      iconBg: 'bg-rose-500/20',
      iconColor: 'text-rose-400',
    },
    {
      title: 'Predicted Spending',
      value: formatCurrency(overviewData.predictedSpending),
      change: overviewData.forecastStatus === 'insufficient_data' 
        ? 'Add more transactions'
        : overviewData.forecastModelUsed,
      isPositive: null,
      icon: Brain,
      gradient: 'from-indigo-500/20 to-purple-500/20',
      iconBg: 'bg-indigo-500/20',
      iconColor: 'text-indigo-400',
      showProgress: overviewData.forecastStatus !== 'ok',
      progressValue: overviewData.daysOfData,
      progressMax: overviewData.fullModelDays,
    },
    {
      title: 'Anomaly Alerts',
      value: overviewData.anomalyAlerts.toString(),
      change: 'Needs Review',
      isPositive: null,
      icon: AlertTriangle,
      gradient: 'from-amber-500/20 to-orange-500/20',
      iconBg: 'bg-amber-500/20',
      iconColor: 'text-amber-400',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-[var(--muted-text)] mt-1">
            Here's what's happening with your finances today.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-5 h-5" />
          Add Transaction
        </button>
      </div>

      {/* Financial Health Score Section */}
      <section className="pt-2">
        <FinancialHealthScore />
      </section>

      {/* Overview Cards Section */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {overviewCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={cn(
              'card-glass p-6 relative overflow-hidden group rounded-2xl',
              'hover:border-indigo-500/30 transition-all duration-300'
            )}
          >
            {/* Gradient Background */}
            <div className={cn(
              'absolute inset-0 bg-gradient-to-br opacity-50',
              card.gradient
            )} />

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center',
                  card.iconBg
                )}>
                  <card.icon className={cn('w-5 h-5', card.iconColor)} />
                </div>
                {card.isPositive !== null && (
                  <div className={cn(
                    'flex items-center gap-1 text-xs font-medium',
                    card.isPositive ? 'text-emerald-400' : 'text-rose-400'
                  )}>
                    {card.isPositive ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {card.change}
                  </div>
                )}
                {card.isPositive === null && (
                  <span className="text-xs font-medium text-indigo-400">
                    {card.change}
                  </span>
                )}
              </div>

                <p className="text-sm text-[var(--muted-text)] mb-1">{card.title}</p>
                <p className="text-2xl font-bold">{card.value}</p>
                {/* Progress indicator for forecast data collection */}
                {(card as any).showProgress && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-[var(--muted-text)] mb-1">
                      <span>Data collected: {(card as any).progressValue || 0}/{(card as any).progressMax || 21} days</span>
                      <span>{Math.round(((card as any).progressValue || 0) / ((card as any).progressMax || 21) * 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-[var(--glass-bg)] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, ((card as any).progressValue || 0) / ((card as any).progressMax || 21) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Charts Section */}
      <section className="py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Spending Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="card-glass p-6 rounded-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold">Spending Trends</h3>
                <p className="text-sm text-[var(--muted-text)]">Last 6 months</p>
              </div>
              <select className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg px-3 py-1.5 text-sm">
                <option>Last 6 Months</option>
                <option>Last Year</option>
                <option>All Time</option>
              </select>
            </div>
            <SpendingChart data={spendingTrends} />
          </motion.div>

          {/* Category Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="card-glass p-6 rounded-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold">Spending by Category</h3>
                <p className="text-sm text-[var(--muted-text)]">This month</p>
              </div>
            </div>
            <CategoryChart data={categoryData} />
          </motion.div>

          {/* Weekly Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
            className="card-glass p-6 rounded-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold">Weekly Breakdown</h3>
                <p className="text-sm text-[var(--muted-text)]">This week</p>
              </div>
            </div>
            <WeeklyBreakdownChart data={weeklyData} />
          </motion.div>

          {/* AI Forecast */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
            className="card-glass p-6 rounded-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold">AI Spending Forecast</h3>
                <p className="text-sm text-[var(--muted-text)]">Next 30 days with confidence band</p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  Predicted
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-500/30" />
                  Confidence
                </span>
              </div>
            </div>
            <ForecastChart />
          </motion.div>
        </div>
      </section>

      {/* ML Models Status Section */}
      <section className="py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
        >
          <MLIntegrationPanel />
        </motion.div>
      </section>

      {/* AI Insights & Recent Transactions Section */}
      <section className="py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.8 }}
            className="lg:col-span-1"
          >
            <AIInsightsPanel />
          </motion.div>

          {/* Recent Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.9 }}
            className="lg:col-span-2"
          >
            <RecentTransactions transactions={recent} />
          </motion.div>
        </div>
      </section>

      {/* Onboarding Tour for New Users */}
      <OnboardingTour />

      {/* Add Transaction Modal */}
      {showAddModal && (
        <AddTransactionModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}
