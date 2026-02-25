import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { useTheme, spacing, borderRadius, typography, shadows } from '../../theme/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { mlClient } from '../../lib/ml';

const categories = [
  { value: 'food', label: 'Food & Dining', icon: 'restaurant' },
  { value: 'transportation', label: 'Transportation', icon: 'car' },
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

export default function AddTransactionScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  const handleAddTransaction = async () => {
    if (!amount || !description) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please enter amount and description',
      });
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Amount',
        text2: 'Please enter a valid positive amount',
      });
      return;
    }

    // Check if expense would make balance negative
    if (type === 'expense') {
      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, type')
        .eq('user_id', user?.id);
      
      const currentBalance = transactions?.reduce((sum, t) => {
        return t.type === 'income' ? sum + Number(t.amount) : sum - Number(t.amount);
      }, 0) || 0;

      if (currentBalance < parsedAmount) {
        Toast.show({
          type: 'error',
          text1: 'Insufficient Balance',
          text2: `Your current balance is ₹${currentBalance.toFixed(2)}`,
        });
        return;
      }
    }

    setLoading(true);
    try {
      // Get AI categorization if category not selected
      let finalCategory = category;
      let isAnomaly = false;
      let confidence = 0;

      if (!finalCategory) {
        const mlResult = await mlClient.categorizeTransaction({
          date: new Date().toISOString().split('T')[0],
          description,
          amount: parseFloat(amount),
        });

        if (mlResult) {
          finalCategory = mlResult.category;
          isAnomaly = mlResult.is_anomaly;
          confidence = mlResult.confidence;
          setAiSuggestion(finalCategory);
        } else {
          finalCategory = 'other';
        }
      }

      console.log('User ID:', user?.id);
      console.log('Inserting transaction with user_id:', user?.id);
      
      const { error, data } = await supabase.from('transactions').insert({
        user_id: user?.id,
        amount: parseFloat(amount),
        type,
        category: finalCategory,
        description,
        merchant: null,
        payment_method: null,
        status: 'completed',
        is_anomaly: isAnomaly,
        occurred_at: new Date().toISOString(),
      }).select();
      
      console.log('Insert result:', { error, data });

      if (error) throw error;

      Toast.show({
        type: 'success',
        text1: 'Transaction Added',
        text2: isAnomaly ? 'Anomaly detected by AI!' : `Category: ${finalCategory}`,
      });

      navigation.goBack();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to add transaction',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Add Transaction</Text>
        <View style={{ width: 28 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Type Selector */}
          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                type === 'expense' && { backgroundColor: colors.expense },
              ]}
              onPress={() => setType('expense')}
            >
              <Ionicons name="arrow-down" size={24} color={type === 'expense' ? '#FFFFFF' : colors.text} />
              <Text style={[styles.typeText, { color: type === 'expense' ? '#FFFFFF' : colors.text }]}>
                Expense
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                type === 'income' && { backgroundColor: colors.income },
              ]}
              onPress={() => setType('income')}
            >
              <Ionicons name="arrow-up" size={24} color={type === 'income' ? '#FFFFFF' : colors.text} />
              <Text style={[styles.typeText, { color: type === 'income' ? '#FFFFFF' : colors.text }]}>
                Income
              </Text>
            </TouchableOpacity>
          </View>

          {/* Amount Input */}
          <View style={[styles.amountCard, { backgroundColor: colors.card, ...shadows.medium }]}>
            <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>Amount</Text>
            <TextInput
              style={[styles.amountInput, { color: colors.text }]}
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          {/* Description Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Description</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.card, color: colors.text, borderColor: colors.border },
              ]}
              placeholder="What was this for?"
              placeholderTextColor={colors.textMuted}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* Category Selection */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>
              Category {aiSuggestion && `(AI: ${aiSuggestion})`}
            </Text>
            <View style={styles.categoryGrid}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.categoryItem,
                    {
                      backgroundColor: category === cat.value ? colors.primary : colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => setCategory(cat.value)}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={20}
                    color={category === cat.value ? '#FFFFFF' : colors.text}
                  />
                  <Text
                    style={[
                      styles.categoryText,
                      { color: category === cat.value ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Add Button */}
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={handleAddTransaction}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.addButtonText}>Add Transaction</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
    fontSize: 20,
    fontWeight: '700',
  },
  keyboardView: {
    flex: 1,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  typeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  amountCard: {
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
  },
  amountLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: '700',
  },
  inputContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  addButton: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 32,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
