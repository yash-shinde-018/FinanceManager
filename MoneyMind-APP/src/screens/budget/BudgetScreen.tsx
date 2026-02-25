import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  RefreshControl,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, shadows } from '../../theme/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import Toast from 'react-native-toast-message';

interface Budget {
  id: string;
  category: string;
  amount: number;
  spent: number;
  period: 'monthly' | 'weekly' | 'yearly';
  alert_threshold: number;
  created_at: string;
}

const BUDGET_CATEGORIES = [
  { value: 'food', label: 'Food & Dining', icon: 'restaurant' },
  { value: 'transport', label: 'Transportation', icon: 'car' },
  { value: 'shopping', label: 'Shopping', icon: 'cart' },
  { value: 'entertainment', label: 'Entertainment', icon: 'film' },
  { value: 'utilities', label: 'Utilities', icon: 'flash' },
  { value: 'healthcare', label: 'Healthcare', icon: 'medical' },
  { value: 'education', label: 'Education', icon: 'school' },
  { value: 'travel', label: 'Travel', icon: 'airplane' },
  { value: 'other', label: 'Other', icon: 'ellipsis-horizontal' },
];

const PERIODS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'yearly', label: 'Yearly' },
];

export default function BudgetScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [newBudget, setNewBudget] = useState({
    category: 'food',
    amount: '',
    period: 'monthly',
    alert_threshold: '80',
  });

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    try {
      setLoading(true);
      // Fetch budgets
      const { data: budgetsData, error: budgetsError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (budgetsError) throw budgetsError;

      // Fetch current month's expenses for each budget category
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('category, amount')
        .eq('user_id', user?.id)
        .eq('type', 'expense')
        .gte('occurred_at', startOfMonth.toISOString());

      if (transError) throw transError;

      // Calculate spent amount for each budget
      const budgetsWithSpent = (budgetsData || []).map((budget) => {
        const spent = (transactions || [])
          .filter((t) => t.category === budget.category)
          .reduce((sum, t) => sum + t.amount, 0);
        return { ...budget, spent };
      });

      setBudgets(budgetsWithSpent);
    } catch (error) {
      console.error('Error loading budgets:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load budgets',
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBudgets().finally(() => setRefreshing(false));
  };

  const handleAddBudget = async () => {
    if (!newBudget.amount || parseFloat(newBudget.amount) <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Amount',
        text2: 'Please enter a valid budget amount',
      });
      return;
    }

    try {
      const { error } = await supabase.from('budgets').insert({
        user_id: user?.id,
        category: newBudget.category,
        amount: parseFloat(newBudget.amount),
        period: newBudget.period,
        alert_threshold: parseInt(newBudget.alert_threshold),
      });

      if (error) throw error;

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Budget created successfully',
      });

      setShowAddModal(false);
      resetForm();
      loadBudgets();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to create budget',
      });
    }
  };

  const handleEditBudget = async () => {
    if (!editingBudget) return;

    try {
      const { error } = await supabase
        .from('budgets')
        .update({
          category: editingBudget.category,
          amount: editingBudget.amount,
          period: editingBudget.period,
          alert_threshold: editingBudget.alert_threshold,
        })
        .eq('id', editingBudget.id);

      if (error) throw error;

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Budget updated successfully',
      });

      setShowEditModal(false);
      setEditingBudget(null);
      loadBudgets();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to update budget',
      });
    }
  };

  const handleDeleteBudget = (id: string) => {
    Alert.alert(
      'Delete Budget',
      'Are you sure you want to delete this budget?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.from('budgets').delete().eq('id', id);
              if (error) throw error;
              Toast.show({
                type: 'success',
                text1: 'Deleted',
                text2: 'Budget removed successfully',
              });
              loadBudgets();
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message || 'Failed to delete budget',
              });
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setNewBudget({
      category: 'food',
      amount: '',
      period: 'monthly',
      alert_threshold: '80',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getProgressColor = (spent: number, amount: number, threshold: number) => {
    const percentage = (spent / amount) * 100;
    if (percentage >= 100) return colors.error;
    if (percentage >= threshold) return colors.warning;
    return colors.success;
  };

  const getCategoryIcon = (category: string) => {
    return BUDGET_CATEGORIES.find((c) => c.value === category)?.icon || 'ellipsis-horizontal';
  };

  const getCategoryLabel = (category: string) => {
    return BUDGET_CATEGORIES.find((c) => c.value === category)?.label || category;
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const overallProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const renderBudgetCard = ({ item }: { item: Budget }) => {
    const progress = item.amount > 0 ? (item.spent / item.amount) * 100 : 0;
    const progressColor = getProgressColor(item.spent, item.amount, item.alert_threshold);
    const isOverBudget = item.spent > item.amount;

    return (
      <TouchableOpacity
        style={[styles.budgetCard, { backgroundColor: colors.card, ...shadows.small }]}
        onPress={() => {
          setEditingBudget(item);
          setShowEditModal(true);
        }}
      >
        <View style={styles.budgetHeader}>
          <View style={styles.categoryInfo}>
            <View style={[styles.categoryIcon, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name={getCategoryIcon(item.category) as any} size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.categoryName, { color: colors.text }]}>
                {getCategoryLabel(item.category)}
              </Text>
              <Text style={[styles.periodText, { color: colors.textMuted }]}>
                {item.period.charAt(0).toUpperCase() + item.period.slice(1)}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => handleDeleteBudget(item.id)}
            style={[styles.deleteButton, { backgroundColor: colors.error + '15' }]}
          >
            <Ionicons name="trash-outline" size={18} color={colors.error} />
          </TouchableOpacity>
        </View>

        <View style={styles.amountsRow}>
          <View>
            <Text style={[styles.spentAmount, { color: isOverBudget ? colors.error : colors.text }]}>
              {formatCurrency(item.spent)}
            </Text>
            <Text style={[styles.budgetAmount, { color: colors.textMuted }]}>
              of {formatCurrency(item.amount)}
            </Text>
          </View>
          <View style={[styles.percentageBadge, { backgroundColor: progressColor + '20' }]}>
            <Text style={[styles.percentageText, { color: progressColor }]}>
              {progress.toFixed(0)}%
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarBackground, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressBarFill,
                {
                  backgroundColor: progressColor,
                  width: `${Math.min(progress, 100)}%`,
                },
              ]}
            />
          </View>
          {progress >= item.alert_threshold && progress < 100 && (
            <Text style={[styles.alertText, { color: colors.warning }]}>
              <Ionicons name="warning" size={12} color={colors.warning} /> Approaching limit
            </Text>
          )}
          {isOverBudget && (
            <Text style={[styles.alertText, { color: colors.error }]}>
              <Ionicons name="alert-circle" size={12} color={colors.error} /> Over budget!
            </Text>
          )}
        </View>

        <View style={styles.remainingRow}>
          <Text style={[styles.remainingText, { color: colors.textMuted }]}>
            {isOverBudget
              ? `Over by ${formatCurrency(item.spent - item.amount)}`
              : `${formatCurrency(item.amount - item.spent)} remaining`}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Budget</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Overall Summary Card */}
        <View style={[styles.summaryCard, { backgroundColor: colors.card, ...shadows.medium }]}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>Monthly Overview</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{formatCurrency(totalBudget)}</Text>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Total Budget</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: totalSpent > totalBudget ? colors.error : colors.text }]}>
                {formatCurrency(totalSpent)}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Total Spent</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: totalBudget - totalSpent >= 0 ? colors.success : colors.error }]}>
                {formatCurrency(Math.abs(totalBudget - totalSpent))}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
                {totalBudget - totalSpent >= 0 ? 'Remaining' : 'Over Budget'}
              </Text>
            </View>
          </View>
          {/* Overall Progress */}
          <View style={styles.overallProgressContainer}>
            <View style={[styles.progressBarBackground, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    backgroundColor: overallProgress >= 100 ? colors.error : overallProgress >= 80 ? colors.warning : colors.success,
                    width: `${Math.min(overallProgress, 100)}%`,
                  },
                ]}
              />
            </View>
            <Text style={[styles.overallProgressText, { color: colors.textMuted }]}>
              {overallProgress.toFixed(1)}% used
            </Text>
          </View>
        </View>

        {/* Budgets List */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Budgets</Text>
        {budgets.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
            <Ionicons name="wallet-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No budgets yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              Create a budget to track your spending and stay on top of your finances
            </Text>
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowAddModal(true)}
            >
              <Text style={styles.createButtonText}>Create Budget</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.budgetsList}>
            {budgets.map((budget) => (
              <View key={budget.id}>{renderBudgetCard({ item: budget })}</View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Budget Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Create Budget</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Category</Text>
              <View style={styles.categoryGrid}>
                {BUDGET_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.value}
                    style={[
                      styles.categoryItem,
                      {
                        backgroundColor: newBudget.category === cat.value ? colors.primary : colors.card,
                        borderColor: newBudget.category === cat.value ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setNewBudget({ ...newBudget, category: cat.value })}
                  >
                    <Ionicons
                      name={cat.icon as any}
                      size={20}
                      color={newBudget.category === cat.value ? '#FFFFFF' : colors.text}
                    />
                    <Text
                      style={[
                        styles.categoryItemText,
                        { color: newBudget.category === cat.value ? '#FFFFFF' : colors.text },
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: colors.text }]}>Budget Amount *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                value={newBudget.amount}
                onChangeText={(text) => setNewBudget({ ...newBudget, amount: text })}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={[styles.label, { color: colors.text }]}>Period</Text>
              <View style={styles.periodContainer}>
                {PERIODS.map((period) => (
                  <TouchableOpacity
                    key={period.value}
                    style={[
                      styles.periodItem,
                      {
                        backgroundColor: newBudget.period === period.value ? colors.primary : colors.card,
                        borderColor: newBudget.period === period.value ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setNewBudget({ ...newBudget, period: period.value as any })}
                  >
                    <Text
                      style={[
                        styles.periodItemText,
                        { color: newBudget.period === period.value ? '#FFFFFF' : colors.text },
                      ]}
                    >
                      {period.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: colors.text }]}>Alert Threshold (%)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                value={newBudget.alert_threshold}
                onChangeText={(text) => setNewBudget({ ...newBudget, alert_threshold: text })}
                keyboardType="numeric"
                placeholder="80"
                placeholderTextColor={colors.textMuted}
              />
              <Text style={[styles.hint, { color: colors.textMuted }]}>
                Get alerted when you reach this percentage of your budget
              </Text>

              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: colors.primary }]}
                onPress={handleAddBudget}
              >
                <Text style={styles.submitButtonText}>Create Budget</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Budget Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Budget</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              {editingBudget && (
                <>
                  <Text style={[styles.label, { color: colors.text }]}>Budget Amount</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                    value={editingBudget.amount.toString()}
                    onChangeText={(text) =>
                      setEditingBudget({ ...editingBudget, amount: parseFloat(text) || 0 })
                    }
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor={colors.textMuted}
                  />

                  <Text style={[styles.label, { color: colors.text }]}>Alert Threshold (%)</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                    value={editingBudget.alert_threshold.toString()}
                    onChangeText={(text) =>
                      setEditingBudget({ ...editingBudget, alert_threshold: parseInt(text) || 80 })
                    }
                    keyboardType="numeric"
                    placeholder="80"
                    placeholderTextColor={colors.textMuted}
                  />

                  <TouchableOpacity
                    style={[styles.submitButton, { backgroundColor: colors.primary }]}
                    onPress={handleEditBudget}
                  >
                    <Text style={styles.submitButtonText}>Update Budget</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: { fontSize: 28, fontWeight: '700' },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: { padding: 20, paddingBottom: 40 },
  summaryCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  summaryLabel: { fontSize: 12 },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  overallProgressContainer: { marginTop: 8 },
  overallProgressText: {
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  budgetsList: { gap: 12 },
  budgetCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
  },
  periodText: {
    fontSize: 12,
    marginTop: 2,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  spentAmount: {
    fontSize: 24,
    fontWeight: '700',
  },
  budgetAmount: {
    fontSize: 14,
    marginTop: 2,
  },
  percentageBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBarContainer: { marginBottom: 8 },
  progressBarBackground: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  alertText: {
    fontSize: 12,
    marginTop: 6,
  },
  remainingRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  remainingText: {
    fontSize: 12,
  },
  emptyCard: {
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
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
  periodContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  periodItem: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  periodItemText: {
    fontSize: 14,
    fontWeight: '500',
  },
  hint: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
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
