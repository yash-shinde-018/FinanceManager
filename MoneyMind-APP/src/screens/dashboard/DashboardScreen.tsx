import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { useTheme, spacing, borderRadius, typography, shadows } from '../../theme/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { mlClient } from '../../lib/ml';
import type { MonthlyData } from '../../lib/ml';

const { width } = Dimensions.get('window');

interface DashboardData {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  predictedSpending: number;
  savingsRate: number;
  recentTransactions: any[];
  spendingByCategory: any[];
  anomalyAlerts: number;
}

export default function DashboardScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData>({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
    predictedSpending: 0,
    savingsRate: 0,
    recentTransactions: [],
    spendingByCategory: [],
    anomalyAlerts: 0,
  });

  // Use ref to store previous balance so it persists across renders
  const previousBalanceRef = React.useRef<number>(0);

  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
      
      // IMMEDIATE SYNC: Check for any unsynced UPI transactions on mount
      const immediateSync = async () => {
        console.log('[Dashboard] Immediate sync check...');
        const { data: accounts } = await supabase
          .from('accounts')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'active');
        
        if (accounts && accounts.length > 0) {
          const { syncLatestTransactions } = await import('../../lib/upiSync');
          const result = await syncLatestTransactions(user.id, accounts[0].id, 10);
          console.log('[Dashboard] Immediate sync result:', result);
          
          if (result.synced > 0) {
            loadDashboardData(); // Refresh if transactions were added
          }
        }
      };
      
      immediateSync();
      
      // Start monitoring with proper initialization
      const startMonitoring = async () => {
        console.log('[Dashboard] Starting monitoring...');
        
        // Get initial balance FIRST
        const { data: accounts } = await supabase
          .from('accounts')
          .select('id, balance')
          .eq('user_id', user.id)
          .eq('status', 'active');
        
        const total = accounts?.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0) || 0;
        
        // Set initial balance in ref
        previousBalanceRef.current = total;
        console.log('[Dashboard] Initial balance set:', total);
        
        // Now start polling
        const interval = setInterval(async () => {
          try {
            const { data: currentAccounts } = await supabase
              .from('accounts')
              .select('id, balance')
              .eq('user_id', user.id)
              .eq('status', 'active');
            
            const currentTotal = currentAccounts?.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0) || 0;
            const previousTotal = previousBalanceRef.current;
            const change = currentTotal - previousTotal;
            
            console.log(`[Dashboard] Check - Prev: ${previousTotal}, Curr: ${currentTotal}, Diff: ${change}`);
            
            if (Math.abs(change) > 0.01) {
              console.log('[Dashboard] ⚠️ BALANCE CHANGED!');
              previousBalanceRef.current = currentTotal;
              
              const currentIds = currentAccounts?.map(a => a.id) || [];
              if (currentIds.length > 0) {
                const { syncUpiTransactions } = await import('../../lib/upiSync');
                const result = await syncUpiTransactions(user.id, currentIds[0], {
                  changeAmount: Math.abs(change),
                  changeType: change > 0 ? 'income' : 'expense',
                });
                console.log('[Dashboard] Sync:', result);
                
                if (result.synced > 0) {
                  loadDashboardData();
                }
              }
            }
          } catch (err) {
            console.error('[Dashboard] Monitor error:', err);
          }
        }, 3000);
        
        return interval;
      };
      
      let intervalId: NodeJS.Timeout;
      startMonitoring().then(id => { intervalId = id; });
      
      return () => {
        if (intervalId) clearInterval(intervalId);
      };
    }
  }, [user?.id]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get actual account balances (sum of all accounts for this user)
      const { data: accounts } = await supabase
        .from('accounts')
        .select('balance')
        .eq('user_id', user?.id)
        .eq('status', 'active');

      const totalBalance = accounts?.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0) || 0;

      // Get transactions for monthly stats
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('occurred_at', { ascending: false });
      
      let totalIncome = 0;
      let totalExpense = 0;
      let monthlyIncome = 0;
      let monthlyExpense = 0;
      
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      transactions?.forEach((t: any) => {
        const amount = Number(t.amount);
        const date = new Date(t.occurred_at);
        
        if (t.type === 'income') {
          totalIncome += amount;
          if (date >= startOfMonth) monthlyIncome += amount;
        } else {
          totalExpense += amount;
          if (date >= startOfMonth) monthlyExpense += amount;
        }
      });

      // Calculate monthly data for ML prediction
      const monthlyMap = new Map<string, MonthlyData>();
      
      transactions?.forEach((t: any) => {
        const amount = Number(t.amount);
        const date = new Date(t.occurred_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
        
        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, {
            date: monthKey,
            total_expense: 0,
            total_income: 0,
            expense_food: 0,
            expense_travel: 0,
            expense_bills: 0,
            expense_emi: 0,
            expense_shopping: 0,
            expense_investment: 0,
            expense_healthcare: 0,
            expense_entertainment: 0,
            expense_subscription: 0,
            expense_transfer: 0,
            expense_others: 0,
          });
        }
        
        const month = monthlyMap.get(monthKey)!;
        const category = (t.category || '').toLowerCase();
        
        if (t.type === 'income') {
          month.total_income += amount;
        } else {
          month.total_expense += amount;
          
          // Categorize expenses
          if (category.includes('food')) month.expense_food += amount;
          else if (category.includes('travel') || category.includes('transport')) month.expense_travel += amount;
          else if (category.includes('bill') || category.includes('utility')) month.expense_bills += amount;
          else if (category.includes('emi') || category.includes('loan')) month.expense_emi += amount;
          else if (category.includes('shop')) month.expense_shopping += amount;
          else if (category.includes('invest')) month.expense_investment += amount;
          else if (category.includes('health') || category.includes('medical')) month.expense_healthcare += amount;
          else if (category.includes('entertainment') || category.includes('movie')) month.expense_entertainment += amount;
          else if (category.includes('subscription')) month.expense_subscription += amount;
          else if (category.includes('transfer')) month.expense_transfer += amount;
          else month.expense_others += amount;
        }
      });

      // Get ML spending prediction (need 12+ months)
      let predictedSpending = 0; // Don't show monthly spending as fallback
      const monthlyDataArray = Array.from(monthlyMap.values()).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      if (monthlyDataArray.length >= 12) {
        try {
          const predictionResult = await mlClient.predictSpending(monthlyDataArray);
          if (predictionResult && predictionResult.predicted_expense) {
            predictedSpending = Math.abs(predictionResult.predicted_expense);
            console.log('Dashboard: Predicted spending:', predictedSpending);
          }
        } catch (error) {
          console.error('Prediction error:', error);
        }
      } else {
        console.log('Dashboard: Insufficient data for prediction, need 12+ months, have:', monthlyDataArray.length);
      }

      // Get spending by category
      const categoryMap = new Map();
      transactions?.forEach((t: any) => {
        if (t.type === 'expense') {
          const cat = t.category || 'Other';
          categoryMap.set(cat, (categoryMap.get(cat) || 0) + Number(t.amount));
        }
      });
      
      const spendingByCategory = Array.from(categoryMap.entries())
        .map(([name, amount]) => ({ name, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

      // Count anomalies
      const anomalyCount = transactions?.filter((t: any) => t.is_anomaly).length || 0;

      const savingsRate = monthlyIncome > 0 
        ? ((monthlyIncome - monthlyExpense) / monthlyIncome) * 100 
        : 0;

      setData({
        totalBalance,
        monthlyIncome,
        monthlyExpense,
        predictedSpending,
        savingsRate,
        recentTransactions: transactions?.slice(0, 5) || [],
        spendingByCategory,
        anomalyAlerts: anomalyCount,
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const chartConfig = {
    backgroundColor: colors.card,
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => colors.primary,
    labelColor: () => colors.textSecondary,
    style: {
      borderRadius: borderRadius.lg,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: colors.primary,
    },
  };

  const pieData = data.spendingByCategory.map((cat, index) => ({
    name: cat.name,
    amount: cat.amount,
    color: [
      '#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'
    ][index],
    legendFontColor: colors.text,
    legendFontSize: 12,
  }));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.text }]}>
            Hello, {user?.name?.split(' ')[0] || 'There'}! 👋
          </Text>
          <Text style={[styles.subGreeting, { color: colors.textSecondary }]}>
            Here's your financial overview
          </Text>
        </View>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('Transactions', { addNew: true })}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Balance Card */}
        <View style={[styles.balanceCard, { backgroundColor: colors.card, ...shadows.medium }]}>
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceGradient}
          >
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceAmount}>{formatCurrency(data.totalBalance)}</Text>
            <View style={styles.balanceRow}>
              <View style={styles.balanceItem}>
                <Ionicons name="arrow-up-circle" size={20} color="#10B981" />
                <Text style={styles.balanceItemText}>
                  {formatCurrency(data.monthlyIncome)}
                </Text>
              </View>
              <View style={styles.balanceItem}>
                <Ionicons name="arrow-down-circle" size={20} color="#EF4444" />
                <Text style={styles.balanceItemText}>
                  {formatCurrency(data.monthlyExpense)}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <TouchableOpacity 
            style={[styles.statCard, { backgroundColor: colors.card, ...shadows.small }]}
            onPress={async () => {
              console.log('[Dashboard] TEST: Manual sync triggered');
              if (!user?.id) return;
              const { syncLatestTransactions } = await import('../../lib/upiSync');
              const { data: accounts } = await supabase
                .from('accounts')
                .select('id')
                .eq('user_id', user.id)
                .limit(1);
              if (accounts?.[0]) {
                const result = await syncLatestTransactions(user.id, accounts[0].id, 10);
                console.log('[Dashboard] TEST Result:', result);
                if (result.synced > 0) loadDashboardData();
              }
            }}
          >
            <Ionicons name="sync" size={24} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.text }]}>
              Sync
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              UPI Now
            </Text>
          </TouchableOpacity>
          
          <View style={[styles.statCard, { backgroundColor: colors.card, ...shadows.small }]}>
            <Ionicons name="trending-up" size={24} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {data.savingsRate.toFixed(1)}%
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Savings Rate
            </Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: colors.card, ...shadows.small }]}>
            <Ionicons name="hardware-chip" size={24} color={colors.info} />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {formatCurrency(data.predictedSpending)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Predicted
            </Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: colors.card, ...shadows.small }]}>
            <Ionicons name="warning" size={24} color={data.anomalyAlerts > 0 ? colors.warning : colors.success} />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {data.anomalyAlerts}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Anomalies
            </Text>
          </View>
        </View>

        {/* Charts */}
        {data.spendingByCategory.length > 0 && (
          <View style={[styles.chartCard, { backgroundColor: colors.card, ...shadows.small }]}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>
              Spending by Category
            </Text>
            <PieChart
              data={pieData}
              width={width - 64}
              height={180}
              chartConfig={chartConfig}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>
        )}

        {/* Recent Transactions */}
        <View style={[styles.section, { backgroundColor: colors.card, ...shadows.small }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Recent Transactions
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>
                See All
              </Text>
            </TouchableOpacity>
          </View>
          
          {data.recentTransactions.map((transaction, index) => (
            <TouchableOpacity
              key={transaction.id}
              style={[
                styles.transactionItem,
                index < data.recentTransactions.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <View style={styles.transactionIcon}>
                <Ionicons
                  name={transaction.type === 'income' ? 'arrow-up' : 'arrow-down'}
                  size={20}
                  color={transaction.type === 'income' ? colors.income : colors.expense}
                />
              </View>
              <View style={styles.transactionInfo}>
                <Text style={[styles.transactionDesc, { color: colors.text }]}>
                  {transaction.description}
                </Text>
                <Text style={[styles.transactionCategory, { color: colors.textMuted }]}>
                  {transaction.category}
                </Text>
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  {
                    color: transaction.type === 'income' ? colors.income : colors.expense,
                  },
                ]}
              >
                {transaction.type === 'income' ? '+' : '-'}
                {formatCurrency(Math.abs(transaction.amount))}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
  },
  subGreeting: {
    fontSize: 14,
    marginTop: 4,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  balanceGradient: {
    padding: spacing.xl,
  },
  balanceLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '700',
    marginVertical: spacing.md,
  },
  balanceRow: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  balanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  balanceItemText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  chartCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  section: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  transactionDesc: {
    fontSize: 16,
    fontWeight: '500',
  },
  transactionCategory: {
    fontSize: 12,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
});
