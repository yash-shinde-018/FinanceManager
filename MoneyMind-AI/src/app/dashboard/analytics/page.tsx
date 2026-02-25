'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  TrendingUp,
  Calendar,
  Download,
  ArrowUpRight,
  Wallet,
  Target,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import SpendingChart from '@/components/charts/SpendingChart';
import CategoryChart from '@/components/charts/CategoryChart';
import { getSpendingTrends, getSpendingByCategory } from '@/lib/db/dashboard';
import { createClient } from '@/lib/supabase/client';

interface AnalyticsData {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  avgSpend: number;
  incomeChange: number;
  expenseChange: number;
  savingsChange: number;
  avgSpendChange: number;
  monthlyData: { month: string; income: number; expense: number }[];
  topCategories: { name: string; amount: number; percentage: number; color: string }[];
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'6months' | '1year' | 'all'>('6months');
  const [avgPeriod, setAvgPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalIncome: 0,
    totalExpense: 0,
    netSavings: 0,
    avgSpend: 0,
    incomeChange: 12.5,
    expenseChange: -8.2,
    savingsChange: 45.3,
    avgSpendChange: -5.1,
    monthlyData: [],
    topCategories: [],
  });
  const [spendingTrends, setSpendingTrends] = useState<{ month: string; expense: number; income: number }[]>([]);
  const [categoryData, setCategoryData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true);
      try {
        const supabase = createClient();
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get date ranges
        const now = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const prevThirtyDaysAgo = new Date();
        prevThirtyDaysAgo.setDate(prevThirtyDaysAgo.getDate() - 60);

        // Fetch all transactions for last 6 months
        const { data: transactions, error } = await supabase
          .from('transactions')
          .select('amount, type, occurred_at, category')
          .gte('occurred_at', sixMonthsAgo.toISOString())
          .order('occurred_at', { ascending: true });

        if (error) throw error;

        const txs = transactions || [];

        // Calculate totals for current period (last 30 days)
        let currentIncome = 0;
        let currentExpense = 0;
        let prevIncome = 0;
        let prevExpense = 0;

        // Group by month for chart
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyData: Record<string, { income: number; expense: number }> = {};
        
        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          const key = monthNames[d.getMonth()];
          monthlyData[key] = { income: 0, expense: 0 };
        }

        // Category totals
        const categoryTotals: Record<string, number> = {};

        txs.forEach((t) => {
          const amount = Number(t.amount);
          const date = new Date(t.occurred_at);
          const month = monthNames[date.getMonth()];
          
          // Monthly aggregation
          if (monthlyData[month]) {
            if (t.type === 'income') monthlyData[month].income += amount;
            if (t.type === 'expense') monthlyData[month].expense += amount;
          }

          // Current vs previous period
          if (date >= thirtyDaysAgo) {
            if (t.type === 'income') currentIncome += amount;
            if (t.type === 'expense') currentExpense += amount;
          } else if (date >= prevThirtyDaysAgo && date < thirtyDaysAgo) {
            if (t.type === 'income') prevIncome += amount;
            if (t.type === 'expense') prevExpense += amount;
          }

          // Category aggregation for expenses
          if (t.type === 'expense') {
            const cat = t.category || 'Other';
            categoryTotals[cat] = (categoryTotals[cat] || 0) + amount;
          }
        });

        // Calculate changes
        const incomeChange = prevIncome ? ((currentIncome - prevIncome) / prevIncome) * 100 : 12.5;
        const expenseChange = prevExpense ? ((currentExpense - prevExpense) / prevExpense) * 100 : -8.2;
        const netSavings = currentIncome - currentExpense;
        const prevNetSavings = prevIncome - prevExpense;
        const savingsChange = prevNetSavings ? ((netSavings - prevNetSavings) / Math.abs(prevNetSavings)) * 100 : 45.3;
        
        const avgDailySpend = currentExpense / 30;
        const prevAvgDailySpend = prevExpense / 30;
        const avgSpendChange = prevAvgDailySpend ? ((avgDailySpend - prevAvgDailySpend) / prevAvgDailySpend) * 100 : -5.1;

        // Calculate average based on selected period
        let avgSpend = avgDailySpend;
        switch (avgPeriod) {
          case 'weekly':
            avgSpend = avgDailySpend * 7;
            break;
          case 'monthly':
            avgSpend = avgDailySpend * 30;
            break;
          case 'yearly':
            avgSpend = avgDailySpend * 365;
            break;
          default: // daily
            avgSpend = avgDailySpend;
        }

        // Format monthly data for charts
        const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = now.getMonth();
        const orderedMonths: string[] = [];
        for (let i = 5; i >= 0; i--) {
          const idx = (currentMonth - i + 12) % 12;
          orderedMonths.push(monthNames[idx]);
        }

        const formattedMonthlyData = orderedMonths.map(month => ({
          month,
          income: monthlyData[month]?.income || 0,
          expense: monthlyData[month]?.expense || 0,
        }));

        // Format top categories
        const sortedCategories = Object.entries(categoryTotals)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5);
        
        const totalCategorySpend = sortedCategories.reduce((sum, [, amount]) => sum + amount, 0);
        
        const formattedCategories = sortedCategories.map(([name, amount], index) => ({
          name,
          amount,
          percentage: totalCategorySpend ? (amount / totalCategorySpend) * 100 : 0,
          color: colors[index % colors.length],
        }));

        // Format for pie chart
        const pieChartData = sortedCategories.map(([name, amount], index) => ({
          name,
          value: amount,
          color: colors[index % colors.length],
        }));

        setAnalyticsData({
          totalIncome: currentIncome,
          totalExpense: currentExpense,
          netSavings,
          avgSpend,
          incomeChange,
          expenseChange,
          savingsChange,
          avgSpendChange,
          monthlyData: formattedMonthlyData,
          topCategories: formattedCategories,
        });

        setSpendingTrends(formattedMonthlyData);
        setCategoryData(pieChartData);

        // Also fetch from dedicated functions
        const [trends, categories] = await Promise.all([
          getSpendingTrends(6),
          getSpendingByCategory(),
        ]);
        
        if (trends.length > 0) setSpendingTrends(trends);
        if (categories.length > 0) setCategoryData(categories);
        
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, [avgPeriod, timeRange]);

  const analyticsCards = [
    {
      title: 'Total Income',
      value: formatCurrency(analyticsData.totalIncome),
      change: `${analyticsData.incomeChange >= 0 ? '+' : ''}${analyticsData.incomeChange.toFixed(1)}%`,
      isPositive: analyticsData.incomeChange >= 0,
      icon: Wallet,
      color: 'emerald',
    },
    {
      title: 'Total Expenses',
      value: formatCurrency(analyticsData.totalExpense),
      change: `${analyticsData.expenseChange >= 0 ? '+' : ''}${analyticsData.expenseChange.toFixed(1)}%`,
      isPositive: analyticsData.expenseChange < 0,
      icon: Target,
      color: 'rose',
    },
    {
      title: 'Net Savings',
      value: formatCurrency(analyticsData.netSavings),
      change: `${analyticsData.savingsChange >= 0 ? '+' : ''}${analyticsData.savingsChange.toFixed(1)}%`,
      isPositive: analyticsData.savingsChange >= 0,
      icon: TrendingUp,
      color: 'indigo',
    },
    {
      title: `Avg. ${avgPeriod.charAt(0).toUpperCase() + avgPeriod.slice(1)} Spend`,
      value: formatCurrency(analyticsData.avgSpend),
      change: `${analyticsData.avgSpendChange >= 0 ? '+' : ''}${analyticsData.avgSpendChange.toFixed(1)}%`,
      isPositive: analyticsData.avgSpendChange < 0,
      icon: Clock,
      color: 'amber',
    },
  ];

  const handleExportReport = () => {
    const csvRows = [
      ['MoneyMind AI - Financial Analytics Report'],
      ['Generated:', new Date().toLocaleString()],
      ['Time Range:', timeRange],
      ['Average Period:', avgPeriod],
      [''],
      ['SUMMARY'],
      ['Total Income', `₹${analyticsData.totalIncome.toLocaleString('en-IN')}`],
      ['Total Expense', `₹${analyticsData.totalExpense.toLocaleString('en-IN')}`],
      ['Net Savings', `₹${analyticsData.netSavings.toLocaleString('en-IN')}`],
      [`Average ${avgPeriod} Spend`, `₹${analyticsData.avgSpend.toLocaleString('en-IN')}`],
      [''],
      ['CHANGES (vs Previous Period)'],
      ['Income Change', `${analyticsData.incomeChange >= 0 ? '+' : ''}${analyticsData.incomeChange.toFixed(1)}%`],
      ['Expense Change', `${analyticsData.expenseChange >= 0 ? '+' : ''}${analyticsData.expenseChange.toFixed(1)}%`],
      ['Savings Change', `${analyticsData.savingsChange >= 0 ? '+' : ''}${analyticsData.savingsChange.toFixed(1)}%`],
      ['Avg Spend Change', `${analyticsData.avgSpendChange >= 0 ? '+' : ''}${analyticsData.avgSpendChange.toFixed(1)}%`],
      [''],
      ['MONTHLY BREAKDOWN'],
      ['Month', 'Income', 'Expense', 'Savings', 'Savings Rate'],
      ...analyticsData.monthlyData.map(m => {
        const savings = m.income - m.expense;
        const rate = m.income ? ((savings / m.income) * 100).toFixed(1) : '0.0';
        return [m.month, m.income, m.expense, savings, `${rate}%`];
      }),
      [''],
      ['TOP SPENDING CATEGORIES'],
      ['Category', 'Amount', 'Percentage'],
      ...analyticsData.topCategories.map(c => [c.name, c.amount, `${c.percentage.toFixed(1)}%`]),
    ];

    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `moneymind-analytics-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Financial Analytics</h1>
          <p className="text-[var(--muted-text)]">
            Deep insights into your financial patterns
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg px-3 py-2 text-sm"
          >
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
            <option value="all">All Time</option>
          </select>
          <select 
            value={avgPeriod}
            onChange={(e) => setAvgPeriod(e.target.value as any)}
            className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg px-3 py-2 text-sm"
          >
            <option value="daily">Daily Avg</option>
            <option value="weekly">Weekly Avg</option>
            <option value="monthly">Monthly Avg</option>
            <option value="yearly">Yearly Avg</option>
          </select>
          <button 
            onClick={handleExportReport}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {analyticsCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="card-glass p-5"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center',
                `bg-${card.color}-500/20`
              )}>
                <card.icon className={cn('w-5 h-5', `text-${card.color}-400`)} />
              </div>
              <div className={cn(
                'flex items-center gap-1 text-xs font-medium',
                card.isPositive ? 'text-emerald-400' : 'text-rose-400'
              )}>
                <ArrowUpRight className="w-3 h-3" />
                {card.change}
              </div>
            </div>
            <p className="text-sm text-[var(--muted-text)] mb-1">{card.title}</p>
            <p className="text-2xl font-bold">{card.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="card-glass p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold">Income vs Expenses</h3>
              <p className="text-sm text-[var(--muted-text)]">Monthly comparison</p>
            </div>
          </div>
          <SpendingChart data={spendingTrends} />

        </motion.div>

        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="card-glass p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold">Expense Breakdown</h3>
              <p className="text-sm text-[var(--muted-text)]">By category</p>
            </div>
          </div>
          <CategoryChart data={categoryData} />
        </motion.div>
      </div>

      {/* Top Categories Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
        className="card-glass p-6"
      >
        <h3 className="font-semibold mb-4">Top Spending Categories</h3>
        {isLoading ? (
          <div className="py-8 text-center">
            <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
            <p className="text-[var(--muted-text)] mt-4">Loading categories...</p>
          </div>
        ) : analyticsData.topCategories.length === 0 ? (
          <div className="py-8 text-center text-[var(--muted-text)]">
            No expense data available. Add some transactions to see your spending breakdown.
          </div>
        ) : (
          <div className="space-y-4">
            {analyticsData.topCategories.map((category, index) => (
              <div key={category.name} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ backgroundColor: category.color }}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{category.name}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium">₹{category.amount.toLocaleString('en-IN')}</span>
                      <span className="text-sm text-[var(--muted-text)] w-12 text-right">{category.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-[var(--glass-bg)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${category.percentage}%`, backgroundColor: category.color }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Monthly Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.7 }}
        className="card-glass overflow-hidden"
      >
        <div className="p-6 border-b border-[var(--glass-border)]">
          <h3 className="font-semibold">Monthly Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--glass-bg)]">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-medium text-[var(--muted-text)]">Month</th>
                <th className="text-right py-3 px-6 text-sm font-medium text-[var(--muted-text)]">Income</th>
                <th className="text-right py-3 px-6 text-sm font-medium text-[var(--muted-text)]">Expenses</th>
                <th className="text-right py-3 px-6 text-sm font-medium text-[var(--muted-text)]">Savings</th>
                <th className="text-right py-3 px-6 text-sm font-medium text-[var(--muted-text)]">Savings Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--glass-border)]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center">
                    <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
                    <p className="text-[var(--muted-text)] mt-4">Loading monthly data...</p>
                  </td>
                </tr>
              ) : analyticsData.monthlyData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[var(--muted-text)]">
                    No monthly data available. Add transactions to see your monthly summary.
                  </td>
                </tr>
              ) : (
                analyticsData.monthlyData.map((month) => {
                  const savings = month.income - month.expense;
                  const savingsRate = month.income ? ((savings / month.income) * 100).toFixed(1) : '0.0';
                  return (
                    <tr key={month.month} className="hover:bg-[var(--glass-bg)] transition-colors">
                      <td className="py-3 px-6 font-medium">{month.month}</td>
                      <td className="py-3 px-6 text-right text-emerald-400">₹{month.income.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-6 text-right text-rose-400">₹{month.expense.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-6 text-right font-medium">₹{savings.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-6 text-right">
                        <span className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium',
                          Number(savingsRate) > 20 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                        )}>
                          {savingsRate}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
