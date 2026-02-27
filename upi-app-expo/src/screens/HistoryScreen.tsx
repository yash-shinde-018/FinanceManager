import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SPACING, FONTS } from '../constants';

// Mock Data
const mockTransactions = [
  {
    id: '1',
    amount: 500,
    type: 'received',
    status: 'completed',
    fromUpiId: 'rahul@okhdfcbank',
    toUpiId: 'nikhil@okaxis',
    fromName: 'Rahul Sharma',
    toName: 'Nikhil',
    description: 'Dinner split',
    date: new Date(Date.now() - 1000 * 60 * 30),
    category: 'Food',
    referenceId: 'REF123456',
  },
  {
    id: '2',
    amount: 1500,
    type: 'sent',
    status: 'completed',
    fromUpiId: 'nikhil@okaxis',
    toUpiId: 'electricity@bills',
    fromName: 'Nikhil',
    toName: 'Electricity Board',
    description: 'Electricity Bill',
    date: new Date(Date.now() - 1000 * 60 * 60 * 2),
    category: 'Utilities',
    referenceId: 'REF987654',
  },
  {
    id: '3',
    amount: 2500,
    type: 'sent',
    status: 'completed',
    fromUpiId: 'nikhil@paytm',
    toUpiId: 'flipkart@upi',
    fromName: 'Nikhil',
    toName: 'Flipkart',
    description: 'Shopping',
    date: new Date(Date.now() - 1000 * 60 * 60 * 5),
    category: 'Shopping',
    referenceId: 'REF456789',
  },
  {
    id: '4',
    amount: 1000,
    type: 'received',
    status: 'completed',
    fromUpiId: 'priya@oksbi',
    toUpiId: 'nikhil@okaxis',
    fromName: 'Priya Patel',
    toName: 'Nikhil',
    description: 'Rent share',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24),
    category: 'Housing',
    referenceId: 'REF789123',
  },
  {
    id: '5',
    amount: 3000,
    type: 'received',
    status: 'completed',
    fromUpiId: 'client@work',
    toUpiId: 'nikhil@okaxis',
    fromName: 'Freelance Client',
    toName: 'Nikhil',
    description: 'Project payment',
    date: new Date(Date.now() - 1000 * 60 * 60 * 72),
    category: 'Income',
    referenceId: 'REF654321',
  },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const FilterButton = ({ 
  label, 
  active, 
  onPress 
}: { 
  label: string; 
  active: boolean; 
  onPress: () => void;
}) => (
  <TouchableOpacity 
    style={[styles.filterButton, active && styles.filterButtonActive]}
    onPress={onPress}
  >
    <Text style={[styles.filterText, active && styles.filterTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const TransactionItem = ({ transaction }: { transaction: typeof mockTransactions[0] }) => (
  <View style={styles.transactionItem}>
    <View style={[styles.transactionIcon, { backgroundColor: transaction.type === 'sent' ? COLORS.danger + '20' : COLORS.success + '20' }]}>
      <Icon
        name={transaction.type === 'sent' ? 'arrow-up' : 'arrow-down'}
        size={20}
        color={transaction.type === 'sent' ? COLORS.danger : COLORS.success}
      />
    </View>
    <View style={styles.transactionInfo}>
      <Text style={styles.transactionDescription}>{transaction.description}</Text>
      <Text style={styles.transactionMeta}>
        {formatDate(transaction.date)} • {transaction.referenceId}
      </Text>
      <Text style={styles.transactionUpi}>
        {transaction.type === 'sent' ? `To: ${transaction.toUpiId}` : `From: ${transaction.fromUpiId}`}
      </Text>
    </View>
    <View style={styles.transactionAmount}>
      <Text style={[styles.amountText, { color: transaction.type === 'sent' ? COLORS.danger : COLORS.success }]}>
        {transaction.type === 'sent' ? '-' : '+'}{formatCurrency(transaction.amount)}
      </Text>
      <View style={[styles.statusBadge, { backgroundColor: transaction.status === 'completed' ? COLORS.success + '30' : COLORS.warning + '30' }]}>
        <Text style={[styles.statusText, { color: transaction.status === 'completed' ? COLORS.success : COLORS.warning }]}>
          {transaction.status}
        </Text>
      </View>
    </View>
  </View>
);

export const HistoryScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredTransactions = useMemo(() => {
    let filtered = mockTransactions;
    
    if (searchQuery) {
      filtered = filtered.filter(
        (t) =>
          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.fromUpiId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.referenceId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (activeFilter !== 'all') {
      filtered = filtered.filter((t) => t.type === activeFilter);
    }
    
    return filtered;
  }, [searchQuery, activeFilter]);

  const totalSent = useMemo(() => 
    filteredTransactions
      .filter(t => t.type === 'sent')
      .reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions]
  );

  const totalReceived = useMemo(() => 
    filteredTransactions
      .filter(t => t.type === 'received')
      .reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions]
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transaction History</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color={COLORS.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search transactions..."
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <FilterButton 
          label="All" 
          active={activeFilter === 'all'} 
          onPress={() => setActiveFilter('all')} 
        />
        <FilterButton 
          label="Sent" 
          active={activeFilter === 'sent'} 
          onPress={() => setActiveFilter('sent')} 
        />
        <FilterButton 
          label="Received" 
          active={activeFilter === 'received'} 
          onPress={() => setActiveFilter('received')} 
        />
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Icon name="arrow-up-circle" size={24} color={COLORS.danger} />
          <Text style={styles.summaryLabel}>Total Sent</Text>
          <Text style={[styles.summaryValue, { color: COLORS.danger }]}>
            {formatCurrency(totalSent)}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Icon name="arrow-down-circle" size={24} color={COLORS.success} />
          <Text style={styles.summaryLabel}>Total Received</Text>
          <Text style={[styles.summaryValue, { color: COLORS.success }]}>
            {formatCurrency(totalReceived)}
          </Text>
        </View>
      </View>

      {/* Transactions List */}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.transactionsList}>
        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="receipt-text-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No transactions found</Text>
          </View>
        ) : (
          filteredTransactions.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))
        )}
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
    padding: SPACING.lg,
    paddingTop: SPACING.md,
  },
  headerTitle: {
    fontSize: FONTS.h1,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.md,
    color: COLORS.text,
    fontSize: FONTS.body,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  filterButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: FONTS.caption,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: FONTS.caption,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: FONTS.h3,
    fontWeight: 'bold',
  },
  transactionsList: {
    paddingHorizontal: SPACING.lg,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: 12,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: FONTS.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  transactionMeta: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  transactionUpi: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: FONTS.h4,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: SPACING.xxl * 2,
  },
  emptyText: {
    fontSize: FONTS.body,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  },
});
