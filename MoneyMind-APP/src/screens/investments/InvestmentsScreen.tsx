import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, spacing, borderRadius, typography, shadows } from '../../theme/ThemeContext';
import { supabase, Investment } from '../../lib/supabase';

const assetTypes = [
  { value: 'stocks', label: 'Stocks', icon: 'trending-up' },
  { value: 'crypto', label: 'Crypto', icon: 'logo-bitcoin' },
  { value: 'mutual_funds', label: 'Mutual Funds', icon: 'pie-chart' },
  { value: 'etfs', label: 'ETFs', icon: 'bar-chart' },
  { value: 'bonds', label: 'Bonds', icon: 'document' },
  { value: 'real_estate', label: 'Real Estate', icon: 'home' },
];

export default function InvestmentsScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadInvestments();
  }, []);

  const loadInvestments = async () => {
    try {
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvestments(data || []);
    } catch (error) {
      console.error('Error loading investments:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadInvestments().finally(() => setRefreshing(false));
  };

  const calculateMetrics = () => {
    const totalInvested = investments.reduce(
      (sum, inv) => sum + inv.quantity * inv.buy_price,
      0
    );
    const totalCurrent = investments.reduce(
      (sum, inv) => sum + inv.quantity * (inv.current_price || inv.buy_price),
      0
    );
    const profitLoss = totalCurrent - totalInvested;
    const returnPercentage = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

    return { totalInvested, totalCurrent, profitLoss, returnPercentage };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const metrics = calculateMetrics();

  const renderInvestment = ({ item }: { item: Investment }) => {
    const currentPrice = item.current_price || item.buy_price;
    const invested = item.quantity * item.buy_price;
    const current = item.quantity * currentPrice;
    const profit = current - invested;
    const returnPct = invested > 0 ? (profit / invested) * 100 : 0;
    const isProfitable = profit >= 0;

    return (
      <TouchableOpacity style={[styles.investmentCard, { backgroundColor: colors.card, ...shadows.small }]}>
        <View style={styles.investmentHeader}>
          <View style={styles.assetInfo}>
            <Text style={[styles.assetName, { color: colors.text }]}>{item.asset_name}</Text>
            <Text style={[styles.assetType, { color: colors.textMuted }]}>
              {assetTypes.find((t) => t.value === item.asset_type)?.label || item.asset_type}
            </Text>
          </View>
          <View style={[styles.profitBadge, { backgroundColor: isProfitable ? colors.success + '20' : colors.error + '20' }]}>
            <Text style={[styles.profitText, { color: isProfitable ? colors.success : colors.error }]}>
              {isProfitable ? '+' : ''}{returnPct.toFixed(2)}%
            </Text>
          </View>
        </View>

        <View style={styles.investmentDetails}>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Invested</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{formatCurrency(invested)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Current</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{formatCurrency(current)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Profit/Loss</Text>
            <Text style={[styles.detailValue, { color: isProfitable ? colors.success : colors.error }]}>
              {isProfitable ? '+' : ''}{formatCurrency(profit)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Investments</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Portfolio Summary */}
        <View style={[styles.summaryCard, { backgroundColor: colors.card, ...shadows.medium }]}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Portfolio Value</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {formatCurrency(metrics.totalCurrent)}
          </Text>
          <View style={styles.summaryRow}>
            <View>
              <Text style={[styles.summarySubLabel, { color: colors.textMuted }]}>Invested</Text>
              <Text style={[styles.summarySubValue, { color: colors.text }]}>
                {formatCurrency(metrics.totalInvested)}
              </Text>
            </View>
            <View style={[styles.profitContainer, { backgroundColor: metrics.profitLoss >= 0 ? colors.success + '20' : colors.error + '20' }]}>
              <Ionicons
                name={metrics.profitLoss >= 0 ? 'trending-up' : 'trending-down'}
                size={16}
                color={metrics.profitLoss >= 0 ? colors.success : colors.error}
              />
              <Text style={[styles.profitAmount, { color: metrics.profitLoss >= 0 ? colors.success : colors.error }]}>
                {metrics.profitLoss >= 0 ? '+' : ''}{formatCurrency(metrics.profitLoss)}
              </Text>
            </View>
          </View>
        </View>

        {/* Asset Allocation */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Asset Allocation</Text>
          <View style={[styles.allocationCard, { backgroundColor: colors.card, ...shadows.small }]}>
            {assetTypes.map((type, index) => {
              const count = investments.filter((inv) => inv.asset_type === type.value).length;
              const percentage = investments.length > 0 ? (count / investments.length) * 100 : 0;
              
              return (
                <View key={type.value} style={styles.allocationItem}>
                  <View style={styles.allocationLeft}>
                    <View style={[styles.allocationIcon, { backgroundColor: colors.primary + '20' }]}>
                      <Ionicons name={type.icon as any} size={20} color={colors.primary} />
                    </View>
                    <Text style={[styles.allocationLabel, { color: colors.text }]}>{type.label}</Text>
                  </View>
                  <View style={styles.allocationRight}>
                    <View style={[styles.allocationBar, { backgroundColor: colors.border }]}>
                      <View
                        style={[
                          styles.allocationFill,
                          { width: `${percentage}%`, backgroundColor: colors.primary },
                        ]}
                      />
                    </View>
                    <Text style={[styles.allocationPercent, { color: colors.textMuted }]}>
                      {percentage.toFixed(0)}%
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Investments List */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Investments</Text>
          <FlatList
            data={investments}
            renderItem={renderInvestment}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.investmentsList}
          />
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 24,
    borderRadius: 20,
  },
  summaryLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summarySubLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  summarySubValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  profitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  profitAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 20,
    marginBottom: 16,
  },
  allocationCard: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 20,
    gap: 16,
  },
  allocationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  allocationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: 120,
  },
  allocationIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  allocationLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  allocationRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  allocationBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  allocationFill: {
    height: '100%',
    borderRadius: 3,
  },
  allocationPercent: {
    fontSize: 12,
    width: 35,
    textAlign: 'right',
  },
  investmentsList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  investmentCard: {
    padding: 20,
    borderRadius: 16,
  },
  investmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  assetInfo: {
    flex: 1,
  },
  assetName: {
    fontSize: 18,
    fontWeight: '600',
  },
  assetType: {
    fontSize: 12,
    marginTop: 2,
  },
  profitBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  profitText: {
    fontSize: 14,
    fontWeight: '600',
  },
  investmentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
});
