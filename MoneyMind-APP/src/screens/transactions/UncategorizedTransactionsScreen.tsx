import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useTheme, spacing, borderRadius, typography, shadows } from '../../theme/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

const CATEGORIES = [
  { name: 'Food', icon: 'restaurant', color: '#F59E0B' },
  { name: 'Travel', icon: 'car', color: '#3B82F6' },
  { name: 'Bills', icon: 'receipt', color: '#EF4444' },
  { name: 'EMI', icon: 'cash', color: '#8B5CF6' },
  { name: 'Shopping', icon: 'cart', color: '#EC4899' },
  { name: 'Investment', icon: 'trending-up', color: '#10B981' },
  { name: 'Healthcare', icon: 'medical', color: '#14B8A6' },
  { name: 'Entertainment', icon: 'film', color: '#F97316' },
  { name: 'Subscription', icon: 'calendar', color: '#6366F1' },
  { name: 'Transfer', icon: 'swap-horizontal', color: '#6B7280' },
  { name: 'Salary', icon: 'wallet', color: '#22C55E' },
  { name: 'Others', icon: 'ellipsis-horizontal', color: '#9CA3AF' },
];

type Transaction = {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  merchant: string | null;
  occurred_at: string;
  is_anomaly: boolean;
  anomaly_notes: string | null;
  category: string;
};

const UncategorizedTransactionsScreen: React.FC = ({ navigation }: any) => {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [notes, setNotes] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [stats, setStats] = useState({
    uncategorized: 0,
    untracked: 0,
  });

  const loadTransactions = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('needs_categorization_review', true)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error loading transactions:', error);
        return;
      }

      setTransactions(data || []);
      
      const { count: uncategorizedCount } = await supabase
        .from('transactions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('needs_categorization_review', true);
        
      const { count: untrackedCount } = await supabase
        .from('transactions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_anomaly', true)
        .eq('anomaly_reviewed', false)
        .eq('payment_method', 'UPI');
      
      setStats({
        uncategorized: uncategorizedCount || 0,
        untracked: untrackedCount || 0,
      });
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadTransactions();
  };

  const handleSync = async () => {
    if (!user?.id) return;
    
    setSyncing(true);
    try {
      Toast.show({
        type: 'info',
        text1: 'Syncing UPI transactions...',
      });

      await loadTransactions();
      
      Toast.show({
        type: 'success',
        text1: 'Sync complete',
        text2: `Found ${stats.uncategorized} to review`,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Sync failed',
        text2: String(error),
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleCategorize = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setNotes('');
    setCategoryModalVisible(true);
  };

  const handleCategorySelect = async (category: string) => {
    if (!selectedTransaction) return;
    
    try {
      const { error } = await supabase
        .from('transactions')
        .update({
          category,
          needs_categorization_review: false,
          user_category_notes: notes || null,
          categorized_at: new Date().toISOString(),
        })
        .eq('id', selectedTransaction.id);

      if (error) {
        Toast.show({
          type: 'error',
          text1: 'Failed to update category',
        });
        return;
      }

      setCategoryModalVisible(false);
      setSelectedTransaction(null);
      loadTransactions();
      
      Toast.show({
        type: 'success',
        text1: 'Categorized successfully',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error updating category',
      });
    }
  };

  const handleDismiss = (transactionId: string) => {
    Alert.alert(
      'Dismiss Transaction',
      'Mark this as reviewed without categorizing?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Dismiss',
          style: 'default',
          onPress: async () => {
            const { error } = await supabase
              .from('transactions')
              .update({
                needs_categorization_review: false,
                anomaly_reviewed: true,
              })
              .eq('id', transactionId);
            
            if (!error) {
              loadTransactions();
            }
          },
        },
      ]
    );
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={[styles.card, { backgroundColor: colors.card }, shadows.small]}>
      <View style={styles.cardHeader}>
        <View style={styles.amountContainer}>
          <Text
            style={[
              styles.amount,
              { color: item.type === 'income' ? colors.income : colors.expense },
            ]}
          >
            {item.type === 'income' ? '+' : '-'}
            {formatCurrency(item.amount)}
          </Text>
          <Text style={[styles.date, { color: colors.textMuted }]}>
            {formatDate(item.occurred_at)}
          </Text>
        </View>
        {item.is_anomaly && (
          <View style={[styles.anomalyBadge, { backgroundColor: colors.warning + '15' }]}>
            <Ionicons name="alert-circle" size={14} color={colors.warning} />
            <Text style={[styles.anomalyText, { color: colors.warning }]}>Untracked</Text>
          </View>
        )}
      </View>

      <Text style={[styles.description, { color: colors.text }]}>
        {item.description || 'No description'}
      </Text>
      
      {item.merchant && (
        <Text style={[styles.merchant, { color: colors.textMuted }]}>
          Via: {item.merchant}
        </Text>
      )}

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.primary }]}
          onPress={() => handleCategorize(item)}
        >
          <Ionicons name="pricetag" size={16} color="#fff" />
          <Text style={styles.actionBtnText}>Categorize</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }]}
          onPress={() => handleDismiss(item.id)}
        >
          <Ionicons name="close" size={16} color={colors.textMuted} />
          <Text style={[styles.actionBtnText, { color: colors.textMuted }]}>
            Dismiss
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCategoryModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={categoryModalVisible}
      onRequestClose={() => setCategoryModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Category</Text>
            <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {selectedTransaction && (
            <View style={[styles.modalTransaction, { backgroundColor: colors.background }]}>
              <Text style={[styles.modalAmount, { color: colors.text }]}>
                {formatCurrency(selectedTransaction.amount)}
              </Text>
              <Text style={[styles.modalDesc, { color: colors.textMuted }]}>
                {selectedTransaction.description}
              </Text>
            </View>
          )}

          <TextInput
            style={[styles.notesInput, { 
              backgroundColor: colors.background, 
              color: colors.text,
              borderColor: colors.border,
            }]}
            placeholder="Add notes (optional)"
            placeholderTextColor={colors.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
          />

          <FlatList
            data={CATEGORIES}
            numColumns={3}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.categoryBtn, { backgroundColor: item.color + '20' }]}
                onPress={() => handleCategorySelect(item.name)}
              >
                <Ionicons name={item.icon as any} size={24} color={item.color} />
                <Text style={[styles.categoryText, { color: item.color }]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Review Transactions</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
            {stats.uncategorized} uncategorized • {stats.untracked} untracked
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.syncBtn, { backgroundColor: colors.primary }, syncing && { opacity: 0.7 }]}
          onPress={handleSync}
          disabled={syncing}
        >
          {syncing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="sync" size={20} color="#fff" />
              <Text style={styles.syncBtnText}>Sync</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.warning + '10' }]}>
          <Ionicons name="pricetag-outline" size={24} color={colors.warning} />
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.uncategorized}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Needs Category</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.expense + '10' }]}>
          <Ionicons name="alert-circle-outline" size={24} color={colors.expense} />
          <Text style={[styles.statValue, { color: colors.text }]}>{stats.untracked}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Untracked</Text>
        </View>
      </View>

      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle" size={64} color={colors.success} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>All Caught Up!</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              No transactions need your attention
            </Text>
            <TouchableOpacity 
              style={[styles.emptySyncBtn, { backgroundColor: colors.primary }]} 
              onPress={handleSync}
            >
              <Text style={styles.emptySyncText}>Check for New</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {renderCategoryModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: borderRadius.lg,
    gap: 8,
  },
  syncBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  list: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  amountContainer: {
    flex: 1,
  },
  amount: {
    fontSize: 20,
    fontWeight: '700',
  },
  date: {
    fontSize: 12,
    marginTop: 2,
  },
  anomalyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
    gap: 4,
  },
  anomalyText: {
    fontSize: 12,
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  merchant: {
    fontSize: 12,
    marginBottom: spacing.md,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: 6,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl * 2,
    marginTop: spacing.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: spacing.lg,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  emptySyncBtn: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  emptySyncText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalTransaction: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  modalAmount: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalDesc: {
    fontSize: 14,
    marginTop: 4,
  },
  notesInput: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: 14,
    marginBottom: spacing.md,
    borderWidth: 1,
    minHeight: 60,
  },
  categoryBtn: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    margin: spacing.xs,
    minWidth: 80,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
});

export default UncategorizedTransactionsScreen;
