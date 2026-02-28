import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, spacing, borderRadius, typography, shadows } from '../../theme/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { mlClient, MonthlyData, SavingsAnalysisRequest } from '../../lib/ml';

interface Insight {
  id: string;
  type: 'savings' | 'health' | 'overspending' | 'anomaly' | 'forecast' | 'tip';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'success' | 'alert';
  timestamp: Date;
  actionRequired?: boolean;
  actionText?: string;
  mlModel?: string;
}

const categories = [
  { id: 'all', label: 'All', icon: 'grid', mlModel: null },
  { id: 'savings', label: 'Savings', icon: 'wallet', mlModel: 'savings' },
  { id: 'health', label: 'Health', icon: 'shield-checkmark', mlModel: 'savings' },
  { id: 'overspending', label: 'Alerts', icon: 'warning', mlModel: 'prediction' },
  { id: 'anomaly', label: 'Anomalies', icon: 'alert-circle', mlModel: 'fraud' },
  { id: 'forecast', label: 'Forecasts', icon: 'trending-up', mlModel: 'prediction' },
  { id: 'tip', label: 'Tips', icon: 'bulb', mlModel: null },
];

export default function InsightsScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [mlStatus, setMlStatus] = useState({
    categorization: false,
    prediction: false,
    fraud: false,
    savings: false,
  });

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      setRefreshing(true);
      
      // Check ML models health
      try {
        const health = await mlClient.healthCheck();
        setMlStatus(health);
      } catch (error) {
        console.error('ML health check failed:', error);
      }

      const formattedInsights: Insight[] = [];

      // Get user transactions for analysis
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('occurred_at', { ascending: false });

      if (transactions && transactions.length > 0) {
        // Calculate metrics
        let totalIncome = 0;
        let totalExpense = 0;
        let foodSpending = 0;
        let subscriptionSpending = 0;
        let emiSpending = 0;
        let investmentSpending = 0;
        const monthlyMap = new Map<string, MonthlyData>();

        transactions.forEach((t) => {
          const amount = Number(t.amount);
          const category = (t.category || '').toLowerCase();
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

          if (t.type === 'income') {
            totalIncome += amount;
            month.total_income += amount;
          } else {
            totalExpense += amount;
            month.total_expense += amount;

            if (category.includes('food')) {
              foodSpending += amount;
              month.expense_food += amount;
            } else if (category.includes('subscription')) {
              subscriptionSpending += amount;
              month.expense_subscription += amount;
            } else if (category.includes('emi') || category.includes('loan')) {
              emiSpending += amount;
              month.expense_emi += amount;
            } else if (category.includes('invest')) {
              investmentSpending += amount;
              month.expense_investment += amount;
            } else if (category.includes('travel') || category.includes('transport')) {
              month.expense_travel += amount;
            } else if (category.includes('bill') || category.includes('utility')) {
              month.expense_bills += amount;
            } else if (category.includes('shop')) {
              month.expense_shopping += amount;
            } else if (category.includes('health') || category.includes('medical')) {
              month.expense_healthcare += amount;
            } else if (category.includes('entertainment') || category.includes('movie')) {
              month.expense_entertainment += amount;
            } else if (category.includes('transfer')) {
              month.expense_transfer += amount;
            } else {
              month.expense_others += amount;
            }
          }
        });

        const savings = totalIncome - totalExpense;
        
        // Get savings insights from ML API
        if (mlStatus.savings && totalIncome > 0) {
          try {
            const savingsData: SavingsAnalysisRequest = {
              income: totalIncome,
              expense: totalExpense,
              savings: savings,
              food_spending: foodSpending,
              subscription_spending: subscriptionSpending,
              emi_spending: emiSpending,
              investment_spending: investmentSpending,
              volatility: Math.abs((totalExpense - (totalExpense * 0.8)) / (totalExpense || 1)),
            };

            const savingsResult = await mlClient.getSavingsInsights(savingsData);
            
            if (savingsResult) {
              // Add financial health insight
              formattedInsights.push({
                id: 'health-1',
                type: 'health',
                title: 'Financial Health Score',
                description: `Your financial health score is ${savingsResult.financial_health_score}/100. ${savingsResult.score_message}`,
                severity: savingsResult.financial_health_score >= 70 ? 'success' : 
                         savingsResult.financial_health_score >= 50 ? 'warning' : 'alert',
                timestamp: new Date(),
                mlModel: 'savings',
              });

              // Add behavior class insight
              formattedInsights.push({
                id: 'savings-1',
                type: 'savings',
                title: `Behavior: ${savingsResult.behavior_class}`,
                description: `Risk Level: ${savingsResult.risk_level}. ${savingsResult.recommendations?.[0] || 'Keep tracking your expenses!'}`,
                severity: savingsResult.risk_level === 'Low' ? 'success' : 
                         savingsResult.risk_level === 'Medium' ? 'warning' : 'alert',
                timestamp: new Date(),
                mlModel: 'savings',
              });

              // Add additional recommendations
              savingsResult.recommendations?.slice(1, 3).forEach((rec: string, index: number) => {
                formattedInsights.push({
                  id: `recommendation-${index}`,
                  type: 'tip',
                  title: 'AI Recommendation',
                  description: rec,
                  severity: 'info',
                  timestamp: new Date(),
                });
              });
            }
          } catch (error) {
            console.error('Error getting savings insights:', error);
          }
        }

        // Get spending prediction if enough data
        const monthlyDataArray = Array.from(monthlyMap.values()).sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        if (mlStatus.prediction && monthlyDataArray.length >= 12) {
          try {
            const predictionResult = await mlClient.predictSpending(monthlyDataArray);
            
            if (predictionResult && predictionResult.predicted_expense) {
              const predValue = Math.abs(predictionResult.predicted_expense);
              const lower = typeof predictionResult.confidence_interval === 'object' && 'lower' in predictionResult.confidence_interval 
                ? Math.abs(predictionResult.confidence_interval.lower)
                : 0;
              const upper = typeof predictionResult.confidence_interval === 'object' && 'upper' in predictionResult.confidence_interval 
                ? Math.abs(predictionResult.confidence_interval.upper)
                : 0;
              
              formattedInsights.push({
                id: 'forecast-1',
                type: 'forecast',
                title: 'AI Spending Forecast',
                description: `Based on your spending patterns, AI predicts your next month's spending will be approximately ₹${predValue.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}. ${lower && upper ? `Expected range: ₹${lower.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} - ₹${upper.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.` : ''} Model: ${predictionResult.model_used || 'LinearRegression'}`,
                severity: 'info',
                timestamp: new Date(),
                mlModel: 'prediction',
              });
            }
          } catch (error) {
            console.error('Error getting spending prediction:', error);
          }
        }

        // Check for overspending patterns
        const avgMonthlyExpense = totalExpense / (monthlyDataArray.length || 1);
        const recentMonth = monthlyDataArray[monthlyDataArray.length - 1];
        if (recentMonth && recentMonth.total_expense > avgMonthlyExpense * 1.2) {
          formattedInsights.push({
            id: 'overspend-1',
            type: 'overspending',
            title: 'Spending Alert',
            description: `Your spending this month (₹${recentMonth.total_expense.toFixed(0)}) is ${((recentMonth.total_expense / avgMonthlyExpense - 1) * 100).toFixed(0)}% higher than your average. Consider reviewing your expenses.`,
            severity: 'warning',
            timestamp: new Date(),
            actionRequired: true,
            actionText: 'Review',
            mlModel: 'prediction',
          });
        }
      }

      // Get anomalous transactions
      const { data: anomalies } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_anomaly', true)
        .order('occurred_at', { ascending: false })
        .limit(5);

      anomalies?.forEach((transaction, index) => {
        formattedInsights.push({
          id: `anomaly-${index}`,
          type: 'anomaly',
          title: 'Unusual Transaction Detected',
          description: `A transaction of ₹${transaction.amount} at "${transaction.description}" was flagged as unusual.`,
          severity: 'alert',
          timestamp: new Date(transaction.occurred_at),
          actionRequired: true,
          actionText: 'Review',
          mlModel: 'fraud',
        });
      });

      setInsights(formattedInsights);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    loadInsights();
  };

  const filteredInsights = activeFilter === 'all' 
    ? insights 
    : insights.filter(i => i.type === activeFilter);

  const getIconForType = (type: string) => {
    const icons: { [key: string]: keyof typeof Ionicons.glyphMap } = {
      savings: 'wallet',
      health: 'shield-checkmark',
      overspending: 'warning',
      anomaly: 'alert-circle',
      forecast: 'trending-up',
      tip: 'bulb',
    };
    return icons[type] || 'information-circle';
  };

  const isModelActive = (mlModel: string | null | undefined) => {
    if (!mlModel) return true;
    return mlStatus[mlModel as keyof typeof mlStatus];
  };

  const getColorForSeverity = (severity: string) => {
    switch (severity) {
      case 'alert': return colors.error;
      case 'warning': return colors.warning;
      case 'success': return colors.success;
      default: return colors.info;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header with ML Status */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>AI Insights</Text>
        <View style={styles.mlStatusContainer}>
          <View style={[styles.mlStatusDot, { backgroundColor: mlStatus.savings ? colors.success : colors.error }]} />
          <Text style={[styles.mlStatusText, { color: colors.textMuted }]}>
            ML {mlStatus.savings && mlStatus.prediction ? 'Active' : 'Limited'}
          </Text>
        </View>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {categories.map((category) => {
          const Icon = category.icon as keyof typeof Ionicons.glyphMap;
          const isActive = isModelActive(category.mlModel);
          
          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.filterButton,
                {
                  backgroundColor: activeFilter === category.id ? colors.primary : colors.card,
                  opacity: category.mlModel && !isActive ? 0.6 : 1,
                },
              ]}
              onPress={() => setActiveFilter(category.id)}
            >
              <View style={styles.filterContent}>
                <Ionicons
                  name={Icon}
                  size={16}
                  color={activeFilter === category.id ? '#FFFFFF' : colors.text}
                  style={styles.filterIcon}
                />
                <Text
                  style={[
                    styles.filterText,
                    { color: activeFilter === category.id ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {category.label}
                </Text>
                {category.mlModel && (
                  <View style={[
                    styles.modelIndicator,
                    { backgroundColor: isActive ? colors.success : colors.error }
                  ]} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Insights List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.insightsContainer}
      >
        {filteredInsights.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="sparkles-outline" size={64} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No insights yet
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>
              Add more transactions to get personalized AI insights
            </Text>
          </View>
        ) : (
          filteredInsights.map((insight) => (
            <View
              key={insight.id}
              style={[styles.insightCard, { backgroundColor: colors.card, ...shadows.small }]}
            >
              <View style={styles.insightHeader}>
                <View
                  style={[
                    styles.insightIcon,
                    { backgroundColor: getColorForSeverity(insight.severity) + '20' },
                  ]}
                >
                  <Ionicons
                    name={getIconForType(insight.type)}
                    size={24}
                    color={getColorForSeverity(insight.severity)}
                  />
                </View>
                <View style={styles.insightInfo}>
                  <View style={styles.insightTitleRow}>
                    <Text style={[styles.insightTitle, { color: colors.text }]}>
                      {insight.title}
                    </Text>
                    {insight.mlModel && (
                      <View style={[
                        styles.mlBadge,
                        { backgroundColor: isModelActive(insight.mlModel) ? colors.success + '30' : colors.error + '30' }
                      ]}>
                        <View style={[
                          styles.mlBadgeDot,
                          { backgroundColor: isModelActive(insight.mlModel) ? colors.success : colors.error }
                        ]} />
                      </View>
                    )}
                  </View>
                  <Text style={[styles.insightTime, { color: colors.textMuted }]}>
                    {insight.timestamp.toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <Text style={[styles.insightDescription, { color: colors.textSecondary }]}>
                {insight.description}
              </Text>
              {insight.actionRequired && (
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: getColorForSeverity(insight.severity) + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.actionText,
                      { color: getColorForSeverity(insight.severity) },
                    ]}
                  >
                    {insight.actionText}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))
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
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  mlStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mlStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  mlStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
    maxHeight: 50,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterIcon: {
    marginRight: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modelIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 6,
  },
  insightsContainer: {
    padding: 20,
    gap: 16,
  },
  insightCard: {
    padding: 20,
    borderRadius: 20,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightInfo: {
    marginLeft: 16,
    flex: 1,
  },
  insightTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  mlBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mlBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  insightTime: {
    fontSize: 12,
    marginTop: 2,
  },
  insightDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionButton: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    gap: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
