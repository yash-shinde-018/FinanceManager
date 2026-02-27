import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    loadDashboardData();
  }, []);

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

      // Get ML forecast
      let predictedSpending = 0;
      try {
        const mlTransactions = transactions?.map((t: any) => ({
          date: t.occurred_at.split('T')[0],
          description: t.description,
          amount: t.type === 'income' ? Number(t.amount) : -Number(t.amount),
          category: t.category,
        })) || [];
        
        const forecast = await mlClient.getForecast(mlTransactions, 30);
        predictedSpending = forecast?.total_predicted || monthlyExpense;
      } catch (error) {
        console.error('Forecast error:', error);
        predictedSpending = monthlyExpense;
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
