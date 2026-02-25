import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { useTheme, spacing, borderRadius, typography, shadows } from '../../theme/ThemeContext';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');
  const [analyticsData, setAnalyticsData] = useState({
    totalIncome: 0,
    totalExpense: 0,
    savingsRate: 0,
    monthlyData: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      income: [0, 0, 0, 0, 0, 0],
      expense: [0, 0, 0, 0, 0, 0],
    },
    categoryData: [] as { name: string; amount: number; color: string }[],
  });

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .order('occurred_at', { ascending: true });

      if (!transactions) return;

      // Calculate totals
      let totalIncome = 0;
      let totalExpense = 0;
      const categoryMap = new Map<string, number>();
      const monthlyIncome = [0, 0, 0, 0, 0, 0];
      const monthlyExpense = [0, 0, 0, 0, 0, 0];

      transactions.forEach((t) => {
        const amount = Number(t.amount);
        const date = new Date(t.occurred_at);
        const monthIndex = date.getMonth();

        if (t.type === 'income') {
          totalIncome += amount;
          if (monthIndex < 6) monthlyIncome[monthIndex] += amount;
        } else {
          totalExpense += amount;
          if (monthIndex < 6) monthlyExpense[monthIndex] += amount;

          // Category aggregation
          const cat = t.category || 'Other';
          categoryMap.set(cat, (categoryMap.get(cat) || 0) + amount);
        }
      });

      // Format category data
      const categoryData = Array.from(categoryMap.entries())
        .map(([name, amount], index) => ({
          name,
          amount,
          color: ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'][index % 6],
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 6);

      const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

      setAnalyticsData({
        totalIncome,
        totalExpense,
        savingsRate,
        monthlyData: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          income: monthlyIncome,
          expense: monthlyExpense,
        },
        categoryData,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAnalytics().finally(() => setRefreshing(false));
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
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
    },
  };

  const pieData = analyticsData.categoryData.map((cat) => ({
    name: cat.name,
    amount: cat.amount,
    color: cat.color,
    legendFontColor: colors.text,
    legendFontSize: 12,
  }));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Analytics</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Time Range Selector */}
        <View style={styles.timeRangeContainer}>
          {(['month', 'quarter', 'year'] as const).map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.timeRangeButton,
                {
                  backgroundColor: timeRange === range ? colors.primary : colors.card,
                },
              ]}
              onPress={() => setTimeRange(range)}
            >
              <Text
                style={[
                  styles.timeRangeText,
                  { color: timeRange === range ? '#FFFFFF' : colors.text },
                ]}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, { backgroundColor: colors.income + '20' }]}>
            <Ionicons name="arrow-up" size={24} color={colors.income} />
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Income</Text>
            <Text style={[styles.summaryValue, { color: colors.income }]}>
              {formatCurrency(analyticsData.totalIncome)}
            </Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: colors.expense + '20' }]}>
            <Ionicons name="arrow-down" size={24} color={colors.expense} />
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Expense</Text>
            <Text style={[styles.summaryValue, { color: colors.expense }]}>
              {formatCurrency(analyticsData.totalExpense)}
            </Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="trending-up" size={24} color={colors.primary} />
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Savings</Text>
            <Text style={[styles.summaryValue, { color: colors.primary }]}>
              {analyticsData.savingsRate.toFixed(1)}%
            </Text>
          </View>
        </View>

        {/* Income vs Expense Chart */}
        <View style={[styles.chartCard, { backgroundColor: colors.card, ...shadows.small }]}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>Income vs Expense</Text>
          <LineChart
            data={{
              labels: analyticsData.monthlyData.labels,
              datasets: [
                {
                  data: analyticsData.monthlyData.income,
                  color: () => colors.income,
                },
                {
                  data: analyticsData.monthlyData.expense,
                  color: () => colors.expense,
                },
              ],
            }}
            width={width - 64}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>

        {/* Category Breakdown */}
        {pieData.length > 0 && (
          <View style={[styles.chartCard, { backgroundColor: colors.card, ...shadows.small }]}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>Spending by Category</Text>
            <PieChart
              data={pieData}
              width={width - 64}
              height={200}
              chartConfig={chartConfig}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>
        )}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  timeRangeContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
  },
  summaryLabel: {
    fontSize: 12,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  chartCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
  },
});
