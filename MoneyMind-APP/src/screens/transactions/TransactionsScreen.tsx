import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Modal,
  ScrollView,
  Alert,
  Share,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, spacing, borderRadius, typography, shadows } from '../../theme/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { supabase, Transaction } from '../../lib/supabase';
import { mlClient } from '../../lib/ml';
import AnomalyReviewModal from '../../components/AnomalyReviewModal';

const CATEGORIES = [
  { value: 'food', label: 'Food & Dining', icon: 'restaurant' },
  { value: 'transport', label: 'Transportation', icon: 'car' },
  { value: 'shopping', label: 'Shopping', icon: 'cart' },
  { value: 'entertainment', label: 'Entertainment', icon: 'film' },
  { value: 'housing', label: 'Housing', icon: 'home' },
  { value: 'utilities', label: 'Utilities', icon: 'flash' },
  { value: 'healthcare', label: 'Healthcare', icon: 'medical' },
  { value: 'education', label: 'Education', icon: 'school' },
  { value: 'salary', label: 'Salary', icon: 'cash' },
  { value: 'investment', label: 'Investment', icon: 'trending-up' },
  { value: 'other', label: 'Other', icon: 'apps' },
];

export default function TransactionsScreen({ navigation, route }: any) {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [anomalyModalVisible, setAnomalyModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [anomalyConfidence, setAnomalyConfidence] = useState(0);
  
  // Add Transaction Modal State
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [aiCategory, setAiCategory] = useState<string | null>(null);
  const [aiConfidence, setAiConfidence] = useState(0);
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: 'food',
    occurred_at: new Date().toISOString().split('T')[0],
  });

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
        .eq('user_id', user?.id)
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

  const handleAnomalyPress = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setAnomalyConfidence(0.85); // Default confidence - could be stored in DB
    setAnomalyModalVisible(true);
  };

  const handleAnomalyConfirm = async (isActuallyAnomaly: boolean, notes?: string) => {
    if (!selectedTransaction) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .update({
          is_anomaly: isActuallyAnomaly,
          anomaly_notes: notes || null,
        })
        .eq('id', selectedTransaction.id);

      if (error) throw error;

      // Reload transactions
      loadTransactions();
    } catch (error) {
      console.error('Error updating anomaly status:', error);
    }
  };

  const handleAddTransaction = async () => {
    if (!newTransaction.description || !newTransaction.amount) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // AI categorization if not manually selected
      let finalCategory = newTransaction.category;

      // Only auto-categorize if user hasn't manually changed category from default
      if (newTransaction.category === 'food' && newTransaction.description.length > 3) {
        const mlResult = await mlClient.categorizeTransaction({
          date: newTransaction.occurred_at,
          description: newTransaction.description,
          amount: parseFloat(newTransaction.amount),
        });

        if (mlResult) {
          finalCategory = mlResult.category;
          setAiCategory(mlResult.category);
          setAiConfidence(mlResult.confidence);
        }
      }

      // ALWAYS detect fraud/anomaly for EVERY transaction
      let isAnomaly = false;
      const fraudResult = await mlClient.detectFraud({
        id: Date.now(),
        date: newTransaction.occurred_at,
        description: newTransaction.description,
        amount: parseFloat(newTransaction.amount), // Positive amount
        transaction_type: newTransaction.type === 'expense' ? 'Debit' : 'Credit',
        category: finalCategory || 'other',
      });

      if (fraudResult) {
        isAnomaly = fraudResult.status === 'Suspicious';
        console.log('Fraud detection result:', fraudResult);
      }

      const { error } = await supabase.from('transactions').insert({
        user_id: user?.id,
        description: newTransaction.description,
        amount: parseFloat(newTransaction.amount),
        type: newTransaction.type,
        category: finalCategory,
        occurred_at: newTransaction.occurred_at,
        is_anomaly: isAnomaly,
      });

      if (error) throw error;

      setAddModalVisible(false);
      setNewTransaction({
        description: '',
        amount: '',
        type: 'expense',
        category: 'food',
        occurred_at: new Date().toISOString().split('T')[0],
      });
      setAiCategory(null);
      setAiConfidence(0);
      loadTransactions();
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Failed to add transaction');
    }
  };

  const handleExportData = async () => {
    if (filteredTransactions.length === 0) {
      Alert.alert('No Data', 'No transactions to export');
      return;
    }

    // Create CSV content
    const headers = 'Date,Description,Category,Type,Amount\n';
    const rows = filteredTransactions.map(t => 
      `${t.occurred_at},"${t.description}",${t.category},${t.type},${t.amount}`
    ).join('\n');
    const csvContent = headers + rows;

    try {
      await Share.share({
        message: csvContent,
        title: 'Transactions Export',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TouchableOpacity
      style={[styles.transactionItem, { backgroundColor: colors.card, ...shadows.small }]}
      onPress={() => item.is_anomaly && handleAnomalyPress(item)}
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
        {item.is_anomaly && (
          <Text style={[styles.anomalyText, { color: colors.warning }]}>
            ⚠️ Tap to review anomaly
          </Text>
        )}
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

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card, marginTop: 12 }]}>
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
        <TouchableOpacity
          style={[styles.exportButton, { backgroundColor: colors.card }]}
          onPress={handleExportData}
        >
          <Ionicons name="download-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
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
      <AnomalyReviewModal
        visible={anomalyModalVisible}
        transaction={selectedTransaction}
        confidence={anomalyConfidence}
        onClose={() => setAnomalyModalVisible(false)}
        onConfirm={handleAnomalyConfirm}
      />

      {/* FAB - Add Transaction */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setAddModalVisible(true)}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Add Transaction Modal */}
      <Modal
        visible={addModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add Transaction</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              {/* Type Selection */}
              <Text style={[styles.label, { color: colors.text }]}>Type</Text>
              <View style={styles.typeContainer}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor: newTransaction.type === 'income' ? colors.income : colors.card,
                      borderColor: newTransaction.type === 'income' ? colors.income : colors.border,
                    },
                  ]}
                  onPress={() => setNewTransaction({ ...newTransaction, type: 'income' })}
                >
                  <Ionicons name="arrow-up" size={20} color={newTransaction.type === 'income' ? '#FFFFFF' : colors.text} />
                  <Text style={[styles.typeText, { color: newTransaction.type === 'income' ? '#FFFFFF' : colors.text }]}>Income</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor: newTransaction.type === 'expense' ? colors.expense : colors.card,
                      borderColor: newTransaction.type === 'expense' ? colors.expense : colors.border,
                    },
                  ]}
                  onPress={() => setNewTransaction({ ...newTransaction, type: 'expense' })}
                >
                  <Ionicons name="arrow-down" size={20} color={newTransaction.type === 'expense' ? '#FFFFFF' : colors.text} />
                  <Text style={[styles.typeText, { color: newTransaction.type === 'expense' ? '#FFFFFF' : colors.text }]}>Expense</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.label, { color: colors.text }]}>Description *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                value={newTransaction.description}
                onChangeText={(text) => setNewTransaction({ ...newTransaction, description: text })}
                placeholder="e.g., Grocery shopping"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={[styles.label, { color: colors.text }]}>Amount *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                value={newTransaction.amount}
                onChangeText={(text) => setNewTransaction({ ...newTransaction, amount: text })}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={[styles.label, { color: colors.text }]}>
                Category {aiCategory && `(AI: ${aiCategory} ${(aiConfidence * 100).toFixed(0)}%)`}
              </Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.value}
                    style={[
                      styles.categoryItem,
                      {
                        backgroundColor: newTransaction.category === cat.value ? colors.primary : colors.card,
                        borderColor: newTransaction.category === cat.value ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setNewTransaction({ ...newTransaction, category: cat.value })}
                  >
                    <Ionicons
                      name={cat.icon as any}
                      size={18}
                      color={newTransaction.category === cat.value ? '#FFFFFF' : colors.text}
                    />
                    <Text
                      style={[
                        styles.categoryItemText,
                        { color: newTransaction.category === cat.value ? '#FFFFFF' : colors.text },
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: colors.text }]}>Date</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                value={newTransaction.occurred_at}
                onChangeText={(text) => setNewTransaction({ ...newTransaction, occurred_at: text })}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textMuted}
              />

              <TouchableOpacity style={[styles.submitButton, { backgroundColor: colors.primary }]} onPress={handleAddTransaction}>
                <Text style={styles.submitButtonText}>Add Transaction</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    alignItems: 'center',
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  exportButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
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
  anomalyText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  formContainer: { padding: 20 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryItemText: {
    fontSize: 12,
    fontWeight: '500',
  },
  submitButton: {
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
