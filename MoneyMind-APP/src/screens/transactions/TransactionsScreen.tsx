import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, spacing, borderRadius, typography, shadows } from '../../theme/ThemeContext';
import { supabase, Transaction } from '../../lib/supabase';

export default function TransactionsScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'income' | 'expense'>('all');

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchQuery, selectedFilter]);

  const loadTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('occurred_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;

    if (searchQuery) {
      filtered = filtered.filter(
        (t) =>
          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedFilter !== 'all') {
      filtered = filtered.filter((t) => t.type === selectedFilter);
    }

    setFilteredTransactions(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTransactions().finally(() => setRefreshing(false));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: keyof typeof Ionicons.glyphMap } = {
      food: 'restaurant',
      transportation: 'car',
      shopping: 'cart',
      entertainment: 'film',
      housing: 'home',
      utilities: 'flash',
      healthcare: 'medical',
      education: 'school',
      salary: 'cash',
      investment: 'trending-up',
      other: 'apps',
    };
    return icons[category.toLowerCase()] || 'apps';
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TouchableOpacity
      style={[styles.transactionItem, { backgroundColor: colors.card, ...shadows.small }]}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: item.type === 'income' ? `${colors.income}20` : `${colors.expense}20` },
        ]}
      >
        <Ionicons
          name={getCategoryIcon(item.category)}
          size={24}
          color={item.type === 'income' ? colors.income : colors.expense}
        />
      </View>
      <View style={styles.transactionInfo}>
        <Text style={[styles.transactionDesc, { color: colors.text }]}>
          {item.description}
        </Text>
        <Text style={[styles.transactionCategory, { color: colors.textMuted }]}>
          {item.category} • {formatDate(item.occurred_at)}
        </Text>
      </View>
      <View style={styles.amountContainer}>
        <Text
          style={[
            styles.transactionAmount,
            { color: item.type === 'income' ? colors.income : colors.expense },
          ]}
        >
          {item.type === 'income' ? '+' : '-'}
          {formatCurrency(item.amount)}
        </Text>
        {item.is_anomaly && (
          <Ionicons name="warning" size={16} color={colors.warning} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Transactions</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('AddTransaction')}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <Ionicons name="search" size={20} color={colors.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search transactions..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        {(['all', 'income', 'expense'] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              {
                backgroundColor:
                  selectedFilter === filter ? colors.primary : colors.card,
              },
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text
              style={[
                styles.filterText,
                {
                  color: selectedFilter === filter ? '#FFFFFF' : colors.text,
                },
              ]}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Transactions List */}
      <FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No transactions yet
            </Text>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('AddTransaction')}
            >
              <Text style={styles.emptyButtonText}>Add First Transaction</Text>
            </TouchableOpacity>
          </View>
        )}
      />
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 16,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  list: {
    padding: 20,
    gap: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionInfo: {
    flex: 1,
    marginLeft: 16,
  },
  transactionDesc: {
    fontSize: 16,
    fontWeight: '600',
  },
  transactionCategory: {
    fontSize: 12,
    marginTop: 4,
  },
  amountContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
