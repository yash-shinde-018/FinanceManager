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
import { supabase } from '../../lib/supabase';
import { mlClient } from '../../lib/ml';

interface Insight {
  id: string;
  type: 'savings' | 'overspending' | 'anomaly' | 'forecast' | 'tip';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'success' | 'alert';
  timestamp: Date;
  actionRequired?: boolean;
  actionText?: string;
}

export default function InsightsScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'savings' | 'overspending' | 'anomaly'>('all');

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      // Get ML insights
      const mlInsights = await mlClient.getInsights();
      
      // Get anomalous transactions
      const { data: anomalies } = await supabase
        .from('transactions')
        .select('*')
        .eq('is_anomaly', true)
        .order('occurred_at', { ascending: false });

      const formattedInsights: Insight[] = [];

      // Add ML insights
      if (mlInsights) {
        mlInsights.forEach((insight: any, index: number) => {
          formattedInsights.push({
            id: `ml-${index}`,
            type: insight.type || 'tip',
            title: insight.type === 'overspending' ? 'Spending Alert' : 
                   insight.type === 'recommendation' ? 'AI Recommendation' : 'Insight',
            description: insight.message,
            severity: insight.severity === 'high' ? 'alert' :
                      insight.severity === 'medium' ? 'warning' : 'info',
            timestamp: new Date(),
            actionRequired: insight.type === 'overspending',
            actionText: 'View Details',
          });
        });
      }

      // Add anomaly insights
      anomalies?.forEach((transaction, index) => {
        formattedInsights.push({
          id: `anomaly-${index}`,
          type: 'anomaly',
          title: 'Unusual Transaction Detected',
          description: `A transaction of ₹${transaction.amount} at "${transaction.description}" was flagged as unusual.`,
          severity: 'alert',
          timestamp: new Date(transaction.occurred_at),
          actionRequired: true,
          actionText: 'Review Transaction',
        });
      });

      setInsights(formattedInsights);
    } catch (error) {
      console.error('Error loading insights:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadInsights().finally(() => setRefreshing(false));
  };

  const filteredInsights = activeFilter === 'all' 
    ? insights 
    : insights.filter(i => i.type === activeFilter);

  const getIconForType = (type: string) => {
    const icons: { [key: string]: keyof typeof Ionicons.glyphMap } = {
      savings: 'wallet',
      overspending: 'warning',
      anomaly: 'alert-circle',
      forecast: 'trending-up',
      tip: 'bulb',
    };
    return icons[type] || 'information-circle';
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

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>AI Insights</Text>
        <View style={[styles.aiBadge, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons name="sparkles" size={16} color={colors.primary} />
          <Text style={[styles.aiText, { color: colors.primary }]}>AI Powered</Text>
        </View>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {(['all', 'savings', 'overspending', 'anomaly'] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              {
                backgroundColor: activeFilter === filter ? colors.primary : colors.card,
              },
            ]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text
              style={[
                styles.filterText,
                { color: activeFilter === filter ? '#FFFFFF' : colors.text },
              ]}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
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
                  <Text style={[styles.insightTitle, { color: colors.text }]}>
                    {insight.title}
                  </Text>
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
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  aiText: {
    fontSize: 12,
    fontWeight: '600',
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
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
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
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
