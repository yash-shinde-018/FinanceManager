import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SPACING, FONTS } from '../constants';

const { width } = Dimensions.get('window');

const CHART_DATA = [
  { day: 'Mon', amount: 1500 },
  { day: 'Tue', amount: 2300 },
  { day: 'Wed', amount: 800 },
  { day: 'Thu', amount: 3200 },
  { day: 'Fri', amount: 1200 },
  { day: 'Sat', amount: 4500 },
  { day: 'Sun', amount: 2100 },
];

const QuickActionCard = ({ 
  icon, 
  title, 
  color, 
  onPress 
}: { 
  icon: string; 
  title: string; 
  color: string; 
  onPress: () => void;
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[styles.quickActionContainer, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={[styles.quickAction, { backgroundColor: color + '15' }]}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
      >
        <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
          <Icon name={icon} size={24} color="#fff" />
        </View>
        <Text style={styles.quickActionText}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const StatCard = ({ title, value, icon, color, trend }: { 
  title: string; 
  value: string; 
  icon: string; 
  color: string;
  trend?: string;
}) => (
  <View style={[styles.statCard, { borderLeftColor: color, borderLeftWidth: 3 }]}>
    <View style={styles.statHeader}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
        <Icon name={icon} size={20} color={color} />
      </View>
      {trend && (
        <View style={[styles.trendBadge, { backgroundColor: trend.startsWith('+') ? COLORS.success + '20' : COLORS.danger + '20' }]}>
          <Icon 
            name={trend.startsWith('+') ? 'trending-up' : 'trending-down'} 
            size={14} 
            color={trend.startsWith('+') ? COLORS.success : COLORS.danger} 
          />
          <Text style={[styles.trendText, { color: trend.startsWith('+') ? COLORS.success : COLORS.danger }]}>
            {trend}
          </Text>
        </View>
      )}
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
  </View>
);

const ChartBar = ({ day, amount, maxAmount }: { day: string; amount: number; maxAmount: number }) => {
  const height = (amount / maxAmount) * 120;
  
  return (
    <View style={styles.chartBarContainer}>
      <View style={styles.chartBarWrapper}>
        <View style={[styles.chartBar, { height }]}>
          <View style={styles.chartBarGradient} />
        </View>
      </View>
      <Text style={styles.chartDay}>{day}</Text>
      <Text style={styles.chartAmount}>₹{(amount / 1000).toFixed(1)}k</Text>
    </View>
  );
};

export const FinanceScreen: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('Weekly');
  const periods = ['Daily', 'Weekly', 'Monthly', 'Yearly'];

  const maxAmount = useMemo(() => Math.max(...CHART_DATA.map(d => d.amount)), []);

  const totalSpending = useMemo(() => CHART_DATA.reduce((sum, d) => sum + d.amount, 0), []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Finance</Text>
            <Text style={styles.headerSubtitle}>Track your spending</Text>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <Icon name="bell-outline" size={24} color={COLORS.text} />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        {/* Period Selector */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.periodScroll}
          contentContainerStyle={styles.periodContainer}
        >
          {periods.map((period) => (
            <TouchableOpacity
              key={period}
              style={[styles.periodBtn, selectedPeriod === period && styles.periodBtnActive]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text style={[styles.periodText, selectedPeriod === period && styles.periodTextActive]}>
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <StatCard
            title="Total Spending"
            value={`₹${(totalSpending / 1000).toFixed(1)}k`}
            icon="wallet-outline"
            color={COLORS.primary}
            trend="-12%"
          />
          <StatCard
            title="Income"
            value="₹85.4k"
            icon="cash-plus"
            color={COLORS.success}
            trend="+8%"
          />
        </View>

        {/* Chart Section */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Spending Overview</Text>
            <TouchableOpacity>
              <Icon name="dots-vertical" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.chartContainer}>
            {CHART_DATA.map((item) => (
              <ChartBar
                key={item.day}
                day={item.day}
                amount={item.amount}
                maxAmount={maxAmount}
              />
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickActionCard
              icon="file-document-outline"
              title="Bill Pay"
              color={COLORS.primary}
              onPress={() => {}}
            />
            <QuickActionCard
              icon="calendar-check"
              title="Schedule"
              color={COLORS.success}
              onPress={() => {}}
            />
            <QuickActionCard
              icon="chart-pie"
              title="Budget"
              color={COLORS.warning}
              onPress={() => {}}
            />
            <QuickActionCard
              icon="credit-card"
              title="Cards"
              color={COLORS.secondary}
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Categories</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {[
            { name: 'Food & Dining', amount: 12500, icon: 'food', color: COLORS.warning, percent: 35 },
            { name: 'Shopping', amount: 8200, icon: 'shopping', color: COLORS.primary, percent: 23 },
            { name: 'Transport', amount: 5400, icon: 'bus', color: COLORS.success, percent: 15 },
            { name: 'Entertainment', amount: 3800, icon: 'movie', color: COLORS.secondary, percent: 11 },
          ].map((category) => (
            <View key={category.name} style={styles.categoryItem}>
              <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                <Icon name={category.icon} size={20} color={category.color} />
              </View>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBar, { width: `${category.percent}%`, backgroundColor: category.color }]} />
                </View>
              </View>
              <Text style={styles.categoryAmount}>₹{category.amount.toLocaleString()}</Text>
            </View>
          ))}
        </View>

        {/* Budget Card */}
        <View style={[styles.section, { marginBottom: SPACING.xl }]}>
          <View style={styles.budgetCard}>
            <View style={styles.budgetHeader}>
              <View>
                <Text style={styles.budgetTitle}>Monthly Budget</Text>
                <Text style={styles.budgetSubtitle}>You're doing great!</Text>
              </View>
              <View style={styles.budgetBadge}>
                <Text style={styles.budgetBadgeText}>65%</Text>
              </View>
            </View>
            
            <View style={styles.budgetProgressContainer}>
              <View style={styles.budgetProgressBar}>
                <View style={[styles.budgetProgressFill, { width: '65%' }]} />
              </View>
              <View style={styles.budgetLabels}>
                <Text style={styles.budgetLabel}>₹35,000 spent</Text>
                <Text style={styles.budgetLabel}>₹50,000 limit</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingTop: SPACING.md,
  },
  headerTitle: {
    fontSize: FONTS.h1,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: FONTS.body,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.danger,
  },
  periodScroll: {
    marginBottom: SPACING.lg,
  },
  periodContainer: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  periodBtn: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  periodBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  periodText: {
    fontSize: FONTS.caption,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  periodTextActive: {
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statValue: {
    fontSize: FONTS.h2,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  chartCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.lg,
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  chartTitle: {
    fontSize: FONTS.h3,
    fontWeight: '600',
    color: COLORS.text,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
    paddingTop: SPACING.md,
  },
  chartBarContainer: {
    alignItems: 'center',
    flex: 1,
  },
  chartBarWrapper: {
    height: 120,
    justifyContent: 'flex-end',
    width: 30,
  },
  chartBar: {
    width: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    alignSelf: 'center',
  },
  chartBarGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.primary + '50',
    borderRadius: 4,
  },
  chartDay: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 8,
  },
  chartAmount: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONTS.h3,
    fontWeight: '600',
    color: COLORS.text,
  },
  seeAllText: {
    fontSize: FONTS.caption,
    color: COLORS.primary,
    fontWeight: '500',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  quickActionContainer: {
    width: (width - SPACING.lg * 2 - SPACING.md * 3) / 4,
  },
  quickAction: {
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 11,
    color: COLORS.text,
    fontWeight: '500',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: FONTS.body,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 6,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  categoryAmount: {
    fontSize: FONTS.body,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: SPACING.md,
  },
  budgetCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  budgetTitle: {
    fontSize: FONTS.h3,
    fontWeight: '600',
    color: COLORS.text,
  },
  budgetSubtitle: {
    fontSize: FONTS.caption,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  budgetBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  budgetBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  budgetProgressContainer: {
    marginTop: SPACING.sm,
  },
  budgetProgressBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  budgetProgressFill: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: 4,
  },
  budgetLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
});
