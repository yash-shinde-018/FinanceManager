import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  RefreshControl,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { COLORS } from '../constants';
import { transactionSupabase, UpiTransaction } from '../lib/transactionSupabase';

export const TransactionsScreen: React.FC = ({ navigation }: any) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<UpiTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all');

  // Fetch transactions from Transaction Supabase
  const fetchTransactions = async () => {
    try {
      const { data, error } = await transactionSupabase
        .from('upi_transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching transactions:', error);
        return;
      }

      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    if (filter === 'sent') return tx.type === 'debit';
    if (filter === 'received') return tx.type === 'credit';
    return true;
  });

  const formatMoney = (amount: number) => {
    return '₹' + amount.toLocaleString('en-IN');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today, ' + date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday, ' + date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }
  };

  const renderTransaction = ({ item }: { item: UpiTransaction }) => (
    <TouchableOpacity style={styles.txItem}>
      <View style={[styles.txIcon, { 
        backgroundColor: item.type === 'debit' ? COLORS.danger + '15' : COLORS.success + '15' 
      }]}>
        <Icon 
          name={item.type === 'debit' ? 'arrow-up' : 'arrow-down'} 
          size={20} 
          color={item.type === 'debit' ? COLORS.danger : COLORS.success} 
        />
      </View>
      <View style={styles.txInfo}>
        <Text style={styles.txName}>{item.description || 'UPI Transaction'}</Text>
        <Text style={styles.txUpiId}>{item.upi_id}</Text>
        <Text style={styles.txDate}>{formatDate(item.created_at)}</Text>
      </View>
      <View style={styles.txAmountContainer}>
        <Text style={[styles.txAmount, { 
          color: item.type === 'debit' ? COLORS.danger : COLORS.success 
        }]}>
          {item.type === 'debit' ? '-' : '+'}{formatMoney(item.amount)}
        </Text>
        <Text style={styles.txStatus}>{item.status}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transactions</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterBtn, filter === 'all' && styles.filterBtnActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterBtn, filter === 'sent' && styles.filterBtnActive]}
          onPress={() => setFilter('sent')}
        >
          <Text style={[styles.filterText, filter === 'sent' && styles.filterTextActive]}>
            Sent
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterBtn, filter === 'received' && styles.filterBtnActive]}
          onPress={() => setFilter('received')}
        >
          <Text style={[styles.filterText, filter === 'received' && styles.filterTextActive]}>
            Received
          </Text>
        </TouchableOpacity>
      </View>

      {/* Transaction List */}
      <FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="receipt" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>
              {loading ? 'Loading...' : 'No transactions found'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 8,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    alignItems: 'center',
  },
  filterBtnActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  filterTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  txIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txInfo: {
    flex: 1,
  },
  txName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  txUpiId: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  txDate: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  txAmountContainer: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  txStatus: {
    fontSize: 10,
    color: COLORS.success,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textMuted,
    marginTop: 16,
  },
});
